import React, { useEffect, useState, useMemo } from 'react';
import { Image as ImageIcon, Eye, Tag } from 'lucide-react';
import { GalleryItem } from '../types/gallery';
import { getPublishedGalleryItems, subscribeToGallery } from '../services/galleryService';
import { GalleryLightbox } from '../components/gallery/GalleryLightbox';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    getPublishedGalleryItems()
      .then(data => {
        if (isMounted) setItems(data);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const unsubscribe = subscribeToGallery(() => {
      getPublishedGalleryItems().then(data => {
        if (isMounted) setItems(data);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.category) set.add(i.category);
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter(i => i.category === selectedCategory);
  }, [items, selectedCategory]);

  const activeIndex = useMemo(() => {
    if (!activeItem) return -1;
    return filteredItems.findIndex(i => i.id === activeItem.id);
  }, [activeItem, filteredItems]);

  // Premium Scroll Reveal Observer for gallery cards
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.gallery-card-reveal').forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px 50px 0px',
        threshold: 0.08
      }
    );

    const observeUnrevealed = () => {
      const cards = document.querySelectorAll('.gallery-card-reveal:not(.is-revealed)');
      cards.forEach(card => observer.observe(card));
    };

    observeUnrevealed();
    const timer = setTimeout(observeUnrevealed, 80);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [filteredItems]);

  return (
    <div style={{ backgroundColor: 'var(--color-sage-50)', minHeight: '85vh', color: 'var(--color-charcoal-800)' }}>

      {/* Page Header — Deep Forest Botanical */}
      <section style={{ backgroundColor: 'var(--color-forest-900)', color: '#FFFFFF', paddingTop: 'clamp(48px, 7vw, 72px)', paddingBottom: 'clamp(48px, 7vw, 72px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '16px' }}>
            Field Trials & Visual Documentation
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', color: '#FFFFFF', marginBottom: '14px', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Indus Crop Care Gallery
          </h1>
          <p style={{ fontSize: '1.08rem', color: 'var(--color-sage-200)', maxWidth: '680px', margin: '0 auto', lineHeight: '1.65' }}>
            Real crop protection results, farmer field trials, demonstration plots, and agricultural exhibitions managed directly by Indus Crop Care Pvt. Ltd.
          </p>
        </div>
      </section>

      {/* Main Gallery Grid */}
      <section className="section" style={{ paddingTop: '40px', paddingBottom: '76px' }}>
        <div className="container">

          {/* Category Filter Chips */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'All' ? 'All Visuals' : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-charcoal-600)' }}>
              Loading gallery...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="card card-light" style={{ padding: '50px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
              <ImageIcon size={44} style={{ color: 'var(--color-primary-green)', margin: '0 auto 16px auto' }} />
              <h3 style={{ color: 'var(--color-charcoal-950)' }}>Gallery Updates Underway</h3>
              <p style={{ color: 'var(--color-charcoal-600)' }}>
                Field photography will appear as field trials are uploaded.
              </p>
            </div>
          ) : (
            <div className="gallery-grid">
              {filteredItems.map((item, index) => {
                const staggerClass = `stagger-${(index % 3) + 1}`;
                return (
                  <article
                    key={item.id}
                    className={`gallery-card gallery-card-reveal ${staggerClass}`}
                    onClick={() => setActiveItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveItem(item); } }}
                    aria-label={`View photography for ${item.title}`}
                  >
                  <div className="gallery-img-wrap">
                    <img
                      src={item.imageUrl}
                      alt={item.altText || item.title}
                      className="gallery-img"
                      loading="lazy"
                    />
                    <div className="gallery-overlay-sheen" />

                    <span className="gallery-category-pill">
                      <Tag size={11} />
                      {item.category}
                    </span>

                    <div className="gallery-hover-indicator">
                      <div className="gallery-zoom-button">
                        <Eye size={22} />
                      </div>
                    </div>
                  </div>

                  <div className="gallery-body">
                    <h3 className="gallery-title">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p className="gallery-caption">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          )}

        </div>
      </section>

      {/* Lightbox Modal */}
      <GalleryLightbox
        item={activeItem}
        isOpen={Boolean(activeItem)}
        onClose={() => setActiveItem(null)}
        onPrev={activeIndex > 0 ? () => setActiveItem(filteredItems[activeIndex - 1]) : undefined}
        onNext={activeIndex >= 0 && activeIndex < filteredItems.length - 1 ? () => setActiveItem(filteredItems[activeIndex + 1]) : undefined}
        currentIndex={activeIndex >= 0 ? activeIndex : undefined}
        totalCount={filteredItems.length}
      />

    </div>
  );
};
