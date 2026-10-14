import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  MessageSquareShare,
  Target,
  Sparkles,
  ShieldCheck,
  Scale,
  Sprout,
  Leaf
} from 'lucide-react';

interface AboutPageProps {
  onOpenQuote: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenQuote }) => {
  return (
    <div style={{ backgroundColor: '#06180D', minHeight: '85vh', color: '#F4F8F3' }}>
      
      {/* Editorial Hero Header */}
      <section style={{ 
        backgroundColor: '#0A2415', 
        color: '#FFFFFF', 
        paddingTop: '70px', 
        paddingBottom: '70px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '980px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', backgroundColor: 'rgba(37, 211, 102, 0.12)', border: '1px solid rgba(37, 211, 102, 0.3)', marginBottom: '18px' }}>
            <Sparkles size={14} style={{ color: '#25D366' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Corporate Heritage & Agri-Science Leadership
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', color: '#F4F8F3', marginBottom: '18px', lineHeight: '1.2', fontWeight: 800 }}>
            About Indus Crop Care Pvt. Ltd.
          </h1>

          <div className="telugu-quote" style={{ fontSize: '1.3rem', color: '#FFE082', marginBottom: '20px', fontWeight: 600 }}>
            రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు
          </div>

          <p style={{ fontSize: '1.15rem', color: '#CBDACD', lineHeight: '1.7', maxWidth: '780px', margin: '0 auto' }}>
            Science for Sustainability — Over 15 years of dedicated partnership with Indian farmers, delivering high-performance crop protection, plant nutrition, and bio-stimulants.
          </p>
        </div>
      </section>

      {/* Main Corporate Overview */}
      <section className="section" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          
          <div className="card" style={{ 
            padding: 'clamp(24px, 5vw, 48px)', 
            backgroundColor: '#0E291A', 
            border: '1px solid rgba(255, 255, 255, 0.09)',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <img 
                src="/images/branding/indus/indus-emblem-transparent.png" 
                alt="Indus Tree Emblem" 
                style={{ width: '48px', height: '48px', objectFit: 'contain' }}
              />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#25D366', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Company Profile
                </span>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#F4F8F3', margin: 0, fontWeight: 700 }}>
                  A Proven Track Record of Over 15 Years
                </h2>
              </div>
            </div>

            <div style={{ fontSize: '1.08rem', lineHeight: '1.85', color: '#CBDACD' }}>
              <p style={{ marginBottom: '20px' }}>
                <strong style={{ color: '#F4F8F3' }}>Indus Crop Care Pvt. Ltd.</strong> is a renowned agri-input company with a proven track record of over 15 years in the agricultural industry. Our comprehensive expertise spans across <strong>Organic Fertilizers, Water-Soluble Fertilizers, Plant Micronutrients, Biofertilizers, Crop Protection Chemicals, Biopesticides, and Biostimulants</strong>, empowering farmers to optimize yields, reduce costs, and improve livelihoods.
              </p>
              <p style={{ marginBottom: '20px' }}>
                With a strong network of distributors, retailers, and long-standing farmer relationships across India, we have established ourselves as a trusted partner for agricultural professionals. Our commitment to innovation, quality, and customer satisfaction drives our mission to enhance agricultural productivity and sustainability.
              </p>
              <p style={{ marginBottom: '20px' }}>
                We have made significant investments in <strong>Research and Development</strong>, collaborating with leading agronomists, scientific experts, and premier institutions to remain at the forefront of agricultural technology. Looking ahead, we are dedicated to addressing the complex challenges facing modern agriculture — from climate resilience to global food security.
              </p>
              <p style={{ margin: 0 }}>
                Our goal is to create a lasting positive impact on the lives of farmers, rural communities, and the environment, while contributing to a more sustainable and resilient agricultural sector.
              </p>
            </div>
          </div>

          {/* Leadership Team (Page 2 Source) */}
          <div style={{ marginBottom: '50px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '0.82rem', color: '#25D366', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Executive Leadership
              </span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#F4F8F3', marginTop: '6px' }}>
                Steering Innovation & Agricultural Excellence
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              
              {/* Managing Director */}
              <div className="card" style={{ 
                padding: '28px', 
                backgroundColor: '#0A2415', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
              }}>
                <img 
                  src="/images/branding/indus/md-narendranath-dut.png" 
                  alt="K. Narendranath Dut"
                  style={{ 
                    width: '90px', 
                    height: '110px', 
                    objectFit: 'cover', 
                    borderRadius: '8px', 
                    border: '2px solid rgba(37, 211, 102, 0.3)',
                    flexShrink: 0
                  }}
                />
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#F4F8F3', margin: '0 0 4px 0', fontWeight: 700 }}>
                    K. Narendranath Dut
                  </h3>
                  <div style={{ fontSize: '0.88rem', color: '#25D366', fontWeight: 600, marginBottom: '4px' }}>
                    M. Sc (Ag)
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#CBDACD', fontWeight: 500 }}>
                    Managing Director
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '8px', lineHeight: '1.4', margin: 0 }}>
                    Leading technical formulation, scientific crop trial strategy, and corporate governance.
                  </p>
                </div>
              </div>

              {/* Director Sales & Marketing */}
              <div className="card" style={{ 
                padding: '28px', 
                backgroundColor: '#0A2415', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
              }}>
                <img 
                  src="/images/branding/indus/director-anoopkumar.png" 
                  alt="K. Anoopkumar"
                  style={{ 
                    width: '90px', 
                    height: '110px', 
                    objectFit: 'cover', 
                    borderRadius: '8px', 
                    border: '2px solid rgba(37, 211, 102, 0.3)',
                    flexShrink: 0
                  }}
                />
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#F4F8F3', margin: '0 0 4px 0', fontWeight: 700 }}>
                    K. Anoopkumar
                  </h3>
                  <div style={{ fontSize: '0.88rem', color: '#25D366', fontWeight: 600, marginBottom: '4px' }}>
                    B. Sc (Ag) APMP, IIMC Kolkatta
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#CBDACD', fontWeight: 500 }}>
                    Director, Sales & Marketing
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '8px', lineHeight: '1.4', margin: 0 }}>
                    Spearheading pan-India distribution channels, dealer network empowerment, and market growth.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Vision & Mission (Official Page 3 Source) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            
            {/* Vision */}
            <div className="card" style={{ 
              padding: '32px', 
              backgroundColor: '#0B2918', 
              border: '1px solid rgba(37, 211, 102, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 14px', borderRadius: '6px', backgroundColor: '#0284C7', color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', width: 'fit-content', marginBottom: '16px' }}>
                <Target size={16} />
                <span>VISION</span>
              </div>
              <p style={{ fontSize: '1.08rem', lineHeight: '1.75', color: '#E2E8F0', margin: 0, fontWeight: 500 }}>
                To empower farmers with innovative, high-quality, and sustainable agri-input solutions. We are committed to enhancing agricultural productivity, improving farmer incomes, and promoting environmentally responsible farming practices.
              </p>
            </div>

            {/* Mission */}
            <div className="card" style={{ 
              padding: '32px', 
              backgroundColor: '#0B2918', 
              border: '1px solid rgba(37, 211, 102, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 14px', borderRadius: '6px', backgroundColor: '#0284C7', color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', width: 'fit-content', marginBottom: '16px' }}>
                <Sprout size={16} />
                <span>MISSION</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '1.02rem', color: '#E2E8F0', lineHeight: '1.5' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#25D366', marginTop: '8px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#F4F8F3' }}>EMPOWERING FARMERS:</strong> Enhance Agriculture Production and Sustainability.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '1.02rem', color: '#E2E8F0', lineHeight: '1.5' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#25D366', marginTop: '8px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#F4F8F3' }}>INNOVATION FOR GROWTH:</strong> Develop cutting-edge solutions for farming challenges.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '1.02rem', color: '#E2E8F0', lineHeight: '1.5' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#25D366', marginTop: '8px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#F4F8F3' }}>SUSTAINABLE AGRICULTURE:</strong> Promote eco-friendly practices and reduce environmental impact.
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* 4 Core Objectives (Page 3 Source) */}
          <div className="card" style={{ 
            padding: '36px', 
            backgroundColor: '#0A2415', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '40px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '0.82rem', color: '#25D366', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Guiding Pillars
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#F4F8F3', marginTop: '6px' }}>
                Core Objectives
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px' }}>
              
              {/* Innovation */}
              <div style={{ backgroundColor: '#071F11', padding: '24px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.25)', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Sparkles size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#FBBF24', marginBottom: '8px', fontWeight: 700 }}>
                  Innovation
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#CBDACD', lineHeight: '1.5', margin: 0 }}>
                  Continuous research into advanced green chemistries, nano-fertilizers, and bio-consortia.
                </p>
              </div>

              {/* Sustainability */}
              <div style={{ backgroundColor: '#071F11', padding: '24px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.25)', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Leaf size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#4ADE80', marginBottom: '8px', fontWeight: 700 }}>
                  Sustainability
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#CBDACD', lineHeight: '1.5', margin: 0 }}>
                  Protecting soil biome health and promoting eco-friendly agriculture for future generations.
                </p>
              </div>

              {/* Quality */}
              <div style={{ backgroundColor: '#071F11', padding: '24px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.25)', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <ShieldCheck size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#60A5FA', marginBottom: '8px', fontWeight: 700 }}>
                  Quality
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#CBDACD', lineHeight: '1.5', margin: 0 }}>
                  Rigorous laboratory quality checks ensuring precise active ingredient potency and batch safety.
                </p>
              </div>

              {/* Integrity */}
              <div style={{ backgroundColor: '#071F11', padding: '24px', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.25)', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Scale size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#F472B6', marginBottom: '8px', fontWeight: 700 }}>
                  Integrity
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#CBDACD', lineHeight: '1.5', margin: 0 }}>
                  Uncompromising transparency with farmers, transparent pricing, and ethical business partnerships.
                </p>
              </div>

            </div>
          </div>

          {/* Seeds Division Section Preserved Compatibly */}
          <div className="card" style={{ 
            padding: '32px', 
            backgroundColor: 'rgba(37, 211, 102, 0.05)', 
            border: '1px solid rgba(37, 211, 102, 0.2)',
            borderRadius: '16px',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#25D366', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              <Sprout size={18} />
              <span>Seeds Division Announcement</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#F4F8F3', marginBottom: '12px', lineHeight: '1.4' }}>
              INDAS AGRI SEEDS INDIA PVT LTD — Group Seeds Division
            </h3>
            <p style={{ fontSize: '1.02rem', lineHeight: '1.7', color: '#CBDACD', marginBottom: '16px' }}>
              Carrying forward Indus Crop Care's legacy of quality and farmer-first vision, INDAS AGRI SEEDS INDIA PVT LTD provides high-yielding, disease-resistant hybrid vegetable, fruit, and flower seeds (Tomato, Okra, Brinjal, Ridge Gourd, Chilli, Marigold, and more).
            </p>
            <div style={{ fontSize: '0.92rem', color: '#A7F3D0', fontWeight: 600 }}>
              &ldquo;INDUS CROP CARE Protected Your Crop. INDAS AGRI SEEDS Will Secure Your Future.&rdquo;
            </div>
          </div>

          {/* Bottom Action Cards */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>Explore 105+ Official Products</span>
              <ArrowRight size={16} />
            </Link>
            <button 
              type="button" 
              className="btn btn-whatsapp"
              onClick={onOpenQuote}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <MessageSquareShare size={18} />
              <span>Connect on WhatsApp (+91 88860 69143)</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
