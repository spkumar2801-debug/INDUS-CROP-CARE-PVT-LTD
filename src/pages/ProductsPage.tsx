import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sprout, RotateCcw, Filter, CheckCircle2 } from 'lucide-react';
import { Product } from '../types/product';
import { getPublishedProducts } from '../services/productService';
import { ProductCard } from '../components/products/ProductCard';

interface ProductsPageProps {
  onOpenQuote: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

// Broad navigation groups defined in requirement 6
const BROAD_GROUPS = [
  'All',
  'Insecticides',
  'Herbicides',
  'Fungicides',
  'Micronutrients',
  'Nutrients',
  'Fertilizers',
  'Bio Fertilizers',
  'Biostimulants',
  'Biologicals',
  'PGR',
  'Antibiotics',
  'Seeds'
];

export const ProductsPage: React.FC<ProductsPageProps> = ({ onOpenQuote, onOpenDetails }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const initialCategory = searchParams.get('category') || 'All';
  const initialGroup = searchParams.get('group') || 'All';
  const initialSearch = searchParams.get('q') || '';

  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroup);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  useEffect(() => {
    getPublishedProducts()
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  // Update state if URL query params change
  useEffect(() => {
    const cat = searchParams.get('category');
    const grp = searchParams.get('group');
    const q = searchParams.get('q');
    if (cat) setSelectedCategory(cat);
    if (grp) setSelectedGroup(grp);
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  // Extract all unique specific categories from the product list
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  // Filter products based on search, broadGroup, and specific category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Group matching
      let matchesGroup = true;
      if (selectedGroup !== 'All') {
        if (selectedGroup === 'Micronutrients' || selectedGroup === 'Nutrients') {
          matchesGroup = p.broadGroup === 'Nutrients' || 
                         p.broadGroup === 'Micronutrients' || 
                         p.category === 'Micro Nutrient' || 
                         p.category === 'Micro Nutrients' || 
                         p.category === 'Micronutrients' || 
                         p.category === 'Micronutrients Combo' ||
                         Boolean(p.category && p.category.toLowerCase().includes('micro'));
        } else if (selectedGroup === 'Fertilizers') {
          matchesGroup = p.broadGroup === 'Fertilizers' || p.category === 'Organic Fertilizers' || p.category === 'Water Soluble Fertilizers';
        } else if (selectedGroup === 'Bio Fertilizers') {
          matchesGroup = p.category === 'Bio Fertilizers' || p.broadGroup === 'Biologicals';
        } else if (selectedGroup === 'Biologicals') {
          matchesGroup = p.broadGroup === 'Biologicals' || p.category === 'Bio Fertilizers';
        } else if (selectedGroup === 'Biostimulants') {
          matchesGroup = p.broadGroup === 'Biostimulants' || p.category === 'Bio Stimulants';
        } else if (selectedGroup === 'PGR') {
          matchesGroup = p.broadGroup === 'PGR' || p.category === 'Plant Growth Regulator';
        } else if (selectedGroup === 'Antibiotics') {
          matchesGroup = p.category === 'Antibiotic Products';
        } else if (selectedGroup === 'Seeds') {
          matchesGroup = p.broadGroup === 'Seeds' || p.category === 'Seeds';
        } else {
          matchesGroup = p.category === selectedGroup || p.broadGroup === selectedGroup;
        }
      }

      // Specific Category matching with normalization for Micronutrients / Micro Nutrient
      const isMicroMatch = (catA: string, catB: string) => {
        const normA = catA.toLowerCase().replace(/[\s_-]+/g, '');
        const normB = (catB || '').toLowerCase().replace(/[\s_-]+/g, '');
        return (normA.includes('micronutrient') || normA === 'micronutrients' || normA === 'micronutrient') &&
               (normB.includes('micronutrient') || normB === 'micronutrients' || normB === 'micronutrient');
      };

      const matchesCategory = selectedCategory === 'All' || 
        p.category === selectedCategory ||
        isMicroMatch(selectedCategory, p.category);

      // Text Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        p.name.toLowerCase().includes(query) ||
        (p.formulation && p.formulation.toLowerCase().includes(query)) ||
        (p.composition && p.composition.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(query));

      return matchesGroup && matchesCategory && matchesSearch;
    });
  }, [products, selectedGroup, selectedCategory, searchQuery]);

  const handleGroupSelect = (grp: string) => {
    setSelectedGroup(grp);
    setSelectedCategory('All');
    const newParams = new URLSearchParams(searchParams);
    if (grp === 'All') {
      newParams.delete('group');
    } else {
      newParams.set('group', grp);
    }
    newParams.delete('category');
    setSearchParams(newParams);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSelectedGroup('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div style={{ backgroundColor: '#06180D', minHeight: '85vh', color: '#F4F8F3' }}>
      
      {/* Page Header */}
      <section style={{ 
        backgroundColor: '#0A2415', 
        color: '#FFFFFF', 
        paddingTop: '50px', 
        paddingBottom: '50px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)' 
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} />
            <span>Official Catalogue &bull; 105+ Registered Formulations</span>
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: '#F4F8F3', marginBottom: '12px', fontWeight: 800 }}>
            Indus Crop Care Product Portfolio
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#CBDACD', margin: '0 auto', lineHeight: '1.6' }}>
            Explore our certified range of Crop Protection Chemicals, Fertilizers, Plant Micronutrients, Bio-stimulants, and Biofertilizers. Click any formulation for specifications or to connect directly on WhatsApp.
          </p>
        </div>
      </section>

      {/* Main Filter & Listing Section */}
      <section className="section" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div className="container">
          
          {/* Broad Category Navigation Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#A7F3D0', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <Filter size={14} />
              <span>Browse by Category</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              backgroundColor: '#0A2415',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              {BROAD_GROUPS.map(grp => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => handleGroupSelect(grp)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    backgroundColor: selectedGroup === grp ? '#25D366' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedGroup === grp ? '#06180D' : '#CBDACD'
                  }}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Secondary Filter Row */}
          <div className="products-filter-bar" style={{ marginBottom: '20px' }}>
            
            {/* Specific Category Chips */}
            <div className="category-chips">
              {availableCategories.slice(0, 10).map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat === 'All' ? 'All Specific Formulations' : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="product-search-input">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name or chemical formulation (e.g., Abola, Cartap, Thiamethoxam)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search crop care products"
              />
            </div>

          </div>

          {/* Results Summary & Reset Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '0.92rem', color: '#9EB5A3', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              Showing <strong style={{ color: '#F4F8F3' }}>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}
              {selectedGroup !== 'All' && <span> in <strong style={{ color: '#25D366' }}>{selectedGroup}</strong></span>}
              {selectedCategory !== 'All' && <span> &bull; Category: <strong style={{ color: '#F4F8F3' }}>{selectedCategory}</strong></span>}
              {searchQuery && <span> &bull; Matching &ldquo;<strong style={{ color: '#FFE082' }}>{searchQuery}</strong>&rdquo;</span>}
            </div>

            {(selectedGroup !== 'All' || selectedCategory !== 'All' || searchQuery) && (
              <button 
                type="button" 
                onClick={resetFilters}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  color: '#25D366', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: '4px 8px'
                }}
              >
                <RotateCcw size={14} />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9EB5A3' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(37, 211, 102, 0.2)', borderTopColor: '#25D366', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              Loading official Indus Crop Care catalogue...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="card" style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '580px', margin: '40px auto', backgroundColor: '#0E291A' }}>
              <Sprout size={48} style={{ color: '#25D366', margin: '0 auto 16px auto' }} />
              <h3 style={{ marginBottom: '8px', color: '#F4F8F3' }}>No Products Match Your Criteria</h3>
              <p style={{ color: '#9EB5A3', marginBottom: '24px', lineHeight: '1.6' }}>
                We could not find any products matching your current category filter or search query. Try clearing your search or exploring all categories.
              </p>
              <button 
                type="button" 
                className="btn btn-outline-white"
                onClick={resetFilters}
              >
                Show All 105+ Formulations
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onOpenQuote={onOpenQuote}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          )}

        </div>
      </section>

    </div>
  );
};
