import React from 'react';
import { MessageSquareShare, FileText, Calendar, Scale, Ruler, Eye } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onOpenQuote: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenQuote, onOpenDetails }) => {
  return (
    <article className="product-card" id={`product-${product.code.toLowerCase().replace(/\s+/g, '-')}`}>
      {/* Studio Crop Photography & Badges */}
      <div 
        className="product-card-img-wrap"
        onClick={() => onOpenDetails(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenDetails(product);
          }
        }}
        aria-label={`View specifications for ${product.name} ${product.code}`}
      >
        <img 
          src={product.imageUrl} 
          alt={`${product.name} - Indus Crop Care`} 
          className="product-card-img"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== '/images/branding/indus/indus-logo.png') {
              target.src = '/images/branding/indus/indus-logo.png';
            }
          }}
        />
        <div className="product-card-img-sheen" />
        
        {/* Quality Badges */}
        <span className="product-category-badge">
          {product.category}
        </span>
        {product.code && <span className="product-code-badge">{product.code}</span>}

        {/* Hover Quick Action */}
        <div className="product-card-hover-action">
          <Eye size={13} />
          <span>Specs & Details</span>
        </div>
      </div>

      {/* Body Details */}
      <div className="product-card-body">
        <h3 className="product-card-title">{product.name}</h3>

        {/* Formulation / Technical Composition Highlight */}
        {product.formulation && (
          <div style={{ margin: '4px 0 8px 0' }}>
            <span style={{ 
              display: 'inline-block', 
              fontSize: '0.78rem', 
              fontWeight: 700, 
              color: 'var(--color-primary-green-dark)', 
              background: 'var(--color-primary-green-surface)', 
              border: '1px solid rgba(14, 107, 56, 0.22)', 
              padding: '3px 8px', 
              borderRadius: 'var(--radius-xs)',
              lineHeight: '1.3'
            }}>
              {product.formulation}
            </span>
          </div>
        )}

        {product.categoryTelugu && (
          <div className="product-telugu-name">
            {product.categoryTelugu} — {product.code}
          </div>
        )}

        {/* Key Specs Pills for Seeds or General Products */}
        {(product.fruitLength || product.averageWeight || product.daysToHarvest) && (
          <div className="product-specs-summary">
            {product.fruitLength && (
              <span className="spec-pill" title="Fruit Length">
                <Ruler size={11} style={{ display: 'inline', marginRight: '3px' }} />
                {product.fruitLength}
              </span>
            )}
            {product.averageWeight && (
              <span className="spec-pill" title="Average Fruit Weight">
                <Scale size={11} style={{ display: 'inline', marginRight: '3px' }} />
                {product.averageWeight}
              </span>
            )}
            {product.daysToHarvest && (
              <span className="spec-pill" title="Days to Harvest">
                <Calendar size={11} style={{ display: 'inline', marginRight: '3px' }} />
                {product.daysToHarvest}
              </span>
            )}
          </div>
        )}

        <p className="product-card-desc">
          {product.shortDescription}
        </p>

        {/* Action Buttons */}
        <div className="product-card-footer">
          <button 
            type="button" 
            className="btn-card-quote"
            onClick={() => onOpenQuote(product)}
            title={`Direct WhatsApp enquiry for ${product.name} ${product.code}`}
          >
            <MessageSquareShare size={15} />
            <span>WhatsApp Enquiry</span>
          </button>

          <button 
            type="button" 
            className="btn-card-details"
            onClick={() => onOpenDetails(product)}
            title={`View specifications for ${product.name} ${product.code}`}
          >
            <FileText size={14} />
            <span>Specifications</span>
          </button>
        </div>
      </div>
    </article>
  );
};
