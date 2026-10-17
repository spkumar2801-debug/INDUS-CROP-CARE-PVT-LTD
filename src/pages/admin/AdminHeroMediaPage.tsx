import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Upload, 
  Save, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  PhoneCall, 
  Sliders, 
  Eye, 
  HelpCircle,
  Undo2
} from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { HeroSettings, SiteSettings } from '../../types/settings';
import { getSiteSettings, updateSiteSettings } from '../../services/settingsService';
import { uploadToCloudinary, uploadVideoToCloudinary, isCloudinaryConfigured } from '../../lib/cloudinary';
import { useSiteSettings } from '../../context/SettingsContext';

const DRAFT_STORAGE_KEY = 'indus_hero_draft_v1';

export const AdminHeroMediaPage: React.FC = () => {
  const { refreshSettings } = useSiteSettings();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [heroForm, setHeroForm] = useState<HeroSettings | null>(null);
  const [publishedHero, setPublishedHero] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Live Preview Device mode
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      const activeHero = s.hero || {
        mediaType: 'image',
        imageUrl: '/assets/indus-crop-hero.webp',
        imageMobileUrl: '/assets/indus-crop-hero-mobile.webp',
        imagePositionDesktop: 'center 36%',
        imagePositionMobile: 'center center',
        imageFit: 'cover',
        videoUrl: '/videos/hero-cinematic.mp4',
        videoPosterUrl: '/assets/indus-crop-hero.webp',
        videoLoop: true,
        videoMuted: true,
        overlayDarkness: 0.65,
        gradientStrength: 0.8,
        heroHeightPreset: 'standard',
        badgeText: 'Over 15 Years of Agri-Input Leadership & Innovation',
        titleLine1: 'Advancing Crop Health.',
        titleLine2: 'Growing Tomorrow.',
        teluguMotto: 'రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు',
        description: 'Indus Crop Care Pvt. Ltd. is a renowned agri-input enterprise with an established track record across Organic & Water-Soluble Fertilizers, Plant Micronutrients, Biofertilizers, Crop Protection Chemicals, Biopesticides, and Biostimulants — empowering farmers to maximize yields and enhance sustainability.',
        primaryCtaText: 'Explore Products',
        primaryCtaLink: '/products',
        secondaryCtaText: 'Contact Us',
        secondaryCtaLink: '/contact'
      };
      // Ensure activeHero contains only persistent URLs, discarding stale session blobs
      if (activeHero.videoUrl?.startsWith('blob:')) {
        activeHero.videoUrl = '/videos/hero-cinematic.mp4';
      }
      if (activeHero.imageUrl?.startsWith('blob:')) {
        activeHero.imageUrl = '/assets/indus-crop-hero.webp';
      }
      if (activeHero.videoPosterUrl?.startsWith('blob:')) {
        activeHero.videoPosterUrl = '/assets/indus-crop-hero.webp';
      }
      setPublishedHero(activeHero);

      // Check if there is an unsaved draft
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // Purge session-local blob URLs from draft
          if (parsed.videoUrl?.startsWith('blob:')) {
            parsed.videoUrl = activeHero.videoUrl;
          }
          if (parsed.imageUrl?.startsWith('blob:')) {
            parsed.imageUrl = activeHero.imageUrl;
          }
          if (parsed.videoPosterUrl?.startsWith('blob:')) {
            parsed.videoPosterUrl = activeHero.videoPosterUrl;
          }
          setHeroForm(parsed);
          setStatusMessage({ type: 'info', text: 'Loaded your previous saved draft. You can preview or publish it.' });
        } catch {
          setHeroForm(activeHero);
        }
      } else {
        setHeroForm(activeHero);
      }
    }).finally(() => setLoading(false));
  }, []);

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    if (type !== 'info') {
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleFieldChange = (key: keyof HeroSettings, value: any) => {
    if (!heroForm) return;
    setHeroForm({
      ...heroForm,
      [key]: value
    });
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Unified Media Upload handler: auto-detects image vs video, optimizes, and stores persistently
  const handleUnifiedMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-selecting the same file works
    e.target.value = '';

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm)$/i.test(file.name);
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif)$/i.test(file.name);

    if (!isVideo && !isImage) {
      showNotification('error', 'Unsupported file format. Please select an image (JPG, PNG, WebP) or video (MP4, WebM).');
      return;
    }

    if (isVideo && file.size > 25 * 1024 * 1024) {
      showNotification('error', 'Video file exceeds 25MB. Please upload a video under 25MB for smooth loading on mobile devices.');
      return;
    }

    if (isImage && file.size > 15 * 1024 * 1024) {
      showNotification('error', 'Image file exceeds 15MB. Please upload an image under 15MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);

    try {
      if (isVideo) {
        if (!isCloudinaryConfigured()) {
          throw new Error('Persistent cloud storage is not configured.');
        }

        const res = await uploadVideoToCloudinary(file, 'hero', (percent) => setUploadProgress(percent));
        // Automatically derive high-definition frame poster from the video URL on CDN
        const autoPoster = res.secureUrl.replace(/\.(mp4|webm)$/i, '.jpg');

        setHeroForm((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            mediaType: 'video',
            videoUrl: res.secureUrl,
            videoPosterUrl: autoPoster,
            imageUrl: autoPoster,
            videoLoop: true,
            videoMuted: true
          };
        });

        showNotification('success', `Video "${file.name}" uploaded successfully! The hero is now set to Video. Click "Publish to Live Homepage" to update the live website.`);
      } else {
        if (!isCloudinaryConfigured()) {
          throw new Error('Persistent cloud storage is not configured.');
        }

        const res = await uploadToCloudinary(file, 'branding', (percent) => setUploadProgress(percent));

        setHeroForm((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            mediaType: 'image',
            imageUrl: res.secureUrl,
            imageMobileUrl: res.secureUrl,
            videoPosterUrl: res.secureUrl
          };
        });

        showNotification('success', `Image "${file.name}" uploaded successfully! The hero is now set to Image. Click "Publish to Live Homepage" to update the live website.`);
      }
    } catch (err: any) {
      console.error('Media upload error:', err);
      showNotification('error', 'Upload failed: ' + (err?.message || 'Please check your connection and try again.'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Save Draft (Local only)
  const handleSaveDraft = () => {
    if (!heroForm) return;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(heroForm));
    showNotification('info', 'Draft saved locally! You can test it in the device preview window below before publishing.');
  };

  // Publish to Live Website
  const handlePublish = async () => {
    if (!heroForm || !settings) return;

    // Strict guard: Never allow temporary browser-session blob: URLs to be published
    if (heroForm.videoUrl?.startsWith('blob:')) {
      showNotification('error', 'Video is still uploading or has a temporary session blob URL. Please wait for upload to complete before publishing.');
      return;
    }
    if (heroForm.imageUrl?.startsWith('blob:')) {
      showNotification('error', 'Image is still uploading or has a temporary session blob URL. Please wait for upload to complete before publishing.');
      return;
    }
    if (heroForm.videoPosterUrl?.startsWith('blob:')) {
      showNotification('error', 'Poster image has a temporary session blob URL. Please wait for upload to complete before publishing.');
      return;
    }

    if (heroForm.mediaType === 'video' && !heroForm.videoUrl) {
      showNotification('error', 'Please configure or upload a video asset before publishing Video Hero.');
      return;
    }

    setSaving(true);
    try {
      const updatedHero: HeroSettings = {
        ...heroForm,
        publishedAt: new Date().toISOString(),
        publishedBy: 'Administrator'
      };

      await updateSiteSettings({
        ...settings,
        hero: updatedHero
      });

      // Synchronize in-memory settings context across the application
      await refreshSettings();

      setPublishedHero(updatedHero);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      showNotification('success', 'Hero media and homepage settings successfully published to the live website!');
    } catch (err: any) {
      console.error('Publish error:', err);
      showNotification('error', 'Failed to publish hero settings: ' + (err?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // Revert changes to published version
  const handleRevert = () => {
    if (!publishedHero) return;
    setHeroForm(publishedHero);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    showNotification('info', 'Reverted unsaved changes back to currently published hero settings.');
  };

  // Reset to Factory Brand Defaults
  const handleResetDefaults = () => {
    const defaults: HeroSettings = {
      mediaType: 'image',
      imageUrl: '/assets/indus-crop-hero.webp',
      imageMobileUrl: '/assets/indus-crop-hero-mobile.webp',
      imagePositionDesktop: 'center 36%',
      imagePositionMobile: 'center center',
      imageFit: 'cover',
      videoUrl: '/videos/hero-cinematic.mp4',
      videoPosterUrl: '/assets/indus-crop-hero.webp',
      videoLoop: true,
      videoMuted: true,
      overlayDarkness: 0.65,
      gradientStrength: 0.8,
      heroHeightPreset: 'standard',
      badgeText: 'Over 15 Years of Agri-Input Leadership & Innovation',
      titleLine1: 'Advancing Crop Health.',
      titleLine2: 'Growing Tomorrow.',
      teluguMotto: 'రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు',
      description: 'Indus Crop Care Pvt. Ltd. is a renowned agri-input enterprise with an established track record across Organic & Water-Soluble Fertilizers, Plant Micronutrients, Biofertilizers, Crop Protection Chemicals, Biopesticides, and Biostimulants — empowering farmers to maximize yields and enhance sustainability.',
      primaryCtaText: 'Explore Products',
      primaryCtaLink: '/products',
      secondaryCtaText: 'Contact Us',
      secondaryCtaLink: '/contact'
    };
    setHeroForm(defaults);
    showNotification('info', 'Reset form to premium Indus agricultural hero defaults. Click Publish to apply.');
  };

  if (loading || !heroForm) {
    return (
      <div className="admin-layout">
        <AdminNav />
        <main className="admin-main" style={{ padding: '60px', textAlign: 'center' }}>
          Loading Hero Media Manager...
        </main>
      </div>
    );
  }

  // Calculate live preview container styles
  const previewWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  return (
    <div className="admin-layout">
      <AdminNav />

      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Homepage Settings
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>/</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Hero Media Manager
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', color: 'var(--color-primary-green-dark)', margin: 0 }}>
              Hero Media & Visual Experience
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={handleSaveDraft}
              style={{ padding: '8px 16px', fontSize: '0.86rem' }}
            >
              <Save size={15} />
              <span>Save Draft</span>
            </button>

            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handlePublish}
              disabled={saving}
              style={{ padding: '8px 20px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Send size={15} />
              <span>{saving ? 'Publishing...' : 'Publish to Live Homepage'}</span>
            </button>
          </div>
        </header>

        <div className="admin-content" style={{ maxWidth: '1280px' }}>
          
          {/* Live Upload Progress Banner */}
          {isUploading && (
            <div style={{ 
              backgroundColor: '#E8F5E9', 
              border: '1px solid #A5D6A7', 
              padding: '12px 20px', 
              borderRadius: 'var(--radius-md)', 
              color: '#2E7D32', 
              marginBottom: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}>
              <Upload size={18} />
              <span>Uploading media to secure storage... {uploadProgress > 0 ? `(${uploadProgress}%)` : ''}</span>
            </div>
          )}

          {/* Notification Alert Banner */}
          {statusMessage && (
            <div style={{ 
              backgroundColor: statusMessage.type === 'success' ? '#E8F5E9' : statusMessage.type === 'error' ? '#FFEBEE' : '#E3F2FD', 
              border: `1px solid ${statusMessage.type === 'success' ? '#A5D6A7' : statusMessage.type === 'error' ? '#EF9A9A' : '#90CAF9'}`, 
              padding: '14px 20px', 
              borderRadius: 'var(--radius-md)', 
              color: statusMessage.type === 'success' ? '#2E7D32' : statusMessage.type === 'error' ? '#C62828' : '#1565C0', 
              marginBottom: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '12px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{statusMessage.text}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setStatusMessage(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'inherit' }}
              >
                ×
              </button>
            </div>
          )}

          {/* Published Status Bar */}
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--color-border-light)', 
            padding: '12px 20px', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--color-action-green)',
                boxShadow: '0 0 0 3px rgba(37, 211, 102, 0.25)'
              }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--color-charcoal-700)' }}>
                <strong>Currently Published:</strong> {publishedHero?.mediaType === 'video' ? 'Video Hero' : 'Agricultural Image Hero'}
                {publishedHero?.publishedAt && (
                  <span style={{ color: 'var(--color-charcoal-500)', marginLeft: '8px' }}>
                    (Published {new Date(publishedHero.publishedAt).toLocaleDateString()} at {new Date(publishedHero.publishedAt).toLocaleTimeString()})
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                type="button" 
                onClick={handleRevert}
                className="btn btn-outline" 
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                title="Discard unsaved edits and restore published state"
              >
                <Undo2 size={13} />
                <span>Revert to Published</span>
              </button>
              <button 
                type="button" 
                onClick={handleResetDefaults}
                className="btn btn-outline" 
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                title="Reset to brand default high-resolution image and wording"
              >
                <RotateCcw size={13} />
                <span>Reset Brand Defaults</span>
              </button>
            </div>
          </div>

          {/* TWO COLUMN WORKSPACE: Controls on Left, Device Preview on Right */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 480px) 1fr', gap: '28px', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Controls & Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Card 1: Unified Hero Media Manager (Image or Video) */}
              <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--color-charcoal-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} style={{ color: 'var(--color-primary-green)' }} />
                    <span>1. Hero Media (Image or Video)</span>
                  </h3>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: heroForm.mediaType === 'video' ? '#E8F5E9' : '#E3F2FD',
                    color: heroForm.mediaType === 'video' ? '#1B5E20' : '#0D47A1'
                  }}>
                    {heroForm.mediaType === 'video' ? <VideoIcon size={13} /> : <ImageIcon size={13} />}
                    <span>{heroForm.mediaType === 'video' ? 'Video Hero Active' : 'Image Hero Active'}</span>
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--color-charcoal-600)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  Upload a photo or video to display as the homepage hero. The system automatically detects your file format, optimizes it, and renders it across desktop, tablet, and mobile screens.
                </p>

                {/* Media Preview Box */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '190px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: '#0A180E',
                  marginBottom: '16px',
                  border: '1px solid var(--color-border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {heroForm.mediaType === 'video' && heroForm.videoUrl ? (
                    <video
                      key={heroForm.videoUrl}
                      src={heroForm.videoUrl}
                      poster={heroForm.videoPosterUrl || heroForm.imageUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={heroForm.imageUrl || '/assets/indus-crop-hero.webp'}
                      alt="Current hero preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}

                  {/* Overlay Type Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {heroForm.mediaType === 'video' ? <VideoIcon size={12} /> : <ImageIcon size={12} />}
                    <span>{heroForm.mediaType === 'video' ? 'Video Hero' : 'Image Hero'}</span>
                  </div>

                  {/* Publish Status Indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>
                      {publishedHero?.mediaType === heroForm.mediaType &&
                       publishedHero?.videoUrl === heroForm.videoUrl &&
                       publishedHero?.imageUrl === heroForm.imageUrl ? (
                        <span style={{ color: '#69F0AE', fontWeight: 600 }}>✓ Published & Live on Website</span>
                      ) : (
                        <span style={{ color: '#FFD54F', fontWeight: 600 }}>⚠️ Unsaved Changes (Click Publish above)</span>
                      )}
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem' }}>
                      {heroForm.mediaType === 'video' ? 'MP4 / WebM' : 'WebP / JPG'}
                    </span>
                  </div>
                </div>

                {/* Single Unified Upload / Replace Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/webm"
                  onChange={handleUnifiedMediaUpload}
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '12px 20px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      gap: '8px'
                    }}
                  >
                    <Upload size={16} />
                    <span>
                      {isUploading
                        ? `Uploading to Cloud Storage... (${uploadProgress}%)`
                        : (heroForm.imageUrl || heroForm.videoUrl)
                        ? 'Replace Media (Upload New Image or Video)'
                        : 'Upload Hero Image or Video'}
                    </span>
                  </button>

                  <p style={{ fontSize: '0.75rem', color: 'var(--color-charcoal-500)', margin: 0, textAlign: 'center', lineHeight: '1.4' }}>
                    Select an image (JPG, PNG, WebP up to 15MB) or video (MP4, WebM up to 25MB). Auto-detected and stored permanently.
                  </p>
                </div>

                {/* Quick Display Switcher (if both formats are available) */}
                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '14px', marginTop: '4px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '8px', display: 'block', color: 'var(--color-charcoal-600)' }}>
                    Active Hero Display Mode:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('mediaType', 'image')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: heroForm.mediaType === 'image' ? '2px solid var(--color-primary-green)' : '1px solid var(--color-border-light)',
                        backgroundColor: heroForm.mediaType === 'image' ? 'var(--color-primary-green-surface)' : '#FAFCFA',
                        color: heroForm.mediaType === 'image' ? 'var(--color-primary-green-dark)' : 'var(--color-charcoal-700)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                    >
                      <ImageIcon size={15} />
                      <span>Display Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFieldChange('mediaType', 'video')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: heroForm.mediaType === 'video' ? '2px solid var(--color-primary-green)' : '1px solid var(--color-border-light)',
                        backgroundColor: heroForm.mediaType === 'video' ? 'var(--color-primary-green-surface)' : '#FAFCFA',
                        color: heroForm.mediaType === 'video' ? 'var(--color-primary-green-dark)' : 'var(--color-charcoal-700)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                    >
                      <VideoIcon size={15} />
                      <span>Display Video</span>
                    </button>
                  </div>
                </div>

                {/* Additional Playback Options for Video */}
                {heroForm.mediaType === 'video' && (
                  <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#F8FAF8', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-light)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={heroForm.videoLoop !== false}
                        onChange={(e) => handleFieldChange('videoLoop', e.target.checked)}
                      />
                      <span><strong>Loop video continuously</strong> (Muted autoplay on all devices)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Card 2: Presentation & Legibility Overlays */}
              <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-charcoal-900)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} style={{ color: 'var(--color-primary-green)' }} />
                  <span>2. Presentation & Legibility Overlays</span>
                </h3>

                {/* Darkness Slider */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Darkness Overlay (Text Legibility):</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary-green)' }}>
                      {Math.round((heroForm.overlayDarkness ?? 0.65) * 100)}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0.2" 
                    max="0.9" 
                    step="0.05"
                    value={heroForm.overlayDarkness ?? 0.65}
                    onChange={(e) => handleFieldChange('overlayDarkness', parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-charcoal-500)' }}>
                    <span>Brighter Photo</span>
                    <span>Balanced (65%)</span>
                    <span>High Contrast (90%)</span>
                  </div>
                </div>

                {/* Hero Height Preset */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Hero Section Height Preset
                  </label>
                  <select 
                    className="form-control"
                    value={heroForm.heroHeightPreset || 'standard'}
                    onChange={(e) => handleFieldChange('heroHeightPreset', e.target.value)}
                  >
                    <option value="standard">Standard Cinematic (Clamp 540px - 800px)</option>
                    <option value="compact">Compact (Clamp 450px - 580px)</option>
                    <option value="tall">Tall Executive (Clamp 660px - 920px)</option>
                    <option value="fullscreen">Fullscreen Viewport (100vh)</option>
                  </select>
                </div>
              </div>

              {/* Card 3: Editable Hero Copy & CTAs */}
              <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-charcoal-900)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: 'var(--color-harvest-gold)' }} />
                  <span>3. Editable Headline & Call-to-Actions</span>
                </h3>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Introductory Eyebrow Badge</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={heroForm.badgeText || ''}
                    onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Headline Line 1 (White)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={heroForm.titleLine1 || ''}
                      onChange={(e) => handleFieldChange('titleLine1', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Headline Line 2 (Green Gradient)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={heroForm.titleLine2 || ''}
                      onChange={(e) => handleFieldChange('titleLine2', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Telugu Brand Motto</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={heroForm.teluguMotto || ''}
                    onChange={(e) => handleFieldChange('teluguMotto', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Supporting Editorial Narrative</label>
                  <textarea 
                    className="form-control"
                    rows={3}
                    value={heroForm.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Primary CTA Label & Link</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        value={heroForm.primaryCtaText || ''}
                        onChange={(e) => handleFieldChange('primaryCtaText', e.target.value)}
                        placeholder="Label"
                      />
                      <input 
                        type="text" 
                        className="form-control"
                        value={heroForm.primaryCtaLink || ''}
                        onChange={(e) => handleFieldChange('primaryCtaLink', e.target.value)}
                        placeholder="/products"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Secondary CTA Label & Link</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        value={heroForm.secondaryCtaText || ''}
                        onChange={(e) => handleFieldChange('secondaryCtaText', e.target.value)}
                        placeholder="Label"
                      />
                      <input 
                        type="text" 
                        className="form-control"
                        value={heroForm.secondaryCtaLink || ''}
                        onChange={(e) => handleFieldChange('secondaryCtaLink', e.target.value)}
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: Live Interactive Device Preview Window */}
            <div style={{ position: 'sticky', top: '90px' }}>
              <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                
                {/* Device Switcher Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={18} style={{ color: 'var(--color-primary-green)' }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-charcoal-900)' }}>
                      Interactive Live Preview
                    </span>
                  </div>

                  {/* Responsive Switcher Buttons */}
                  <div style={{ display: 'inline-flex', background: 'var(--color-sage-100)', borderRadius: 'var(--radius-pill)', padding: '3px' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        background: previewDevice === 'desktop' ? '#FFFFFF' : 'transparent',
                        color: previewDevice === 'desktop' ? 'var(--color-primary-green-dark)' : 'var(--color-charcoal-600)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        boxShadow: previewDevice === 'desktop' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      <Monitor size={14} />
                      <span>Desktop (16:9)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewDevice('tablet')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        background: previewDevice === 'tablet' ? '#FFFFFF' : 'transparent',
                        color: previewDevice === 'tablet' ? 'var(--color-primary-green-dark)' : 'var(--color-charcoal-600)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        boxShadow: previewDevice === 'tablet' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      <Tablet size={14} />
                      <span>Tablet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        background: previewDevice === 'mobile' ? '#FFFFFF' : 'transparent',
                        color: previewDevice === 'mobile' ? 'var(--color-primary-green-dark)' : 'var(--color-charcoal-600)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        boxShadow: previewDevice === 'mobile' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      <Smartphone size={14} />
                      <span>Mobile (375px)</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Device Frame */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  backgroundColor: '#0F1A12', 
                  padding: previewDevice === 'mobile' ? '20px 10px' : previewDevice === 'tablet' ? '16px' : '0', 
                  borderRadius: 'var(--radius-md)', 
                  overflow: 'hidden' 
                }}>
                  <div style={{
                    width: previewWidths[previewDevice],
                    transition: 'width 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: previewDevice === 'mobile' ? '28px' : previewDevice === 'tablet' ? '16px' : '0',
                    border: previewDevice !== 'desktop' ? '6px solid #2A3B30' : 'none',
                    boxShadow: previewDevice !== 'desktop' ? '0 12px 40px rgba(0,0,0,0.6)' : 'none'
                  }}>
                    
                    {/* Simulated Mini Navbar */}
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      height: '52px', 
                      background: 'rgba(3, 14, 7, 0.85)', 
                      backdropFilter: 'blur(8px)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '0 20px', 
                      zIndex: 30,
                      borderBottom: '1px solid rgba(255,255,255,0.08)'
                    }}>
                      <img 
                        src="/images/branding/indus/indus-logo.png" 
                        alt="Indus Logo" 
                        style={{ height: '26px', width: 'auto' }} 
                      />
                      <div style={{ display: previewDevice === 'mobile' ? 'none' : 'flex', gap: '16px', fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 600 }}>
                        <span>Home</span>
                        <span>About</span>
                        <span>Products</span>
                        <span>Contact</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-action-green)', fontWeight: 700 }}>
                        +91 88860 69143
                      </div>
                    </div>

                    {/* Simulated Hero Stage */}
                    <div style={{
                      position: 'relative',
                      minHeight: previewDevice === 'mobile' ? '460px' : '380px',
                      paddingTop: '68px',
                      paddingBottom: '36px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      
                      {/* Live Background Media */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        backgroundImage: heroForm.mediaType === 'image' 
                          ? `url('${previewDevice === 'mobile' && heroForm.imageMobileUrl ? heroForm.imageMobileUrl : heroForm.imageUrl}')` 
                          : `url('${heroForm.videoPosterUrl || heroForm.imageUrl}')`,
                        backgroundSize: heroForm.imageFit || 'cover',
                        backgroundPosition: previewDevice === 'mobile' ? (heroForm.imagePositionMobile || 'center center') : (heroForm.imagePositionDesktop || 'center 36%'),
                        backgroundRepeat: 'no-repeat'
                      }}>
                        {heroForm.mediaType === 'video' && heroForm.videoUrl && (
                          <video
                            key={heroForm.videoUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={heroForm.videoPosterUrl || heroForm.imageUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          >
                            <source 
                              src={heroForm.videoUrl} 
                              type={heroForm.videoUrl.toLowerCase().includes('.webm') ? 'video/webm' : 'video/mp4'} 
                            />
                          </video>
                        )}
                      </div>

                      {/* Live Dynamic Gradient Overlays */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        pointerEvents: 'none',
                        background: `linear-gradient(90deg, 
                          rgba(3, 14, 7, ${Math.min(0.96, (heroForm.overlayDarkness ?? 0.65) + 0.25)}) 0%, 
                          rgba(3, 14, 7, ${heroForm.overlayDarkness ?? 0.65}) 55%, 
                          rgba(3, 14, 7, ${(heroForm.overlayDarkness ?? 0.65) * 0.45}) 100%)`
                      }} />

                      {/* Live Hero Content Elements */}
                      <div style={{ position: 'relative', zIndex: 10, maxWidth: '640px' }}>
                        
                        {/* Eyebrow Badge */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(4, 20, 11, 0.75)',
                          border: '1px solid rgba(37, 211, 102, 0.35)',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: 'var(--color-action-green)',
                          marginBottom: '10px'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--color-action-green)' }} />
                          <span>{heroForm.badgeText}</span>
                        </div>

                        {/* Title */}
                        <h2 style={{
                          fontSize: previewDevice === 'mobile' ? '1.5rem' : '2.1rem',
                          fontWeight: 900,
                          color: '#FFFFFF',
                          lineHeight: '1.2',
                          margin: '0 0 8px 0',
                          fontFamily: 'var(--font-heading)'
                        }}>
                          {heroForm.titleLine1}<br />
                          <span style={{
                            background: 'linear-gradient(135deg, #FFE082 0%, #25D366 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {heroForm.titleLine2}
                          </span>
                        </h2>

                        {/* Telugu Motto */}
                        {heroForm.teluguMotto && (
                          <div style={{
                            display: 'inline-block',
                            background: 'rgba(245, 199, 78, 0.15)',
                            borderLeft: '3px solid #F5C74E',
                            padding: '3px 10px',
                            borderRadius: '0 4px 4px 0',
                            color: '#FFE082',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            marginBottom: '10px'
                          }}>
                            {heroForm.teluguMotto}
                          </div>
                        )}

                        {/* Supporting Narrative */}
                        <p style={{
                          fontSize: previewDevice === 'mobile' ? '0.78rem' : '0.86rem',
                          lineHeight: '1.5',
                          color: 'var(--color-sage-200)',
                          margin: '0 0 16px 0',
                          display: '-webkit-box',
                          WebkitLineClamp: previewDevice === 'mobile' ? 3 : 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {heroForm.description}
                        </p>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #168547 0%, #0E6B38 100%)',
                            color: '#FFFFFF',
                            padding: '8px 18px',
                            borderRadius: '30px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 14px rgba(14, 107, 56, 0.4)'
                          }}>
                            <span>{heroForm.primaryCtaText}</span>
                            <ArrowRight size={13} />
                          </span>

                          <span style={{
                            background: 'rgba(255, 255, 255, 0.12)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            padding: '8px 16px',
                            borderRadius: '30px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <PhoneCall size={12} />
                            <span>{heroForm.secondaryCtaText}</span>
                          </span>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>

                {/* Helpful Hint */}
                <div style={{ marginTop: '14px', fontSize: '0.78rem', color: 'var(--color-charcoal-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={14} style={{ color: 'var(--color-primary-green)' }} />
                  <span>Changes made in the left controls update this device preview in real-time before publishing.</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};
