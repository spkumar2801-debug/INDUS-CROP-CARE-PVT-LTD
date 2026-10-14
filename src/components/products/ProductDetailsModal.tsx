import React, { useState } from 'react';
import { X, MessageSquareShare, CheckCircle, FileText, Languages, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuote: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenQuote
}) => {
  const [activeTab, setActiveTab] = useState<'english' | 'telugu' | 'sheet'>('english');

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="product-details-title">
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="product-code-badge" style={{ position: 'static' }}>{product.code}</span>
              <span className="badge badge-green">{product.category}</span>
              <span className="modal-certified-chip">
                <ShieldCheck size={13} />
                ISO 9001:2015 Certified
              </span>
            </div>
            <h2 id="product-details-title" style={{ fontSize: '1.5rem', color: '#FFFFFF', fontWeight: 800 }}>
              {product.name} {product.formulation && <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#25D366' }}>({product.formulation})</span>}
            </h2>
            {product.categoryTelugu && (
              <p className="telugu-quote" style={{ margin: '4px 0 0 0', fontSize: '1.05rem', color: '#FFE082' }}>
                {product.categoryTelugu} {product.code ? `(${product.code})` : ''}
              </p>
            )}
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close specifications modal">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          {/* Top Overview Grid */}
          <div className="modal-overview-grid">
            <div className="modal-crop-frame">
              <img 
                src={product.imageUrl} 
                alt={`${product.name} ${product.code}`} 
                className="modal-crop-img"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/images/branding/indus/indus-logo.png') {
                    target.src = '/images/branding/indus/indus-logo.png';
                  }
                }}
              />
              <span className="modal-crop-seal">Certified Specimen</span>
            </div>
            <div>
              <p style={{ fontSize: '0.96rem', lineHeight: '1.65', color: '#DCE8DF', marginBottom: '16px' }}>
                {product.description}
              </p>
              {product.features && product.features.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#25D366', marginBottom: '10px', letterSpacing: '0.05em', fontWeight: 800 }}>
                    Key Agronomic Highlights
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
                    {product.features.slice(0, 5).map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: '#D4E5D8', lineHeight: '1.4' }}>
                        <CheckCircle size={15} style={{ color: '#25D366', flexShrink: 0, marginTop: '2px' }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="modal-tabs">
            <button 
              type="button" 
              className={`modal-tab-btn ${activeTab === 'english' ? 'active' : ''}`}
              onClick={() => setActiveTab('english')}
            >
              <FileText size={16} style={{ display: 'inline', marginRight: '6px' }} />
              English Specifications
            </button>
            <button 
              type="button" 
              className={`modal-tab-btn ${activeTab === 'telugu' ? 'active' : ''}`}
              onClick={() => setActiveTab('telugu')}
            >
              <Languages size={16} style={{ display: 'inline', marginRight: '6px' }} />
              తెలుగు సాంకేతిక వివరాలు (Telugu)
            </button>
            {product.sheetImageUrl && (
              <button 
                type="button" 
                className={`modal-tab-btn ${activeTab === 'sheet' ? 'active' : ''}`}
                onClick={() => setActiveTab('sheet')}
              >
                <ImageIcon size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Original Product Sheet
              </button>
            )}
          </div>

          {/* Tab 1: English Specifications */}
          {activeTab === 'english' && (
            <div>
              <table className="spec-table">
                <tbody>
                  {product.specifications.map((spec, idx) => (
                    <tr key={idx}>
                      <th>{spec.label}</th>
                      <td>{spec.value}</td>
                    </tr>
                  ))}
                  {product.daysToHarvest && (
                    <tr>
                      <th>Days to Harvest</th>
                      <td>{product.daysToHarvest}</td>
                    </tr>
                  )}
                  {product.cropSeason && (
                    <tr>
                      <th>Recommended Season</th>
                      <td>{product.cropSeason}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Telugu Specifications */}
          {activeTab === 'telugu' && (
            <div>
              {product.teluguDescription ? (
                <div style={{ backgroundColor: 'rgba(255, 224, 130, 0.08)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', borderLeft: '4px solid #FFE082', border: '1px solid rgba(255, 224, 130, 0.2)' }}>
                  <p className="telugu-quote" style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.7', color: '#FFE082' }}>
                    {product.teluguDescription}
                  </p>
                </div>
              ) : null}

              {product.specifications.some(s => s.labelTelugu && s.valueTelugu) ? (
                <table className="spec-table">
                  <tbody>
                    {product.specifications
                      .filter(s => s.labelTelugu && s.valueTelugu)
                      .map((spec, idx) => (
                        <tr key={idx}>
                          <th style={{ fontFamily: 'var(--font-telugu)', fontSize: '0.95rem' }}>
                            {spec.labelTelugu}
                          </th>
                          <td style={{ fontFamily: 'var(--font-telugu)', fontSize: '0.95rem' }}>
                            {spec.valueTelugu}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.04)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  textAlign: 'center', 
                  margin: '16px 0' 
                }}>
                  <p style={{ color: '#FFE082', fontSize: '1rem', fontFamily: 'var(--font-telugu)', margin: '0 0 8px 0', fontWeight: 600 }}>
                    ఈ ఫార్ములేషన్ వివరాలు ప్రస్తుతం అధికారిక ఆంగ్ల కేటలాగ్‌లో అందుబాటులో ఉన్నాయి.
                  </p>
                  <p style={{ color: '#CBDACD', fontSize: '0.86rem', lineHeight: '1.5', margin: 0 }}>
                    రైతులకు సమగ్ర పంట రక్షణ మోతాదులు మరియు సాంకేతిక సలహాల కోసం మా నిపుణుల డెస్క్‌ను వాట్సాప్ ద్వారా సంప్రదించండి.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Official Sheet */}
          {activeTab === 'sheet' && product.sheetImageUrl && (
            <div className="sheet-img-wrap">
              <div className="sheet-official-header">
                <span className="badge badge-gold">Official Catalogue Document</span>
                <span style={{ fontSize: '0.82rem', color: '#25D366', fontWeight: 600 }}>
                  Indus Crop Care Verified Document
                </span>
              </div>
              <img 
                src={product.sheetImageUrl} 
                alt={`Official catalogue specification for ${product.name} ${product.code || ''}`} 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/images/branding/indus/indus-logo.png') {
                    target.src = '/images/branding/indus/indus-logo.png';
                  }
                }}
              />
              <p style={{ fontSize: '0.85rem', color: '#CBDACD', marginTop: '14px', lineHeight: '1.5' }}>
                Authentic technical release document issued by Indus Crop Care Pvt. Ltd. All chemical, biological, and nutritional specifications are documented from verified manufacturing and laboratory tests.
              </p>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <span style={{ fontSize: '0.85rem', color: '#A0B8A5' }}>
              Scientific agronomic and crop protection advisory available for commercial and retail farmers.
            </span>
            <button 
              type="button" 
              className="btn btn-whatsapp"
              onClick={() => {
                onClose();
                onOpenQuote(product);
              }}
            >
              <MessageSquareShare size={18} />
              <span>Get WhatsApp Quotation for {product.name}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
