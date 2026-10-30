import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  ShieldCheck, 
  Microscope, 
  Award, 
  MessageSquareShare, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  Layers,
  FlaskConical,
  HeartHandshake,
  Building2,
  Check,
  TrendingUp
} from 'lucide-react';
import { Product } from '../types/product';
import { getPublishedProducts, subscribeToProducts } from '../services/productService';
import { ProductCard } from '../components/products/ProductCard';
import { CountUpNumber } from '../components/common/CountUpNumber';
import { useSiteSettings } from '../context/SettingsContext';

interface HomePageProps {
  onOpenQuote: (product?: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenQuote, onOpenDetails }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoPlaybackError, setVideoPlaybackError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { settings } = useSiteSettings();

  useEffect(() => {
    document.documentElement.classList.add('page-home');
    let isMounted = true;

    const fetchProducts = () => {
      getPublishedProducts()
        .then(data => {
          if (isMounted) {
            setProducts(data);
            setLoading(false);
          }
        });
    };

    fetchProducts();
    const unsubscribe = subscribeToProducts(fetchProducts);

    return () => {
      document.documentElement.classList.remove('page-home');
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const hero = settings?.hero;

  const heroMediaType = hero?.mediaType === 'video' ? 'video' : 'image';
  
  // Guard against any temporary or stale browser blob: URLs
  const rawImageUrl = hero?.imageUrl || '';
  const heroImageUrl = (rawImageUrl && !rawImageUrl.startsWith('blob:')) 
    ? rawImageUrl 
    : '/assets/indus-crop-hero.webp';

  const rawMobileUrl = hero?.imageMobileUrl || '';
  const heroImageMobileUrl = (rawMobileUrl && !rawMobileUrl.startsWith('blob:')) 
    ? rawMobileUrl 
    : '/assets/indus-crop-hero-mobile.webp';

  const heroPositionDesktop = hero?.imagePositionDesktop || 'center 36%';
  const heroPositionMobile = hero?.imagePositionMobile || 'center center';
  const heroFit = hero?.imageFit || 'cover';
  
  const rawVideoUrl = hero?.videoUrl || '';
  const heroVideoUrl = (rawVideoUrl && !rawVideoUrl.startsWith('blob:')) 
    ? rawVideoUrl 
    : '/videos/hero-cinematic.mp4';

  const autoDerivedPoster = (rawVideoUrl && !rawVideoUrl.startsWith('blob:'))
    ? rawVideoUrl.replace(/\.(mp4|webm)$/i, '.jpg')
    : '';

  const rawPosterUrl = hero?.videoPosterUrl || '';
  const heroVideoPoster = (rawPosterUrl && !rawPosterUrl.startsWith('blob:') && !rawPosterUrl.includes('indus-crop-hero.webp')) 
    ? rawPosterUrl 
    : (autoDerivedPoster || '');

  const heroVideoLoop = hero?.videoLoop !== false;
  const heroVideoMuted = hero?.videoMuted !== false;

  // Guarantee mobile browser autoplay (iOS Safari and Android Chrome) by setting DOM attributes directly
  useEffect(() => {
    if (heroMediaType === 'video' && videoRef.current) {
      setVideoPlaybackError(false);
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = heroVideoMuted;
      videoRef.current.play().catch((err) => {
        console.info('[Indus Hero Video] Autoplay handled by browser:', err);
      });
    }
  }, [heroMediaType, heroVideoUrl, heroVideoMuted]);

  // Subtle cinematic hero background parallax during scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // If browser natively supports CSS scroll-driven animations, CSS handles it off-thread
    if (window.CSS && CSS.supports && CSS.supports('animation-timeline', 'scroll()')) {
      return;
    }

    const bgEl = document.querySelector<HTMLElement>('.hero-cinematic-bg');
    if (!bgEl) return;

    let rafId: number | null = null;
    let lastScrollY = -1;

    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY <= 900 && scrollY !== lastScrollY) {
        lastScrollY = scrollY;
        if (rafId === null) {
          rafId = window.requestAnimationFrame(() => {
            const offset = (scrollY * 0.15).toFixed(1);
            bgEl.style.setProperty('--hero-scroll-parallax', `${offset}px`);
            rafId = null;
          });
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const overlayDarkness = typeof hero?.overlayDarkness === 'number' ? hero.overlayDarkness : 0.65;
  const gradientStrength = typeof hero?.gradientStrength === 'number' ? hero.gradientStrength : 0.8;
  const heightPreset = hero?.heroHeightPreset || 'standard';

  const badgeText = hero?.badgeText || 'Over 15 Years of Agri-Input Leadership & Innovation';
  const titleLine1 = hero?.titleLine1 || 'Advancing Crop Health.';
  const titleLine2 = hero?.titleLine2 || 'Growing Tomorrow.';
  const teluguMotto = hero?.teluguMotto || 'రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు';
  const description = hero?.description || 'Indus Crop Care Pvt. Ltd. is a renowned agri-input enterprise with an established track record across Organic & Water-Soluble Fertilizers, Plant Micronutrients, Biofertilizers, Crop Protection Chemicals, Biopesticides, and Biostimulants — empowering farmers to maximize yields and enhance sustainability.';
  const primaryCtaText = hero?.primaryCtaText || 'Explore Products';
  const primaryCtaLink = hero?.primaryCtaLink || '/products';
  const secondaryCtaText = hero?.secondaryCtaText || 'Contact Us';
  const secondaryCtaLink = hero?.secondaryCtaLink || '/contact';

  // Display premier first 4 featured formulations on homepage
  const displayedProducts = useMemo(() => {
    const featured = products.filter(p => p.isFeatured || p.isPublished);
    return featured.slice(0, 4);
  }, [products]);

  return (
    <div>
      {/* 1. Cinematic Hero Section */}
      <section 
        className={`hero-section hero-height-${heightPreset}`} 
        aria-label="Indus Crop Care Hero"
      >
        <div 
          className="hero-cinematic-bg" 
          aria-hidden="true"
          style={{
            backgroundImage: heroMediaType === 'image' 
              ? `url('${heroImageUrl}')` 
              : (heroVideoPoster ? `url('${heroVideoPoster}')` : undefined),
            backgroundPosition: heroPositionDesktop,
            ['--hero-pos-desktop' as string]: heroPositionDesktop,
            ['--hero-pos-mobile' as string]: heroPositionMobile,
            ['--hero-fit' as string]: heroFit
          } as React.CSSProperties}
        >
          {heroMediaType === 'video' && !videoPlaybackError ? (
            <video
              ref={(node) => {
                videoRef.current = node;
                if (node) {
                  node.defaultMuted = true;
                  node.muted = heroVideoMuted;
                }
              }}
              key={heroVideoUrl}
              className="hero-video-element"
              autoPlay
              muted={heroVideoMuted}
              loop={heroVideoLoop}
              playsInline
              preload="auto"
              poster={heroVideoPoster || undefined}
              aria-hidden="true"
              onError={() => {
                console.warn('[Indus Hero Video] Playback encountered an issue, showing fallback poster smoothly.');
                setVideoPlaybackError(true);
              }}
            >
              <source 
                src={heroVideoUrl} 
                type={heroVideoUrl.toLowerCase().includes('.webm') ? 'video/webm' : 'video/mp4'} 
              />
              {hero?.videoMobileUrl && !hero.videoMobileUrl.startsWith('blob:') && (
                <source 
                  src={hero.videoMobileUrl} 
                  type={hero.videoMobileUrl.toLowerCase().includes('.webm') ? 'video/webm' : 'video/mp4'} 
                />
              )}
            </video>
          ) : heroMediaType === 'video' && videoPlaybackError ? (
            <img 
              src={heroVideoPoster} 
              alt="Indus Crop Care Agricultural Landscape" 
              className="hero-image-element"
              loading="eager"
              decoding="async"
            />
          ) : (
            <picture>
              {heroImageMobileUrl && (
                <source media="(max-width: 640px)" srcSet={heroImageMobileUrl} />
              )}
              <img 
                src={heroImageUrl} 
                alt="Indus Crop Care Agricultural Landscape" 
                className="hero-image-element"
                loading="eager"
                decoding="async"
              />
            </picture>
          )}
        </div>

        {/* Dynamic Multi-stop Editorial Gradient Overlays */}
        <div 
          className="hero-overlay" 
          aria-hidden="true" 
          style={{
            background: `linear-gradient(90deg, 
              rgba(3, 14, 7, ${Math.min(0.96, overlayDarkness + 0.25)}) 0%, 
              rgba(3, 14, 7, ${overlayDarkness}) 45%, 
              rgba(3, 14, 7, ${overlayDarkness * 0.55}) 78%, 
              rgba(3, 14, 7, ${overlayDarkness * 0.35}) 100%),
              linear-gradient(180deg, 
              rgba(3, 14, 7, ${gradientStrength * 0.65}) 0%, 
              transparent 35%, 
              rgba(3, 14, 7, ${gradientStrength}) 100%)`
          }}
        />

        <div className="container">
          <div className="hero-content-wrap">
            
            {/* Introductory Eyebrow Badge */}
            <div className="hero-badge">
              <span className="dot" aria-hidden="true" />
              <span>{badgeText}</span>
              <span className="hero-badge-rule" aria-hidden="true" />
            </div>

            {/* Editorial Hero Headline */}
            <h1 className="hero-title">
              <span className="hero-title-line hero-title-line1">{titleLine1}</span>
              <span className="hero-title-line hero-title-line2 hero-gradient-text">{titleLine2}</span>
            </h1>

            {/* Telugu Brand Motto Banner */}
            {teluguMotto && (
              <div className="hero-telugu-banner">
                <span>{teluguMotto}</span>
              </div>
            )}

            {/* Hero Supporting Narrative */}
            <p className="hero-desc">
              {description}
            </p>

            {/* Hero Action CTAs */}
            <div className="hero-actions">
              <Link 
                to={primaryCtaLink} 
                className="hero-btn-primary" 
                aria-label={primaryCtaText}
              >
                <span>{primaryCtaText}</span>
                <ArrowRight size={17} className="hero-btn-arrow" />
              </Link>

              <Link 
                to={secondaryCtaLink} 
                className="hero-btn-secondary"
                aria-label={secondaryCtaText}
              >
                <PhoneCall size={16} className="hero-btn-icon" />
                <span>{secondaryCtaText}</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Reference-Inspired Credentials Section: "Our Legacy of Agronomic Precision" */}
      <section className="credentials-section" aria-label="Indus Agricultural Credentials">
        <div className="credentials-ambient" />
        <div className="container">
          
          <div className="section-title-wrap reveal-on-scroll" style={{ marginBottom: '40px' }}>
            <span className="section-tag">
              <ShieldCheck size={14} />
              <span>Standard of Excellence</span>
            </span>
            <h2 className="section-title" style={{ color: '#FFFFFF' }}>
              OUR LEGACY OF AGRONOMIC PRECISION
            </h2>
            <p className="section-subtitle" style={{ color: 'var(--color-sage-200)' }}>
              15+ Years of Dedicated Field Trials, Scientific Formulation & Farmer Trust
            </p>
          </div>

          <div className="credentials-grid">
            
            {/* Metric 1: 15+ Years */}
            <div className="credential-item reveal-on-scroll stagger-1">
              <div className="credential-icon-orb">
                <Building2 size={24} style={{ color: 'var(--color-action-green)' }} />
              </div>
              <div className="credential-number" style={{ color: '#FFE082' }}>
                <CountUpNumber end={15} suffix="+" />
              </div>
              <div className="credential-label-top">ESTABLISHED</div>
              <div className="credential-label-bottom">IN TELANGANA</div>
              <p className="credential-desc">Over 15 Years of Continuous Agronomic Excellence</p>
            </div>

            {/* Metric 2: 105+ Formulations */}
            <div className="credential-item reveal-on-scroll stagger-2">
              <div className="credential-icon-orb">
                <FlaskConical size={24} style={{ color: 'var(--color-action-green)' }} />
              </div>
              <div className="credential-number" style={{ color: 'var(--color-action-green)' }}>
                <CountUpNumber end={105} suffix="+" />
              </div>
              <div className="credential-label-top">REGISTERED</div>
              <div className="credential-label-bottom">FORMULATIONS</div>
              <p className="credential-desc">Standardized Crop Care & Nutrition Solutions</p>
            </div>

            {/* Metric 3: ISO 9001:2015 */}
            <div className="credential-item reveal-on-scroll stagger-3">
              <div className="credential-icon-orb">
                <Award size={24} style={{ color: 'var(--color-action-green)' }} />
              </div>
              <div className="credential-number" style={{ color: '#FFFFFF' }}>
                ISO 9001
              </div>
              <div className="credential-label-top">QUALITY CERTIFIED</div>
              <div className="credential-label-bottom">MANUFACTURING</div>
              <p className="credential-desc">FCO & Central CIB Registered Standards</p>
            </div>

            {/* Metric 4: Pan-India Network */}
            <div className="credential-item reveal-on-scroll stagger-4">
              <div className="credential-icon-orb">
                <HeartHandshake size={24} style={{ color: 'var(--color-action-green)' }} />
              </div>
              <div className="credential-number" style={{ color: '#FFE082' }}>
                Pan-India
              </div>
              <div className="credential-label-top">DISTRIBUTOR</div>
              <div className="credential-label-bottom">& FARMER NETWORK</div>
              <p className="credential-desc">Trusted Across Telangana, AP & Leading States</p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Official Certifications & Accreditations Ribbon */}
      <section style={{ backgroundColor: 'var(--color-sage-100)', padding: '22px 0', borderBottom: '1px solid var(--color-sage-200)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-charcoal-800)' }}>
            <ShieldCheck size={22} style={{ color: 'var(--color-primary-green)' }} />
            <span style={{ fontSize: '0.94rem', fontWeight: 700 }}>
              Official Accreditations & Statutory Compliance
            </span>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '10px 20px', display: 'flex', alignItems: 'center', overflowX: 'auto', maxWidth: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <img 
              src="/images/branding/indus/certifications-bar.png" 
              alt="FCO Registered, Central CIB Registered, Certified ISO 9001:2015, PMMA, BIPA" 
              style={{ maxHeight: '36px', width: 'auto', objectFit: 'contain' }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 4. Broad Product Spectrum — Clean Warm Ivory Editorial Section */}
      <section className="section section-editorial-light" aria-label="Formulations Portfolio">
        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <span className="section-tag">
              <Layers size={14} />
              <span>Complete Crop Care Portfolio</span>
            </span>
            <h2 className="section-title">
              Our 11 Core Scientific Formulations
            </h2>
            <p className="section-subtitle">
              From broad-spectrum crop protection chemicals to organic bio-stimulants and water-soluble fertilizers, Indus Crop Care delivers end-to-end agricultural productivity solutions.
            </p>
          </div>

          <div className="homepage-formulations-grid">
            {[
              { title: 'Insecticides', count: '31 Formulations', desc: 'Advanced organophosphates, phenylpyrazoles, and diamides for targeted pest control.', icon: <ShieldCheck size={24} style={{ color: 'var(--color-primary-green)' }} />, page: 'Pages 7-9' },
              { title: 'Herbicides', count: '18 Formulations', desc: 'Selective pre- and post-emergent weed control for cotton, paddy, and maize.', icon: <Sprout size={24} style={{ color: 'var(--color-harvest-gold)' }} />, page: 'Pages 10-11' },
              { title: 'Fungicides', count: '14 Formulations', desc: 'Systemic and contact triazoles & strobilurins against blight and blast.', icon: <Microscope size={24} style={{ color: 'var(--color-primary-green)' }} />, page: 'Pages 12-13' },
              { title: 'Water-Soluble Fertilizers', count: '6 Formulations', desc: 'Pure 100% water-soluble NPK grades: 19:19:19, 13:00:45, 00:52:34, 12:61:0, 00:00:50, and Calcium Nitrate.', icon: <Layers size={24} style={{ color: 'var(--color-primary-green)' }} />, page: 'Page 16' },
            ].map((group, idx) => (
              <div 
                key={idx}
                className={`card card-light reveal-on-scroll stagger-${idx + 1}`}
                style={{ 
                  padding: '26px', 
                  display: 'flex',
                  flexDirection: 'column',
                  borderTop: '3px solid var(--color-primary-green)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--color-sage-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {group.icon}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-charcoal-700)', background: 'var(--color-sage-100)', padding: '3px 9px', borderRadius: '4px', fontWeight: 700 }}>
                    {group.page}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-charcoal-950)', marginBottom: '4px' }}>
                  {group.title}
                </h3>
                <div style={{ fontSize: '0.86rem', color: 'var(--color-primary-green)', fontWeight: 700, marginBottom: '10px' }}>
                  {group.count}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-charcoal-600)', lineHeight: '1.55', flex: 1, margin: '0 0 18px 0' }}>
                  {group.desc}
                </p>
                <Link 
                  to={`/products?category=${encodeURIComponent(group.title)}`} 
                  style={{ color: 'var(--color-primary-green-dark)', fontSize: '0.88rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>View Formulations</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          {/* Premium "View All Formulations" CTA */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link 
              to="/products" 
              className="btn btn-outline"
              style={{ minHeight: '48px', padding: '12px 30px' }}
            >
              <Layers size={18} />
              <span>Explore All 11 Formulations & Categories</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Featured Catalogue Products Section — Soft Sage Editorial Surface */}
      <section className="section section-editorial-sage" aria-label="Featured Products">
        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <span className="section-tag">
              <FlaskConical size={14} />
              <span>Certified Catalogue Products</span>
            </span>
            <h2 className="section-title">
              Featured Formulations & Solutions
            </h2>
            <p className="section-subtitle">
              Every product is manufactured with authentic high-purity active ingredients, documented packaging, and verified efficacy.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-charcoal-600)' }}>
              Loading products...
            </div>
          ) : (
            <div className="products-grid">
              {displayedProducts.map((product, idx) => (
                <div 
                  key={product.id} 
                  className={`reveal-on-scroll stagger-${(idx % 4) + 1}`}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <ProductCard 
                    product={product}
                    onOpenQuote={onOpenQuote}
                    onOpenDetails={onOpenDetails}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '44px' }}>
            <Link 
              to="/products" 
              className="btn btn-primary"
              style={{ minHeight: '50px', padding: '14px 32px' }}
            >
              <span>Explore Complete 105+ Formulations Catalogue</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Crop Production System (Page 20 of PDF) */}
      <section 
        id="crop-production-system"
        className="section section-dark-botanical" 
        aria-label="Crop Production System"
      >
        <div className="container">
          <div className="crop-system-grid">
            
            {/* Left Column: Integrated System Description */}
            <div className="reveal-on-scroll">
              <span className="section-tag" style={{ marginBottom: '16px' }}>
                <Sparkles size={14} />
                <span>Integrated Crop Production System</span>
              </span>
              <h2 className="section-title" style={{ marginTop: '4px', marginBottom: '18px' }}>
                Best Partner for Quality Agri Inputs
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--color-sage-200)', marginBottom: '26px' }}>
                Indus Crop Care delivers a holistic Crop Production System connecting soil health, nutrient optimization, and targeted pest and disease management to ensure high yield, eco-friendly farming, and sustainable agricultural livelihoods.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {[
                  { title: 'Nutrient Management', desc: 'Precision water-soluble NPK and organic fertilizers to fuel every growth phase.' },
                  { title: 'Soil Health Management', desc: 'Microbial bio-fertilizers, soil neutralizers, and mycorrhiza to restore soil fertility.' },
                  { title: 'Pest & Disease Management', desc: 'Advanced insecticides, herbicides, and systemic fungicides to protect crops from sowing to harvest.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={14} style={{ color: 'var(--color-action-green)' }} />
                    </div>
                    <div>
                      <h4 style={{ color: '#FFFFFF', fontSize: '1.02rem', margin: '0 0 3px 0' }}>{item.title}</h4>
                      <p style={{ color: 'var(--color-sage-300)', fontSize: '0.88rem', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/about" className="btn btn-outline-white">
                <span>Discover Our Complete Vision</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Column: Official Cycle Artwork */}
            <div className="crop-system-artwork-col reveal-on-scroll">
              <div className="crop-system-artwork-wrapper">
                <img 
                  src="/images/branding/indus/indus-hero-circle.png" 
                  alt="Indus Crop Care - Sustainable Agriculture Cycle" 
                  className="crop-system-artwork-img"
                  loading="lazy"
                  decoding="async"
                  width={340}
                  height={340}
                />
              </div>
            </div>

          </div>

          {/* 4 Balanced Benefit Cards Spanning Full Width */}
          <div className="homepage-benefits-grid" style={{ marginTop: 'clamp(36px, 5vw, 56px)' }}>

            {[
              { label: 'High Yield', desc: 'Proven agronomic formulations for maximum fruit and grain output.', icon: <TrendingUp size={22} style={{ color: '#168547' }} /> },
              { label: 'Cost Effective', desc: 'Optimized dosage rates ensuring higher profitability per acre.', icon: <Award size={22} style={{ color: '#168547' }} /> },
              { label: 'ECO Friendly', desc: 'Biological consortia reducing soil degradation and chemical runoff.', icon: <Sprout size={22} style={{ color: '#168547' }} /> },
              { label: 'Sustainability', desc: 'Long-term environmental and rural community resilience.', icon: <ShieldCheck size={22} style={{ color: '#168547' }} /> }
            ].map((val, idx) => (
              <div 
                key={idx}
                className={`card reveal-on-scroll stagger-${idx + 1}`}
                style={{ 
                  backgroundColor: '#FFFFFF',
                  padding: '24px 20px', 
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  borderLeft: '4px solid #168547',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  height: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(22, 133, 71, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {val.icon}
                  </div>
                  <h4 style={{ color: '#06381C', fontSize: '1.18rem', margin: 0, fontWeight: 700 }}>
                    {val.label}
                  </h4>
                </div>
                <p style={{ color: '#2D3748', fontSize: '0.92rem', margin: 0, lineHeight: '1.6', flex: 1, fontWeight: 500 }}>
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Executive Leadership & Governance — Clean Editorial Profile */}
      <section className="section section-editorial-light" aria-label="Executive Leadership">
        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <span className="section-tag">
              <Award size={14} />
              <span>Leadership & Governance</span>
            </span>
            <h2 className="section-title">
              Guided by Agricultural Scientists & Marketing Experts
            </h2>
            <p className="section-subtitle">
              With deep technical qualifications and decades of agricultural field experience, our leadership steers Indus Crop Care towards cutting-edge crop protection.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '28px', maxWidth: '880px', margin: '0 auto' }}>
            
            {/* Managing Director */}
            <div className="card card-light reveal-on-scroll stagger-1" style={{ padding: 'clamp(20px, 3.5vw, 28px)', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ 
                width: '96px', 
                height: '106px', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                flexShrink: 0, 
                boxShadow: '0 4px 16px rgba(14, 107, 56, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)',
                border: '2px solid rgba(212, 175, 55, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}>
                <img 
                  src="/images/branding/indus/md-narendranath-dut.png" 
                  alt="K. Narendranath Dut - Managing Director" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
                  loading="lazy"
                />
              </div>
              <div>
                <h3 style={{ fontSize: '1.22rem', color: 'var(--color-charcoal-950)', marginBottom: '4px', fontWeight: 800 }}>
                  K. Narendranath Dut
                </h3>
                <div style={{ fontSize: '0.88rem', color: 'var(--color-primary-green)', fontWeight: 700, marginBottom: '2px' }}>
                  M. Sc (Ag)
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-charcoal-700)', fontWeight: 600 }}>
                  Managing Director
                </div>
              </div>
            </div>

            {/* Director Sales & Marketing */}
            <div className="card card-light reveal-on-scroll stagger-2" style={{ padding: 'clamp(20px, 3.5vw, 28px)', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ 
                width: '96px', 
                height: '106px', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                flexShrink: 0, 
                boxShadow: '0 4px 16px rgba(14, 107, 56, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)',
                border: '2px solid rgba(212, 175, 55, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}>
                <img 
                  src="/images/branding/indus/director-anoopkumar.png" 
                  alt="K. Anoopkumar - Director Sales & Marketing" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
                  loading="lazy"
                />
              </div>
              <div>
                <h3 style={{ fontSize: '1.22rem', color: 'var(--color-charcoal-950)', marginBottom: '4px', fontWeight: 800 }}>
                  K. Anoopkumar
                </h3>
                <div style={{ fontSize: '0.88rem', color: 'var(--color-primary-green)', fontWeight: 700, marginBottom: '2px' }}>
                  B. Sc (Ag) APMP, IIMC Kolkatta
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-charcoal-700)', fontWeight: 600 }}>
                  Director, Sales & Marketing
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. WhatsApp & Corporate Hotline CTA Banner */}
      <section style={{ background: 'radial-gradient(circle at 50% 50%, #0C331E 0%, #05180C 100%)', color: '#FFFFFF', padding: 'clamp(60px, 8vw, 84px) 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }} className="reveal-on-scroll">
            <span className="badge badge-gold" style={{ marginBottom: '18px' }}>
              Farmer & Dealership Advisory Desk
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#FFFFFF', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Direct Formulation & Dealership Enquiry
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-sage-200)', lineHeight: '1.7', marginBottom: '32px' }}>
              Connect directly with Indus Crop Care technical advisors on WhatsApp. Enquire about product specifications, batch availability, dealer pricing, and recommendation schedules.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <button 
                type="button" 
                className="btn btn-whatsapp btn-lg"
                onClick={() => onOpenQuote()}
              >
                <MessageSquareShare size={20} />
                <span>WhatsApp Desk (+91 88860 69143)</span>
              </button>
              <Link to="/contact" className="btn btn-outline-white btn-lg">
                <PhoneCall size={18} />
                <span>View Corporate Offices</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
