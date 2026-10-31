import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  // Prevent background scrolling and attach keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !item) return null;
  if (typeof document === 'undefined') return null;

  const modalContent = (
    <div 
      className="gallery-lightbox-overlay" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true" 
      aria-label={`Preview: ${item.title}`}
    >
      <div 
        className="gallery-lightbox-dialog"
        onClick={e => e.stopPropagation()}
      >
        {/* Clearly Visible Top-Right Close Button */}
        <button 
          type="button" 
          onClick={onClose} 
          className="gallery-lightbox-close-btn"
          aria-label="Close image preview"
          title="Close (Esc)"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Centered High-Resolution Image Presentation Stage */}
        <div className="gallery-lightbox-stage">
          <img 
            src={item.imageUrl} 
            alt={item.altText || item.title} 
            className="gallery-lightbox-image"
            loading="eager"
            decoding="sync"
          />

          {/* Navigation Chevron: Previous */}
          {onPrev && (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); onPrev(); }} 
              className="gallery-lightbox-nav-btn prev"
              aria-label="Previous photograph"
              title="Previous photograph (Left Arrow)"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
          )}

          {/* Navigation Chevron: Next */}
          {onNext && (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); onNext(); }} 
              className="gallery-lightbox-nav-btn next"
              aria-label="Next photograph"
              title="Next photograph (Right Arrow)"
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Informative Photographic Header & Caption Bar */}
        <div className="gallery-lightbox-info">
          <div className="gallery-lightbox-meta-row">
            <span className="gallery-lightbox-category-badge">
              <Tag size={12} style={{ marginRight: '5px' }} />
              {item.category}
            </span>
            {currentIndex !== undefined && totalCount !== undefined && (
              <span className="gallery-lightbox-counter">
                {currentIndex + 1} of {totalCount}
              </span>
            )}
          </div>
          
          <h3 className="gallery-lightbox-title">
            {item.title}
          </h3>
          
          {item.description && (
            <p className="gallery-lightbox-description">
              {item.description}
            </p>
          )}
          
          {item.caption && (
            <div className="gallery-lightbox-caption">
              {item.caption}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
