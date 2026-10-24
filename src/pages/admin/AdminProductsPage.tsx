import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Eye, EyeOff, Search, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { Product } from '../../types/product';
import { getAllProductsAdmin, saveProduct, deleteProduct, subscribeToProducts } from '../../services/productService';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);


  useEffect(() => {
    let isMounted = true;
    getAllProductsAdmin()
      .then(prods => {
        if (isMounted) {
          setProducts(prods);
          setLoading(false);
        }
      });

    const unsubscribe = subscribeToProducts(() => {
      getAllProductsAdmin().then(prods => {
        if (isMounted) {
          setProducts(prods);
        }
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleTogglePublish = async (product: Product) => {
    setActionError(null);
    const updated = !product.isPublished;
    try {
      await saveProduct({ isPublished: updated }, product.id);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isPublished: updated } : p));
      setActionSuccess(`Product "${product.name}" is now marked as ${updated ? 'Published' : 'Draft'}.`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      console.error('Toggle publish failed:', err);
      setActionError(`Failed to update publication status: ${err?.message || 'Database operation failed'}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setActionError(null);
    if (window.confirm(`Are you sure you want to delete product "${name}"? This action cannot be undone.`)) {
      try {
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        setActionSuccess(`Product "${name}" was permanently removed.`);
        setTimeout(() => setActionSuccess(null), 3500);
      } catch (err: any) {
        console.error('Delete product failed:', err);
        setActionError(`Failed to delete product: ${err?.message || 'Database operation failed'}`);
      }
    }
  };

  const searchTerms = useMemo(() => {
    return search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  }, [search]);

  const filtered = useMemo(() => {
    if (searchTerms.length === 0) return products;

    return products.filter(p => {
      const targetText = [
        p.name || '',
        p.code || '',
        p.category || '',
        p.formulation || '',
        p.composition || '',
        p.broadGroup || '',
        p.categoryTelugu || '',
        p.shortDescription || '',
        p.description || '',
        p.sourcePage ? `page ${p.sourcePage}` : ''
      ].join(' ').toLowerCase();

      return searchTerms.every(term => targetText.includes(term));
    });
  }, [products, searchTerms]);

  return (
    <div className="admin-layout">
      <AdminNav />

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary-green-dark)' }}>
              Manage Products & Formulations
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Edit, publish, unpublish, and manage Indus Crop Care formulations and seeds
            </p>
          </div>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Add New Product</span>
          </Link>
        </header>

        <div className="admin-content">
          
          {actionError && (
            <div style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', padding: '12px 18px', borderRadius: 'var(--radius-md)', color: '#C62828', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} />
              <span>{actionError}</span>
            </div>
          )}

          {actionSuccess && (
            <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7', padding: '12px 18px', borderRadius: 'var(--radius-md)', color: '#2E7D32', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} />
              <span>{actionSuccess}</span>
            </div>
          )}

          <div className="admin-table-card">
            <div className="admin-table-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-title)' }}>
                  {search.trim() ? (
                    <>Showing <strong>{filtered.length}</strong> of {products.length} products</>
                  ) : (
                    <>Total Catalog Items: {products.length}</>
                  )}
                </span>
              </div>

              <div className="product-search-input">
                <Search size={16} className="search-icon" aria-hidden="true" />
                <input 
                  type="text" 
                  placeholder="Search by code, formulation, crop, category..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Filter products catalogue"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="search-clear-btn"
                    title="Clear search filter"
                    aria-label="Clear search filter"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Loading product records...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>
                  No products found matching &ldquo;<strong>{search}</strong>&rdquo;.
                </p>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSearch('')}
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product / Code</th>
                    <th>Formulation / Crop</th>
                    <th>Category</th>
                    <th>Source Page / Specs</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => (
                    <tr key={product.id}>
                      <td>
                        <img src={product.imageUrl} alt={product.name} className="table-thumb" />
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary-green-dark)' }}>
                          {product.name}
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {product.code}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>
                          {product.formulation || product.composition || product.name}
                        </div>
                        {product.categoryTelugu && (
                          <div className="telugu-quote" style={{ fontSize: '0.8rem', color: 'var(--color-primary-green)' }}>
                            {product.categoryTelugu}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                          {product.category}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                          {product.sourcePage ? `Page ${product.sourcePage}` : (product.daysToHarvest || product.fruitLength || '—')}
                        </div>
                      </td>
                      <td>
                        <button 
                          type="button"
                          onClick={() => handleTogglePublish(product)}
                          className={`badge ${product.isPublished ? 'badge-green' : 'badge-gold'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle publish status"
                        >
                          {product.isPublished ? (
                            <><Eye size={12} style={{ marginRight: '4px' }} /> Published</>
                          ) : (
                            <><EyeOff size={12} style={{ marginRight: '4px' }} /> Draft</>
                          )}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                          <Link 
                            to={`/admin/products/edit/${product.id}`}
                            className="btn-icon"
                            title="Edit product details"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button 
                            type="button" 
                            className="btn-icon delete"
                            onClick={() => handleDelete(product.id, `${product.name} ${product.code}`)}
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>

        </div>
      </main>
    </div>
  );
};
