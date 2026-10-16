import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sprout, RotateCcw, Filter, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Product } from '../types/product';
import { getPublishedProducts } from '../services/productService';
import { ProductCard } from '../components/products/ProductCard';
import { 
  MAIN_CATEGORIES, 
  MainCategory, 
  normalizeCategory, 
  matchesCategory, 
  matchesProductSearch, 
  computeCategoryCounts 
} from '../utils/categoryUtils';

interface ProductsPageProps {
  onOpenQuote: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

const PAGE_SIZE = 24;

export const ProductsPage: React.FC<ProductsPageProps> = ({ onOpenQuote, onOpenDetails }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive active category from URL (?category=... or legacy ?group=...)
  const activeCategory: MainCategory = useMemo(() => {
    const raw = searchParams.get('category') || searchParams.get('group');
    return normalizeCategory(raw);
  }, [searchParams]);

  // Read search query from URL
  const urlSearchQuery = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(urlSearchQuery);

  // Keep local search input synced with URL when user navigates
  useEffect(() => {
    setSearchInput(urlSearchQuery);
  }, [urlSearchQuery]);

  // Read current page from URL
  const currentPage = useMemo(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  // Load published catalogue
  useEffect(() => {
    getPublishedProducts()
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  // Compute exact product counts across all 12 main categories
  const categoryCounts = useMemo(() => {
    return computeCategoryCounts(products);
  }, [products]);

  // Filter products by selected category and active search query
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = matchesCategory(p, activeCategory);
      const matchSearch = matchesProductSearch(p, searchInput);
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, searchInput]);

  const totalResults = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Paginated product slice
  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, safeCurrentPage]);

  // Category selection handler
  const handleCategorySelect = (cat: MainCategory) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All Products') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    newParams.delete('group'); // remove legacy parameter
    newParams.delete('page');  // reset to page 1
    setSearchParams(newParams);
  };

  // Search input handler
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    const newParams = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed) {
      newParams.set('q', trimmed);
    } else {
      newParams.delete('q');
    }
    newParams.delete('page');
    setSearchParams(newParams, { replace: true });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // Pagination handler
  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(newPage, totalPages));
    const newParams = new URLSearchParams(searchParams);
    if (clamped <= 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', clamped.toString());
    }
    setSearchParams(newParams);

    // Smooth scroll to top of catalogue
    const catalogueEl = document.getElementById('catalogue-content');
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reset all active filters
  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const isFiltered = activeCategory !== 'All Products' || Boolean(searchInput.trim()) || safeCurrentPage > 1;

  // Calculate slice range for summary text
  const startItem = totalResults === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safeCurrentPage * PAGE_SIZE, totalResults);

  return (
    <div style={{ backgroundColor: 'var(--color-sage-50)', minHeight: '85vh', color: 'var(--color-charcoal-800)' }}>
      
      {/* Page Header — Deep Forest Botanical */}
      <section style={{ 
        backgroundColor: 'var(--color-forest-900)', 
        color: '#FFFFFF', 
        paddingTop: 'clamp(48px, 7vw, 72px)', 
        paddingBottom: 'clamp(48px, 7vw, 72px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)' 
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} />
            <span>Official Catalogue &bull; {products.length > 0 ? `${products.length} Certified Formulations & Seeds` : '127 Certified Formulations & Seeds'}</span>
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', color: '#FFFFFF', marginBottom: '14px', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Indus Crop Care Product Portfolio
          </h1>
          <p style={{ fontSize: '1.08rem', color: 'var(--color-sage-200)', margin: '0 auto', lineHeight: '1.65' }}>
            Explore our certified range of Crop Protection Chemicals, Fertilizers, Plant Micronutrients, Bio-stimulants, and Biofertilizers. Click any formulation for specifications or to connect directly on WhatsApp.
          </p>
        </div>
      </section>

      {/* Main Filter & Listing Section */}
      <section className="section" id="catalogue-content" style={{ paddingTop: '36px', paddingBottom: '70px' }}>
        <div className="container">
          
          {/* Consolidated Category Navigation Bar */}
          <div className="products-category-bar">
            <div className="category-nav-header">
              <div className="category-nav-title">
                <Filter size={15} />
                <span>Browse by Category</span>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-charcoal-600)', fontWeight: 600 }}>
                {products.length} Total Formulations Available
              </span>
            </div>
            
            <div className="category-nav-scroll" role="tablist" aria-label="Product Categories">
              {MAIN_CATEGORIES.map(cat => {
                const count = categoryCounts[cat] ?? 0;
                const isActive = activeCategory === cat;
                const cleanId = `cat-btn-${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

                return (
                  <button
                    key={cat}
                    id={cleanId}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleCategorySelect(cat)}
                    className={`category-chip-btn ${isActive ? 'active' : ''}`}
                  >
                    <span>{cat}</span>
                    <span className="category-chip-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consolidated Search & Results Toolbar */}
          <div className="products-toolbar">
            
            {/* Search Input Box */}
            <div className="product-search-box">
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input 
                id="product-search-input"
                type="text" 
                placeholder="Search formulation, active ingredient, or product code (e.g., Abola, ICC-001, Cartap)..."
                value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
                aria-label="Search crop care products by name, code, or active ingredient"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="clear-btn"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Status & Reset Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.92rem', color: 'var(--color-charcoal-700)' }}>
                {totalResults > 0 ? (
                  <span>
                    Showing <strong style={{ color: 'var(--color-charcoal-950)' }}>{startItem}–{endItem}</strong> of <strong style={{ color: 'var(--color-charcoal-950)' }}>{totalResults}</strong> {totalResults === 1 ? 'product' : 'products'}
                    {activeCategory !== 'All Products' && (
                      <span> in <strong style={{ color: 'var(--color-primary-green-dark)' }}>{activeCategory}</strong></span>
                    )}
                    {searchInput.trim() && (
                      <span> &bull; Matching &ldquo;<strong style={{ color: 'var(--color-primary-green-dark)' }}>{searchInput.trim()}</strong>&rdquo;</span>
                    )}
                  </span>
                ) : (
                  <span>No matching products</span>
                )}
              </div>

              {isFiltered && (
                <button 
                  type="button" 
                  onClick={resetFilters}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    color: 'var(--color-primary-green-dark)', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: '4px 8px',
                    fontSize: '0.88rem'
                  }}
                  id="reset-filters-btn"
                >
                  <RotateCcw size={14} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-charcoal-600)' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(14, 107, 56, 0.2)', borderTopColor: 'var(--color-primary-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              Loading official Indus Crop Care catalogue...
            </div>
          ) : totalResults === 0 ? (
            <div className="card card-light" style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '580px', margin: '40px auto' }}>
              <Sprout size={48} style={{ color: 'var(--color-primary-green)', margin: '0 auto 16px auto' }} />
              <h3 style={{ marginBottom: '8px', color: 'var(--color-charcoal-950)' }}>No Products Match Your Criteria</h3>
              <p style={{ color: 'var(--color-charcoal-600)', marginBottom: '24px', lineHeight: '1.6' }}>
                We could not find any products matching your current category filter or search query. Try clearing your search or browsing all categories.
              </p>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={resetFilters}
                id="empty-state-reset-btn"
              >
                Show All {products.length || 127} Products
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {paginatedProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onOpenQuote={onOpenQuote}
                    onOpenDetails={onOpenDetails}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav className="products-pagination" aria-label="Catalogue pagination">
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                    <span style={{ marginLeft: '4px' }}>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`pagination-btn ${safeCurrentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                      aria-current={safeCurrentPage === pageNum ? 'page' : undefined}
                      aria-label={`Page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage >= totalPages}
                    aria-label="Next page"
                  >
                    <span style={{ marginRight: '4px' }}>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </nav>
              )}
            </>
          )}

        </div>
      </section>

    </div>
  );
};
