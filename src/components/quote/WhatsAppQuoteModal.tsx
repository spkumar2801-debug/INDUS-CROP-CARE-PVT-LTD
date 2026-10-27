import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, AlertCircle, MessageCircle, Mail } from 'lucide-react';
import { Product, QuoteFormData } from '../../types/product';
import { generateWhatsAppHandoffUrl, buildWhatsAppQuoteMessage } from '../../lib/whatsapp';
import { getSiteSettings } from '../../services/settingsService';

interface WhatsAppQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: Product | null;
  allProducts: Product[];
}

export const WhatsAppQuoteModal: React.FC<WhatsAppQuoteModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
  allProducts
}) => {
  const initialProd = selectedProduct || (allProducts.length > 0 ? allProducts[0] : null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(initialProd);
  const [businessNumber, setBusinessNumber] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<QuoteFormData>({
    customerName: '',
    phone: '',
    state: 'Andhra Pradesh',
    district: '',
    productId: initialProd?.id || '',
    productName: initialProd?.name || '',
    productCode: initialProd?.code || '',
    quantity: '',
    message: ''
  });

  const [prevSelectedId, setPrevSelectedId] = useState(selectedProduct?.id);
  if (selectedProduct && selectedProduct.id !== prevSelectedId) {
    setPrevSelectedId(selectedProduct.id);
    setCurrentProduct(selectedProduct);
    setFormData(prev => ({
      ...prev,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productCode: selectedProduct.code
    }));
  }

  useEffect(() => {
    if (!isOpen) return;

    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Fetch latest WhatsApp configuration from settings
    getSiteSettings().then(settings => {
      if (settings.whatsappNumber) {
        setBusinessNumber(settings.whatsappNumber);
      }
    });

    return () => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prod = allProducts.find(p => p.id === e.target.value);
    if (prod) {
      setCurrentProduct(prod);
      setFormData(prev => ({
        ...prev,
        productId: prod.id,
        productName: prod.name,
        productCode: prod.code
      }));
    }
  };

  const previewText = buildWhatsAppQuoteMessage(formData);

  const handleHandoff = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.customerName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp or phone number.');
      return;
    }
    if (!formData.productName) {
      setErrorMsg('Please select a product.');
      return;
    }

    const handoff = generateWhatsAppHandoffUrl(formData, businessNumber);

    if (handoff.success && handoff.url) {
      // Open WhatsApp click-to-chat in new tab / mobile app
      window.open(handoff.url, '_blank', 'noopener,noreferrer');
      onClose();
    } else {
      // When business WhatsApp number has not been configured by owner yet
      setErrorMsg(
        handoff.error || 
        'Official WhatsApp business number is pending configuration by company admin. You can copy the inquiry message below or email us.'
      );
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="quote-modal-title">
      <div className="modal-dialog quote-modal-dialog" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="section-tag" style={{ marginBottom: '6px' }}>Direct Farmer & Dealer Enquiry</span>
            <h3 id="quote-modal-title" style={{ fontSize: '1.4rem', color: 'var(--color-primary-green-dark)' }}>
              Request a Product Quotation
            </h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleHandoff} className="modal-body">
          
          {/* Selected Product Banner */}
          {currentProduct && (
            <div className="selected-product-banner">
              <img 
                src={currentProduct.imageUrl} 
                alt={currentProduct.name} 
                className="selected-product-img" 
              />
              <div className="selected-product-info">
                <h4>{currentProduct.name} — {currentProduct.code}</h4>
                <p>
                  Category: {currentProduct.category} {currentProduct.categoryTelugu && `(${currentProduct.categoryTelugu})`}
                </p>
              </div>
            </div>
          )}

          {/* Product Switcher Dropdown */}
          <div className="form-group">
            <label className="form-label" htmlFor="quote-product-select">
              Selected Seed Product <span className="req">*</span>
            </label>
            <select 
              id="quote-product-select"
              className="form-control"
              value={formData.productId}
              onChange={handleProductSelect}
              required
            >
              {allProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Customer Name & Phone */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="customerName">
                Your Full Name <span className="req">*</span>
              </label>
              <input 
                type="text" 
                id="customerName"
                className="form-control"
                placeholder="e.g. Ramesh Kumar"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                WhatsApp / Mobile Number <span className="req">*</span>
              </label>
              <input 
                type="tel" 
                id="phone"
                className="form-control"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* State & District */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="state">
                State
              </label>
              <select 
                id="state"
                className="form-control"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
              >
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Other">Other State</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="district">
                District / Mandal
              </label>
              <input 
                type="text" 
                id="district"
                className="form-control"
                placeholder="e.g. Guntur, Krishna, Warangal"
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
              />
            </div>
          </div>

          {/* Quantity & Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="quantity">
              Estimated Quantity Required (Optional)
            </label>
            <input 
              type="text" 
              id="quantity"
              className="form-control"
              placeholder="e.g. 10 Packets, 5 kg, 50 Acres requirement"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="message">
              Additional Notes or Field Questions (Optional)
            </label>
            <textarea 
              id="message"
              className="form-control"
              rows={2}
              placeholder="Inquire about sowing recommendations, nursery tips, bulk dealer rates..."
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          {/* Live WhatsApp Message Preview */}
          <div className="whatsapp-preview-box">
            <div className="whatsapp-preview-title">
              <MessageCircle size={16} />
              <span>Prefilled WhatsApp Enquiry Message</span>
            </div>
            <pre className="whatsapp-preview-text">{previewText}</pre>
          </div>

          {/* Error / Notice Display */}
          {errorMsg && (
            <div className="whatsapp-notice-banner">
              <AlertCircle size={18} style={{ flexShrink: 0, color: '#C62828' }} />
              <div>
                <strong style={{ display: 'block', color: '#B71C1C' }}>Notice:</strong>
                <span>{errorMsg}</span>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline"
                    onClick={handleCopyMessage}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy Enquiry Text'}</span>
                  </button>
                  <a 
                    href={`mailto:indusagriseedspl@gmail.com?subject=Enquiry for ${encodeURIComponent(formData.productName)}&body=${encodeURIComponent(previewText)}`}
                    className="btn btn-sm btn-outline"
                  >
                    <Mail size={14} />
                    <span>Send via Email</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Handoff Button */}
          <button 
            type="submit" 
            className="whatsapp-handoff-btn"
          >
            <Send size={18} />
            <span>Connect on WhatsApp & Send Enquiry</span>
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '12px' }}>
            Clicking will open WhatsApp with your prefilled product enquiry. You will confirm and send the message directly in WhatsApp.
          </p>

        </form>

      </div>
    </div>
  );
};
