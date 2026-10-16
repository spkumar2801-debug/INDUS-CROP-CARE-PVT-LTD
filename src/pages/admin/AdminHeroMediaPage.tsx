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
  Layers, 
  HelpCircle,
  Undo2
} from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { HeroSettings, SiteSettings } from '../../types/settings';
import { getSiteSettings, updateSiteSettings } from '../../services/settingsService';
import { uploadToCloudinary, isCloudinaryConfigured } from '../../lib/cloudinary';

const DRAFT_STORAGE_KEY = 'indus_hero_draft_v1';

export const AdminHeroMediaPage: React.FC = () => {
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
      setPublishedHero(activeHero);

      // Check if there is an unsaved draft
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
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

  // Image Upload handler (Desktop & Mobile)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile' | 'poster') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      showNotification('error', 'Image is too large. Maximum allowed size is 15MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Immediate preview using object URL
    const localUrl = URL.createObjectURL(file);
    if (target === 'desktop') handleFieldChange('imageUrl', localUrl);
    else if (target === 'mobile') handleFieldChange('imageMobileUrl', localUrl);
    else if (target === 'poster') handleFieldChange('videoPosterUrl', localUrl);

    if (isCloudinaryConfigured()) {
      try {
        const res = await uploadToCloudinary(file, 'branding', (percent) => setUploadProgress(percent));
        if (target === 'desktop') handleFieldChange('imageUrl', res.secureUrl);
        else if (target === 'mobile') handleFieldChange('imageMobileUrl', res.secureUrl);
        else if (target === 'poster') handleFieldChange('videoPosterUrl', res.secureUrl);
        showNotification('success', `High-resolution ${target} image uploaded to cloud storage successfully!`);
      } catch (err: any) {
        console.warn('Cloud storage upload warning:', err);
        // Fallback: convert to optimized base64 for persistent offline/local storage
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          if (target === 'desktop') handleFieldChange('imageUrl', base64);
          else if (target === 'mobile') handleFieldChange('imageMobileUrl', base64);
          else if (target === 'poster') handleFieldChange('videoPosterUrl', base64);
          showNotification('info', `Image loaded locally and ready to publish.`);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Local persistent Base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (target === 'desktop') handleFieldChange('imageUrl', base64);
        else if (target === 'mobile') handleFieldChange('imageMobileUrl', base64);
        else if (target === 'poster') handleFieldChange('videoPosterUrl', base64);
        setIsUploading(false);
        showNotification('success', `${target.toUpperCase()} image loaded and ready for live preview.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Video Upload handler
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('mp4') && !file.type.includes('webm')) {
      showNotification('error', 'Invalid video format. Please upload MP4 (H.264) or WebM video.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showNotification('error', 'Video file exceeds 25MB. Please compress your video to under 25MB for optimal mobile loading.');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    handleFieldChange('videoUrl', localUrl);
    showNotification('success', `Video "${file.name}" loaded for preview! Remember to enter an official cloud video URL or publish.`);
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
              
              {/* Card 1: Media Type Selection */}
              <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-charcoal-900)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} style={{ color: 'var(--color-primary-green)' }} />
                  <span>1. Choose Hero Media Type</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-charcoal-600)', margin: '0 0 16px 0' }}>
                  Switch between high-impact photorealistic photography and cinematic video without breaking public layout.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('mediaType', 'image')}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: heroForm.mediaType === 'image' ? '2px solid var(--color-primary-green)' : '1px solid var(--color-border-light)',
                      backgroundColor: heroForm.mediaType === 'image' ? 'var(--color-primary-green-surface)' : '#FAFCFA',
                      color: heroForm.mediaType === 'image' ? 'var(--color-primary-green-dark)' : 'var(--color-charcoal-700)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <ImageIcon size={22} />
                    <span>Image Hero</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--color-charcoal-500)' }}>
                      Recommended (Ultra Fast)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFieldChange('mediaType', 'video')}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: heroForm.mediaType === 'video' ? '2px solid var(--color-primary-green)' : '1px solid var(--color-border-light)',
                      backgroundColor: heroForm.mediaType === 'video' ? 'var(--color-primary-green-surface)' : '#FAFCFA',
                      color: heroForm.mediaType === 'video' ? 'var(--color-primary-green-dark)' : 'var(--color-charcoal-700)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <VideoIcon size={22} />
                    <span>Video Hero</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--color-charcoal-500)' }}>
                      HTML5 MP4 / WebM
                    </span>
                  </button>
                </div>
              </div>

              {/* Card 2: Image Media Settings (Shown if Image Hero) */}
              {heroForm.mediaType === 'image' && (
                <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--color-charcoal-900)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={18} style={{ color: 'var(--color-primary-green)' }} />
                    <span>2. Image Asset & Positioning</span>
                  </h3>

                  {/* Desktop Image Upload */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Desktop Landscape Image (16:9)</span>
                      <span style={{ color: 'var(--color-primary-green)', fontWeight: 600 }}>WebP / JPG</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        value={heroForm.imageUrl}
                        onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                        placeholder="/assets/indus-crop-hero.webp or https://..."
                        style={{ fontSize: '0.85rem' }}
                      />
                      <label 
                        className="btn btn-outline" 
                        style={{ padding: '0 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                      >
                        <Upload size={14} />
                        <span>Upload</span>
                        <input 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp,image/jpg" 
                          onChange={(e) => handleImageFileUpload(e, 'desktop')} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Mobile Image Upload (Optional separate crop) */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Mobile Portrait Crop (Optional)</span>
                      <span style={{ color: 'var(--color-charcoal-500)', fontWeight: 500 }}>375px+ screens</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        value={heroForm.imageMobileUrl || ''}
                        onChange={(e) => handleFieldChange('imageMobileUrl', e.target.value)}
                        placeholder="e.g. /assets/indus-crop-hero-mobile.webp"
                        style={{ fontSize: '0.85rem' }}
                      />
                      <label 
                        className="btn btn-outline" 
                        style={{ padding: '0 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                      >
                        <Upload size={14} />
                        <span>Upload</span>
                        <input 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp,image/jpg" 
                          onChange={(e) => handleImageFileUpload(e, 'mobile')} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Desktop Horizon & Vertical Positioning */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">
                      Desktop Focal Point & Horizon Alignment
                    </label>
                    <select 
                      className="form-control"
                      value={heroForm.imagePositionDesktop || 'center 36%'}
                      onChange={(e) => handleFieldChange('imagePositionDesktop', e.target.value)}
                    >
                      <option value="center 36%">Golden Horizon (Recommended: 36% from top)</option>
                      <option value="center center">Dead Center (50% 50%)</option>
                      <option value="center top">High Horizon (Top of field)</option>
                      <option value="center bottom">Close Foliage (Bottom crop leaves)</option>
                      <option value="left center">Focus on Left Foliage</option>
                      <option value="right center">Focus on Right Sunlit Rows</option>
                    </select>
                  </div>

                  {/* Mobile Focal Point Positioning */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">
                      Mobile Focal Point Alignment
                    </label>
                    <select 
                      className="form-control"
                      value={heroForm.imagePositionMobile || 'center center'}
                      onChange={(e) => handleFieldChange('imagePositionMobile', e.target.value)}
                    >
                      <option value="center center">Center Crop (Recommended for mobile)</option>
                      <option value="center 30%">Upper Horizon (30% vertical)</option>
                      <option value="42% center">Left-Center Crop (Balanced for text)</option>
                      <option value="right center">Right Sunlit Rows Focus</option>
                    </select>
                  </div>

                  {/* Image Fit Mode */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      Image Fit Sizing
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="imageFit" 
                          checked={heroForm.imageFit === 'cover'} 
                          onChange={() => handleFieldChange('imageFit', 'cover')} 
                        />
                        <span>Cover (Full Bleed Hero Background)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="imageFit" 
                          checked={heroForm.imageFit === 'contain'} 
                          onChange={() => handleFieldChange('imageFit', 'contain')} 
                        />
                        <span>Contain (Show full unaltered frame)</span>
                      </label>
                    </div>
                  </div>

                </div>
              )}

              {/* Card 3: Video Media Settings (Shown if Video Hero) */}
              {heroForm.mediaType === 'video' && (
                <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--color-charcoal-900)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VideoIcon size={18} style={{ color: 'var(--color-primary-green)' }} />
                    <span>2. Video Stream & Poster Controls</span>
                  </h3>

                  {/* Video URL & File Upload */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Desktop Video Asset (MP4 / WebM)</span>
                      <span style={{ color: 'var(--color-charcoal-500)', fontSize: '0.78rem' }}>Under 25MB</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        value={heroForm.videoUrl || ''}
                        onChange={(e) => handleFieldChange('videoUrl', e.target.value)}
                        placeholder="/videos/hero-cinematic.mp4 or https://..."
                        style={{ fontSize: '0.85rem' }}
                      />
                      <label 
                        className="btn btn-outline" 
                        style={{ padding: '0 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                      >
                        <Upload size={14} />
                        <span>Upload</span>
                        <input 
                          type="file" 
                          accept="video/mp4,video/webm" 
                          onChange={handleVideoFileUpload} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Video Fallback Poster Image */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Fallback Poster Photograph</span>
                      <span style={{ color: 'var(--color-primary-green)', fontWeight: 600 }}>Zero layout shift</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        value={heroForm.videoPosterUrl || ''}
                        onChange={(e) => handleFieldChange('videoPosterUrl', e.target.value)}
                        placeholder="/assets/indus-crop-hero.webp"
                        style={{ fontSize: '0.85rem' }}
                      />
                      <label 
                        className="btn btn-outline" 
                        style={{ padding: '0 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                      >
                        <Upload size={14} />
                        <span>Upload</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageFileUpload(e, 'poster')} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Video Playback Flags */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={heroForm.videoMuted !== false} 
                        disabled 
                      />
                      <span><strong>Always Muted (Locked):</strong> Required for browser autoplay policies & farmer friendliness.</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={heroForm.videoLoop !== false} 
                        onChange={(e) => handleFieldChange('videoLoop', e.target.checked)} 
                      />
                      <span>Loop Video Continuously</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Card 4: Presentation & Overlay Sliders */}
              <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-charcoal-900)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} style={{ color: 'var(--color-primary-green)' }} />
                  <span>3. Presentation & Legibility Overlays</span>
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

              {/* Card 5: Editable Hero Copy & CTAs */}
              <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-charcoal-900)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: 'var(--color-harvest-gold)' }} />
                  <span>4. Editable Headline & Call-to-Actions</span>
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
                        backgroundImage: heroForm.mediaType === 'image' ? `url('${previewDevice === 'mobile' && heroForm.imageMobileUrl ? heroForm.imageMobileUrl : heroForm.imageUrl}')` : undefined,
                        backgroundSize: heroForm.imageFit || 'cover',
                        backgroundPosition: previewDevice === 'mobile' ? (heroForm.imagePositionMobile || 'center center') : (heroForm.imagePositionDesktop || 'center 36%'),
                        backgroundRepeat: 'no-repeat'
                      }}>
                        {heroForm.mediaType === 'video' && heroForm.videoUrl && (
                          <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={heroForm.videoPosterUrl || heroForm.imageUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          >
                            <source src={heroForm.videoUrl} type="video/mp4" />
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
