import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { Product } from '../../types/product';
import { getAllProductsAdmin, saveProduct, deleteProduct } from '../../services/productService';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProducts = () => {
    setLoading(true);
    getAllProductsAdmin()
      .then(prods => setProducts(prods))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleTogglePublish = async (product: Product) => {
    const updated = !product.isPublished;
    await saveProduct({ isPublished: updated }, product.id);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isPublished: updated } : p));
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"? This action cannot be undone.`)) {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

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
          
          <div className="admin-table-card">
            <div className="admin-table-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-title)' }}>
                  Total Catalog Items: {products.length}
                </span>
              </div>

              <div className="product-search-input" style={{ minWidth: '240px' }}>
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Filter by name, formulation, category..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Loading product records...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No products found matching "{search}".
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
