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
    <div style={{ minHeight: '85vh' }}>

      {/* Editorial Hero Header — Deep Forest Botanical */}
      <section style={{
        backgroundColor: 'var(--color-forest-900)',
        color: '#FFFFFF',
        paddingTop: 'clamp(56px, 8vw, 84px)',
        paddingBottom: 'clamp(56px, 8vw, 84px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '980px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(37, 211, 102, 0.12)', border: '1px solid rgba(37, 211, 102, 0.3)', marginBottom: '18px' }}>
            <Sparkles size={14} style={{ color: 'var(--color-action-green)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Corporate Heritage & Agri-Science Leadership
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', color: '#FFFFFF', marginBottom: '18px', lineHeight: '1.15', fontWeight: 800, letterSpacing: '-0.025em' }}>
            About Indus Crop Care Pvt. Ltd.
          </h1>

          <div className="telugu-quote" style={{ fontSize: '1.25rem', color: 'var(--color-gold-400)', marginBottom: '20px', fontWeight: 700 }}>
            రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు
          </div>

          <p style={{ fontSize: '1.12rem', color: 'var(--color-sage-200)', lineHeight: '1.7', maxWidth: '780px', margin: '0 auto' }}>
            Science for Sustainability — Over 15 years of dedicated partnership with Indian farmers, delivering high-performance crop protection, plant nutrition, and bio-stimulants.
          </p>
        </div>
      </section>

      {/* Main Corporate Overview — Warm Ivory Editorial Surface */}
      <section className="section section-editorial-light">
        <div className="container" style={{ maxWidth: '1080px' }}>

          <div className="card card-light reveal-on-scroll" style={{
            padding: 'clamp(24px, 5vw, 48px)',
            marginBottom: '44px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <img
                src="/images/branding/indus/indus-emblem-transparent.png"
                alt="Indus Tree Emblem"
                style={{ width: '48px', height: '48px', objectFit: 'contain' }}
              />
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-primary-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Company Profile
                </span>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)', color: 'var(--color-charcoal-950)', margin: 0, fontWeight: 800 }}>
                  A Proven Track Record of Over 15 Years
                </h2>
              </div>
            </div>

            <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-charcoal-700)' }}>
              <p style={{ marginBottom: '20px' }}>
                <strong style={{ color: 'var(--color-charcoal-950)' }}>Indus Crop Care Pvt. Ltd.</strong> is a renowned agri-input company with a proven track record of over 15 years in the agricultural industry. Our comprehensive expertise spans across <strong>Organic Fertilizers, Water-Soluble Fertilizers, Plant Micronutrients, Biofertilizers, Crop Protection Chemicals, Biopesticides, and Biostimulants</strong>, empowering farmers to optimize yields, reduce costs, and improve livelihoods.
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

          {/* Executive Leadership Team — Editorial Profile Grid */}
          <div style={{ marginBottom: '56px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }} className="reveal-on-scroll">
              <span className="section-tag">
                Executive Leadership
              </span>
              <h2 className="section-title">
                Steering Innovation & Agricultural Excellence
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '26px' }}>

              {/* Managing Director */}
              <div className="card card-light reveal-on-scroll stagger-1 executive-profile-card" style={{
                padding: 'clamp(20px, 3.5vw, 28px)',
                gap: '20px'
              }}>
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
                    alt="K. Narendranath Dut"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.22rem', color: 'var(--color-charcoal-950)', margin: '0 0 4px 0', fontWeight: 800 }}>
                    K. Narendranath Dut
                  </h3>
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-primary-green)', fontWeight: 700, marginBottom: '4px' }}>
                    M. Sc (Ag)
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--color-charcoal-600)', fontWeight: 600 }}>
                    Managing Director
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--color-charcoal-500)', marginTop: '8px', lineHeight: '1.4', margin: 0 }}>
                    Leading technical formulation, scientific crop trial strategy, and corporate governance.
                  </p>
                </div>
              </div>

              {/* Director Sales & Marketing */}
              <div className="card card-light reveal-on-scroll stagger-2 executive-profile-card" style={{
                padding: 'clamp(20px, 3.5vw, 28px)',
                gap: '20px'
              }}>
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
                    alt="K. Anoopkumar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.22rem', color: 'var(--color-charcoal-950)', margin: '0 0 4px 0', fontWeight: 800 }}>
                    K. Anoopkumar
                  </h3>
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-primary-green)', fontWeight: 700, marginBottom: '4px' }}>
                    B. Sc (Ag) APMP, IIMC Kolkatta
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--color-charcoal-600)', fontWeight: 600 }}>
                    Director, Sales & Marketing
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--color-charcoal-500)', marginTop: '8px', lineHeight: '1.4', margin: 0 }}>
                    Spearheading pan-India distribution channels, dealer network empowerment, and market growth.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Vision & Mission — High-Impact Split Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '26px', marginBottom: '44px' }}>

            {/* Vision */}
            <div className="card card-light reveal-on-scroll stagger-1" style={{
              padding: '34px',
              borderTop: '4px solid #0284C7',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(2, 132, 199, 0.12)', color: '#0284C7', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.08em', width: 'fit-content', marginBottom: '18px' }}>
                <Target size={16} />
                <span>OUR VISION</span>
              </div>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.75', color: 'var(--color-charcoal-800)', margin: 0, fontWeight: 500 }}>
                To empower farmers with innovative, high-quality, and sustainable agri-input solutions. We are committed to enhancing agricultural productivity, improving farmer incomes, and promoting environmentally responsible farming practices.
              </p>
            </div>

            {/* Mission */}
            <div className="card card-light reveal-on-scroll stagger-2" style={{
              padding: '34px',
              borderTop: '4px solid var(--color-primary-green)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-primary-green-surface)', color: 'var(--color-primary-green-dark)', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.08em', width: 'fit-content', marginBottom: '18px' }}>
                <Sprout size={16} />
                <span>OUR MISSION</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '1rem', color: 'var(--color-charcoal-800)', lineHeight: '1.5' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-green)', marginTop: '8px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--color-charcoal-950)' }}>EMPOWERING FARMERS:</strong> Enhance Agriculture Production and Sustainability.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '1rem', color: 'var(--color-charcoal-800)', lineHeight: '1.5' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-green)', marginTop: '8px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--color-charcoal-950)' }}>INNOVATION FOR GROWTH:</strong> Develop cutting-edge solutions for farming challenges.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '1rem', color: 'var(--color-charcoal-800)', lineHeight: '1.5' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-green)', marginTop: '8px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--color-charcoal-950)' }}>SUSTAINABLE AGRICULTURE:</strong> Promote eco-friendly practices and reduce environmental impact.
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* 4 Core Pillars — Soft Sage Cards */}
          <div className="card card-light reveal-on-scroll" style={{
            padding: 'clamp(28px, 5vw, 42px)',
            marginBottom: '44px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span className="section-tag">
                Guiding Pillars
              </span>
              <h2 className="section-title">
                Core Objectives
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px' }}>

              {/* Innovation */}
              <div style={{ backgroundColor: 'var(--color-sage-50)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-sage-200)', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Sparkles size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-charcoal-950)', marginBottom: '8px', fontWeight: 800 }}>
                  Innovation
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-600)', lineHeight: '1.5', margin: 0 }}>
                  Continuous research into advanced green chemistries, nano-fertilizers, and bio-consortia.
                </p>
              </div>

              {/* Sustainability */}
              <div style={{ backgroundColor: 'var(--color-sage-50)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-sage-200)', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Leaf size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-charcoal-950)', marginBottom: '8px', fontWeight: 800 }}>
                  Sustainability
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-600)', lineHeight: '1.5', margin: 0 }}>
                  Protecting soil biome health and promoting eco-friendly agriculture for future generations.
                </p>
              </div>

              {/* Quality */}
              <div style={{ backgroundColor: 'var(--color-sage-50)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-sage-200)', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <ShieldCheck size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-charcoal-950)', marginBottom: '8px', fontWeight: 800 }}>
                  Quality
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-600)', lineHeight: '1.5', margin: 0 }}>
                  Rigorous laboratory quality checks ensuring precise active ingredient potency and batch safety.
                </p>
              </div>

              {/* Integrity */}
              <div style={{ backgroundColor: 'var(--color-sage-50)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-sage-200)', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Scale size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-charcoal-950)', marginBottom: '8px', fontWeight: 800 }}>
                  Integrity
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-600)', lineHeight: '1.5', margin: 0 }}>
                  Uncompromising transparency with farmers, transparent pricing, and ethical business partnerships.
                </p>
              </div>

            </div>
          </div>

          {/* Seeds Division Section */}
          <div className="card reveal-on-scroll" style={{
            padding: '34px',
            backgroundColor: 'var(--color-primary-green-surface)',
            border: '1px solid rgba(14, 107, 56, 0.25)',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-green-dark)', fontWeight: 800, fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              <Sprout size={18} />
              <span>Seeds Division Announcement</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-charcoal-950)', marginBottom: '10px', fontWeight: 800 }}>
              INDAS AGRI SEEDS INDIA PVT LTD — Group Seeds Division
            </h3>
            <p style={{ fontSize: '1.02rem', lineHeight: '1.7', color: 'var(--color-charcoal-700)', marginBottom: '14px' }}>
              Carrying forward Indus Crop Care's legacy of quality and farmer-first vision, INDAS AGRI SEEDS INDIA PVT LTD provides high-yielding, disease-resistant hybrid vegetable, fruit, and flower seeds (Tomato, Okra, Brinjal, Ridge Gourd, Chilli, Marigold, and more).
            </p>
            <div style={{ fontSize: '0.94rem', color: 'var(--color-primary-green-dark)', fontWeight: 700 }}>
              &ldquo;INDUS CROP CARE Protected Your Crop. INDAS AGRI SEEDS Will Secure Your Future.&rdquo;
            </div>
          </div>

          {/* Bottom Action Cards */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--color-border-light)' }}>
            <Link to="/products" className="btn btn-primary">
              <span>Explore 105+ Official Products</span>
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              className="btn btn-whatsapp"
              onClick={onOpenQuote}
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
