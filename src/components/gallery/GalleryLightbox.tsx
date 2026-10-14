import React, { useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { GalleryItem } from '../../types/gallery';

interface GalleryLightboxProps {
  item: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({ item, isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true" 
      aria-label="Image Lightbox"
      style={{ backgroundColor: 'rgba(5, 20, 10, 0.9)' }}
    >
      <div 
        style={{ 
          maxWidth: '880px', 
          width: '100%', 
          backgroundColor: '#FFFFFF', 
          borderRadius: 'var(--radius-xl)', 
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ position: 'relative', backgroundColor: '#071F11', maxHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={item.imageUrl} 
            alt={item.altText || item.title} 
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', color: '#FFF', border: 'none' }}
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-green">
              <Tag size={12} style={{ marginRight: '4px' }} />
              {item.category}
            </span>
          </div>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-green-dark)', marginBottom: '8px' }}>
            {item.title}
          </h3>
          {item.description && (
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-body)', lineHeight: '1.5', margin: 0 }}>
              {item.description}
            </p>
          )}
          {item.caption && (
            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--color-harvest-gold)', fontWeight: 600 }}>
              {item.caption}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
