import React, { useEffect } from 'react';
import { X, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem } from '../../types/gallery';

interface GalleryLightboxProps {
  item: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({ 
  item, 
  isOpen, 
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalCount
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    if (isOpen) {
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onPrev, onNext]);

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
        <div style={{ position: 'relative', backgroundColor: '#071F11', maxHeight: '70vh', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={item.imageUrl} 
            alt={item.altText || item.title} 
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />

          {onPrev && (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); onPrev(); }} 
              aria-label="Previous photograph"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(5, 20, 10, 0.75)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {onNext && (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); onNext(); }} 
              aria-label="Next photograph"
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(5, 20, 10, 0.75)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              background: 'rgba(5, 20, 10, 0.75)', 
              color: '#FFF', 
              border: '1px solid rgba(255,255,255,0.2)', 
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 11
            }}
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-green">
              <Tag size={12} style={{ marginRight: '4px' }} />
              {item.category}
            </span>
            {currentIndex !== undefined && totalCount !== undefined && (
              <span style={{ fontSize: '0.82rem', color: 'var(--color-charcoal-500)', fontWeight: 600 }}>
                {currentIndex + 1} of {totalCount}
              </span>
            )}
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
