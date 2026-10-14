import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquareShare, 
  CheckCircle, 
  FileText, 
  Languages, 
  Image as ImageIcon,
  Ruler,
  Scale,
  Calendar,
  FlaskConical,
  BookOpen
} from 'lucide-react';
import { Product } from '../types/product';
import { getProductById } from '../services/productService';

interface ProductDetailPageProps {
  onOpenQuote: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onOpenQuote }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'english' | 'telugu' | 'sheet'>('english');

  useEffect(() => {
    if (id) {
      getProductById(id)
        .then(p => {
          setProduct(p);
          if (p && !p.sheetImageUrl && !p.teluguDescription && (!p.specifications || p.specifications.every(s => !s.labelTelugu))) {
            setActiveTab('english');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: '#9EB5A3' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(37, 211, 102, 0.2)', borderTopColor: '#25D366', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        Loading product formulation details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#F4F8F3', marginBottom: '12px' }}>Product Record Not Found</h2>
        <p style={{ color: '#9EB5A3', marginBottom: '24px' }}>
          The requested product or formulation does not exist in the catalogue or has been unpublished.
        </p>
        <Link to="/products" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Products Catalogue</span>
        </Link>
      </div>
    );
  }

  const hasTelugu = Boolean(product.teluguDescription || product.categoryTelugu || product.specifications?.some(s => s.labelTelugu));

  return (
    <div style={{ backgroundColor: '#06180D', minHeight: '85vh', paddingBottom: '80px', color: '#F4F8F3' }}>
      
      {/* Breadcrumb Bar */}
      <div style={{ backgroundColor: '#0A2415', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#9EB5A3', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#25D366' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: '#25D366' }}>Products</Link>
          <span>/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: '#CBDACD' }}>
            {product.category}
          </Link>
          <span>/</span>
          <span style={{ color: '#F4F8F3', fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      <div className="container" style={{ marginTop: '36px' }}>
        
        {/* Product Overview Card */}
        <div className="card" style={{ padding: 'clamp(20px, 4vw, 40px)', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '40px', alignItems: 'center' }}>
            
            {/* Image Box */}
            <div className="product-detail-hero-frame" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#071F11', border: '1px solid rgba(255, 255, 255, 0.09)', textAlign: 'center', padding: '24px' }}>
              <img 
                src={product.imageUrl} 
                alt={`${product.name} - Indus Crop Care`} 
                className="product-detail-hero-img"
                style={{ maxHeight: '360px', width: 'auto', maxWidth: '100%', objectFit: 'contain', margin: '0 auto' }}
              />
              <div className="product-detail-badge-overlay" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-gold">{product.category}</span>
                {product.sourcePage && (
                  <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#CBDACD' }}>
                    Catalogue Page {product.sourcePage}
                  </span>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>{product.category}</span>
                {product.broadGroup && (
                  <span className="badge" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', color: '#A7F3D0', border: '1px solid rgba(37, 211, 102, 0.25)' }}>
                    {product.broadGroup}
                  </span>
                )}
                <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', color: '#94A3B8' }}>
                  SKU: {product.code}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', color: '#F4F8F3', marginBottom: '12px', fontWeight: 800, lineHeight: '1.2' }}>
                {product.name}
              </h1>

              {/* Formulation Pill */}
              {(product.formulation || product.composition) && (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  backgroundColor: 'rgba(2, 132, 199, 0.15)', 
                  border: '1px solid rgba(2, 132, 199, 0.35)',
                  padding: '8px 14px', 
                  borderRadius: '8px', 
                  marginBottom: '20px' 
                }}>
                  <FlaskConical size={16} style={{ color: '#38BDF8', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.96rem', color: '#BAE6FD', fontWeight: 600 }}>
                    {product.formulation || product.composition}
                  </span>
                </div>
              )}

              {product.categoryTelugu && (
                <div className="telugu-quote" style={{ fontSize: '1.15rem', color: '#FFE082', marginBottom: '16px' }}>
                  {product.categoryTelugu} - {product.code}
                </div>
              )}

              {/* Quick Specs Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {product.sourcePage && (
                  <div className="spec-pill" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                    <BookOpen size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    Official Catalogue: <strong>Page {product.sourcePage}</strong>
                  </div>
                )}
                {product.fruitLength && (
                  <div className="spec-pill" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                    <Ruler size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    Length: <strong>{product.fruitLength}</strong>
                  </div>
                )}
                {product.averageWeight && (
                  <div className="spec-pill" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                    <Scale size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    Weight: <strong>{product.averageWeight}</strong>
                  </div>
                )}
                {product.daysToHarvest && (
                  <div className="spec-pill" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                    <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    Harvest: <strong>{product.daysToHarvest}</strong>
                  </div>
                )}
              </div>

              <p style={{ fontSize: '1.04rem', lineHeight: '1.75', color: '#CBDACD', marginBottom: '24px' }}>
                {product.description || product.shortDescription}
              </p>

              {/* Features list */}
              {product.features && product.features.length > 0 && (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px', padding: 0 }}>
                  {product.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#E2E8F0' }}>
                      <CheckCircle size={16} style={{ color: '#25D366', flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button 
                type="button" 
                className="btn btn-whatsapp btn-lg"
                onClick={() => onOpenQuote(product)}
                style={{ width: '100%', maxWidth: '420px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <MessageSquareShare size={20} />
                <span>Enquire on WhatsApp (+91 88860 69143)</span>
              </button>

            </div>

          </div>
        </div>

        {/* Technical Specs Tab Card */}
        <div className="card" style={{ padding: 'clamp(20px, 4vw, 36px)', backgroundColor: '#0E291A', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          
          <div className="modal-tabs">
            <button 
              type="button" 
              className={`modal-tab-btn ${activeTab === 'english' ? 'active' : ''}`}
              onClick={() => setActiveTab('english')}
            >
              <FileText size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Formulation & Scientific Specifications
            </button>
            {hasTelugu && (
              <button 
                type="button" 
                className={`modal-tab-btn ${activeTab === 'telugu' ? 'active' : ''}`}
                onClick={() => setActiveTab('telugu')}
              >
                <Languages size={16} style={{ display: 'inline', marginRight: '6px' }} />
                తెలుగు వివరణలు (Telugu Details)
              </button>
            )}
            {product.sheetImageUrl && (
              <button 
                type="button" 
                className={`modal-tab-btn ${activeTab === 'sheet' ? 'active' : ''}`}
                onClick={() => setActiveTab('sheet')}
              >
                <ImageIcon size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Official Technical Release Sheet
              </button>
            )}
          </div>

          {activeTab === 'english' && (
            <table className="spec-table">
              <tbody>
                {product.specifications && product.specifications.length > 0 ? (
                  product.specifications.map((s, idx) => (
                    <tr key={idx}>
                      <th>{s.label}</th>
                      <td>{s.value}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <th>Product Brand Name</th>
                      <td>{product.name}</td>
                    </tr>
                    <tr>
                      <th>Category</th>
                      <td>{product.category}</td>
                    </tr>
                    {product.formulation && (
                      <tr>
                        <th>Active Ingredient / Formulation</th>
                        <td>{product.formulation}</td>
                      </tr>
                    )}
                    {product.sourcePage && (
                      <tr>
                        <th>Catalogue Source Page</th>
                        <td>Page {product.sourcePage} (Indus Crop Care Official Catalogue)</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'telugu' && (
            <div>
              {product.teluguDescription && (
                <div style={{ backgroundColor: 'rgba(37, 211, 102, 0.08)', padding: '18px', borderRadius: 'var(--radius-md)', marginBottom: '20px', borderLeft: '4px solid #25D366', border: '1px solid rgba(37, 211, 102, 0.25)' }}>
                  <p className="telugu-quote" style={{ margin: 0, fontSize: '1rem', lineHeight: '1.7', color: '#FFE082' }}>
                    {product.teluguDescription}
                  </p>
                </div>
              )}
              {product.specifications && product.specifications.some(s => s.labelTelugu && s.valueTelugu) ? (
                <table className="spec-table">
                  <tbody>
                    {product.specifications
                      .filter(s => s.labelTelugu && s.valueTelugu)
                      .map((s, idx) => (
                        <tr key={idx}>
                          <th style={{ fontFamily: 'var(--font-telugu)', fontSize: '0.95rem' }}>
                            {s.labelTelugu}
                          </th>
                          <td style={{ fontFamily: 'var(--font-telugu)', fontSize: '0.95rem' }}>
                            {s.valueTelugu}
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

          {activeTab === 'sheet' && product.sheetImageUrl && (
            <div className="sheet-img-wrap">
              <div className="sheet-official-header">
                <span className="badge badge-gold">Official Agronomy Release Document</span>
                <span style={{ fontSize: '0.82rem', color: '#25D366', fontWeight: 600 }}>
                  Indus Crop Care Records
                </span>
              </div>
              <img 
                src={product.sheetImageUrl} 
                alt={`Official sheet for ${product.name}`} 
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
