import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Phone, Sprout, Loader2 } from 'lucide-react';
import { Product } from '../../types/product';
import { submitCustomerEnquiry } from '../../services/enquiryService';

interface ProductEnquirySectionProps {
  products: Product[];
  selectedProductId?: string;
}

export const ProductEnquirySection: React.FC<ProductEnquirySectionProps> = ({
  products,
  selectedProductId
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [interestedProduct, setInterestedProduct] = useState(selectedProductId || '');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Sync when selectedProductId changes from parent click
  React.useEffect(() => {
    if (selectedProductId) {
      setInterestedProduct(selectedProductId);
    }
  }, [selectedProductId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      // Find selected product name
      const prod = products.find(p => p.id === interestedProduct || p.code === interestedProduct);
      const productLabel = prod ? `${prod.name} — ${prod.code}` : (interestedProduct || 'General Crop Care Portfolio');

      const res = await submitCustomerEnquiry({
        fullName,
        phone: cleanPhone,
        state,
        district,
        interestedProduct: productLabel,
        quantity,
        message
      });

      if (res.success) {
        setSubmittedId(res.id || 'SUBMITTED');
        setFullName('');
        setPhone('');
        setState('');
        setDistrict('');
        setQuantity('');
        setMessage('');
      } else {
        setError(res.error || 'Failed to submit enquiry. Please check your details and try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section 
      id="product-enquiry-section" 
      className="product-enquiry-section"
      aria-labelledby="enquiry-heading"
    >
      <div className="container">
        <div className="enquiry-card-wrapper reveal-on-scroll">
          
          {/* Header Banner */}
          <div className="enquiry-header">
            <span className="section-tag" style={{ background: 'rgba(37, 211, 102, 0.14)', color: 'var(--color-action-green)', border: '1px solid rgba(37, 211, 102, 0.3)', marginBottom: '14px' }}>
              <Sprout size={14} />
              <span>Official Product Enquiry Desk</span>
            </span>
            <h2 id="enquiry-heading" className="enquiry-title">
              Request Product Availability & Price Quotation
            </h2>
            <p className="enquiry-subtitle">
              Submit your crop protection and nutrient requirement directly to Indus Crop Care technical advisors. We verify stock availability, dispatch schedules, and bulk dealership rates across India.
            </p>
          </div>

          {/* Form / Success Feedback */}
          {submittedId ? (
            <div className="enquiry-success-box" role="status" aria-live="polite">
              <CheckCircle2 size={48} className="success-icon" />
              <h3>Enquiry Received Successfully!</h3>
              <p>
                Thank you for reaching out to <strong>Indus Crop Care Pvt. Ltd.</strong> 
                Our technical advisory team has received your inquiry and will contact your mobile number directly.
              </p>
              <div className="enquiry-id-badge">
                Reference ID: <strong>{submittedId}</strong>
              </div>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setSubmittedId(null)}
                style={{ marginTop: '22px' }}
              >
                Submit Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="enquiry-form dark-form" noValidate>
              
              {error && (
                <div className="enquiry-error-alert" role="alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="enquiry-form-grid">
                
                {/* 1. Full Name */}
                <div className="form-group">
                  <label htmlFor="enq-fullname" className="form-label">
                    Full Name <span className="req">*</span>
                  </label>
                  <input 
                    id="enq-fullname"
                    type="text" 
                    className="form-control"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>

                {/* 2. Mobile Number */}
                <div className="form-group">
                  <label htmlFor="enq-phone" className="form-label">
                    Mobile Number <span className="req">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      id="enq-phone"
                      type="tel" 
                      className="form-control"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      disabled={loading}
                      maxLength={14}
                      autoComplete="tel"
                    />
                    <Phone size={16} className="input-right-icon" />
                  </div>
                </div>

                {/* 3. Interested Product */}
                <div className="form-group">
                  <label htmlFor="enq-product" className="form-label">
                    Interested Product Variety
                  </label>
                  <select 
                    id="enq-product"
                    className="form-control"
                    value={interestedProduct}
                    onChange={e => setInterestedProduct(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">General Crop Care & Formulation Portfolio</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.code} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Quantity Required */}
                <div className="form-group">
                  <label htmlFor="enq-quantity" className="form-label">
                    Quantity Required
                  </label>
                  <input 
                    id="enq-quantity"
                    type="text" 
                    className="form-control"
                    placeholder="e.g. 50 Litres, 100 kg, 20 packets"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* 5. State */}
                <div className="form-group">
                  <label htmlFor="enq-state" className="form-label">
                    State
                  </label>
                  <input 
                    id="enq-state"
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Telangana, Andhra Pradesh, Karnataka"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* 6. District */}
                <div className="form-group">
                  <label htmlFor="enq-district" className="form-label">
                    District / Mandal
                  </label>
                  <input 
                    id="enq-district"
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Warangal, Guntur, Khammam"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    disabled={loading}
                  />
                </div>

              </div>

              {/* 7. Message */}
              <div className="form-group" style={{ marginTop: '4px' }}>
                <label htmlFor="enq-message" className="form-label">
                  Additional Requirements / Agronomic Questions
                </label>
                <textarea 
                  id="enq-message"
                  className="form-control"
                  rows={3}
                  placeholder="Share any special crop symptoms, expected sowing season, or dealer inquiries..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Submit CTA */}
              <div className="enquiry-submit-row">
                <button 
                  type="submit" 
                  className="btn btn-submit-enquiry"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      <span>Submitting to Agronomy Desk...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Product Enquiry</span>
                    </>
                  )}
                </button>
                <span className="enquiry-privacy-note">
                  Your contact details are strictly kept private and processed only by authorized Indus Crop Care staff.
                </span>
              </div>

            </form>
          )}

        </div>
      </div>
    </section>
  );
};
