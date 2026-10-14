import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquareShare, CheckCircle, AlertCircle, Building2, Globe, Sparkles } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';
import { submitCustomerEnquiry } from '../services/enquiryService';

interface ContactPageProps {
  onOpenQuote: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const { handleCustomerCareWhatsApp } = useSiteSettings();

  const [enquiryType, setEnquiryType] = useState<'dealership' | 'quotation' | 'agronomy'>('dealership');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    state: '',
    district: '',
    productName: '',
    quantity: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const typeLabel = 
        enquiryType === 'quotation' ? 'Product Availability & Bulk Order Quotation' :
        enquiryType === 'agronomy' ? 'Technical Agronomy & Field Consultation' :
        'Dealership & Distributorship Application';

      const interestedProduct = enquiryType === 'quotation' && formData.productName.trim()
        ? formData.productName.trim()
        : typeLabel;

      const metadataParts = [
        `Enquiry Type: ${typeLabel}`,
        formData.email.trim() ? `Email: ${formData.email.trim()}` : null,
        formData.quantity.trim() ? `Quantity: ${formData.quantity.trim()}` : null,
        formData.message.trim() ? `Message: ${formData.message.trim()}` : null
      ].filter(Boolean);

      const res = await submitCustomerEnquiry({
        fullName: formData.name.trim(),
        phone: cleanPhone,
        state: formData.state.trim(),
        district: formData.district.trim(),
        interestedProduct,
        quantity: formData.quantity.trim(),
        message: metadataParts.join(' | ')
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setFormError(res.error || 'Failed to submit enquiry. Please check your details.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'A network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#06180D', minHeight: '85vh', color: '#F4F8F3' }}>
      
      {/* Page Header */}
      <section style={{ 
        backgroundColor: '#0A2415', 
        color: '#FFFFFF', 
        paddingTop: '60px', 
        paddingBottom: '60px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)' 
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', backgroundColor: 'rgba(37, 211, 102, 0.12)', border: '1px solid rgba(37, 211, 102, 0.3)', marginBottom: '16px' }}>
            <Sparkles size={14} style={{ color: '#25D366' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Corporate & Technical Support
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: '#F4F8F3', marginBottom: '12px', fontWeight: 800 }}>
            Contact Indus Crop Care Pvt. Ltd.
          </h1>

          <div className="telugu-quote" style={{ fontSize: '1.25rem', color: '#FFE082', marginBottom: '18px', fontWeight: 600 }}>
            రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు
          </div>

          <p style={{ fontSize: '1.05rem', color: '#CBDACD', margin: '0 auto', lineHeight: '1.6' }}>
            Reach out directly to our corporate headquarters or registered office for dealership applications, technical agronomy inquiries, and crop protection supplies.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="section" style={{ paddingTop: '50px', paddingBottom: '70px' }}>
        <div className="container">
          
          {/* Official Banner Card */}
          <div style={{ 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            marginBottom: '40px',
            backgroundColor: '#0E291A'
          }}>
            <img 
              src="/images/branding/indus/contact-official-banner.jpg" 
              alt="Indus Crop Care Official Contact Card" 
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '220px', objectFit: 'contain', backgroundColor: '#FFFFFF' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '36px' }}>
            
            {/* Left Column: Official Contact Details */}
            <div>
              <span className="section-tag">Official Lines</span>
              <h2 style={{ fontSize: '1.8rem', color: '#F4F8F3', marginBottom: '16px', fontWeight: 700 }}>
                Corporate Offices & Direct Desks
              </h2>
              <p style={{ color: '#9EB5A3', lineHeight: '1.6', marginBottom: '32px' }}>
                With over 15 years of agricultural service across India, our offices are staffed with qualified agronomists and commercial advisors ready to support dealers and farmers.
              </p>

              {/* Verified Contact Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '36px' }}>
                
                {/* Corporate Office */}
                <div className="card" style={{ padding: '22px', display: 'flex', alignItems: 'flex-start', gap: '16px', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: 'rgba(37, 211, 102, 0.12)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#25D366', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Headquarters
                    </span>
                    <h3 style={{ fontSize: '1.15rem', color: '#F4F8F3', margin: '4px 0 8px 0', fontWeight: 700 }}>
                      Corporate Office
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: '#CBDACD', lineHeight: '1.6', margin: 0 }}>
                      Apple Avenues, Plot No. 50, Peddaamberpet, Near ORR–Vijayawada Highway, Beside Indian Oil Petrol Pump, Pincode 501505, Telangana.
                    </p>
                  </div>
                </div>

                {/* Registered Office */}
                <div className="card" style={{ padding: '22px', display: 'flex', alignItems: 'flex-start', gap: '16px', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: 'rgba(251, 191, 36, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Statutory Office
                    </span>
                    <h3 style={{ fontSize: '1.15rem', color: '#F4F8F3', margin: '4px 0 8px 0', fontWeight: 700 }}>
                      Registered Office
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: '#CBDACD', lineHeight: '1.6', margin: 0 }}>
                      Sy. No. 627/E1, D. No. 17-88/3, Narayanagiri Road, Bhoodhan Pochampally (V&M), Yadadri, Bhuvanagiri District, Telangana State – 508284.
                    </p>
                  </div>
                </div>

                {/* Telephone & Mobile Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  
                  {/* Landline Telephone */}
                  <div className="card" style={{ padding: '18px', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#25D366' }}>
                      <Phone size={18} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Telephone</span>
                    </div>
                    <a href="tel:04024110478" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F4F8F3', textDecoration: 'none' }}>
                      040-24110478
                    </a>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>Desk: Mon–Sat, 9AM–6PM</div>
                  </div>

                  {/* Mobile / WhatsApp */}
                  <div className="card" style={{ padding: '18px', backgroundColor: '#0E291A', border: '1px solid rgba(37, 211, 102, 0.3)', borderLeft: '4px solid #25D366' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#25D366' }}>
                      <MessageSquareShare size={18} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mobile & WhatsApp</span>
                    </div>
                    <a href="tel:+918886069143" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFE082', textDecoration: 'none' }}>
                      +91 88860 69143
                    </a>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>Immediate WhatsApp response</div>
                  </div>

                </div>

                {/* Email & Website Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  
                  {/* Email */}
                  <div className="card" style={{ padding: '18px', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#38BDF8' }}>
                      <Mail size={18} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Corporate Email</span>
                    </div>
                    <a href="mailto:info@induscropcare.com" style={{ fontSize: '1rem', fontWeight: 700, color: '#F4F8F3', textDecoration: 'none' }}>
                      info@induscropcare.com
                    </a>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>General & institutional queries</div>
                  </div>

                  {/* Website */}
                  <div className="card" style={{ padding: '18px', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#A78BFA' }}>
                      <Globe size={18} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Official Web</span>
                    </div>
                    <a href="https://www.induscropcare.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1rem', fontWeight: 700, color: '#F4F8F3', textDecoration: 'none' }}>
                      www.induscropcare.com
                    </a>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>ISO 9001:2015 Certified Portal</div>
                  </div>

                </div>

                {/* Direct WhatsApp Action Button */}
                <div style={{ marginTop: '8px' }}>
                  <button 
                    type="button" 
                    className="btn btn-whatsapp"
                    onClick={() => handleCustomerCareWhatsApp()}
                    style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  >
                    <MessageSquareShare size={20} />
                    <span>Chat on WhatsApp (+91 88860 69143)</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Right Column: General Enquiry Form */}
            <div>
              <div className="card dark-form" style={{ padding: 'clamp(20px, 4vw, 36px)', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#25D366', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  <span>Official Communication Desk</span>
                </div>
                <h3 style={{ fontSize: '1.45rem', color: '#F4F8F3', marginBottom: '8px', fontWeight: 700 }}>
                  Send an Official Enquiry
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#9EB5A3', marginBottom: '20px', lineHeight: '1.5' }}>
                  Select your enquiry category below. Our commercial and agronomy technical team will follow up directly.
                </p>

                {/* Enquiry Type Selector Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '22px' }}>
                  <button
                    type="button"
                    onClick={() => setEnquiryType('dealership')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: enquiryType === 'dealership' ? '1.5px solid #25D366' : '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: enquiryType === 'dealership' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: enquiryType === 'dealership' ? '#25D366' : '#CBDACD',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Dealership / Distributor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnquiryType('quotation')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: enquiryType === 'quotation' ? '1.5px solid #25D366' : '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: enquiryType === 'quotation' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: enquiryType === 'quotation' ? '#25D366' : '#CBDACD',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Product & Quotation
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnquiryType('agronomy')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: enquiryType === 'agronomy' ? '1.5px solid #25D366' : '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: enquiryType === 'agronomy' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: enquiryType === 'agronomy' ? '#25D366' : '#CBDACD',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Technical Agronomy
                  </button>
                </div>

                {submitted ? (
                  <div style={{ backgroundColor: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.25)', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                    <CheckCircle size={44} style={{ color: '#25D366', margin: '0 auto 12px auto' }} />
                    <h4 style={{ color: '#F4F8F3', fontSize: '1.25rem', marginBottom: '8px', fontWeight: 700 }}>
                      Enquiry Submitted Successfully
                    </h4>
                    <p style={{ color: '#CBDACD', fontSize: '0.92rem', margin: 0, lineHeight: '1.6' }}>
                      Thank you for contacting <strong>Indus Crop Care Pvt. Ltd.</strong> Your message has been safely recorded in our official database. Our team will review your requirements and reach out to you directly.
                    </p>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-white" 
                      style={{ marginTop: '20px' }}
                      onClick={() => { 
                        setSubmitted(false); 
                        setFormData({ 
                          name: '', phone: '', email: '', state: '', district: '', productName: '', quantity: '', message: '' 
                        }); 
                      }}
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    {formError && (
                      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 16px', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" htmlFor="contact-name" style={{ display: 'block', fontSize: '0.88rem', color: '#CBDACD', marginBottom: '6px' }}>
                        Full Name / Company Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        id="contact-name"
                        className="form-control"
                        placeholder="e.g. Ramesh Chandra / Agrico Traders"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#071F11', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F4F8F3', fontSize: '0.95rem' }}
                      />
                    </div>

                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-phone" style={{ display: 'block', fontSize: '0.88rem', color: '#CBDACD', marginBottom: '6px' }}>
                          Mobile / WhatsApp <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input 
                          type="tel" 
                          id="contact-phone"
                          className="form-control"
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          required
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#071F11', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F4F8F3', fontSize: '0.95rem' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-email" style={{ display: 'block', fontSize: '0.88rem', color: '#CBDACD', marginBottom: '6px' }}>
                          Email Address
                        </label>
                        <input 
                          type="email" 
                          id="contact-email"
                          className="form-control"
                          placeholder="name@domain.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#071F11', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F4F8F3', fontSize: '0.95rem' }}
                        />
                      </div>
                    </div>

                    {/* Conditional Fields for Product Quotation */}
                    {enquiryType === 'quotation' && (
                      <>
                        <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                          <div className="form-group">
                            <label className="form-label" htmlFor="contact-state" style={{ display: 'block', fontSize: '0.88rem', color: '#CBDACD', marginBottom: '6px' }}>
                              State
                            </label>
                            <input 
                              type="text" 
                              id="contact-state"
                              className="form-control"
                              placeholder="e.g. Telangana / AP / Karnataka"
                              value={formData.state}
                              onChange={e => setFormData({ ...formData, state: e.target.value })}
                              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#071F11', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F4F8F3', fontSize: '0.95rem' }}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" htmlFor="contact-district" style={{ display: 'block', fontSize: '0.88rem', color: '#CBDACD', marginBottom: '6px' }}>
                              District / Region
                            </label>
                            <input 
                              type="text" 
                              id="contact-district"
                              className="form-control"
                              placeholder="e.g. Warangal / Guntur / Khammam"
                              value={formData.district}
                              onChange={e => setFormData({ ...formData, district: e.target.value })}
                              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#071F11', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F4F8F3', fontSize: '0.95rem' }}
                            />
                          </div>
                        </div>

                        <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                          <div className="form-group">
                            <label className="form-label" htmlFor="contact-product" style={{ display: 'block', fontSize: '0.88rem', color: '#CBDACD', marginBottom: '6px' }}>
                              Formulation / Product Name
                            </label>
                            <input 
                              type="text" 
                              id="contact-product"
                              className="form-control"
                              placeholder="e.g. Abola, Intron, Cartap, Hybrid Seeds"
                              value={formData.productName}
                              onChange={e => setFormData({ ...formData, productName: e.target.value })}
                              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#071F11', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F4F8F3', fontSize: '0.95rem' }}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" htmlFor="contact-quantity" style={{ display: 'block', fontSize: '0.88rem', color: '#CBDACD', marginBottom: '6px' }}>
                              Required Quantity / Units
                            </label>
                            <input 
                              type="text" 
                              id="contact-quantity"
                              className="form-control"
                              placeholder="e.g. 50 Litres / 100 kg / 20 Packs"
                              value={formData.quantity}
                              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#071F11', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F4F8F3', fontSize: '0.95rem' }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" htmlFor="contact-message" style={{ display: 'block', fontSize: '0.88rem', color: '#CBDACD', marginBottom: '6px' }}>
                        {enquiryType === 'dealership' ? 'Dealership Area & Commercial Details' : 
                         enquiryType === 'quotation' ? 'Specific Requirements / Delivery Schedule' : 
                         'Crop Symptoms / Technical Advisory Query'}
                      </label>
                      <textarea 
                        id="contact-message"
                        className="form-control"
                        rows={3}
                        placeholder={
                          enquiryType === 'dealership' ? 'State your existing distribution network, preferred mandals, and experience in agri-inputs...' :
                          enquiryType === 'quotation' ? 'Specify packaging sizes, delivery timeline, or bulk requirements...' :
                          'Describe crop type, pest infestation symptoms, soil characteristics, or agronomic questions...'
                        }
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#071F11', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F4F8F3', fontSize: '0.95rem', resize: 'vertical' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                      disabled={isSubmitting}
                    >
                      <Send size={18} />
                      <span>{isSubmitting ? 'Submitting to Database...' : 'Submit Official Enquiry'}</span>
                    </button>

                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
