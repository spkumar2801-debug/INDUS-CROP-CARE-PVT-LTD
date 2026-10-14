import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  ShieldCheck, 
  Microscope, 
  Award, 
  TrendingUp, 
  MessageSquareShare, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  Leaf,
  CheckCircle2,
  Layers,
  FlaskConical,
  HeartHandshake
} from 'lucide-react';
import { Product } from '../types/product';
import { getPublishedProducts } from '../services/productService';
import { ProductCard } from '../components/products/ProductCard';
import { CountUpNumber } from '../components/common/CountUpNumber';

interface HomePageProps {
  onOpenQuote: (product?: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenQuote, onOpenDetails }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedProducts()
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  // Display only the premier first four featured formulations on homepage
  const displayedProducts = useMemo(() => {
    const featured = products.filter(p => p.isFeatured || p.isPublished);
    return featured.slice(0, 4);
  }, [products]);

  // Spotlight product (e.g. INTRON or ABOLA)
  const spotlightProduct = useMemo(() => {
    return products.find(p => p.slug === 'indus-intron') || 
           products.find(p => p.slug === 'indus-abola') || 
           products[0] || null;
  }, [products]);

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-overlay" />
        <div className="container">
          <div className="hero-grid" style={{ alignItems: 'center' }}>
            
            {/* Left Column: Headline & Value Proposition */}
            <div>
              <div className="hero-badge">
                <span className="dot" />
                <span>Over 15 Years of Agri-Input Leadership & Innovation</span>
              </div>

              <h1 className="hero-title">
                Science For<br />
                <span className="highlight-gold" style={{ color: '#25D366' }}>Sustainability.</span>
              </h1>

              <div className="hero-telugu-banner">
                <span>రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు</span>
              </div>

              <p className="hero-desc">
                Indus Crop Care Pvt. Ltd. is a renowned agri-input enterprise with an established track record across Organic & Water-Soluble Fertilizers, Plant Micronutrients, Biofertilizers, Crop Protection Chemicals, Biopesticides, and Biostimulants — empowering farmers to maximize yields and enhance sustainability.
              </p>

              <div className="hero-actions">
                <Link to="/products" className="btn btn-accent">
                  <FlaskConical size={19} />
                  <span>Explore 105+ Formulations</span>
                </Link>

                <button 
                  type="button" 
                  className="btn btn-whatsapp"
                  onClick={() => onOpenQuote()}
                >
                  <MessageSquareShare size={19} />
                  <span>WhatsApp Advisory</span>
                </button>
              </div>

              {/* Four Verified Trust Pillars */}
              <div className="hero-metrics">
                <div className="hero-metric-item">
                  <h4 style={{ color: '#FFE082' }}>
                    <CountUpNumber end={15} suffix="+ Years" />
                  </h4>
                  <p>Agricultural Trust & R&D Excellence</p>
                </div>
                <div className="hero-metric-item">
                  <h4 style={{ color: '#25D366' }}>
                    <CountUpNumber end={105} suffix="+" />
                  </h4>
                  <p>Standardized Products & Formulations</p>
                </div>
                <div className="hero-metric-item">
                  <h4 style={{ color: '#FFFFFF' }}>ISO Certified</h4>
                  <p>ISO 9001:2015 Quality Manufacturing</p>
                </div>
                <div className="hero-metric-item">
                  <h4 style={{ color: '#FFE082' }}>Pan-India</h4>
                  <p>Distributor & Farmer Partnership</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic Showcase with Circular Art and Real Packaging */}
            <div>
              <div className="hero-card-showcase" style={{ background: 'linear-gradient(145deg, #0C2818 0%, #061A0F 100%)', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.45)' }}>
                
                {/* Official Circular Artwork Badge */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <img 
                    src="/images/branding/indus/indus-hero-circle.png" 
                    alt="Indus Crop Care - Sustainable Agriculture Cycle" 
                    style={{ maxWidth: '280px', width: '100%', borderRadius: '50%', border: '4px solid rgba(37, 211, 102, 0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', margin: '0 auto', display: 'block' }}
                  />
                </div>

                {spotlightProduct && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>{spotlightProduct.category}</span>
                      <span style={{ fontSize: '0.78rem', color: '#FFE082', fontWeight: 600 }}>Catalogue Page {spotlightProduct.sourcePage || 7}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '90px', background: '#FFFFFF', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img 
                          src={spotlightProduct.imageUrl} 
                          alt={spotlightProduct.name} 
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {spotlightProduct.name}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: '#CBDACD', lineHeight: '1.3', marginBottom: '10px' }}>
                          {spotlightProduct.formulation}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            type="button" 
                            className="btn btn-whatsapp btn-sm"
                            style={{ height: '34px', fontSize: '0.82rem', padding: '0 12px' }}
                            onClick={() => onOpenQuote(spotlightProduct)}
                          >
                            <MessageSquareShare size={14} />
                            <span>Enquire</span>
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-white btn-sm"
                            style={{ height: '34px', fontSize: '0.82rem', padding: '0 12px' }}
                            onClick={() => onOpenDetails(spotlightProduct)}
                          >
                            <span>Specs</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Official Certifications & Accreditations Banner */}
      <section style={{ backgroundColor: '#092113', padding: '24px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#D4E5D7' }}>
            <ShieldCheck size={22} style={{ color: '#25D366' }} />
            <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>
              Official Accreditations & Quality Standards
            </span>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', overflowX: 'auto', maxWidth: '100%' }}>
            <img 
              src="/images/branding/indus/certifications-bar.png" 
              alt="FCO, Central CIB Registered, Certified ISO 9001:2015, PMMA, BIPA" 
              style={{ maxHeight: '38px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
        </div>
      </section>

      {/* 3. Broad Product Groups Spectrum */}
      <section className="section" style={{ backgroundColor: '#06180D' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '20px' }}>
            {[
              { title: 'Insecticides', count: '31 Formulations', desc: 'Advanced organophosphates, phenylpyrazoles, and diamides for pest control.', icon: <ShieldCheck size={24} style={{ color: '#25D366' }} />, page: 'Pages 7-9' },
              { title: 'Herbicides', count: '17 Formulations', desc: 'Selective pre- and post-emergent weed control for cotton, paddy, and maize.', icon: <Sprout size={24} style={{ color: '#FFE082' }} />, page: 'Pages 10-11' },
              { title: 'Fungicides', count: '14 Formulations', desc: 'Systemic and contact triazoles & strobilurins against blight and blast.', icon: <Microscope size={24} style={{ color: '#25D366' }} />, page: 'Pages 12-13' },
              { title: 'Plant Growth Regulator', count: 'Gibberellic Acid', desc: 'High-purity PGR solutions to stimulate cell division and fruit elongation.', icon: <TrendingUp size={24} style={{ color: '#FFE082' }} />, page: 'Page 13' },
              { title: 'Organic Fertilizers', count: '5 Formulations', desc: 'Organic DAP (PROM), Neem-rich cakes, City Compost, and organic potash.', icon: <Leaf size={24} style={{ color: '#25D366' }} />, page: 'Page 14' },
              { title: 'Micro Nutrients', count: '14 Formulations', desc: 'Chelated zinc, magnesium sulphate, boron 20%, and multi-micronutrient combos.', icon: <FlaskConical size={24} style={{ color: '#FFE082' }} />, page: 'Page 15' },
              { title: 'Water Soluble Fertilizers', count: '6 Formulations', desc: 'Pure 100% water-soluble NPK grades: 19:19:19, 13:00:45, 00:52:34, and 12:61:0.', icon: <Layers size={24} style={{ color: '#25D366' }} />, page: 'Page 16' },
              { title: 'Bio Fertilizers', count: '8 Formulations', desc: 'Mycorrhiza (VAM), PSB, KMB, ZnSB, and NPK consortium consortia.', icon: <Award size={24} style={{ color: '#FFE082' }} />, page: 'Page 17' },
              { title: 'Bio Stimulants', count: '6 Formulations', desc: 'Yield boosters, 99% soluble humic acid, soil neutralizers, and miticides.', icon: <HeartHandshake size={24} style={{ color: '#25D366' }} />, page: 'Page 18' },
              { title: 'Antibiotic Products', count: '2 Formulations', desc: 'Organic bactericides and natural antibiotics for viral and bacterial blights.', icon: <ShieldCheck size={24} style={{ color: '#FFE082' }} />, page: 'Page 19' },
            ].slice(0, 4).map((group, idx) => (
              <div 
                key={idx}
                className="card reveal-on-scroll"
                style={{ 
                  padding: '24px', 
                  backgroundColor: '#0E291A', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderTop: '3px solid #25D366',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {group.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#FFE082', background: 'rgba(255, 224, 130, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {group.page}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#F4F8F3', marginBottom: '4px' }}>
                  {group.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#25D366', fontWeight: 600, marginBottom: '8px' }}>
                  {group.count}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#9EB5A3', lineHeight: '1.5', flex: 1, margin: '0 0 16px 0' }}>
                  {group.desc}
                </p>
                <Link 
                  to={`/products?category=${encodeURIComponent(group.title)}`} 
                  style={{ color: '#CBDACD', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>View Products</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          {/* Premium "View All Formulations" CTA */}
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link 
              to="/products" 
              className="btn btn-outline-white"
              style={{ 
                minHeight: '48px', 
                padding: '12px 28px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '10px',
                border: '1.5px solid rgba(37, 211, 102, 0.6)',
                color: '#25D366',
                background: 'rgba(37, 211, 102, 0.06)',
                fontWeight: 700,
                fontSize: '0.96rem'
              }}
            >
              <Layers size={18} />
              <span>View All Formulations & Categories</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Filterable Featured Products Section */}
      <section className="section" style={{ backgroundColor: '#092113', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
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
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9EB5A3' }}>
              Loading products...
            </div>
          ) : (
            <div className="products-grid">
              {displayedProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onOpenQuote={onOpenQuote}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link 
              to="/products" 
              className="btn btn-primary"
              style={{ minHeight: '48px', padding: '12px 28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span>Explore Complete 105+ Formulations Catalogue</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Crop Production System (Page 20 of PDF) */}
      <section className="section" style={{ backgroundColor: '#06180D', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '40px', alignItems: 'center' }}>
            
            {/* Left: Diagram explanation */}
            <div>
              <span className="section-tag">
                <Sparkles size={14} />
                <span>Integrated Crop Production System</span>
              </span>
              <h2 className="section-title">
                Best Partner for Quality Agri Inputs
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#CBDACD', marginBottom: '24px' }}>
                Indus Crop Care delivers a holistic Crop Production System connecting soil health, nutrient optimization, and targeted pest and disease management to ensure high yield, eco-friendly farming, and sustainable agricultural livelihoods.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                {[
                  { title: 'Nutrient Management', desc: 'Precision water-soluble NPK and organic fertilizers to fuel every growth phase.' },
                  { title: 'Soil Health Management', desc: 'Microbial bio-fertilizers, soil neutralizers, and mycorrhiza to restore soil fertility.' },
                  { title: 'Pest & Disease Management', desc: 'Advanced insecticides, herbicides, and systemic fungicides to protect crops from sowing to harvest.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <CheckCircle2 size={20} style={{ color: '#25D366', flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      <h4 style={{ color: '#F4F8F3', fontSize: '1rem', margin: '0 0 3px 0' }}>{item.title}</h4>
                      <p style={{ color: '#9EB5A3', fontSize: '0.88rem', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/about" className="btn btn-outline-white">
                <span>Discover Our Complete Vision</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right: Key Values Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px' }}>
              {[
                { label: 'High Yield', desc: 'Proven agronomic formulations for maximum fruit and grain output.' },
                { label: 'Cost Effective', desc: 'Optimized dosage rates ensuring higher profitability per acre.' },
                { label: 'ECO Friendly', desc: 'Biological consortia reducing soil degradation and chemical runoff.' },
                { label: 'Sustainability', desc: 'Long-term environmental and rural community resilience.' }
              ].map((val, idx) => (
                <div 
                  key={idx}
                  className="card"
                  style={{ padding: '24px', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.08)', borderLeft: '4px solid #FFE082' }}
                >
                  <h4 style={{ color: '#FFE082', fontSize: '1.15rem', marginBottom: '8px' }}>{val.label}</h4>
                  <p style={{ color: '#9EB5A3', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>{val.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 6. Executive Leadership & Profile Callout (Page 2 of PDF) */}
      <section className="section" style={{ backgroundColor: '#0A2415', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '28px', maxWidth: '850px', margin: '0 auto' }}>
            
            {/* Managing Director */}
            <div className="card" style={{ padding: '28px', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.09)', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '84px', height: '100px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#FFFFFF' }}>
                <img 
                  src="/images/branding/indus/md-narendranath-dut.png" 
                  alt="K. Narendranath Dut - Managing Director" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#F4F8F3', marginBottom: '4px' }}>
                  K. Narendranath Dut
                </h3>
                <div style={{ fontSize: '0.88rem', color: '#25D366', fontWeight: 600, marginBottom: '2px' }}>
                  M. Sc (Ag)
                </div>
                <div style={{ fontSize: '0.84rem', color: '#FFE082', fontWeight: 600 }}>
                  Managing Director
                </div>
              </div>
            </div>

            {/* Director Sales & Marketing */}
            <div className="card" style={{ padding: '28px', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.09)', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '84px', height: '100px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#FFFFFF' }}>
                <img 
                  src="/images/branding/indus/director-anoopkumar.png" 
                  alt="K. Anoopkumar - Director Sales & Marketing" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#F4F8F3', marginBottom: '4px' }}>
                  K. Anoopkumar
                </h3>
                <div style={{ fontSize: '0.88rem', color: '#25D366', fontWeight: 600, marginBottom: '2px' }}>
                  B. Sc (Ag) APMP, IIMC Kolkatta
                </div>
                <div style={{ fontSize: '0.84rem', color: '#FFE082', fontWeight: 600 }}>
                  Director, Sales & Marketing
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. WhatsApp & Corporate Hotline CTA Banner */}
      <section style={{ background: 'linear-gradient(180deg, #092113 0%, #05160C 100%)', color: '#FFFFFF', padding: '70px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <span className="badge badge-gold" style={{ marginBottom: '16px' }}>
              Farmer & Dealership Advisory Desk
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.7rem)', color: '#FFFFFF', marginBottom: '16px' }}>
              Direct Formulation & Dealership Enquiry
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#C6DEC9', lineHeight: '1.6', marginBottom: '32px' }}>
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
