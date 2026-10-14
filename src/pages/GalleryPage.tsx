import React, { useEffect, useState, useMemo } from 'react';
import { Image as ImageIcon, Eye, Tag } from 'lucide-react';
import { GalleryItem } from '../types/gallery';
import { getPublishedGalleryItems } from '../services/galleryService';
import { GalleryLightbox } from '../components/gallery/GalleryLightbox';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    getPublishedGalleryItems()
      .then(data => setItems(data))
      .finally(() => setLoading(false));
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

  return (
    <div style={{ backgroundColor: '#06180D', minHeight: '80vh' }}>
      
      {/* Page Header */}
      <section style={{ backgroundColor: '#0A2415', color: '#FFFFFF', paddingTop: '60px', paddingBottom: '60px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="badge badge-gold" style={{ marginBottom: '14px' }}>
            Field Trials & Visual Documentation
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', color: '#F4F8F3', marginBottom: '12px' }}>
            Indus Crop Care Gallery
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#CBDACD', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Real crop protection results, farmer field trials, demonstration plots, and agricultural exhibitions managed directly by Indus Crop Care Pvt. Ltd.
          </p>
        </div>
      </section>

      {/* Main Gallery Grid */}
      <section className="section">
        <div className="container">
          
          {/* Category Filter Chips */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '40px' }}>
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
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9EB5A3' }}>
              Loading gallery...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="card" style={{ padding: '50px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto', backgroundColor: '#0E291A' }}>
              <ImageIcon size={44} style={{ color: '#25D366', margin: '0 auto 16px auto' }} />
              <h3 style={{ color: '#F4F8F3' }}>Gallery Updates Underway</h3>
              <p style={{ color: '#9EB5A3' }}>
                Field photography will appear as field trials are uploaded.
              </p>
            </div>
          ) : (
            <div className="gallery-grid">
              {filteredItems.map(item => (
                <article 
                  key={item.id} 
                  className="gallery-card"
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
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Lightbox Modal */}
      <GalleryLightbox 
        item={activeItem}
        isOpen={Boolean(activeItem)}
        onClose={() => setActiveItem(null)}
      />

    </div>
  );
};
