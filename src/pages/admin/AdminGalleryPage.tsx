import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Eye, EyeOff, Tag } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { GalleryItem } from '../../types/gallery';
import { getAllGalleryItemsAdmin, saveGalleryItem, deleteGalleryItem } from '../../services/galleryService';

export const AdminGalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newItem, setNewItem] = useState<Partial<GalleryItem>>({
    title: '',
    category: 'Field Trials',
    description: '',
    caption: '',
    altText: '',
    imageUrl: '/images/products/ias-405.jpg',
    isPublished: true,
    sortOrder: 1
  });

  const loadGallery = () => {
    setLoading(true);
    getAllGalleryItemsAdmin()
      .then(res => setItems(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getAllGalleryItemsAdmin()
      .then(res => setItems(res))
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePublish = async (item: GalleryItem) => {
    const updated = !item.isPublished;
    try {
      await saveGalleryItem({ isPublished: updated }, item.id);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPublished: updated } : i));
    } catch (err: any) {
      alert(`Could not update visual: ${err?.message || 'Permission denied'}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete visual "${title}"?`)) {
      try {
        await deleteGalleryItem(id);
        setItems(prev => prev.filter(i => i.id !== id));
      } catch (err: any) {
        alert(`Could not delete visual: ${err?.message || 'Permission denied'}`);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title) return;
    setSaving(true);
    try {
      await saveGalleryItem(newItem);
      setShowAddModal(false);
      setNewItem({
        title: '',
        category: 'Field Trials',
        description: '',
        caption: '',
        altText: '',
        imageUrl: '/images/products/ias-405.jpg',
        isPublished: true,
        sortOrder: items.length + 1
      });
      loadGallery();
    } catch (e) {
      console.error(e);
      alert('Failed to save gallery item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminNav />

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary-green-dark)' }}>
              Manage Image Gallery
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Upload and organize field trial photographs and crop visuals via Cloudinary
            </p>
          </div>
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={16} />
            <span>Add New Visual</span>
          </button>
        </header>

        <div className="admin-content">
          
          <div className="admin-table-card">
            <div className="admin-table-header">
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-title)' }}>
                Total Visual Records: {items.length}
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Loading gallery items...
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No gallery photographs found. Click "Add New Visual" to upload.
              </div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                  <tr>
                    <th>Visual</th>
                    <th>Title & Caption</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <img src={item.imageUrl} alt={item.title} className="table-thumb" />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>
                          {item.title}
                        </div>
                        {item.caption && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            {item.caption}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-green">
                          <Tag size={11} style={{ marginRight: '4px' }} />
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <button 
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          className={`badge ${item.isPublished ? 'badge-green' : 'badge-gold'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle publish status"
                        >
                          {item.isPublished ? (
                            <><Eye size={12} style={{ marginRight: '4px' }} /> Published</>
                          ) : (
                            <><EyeOff size={12} style={{ marginRight: '4px' }} /> Draft</>
                          )}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          type="button" 
                          className="btn-icon delete"
                          onClick={() => handleDelete(item.id, item.title)}
                          title="Delete visual"
                        >
                          <Trash2 size={15} />
                        </button>
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

      {/* Add New Visual Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-green-dark)' }}>
                Add New Gallery Photograph
              </h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Visual Title <span className="req">*</span>
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Field Trial of Hybrid Bitter Gourd IAS 404"
                  value={newItem.title}
                  onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-control"
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="Field Trials">Field Trials</option>
                  <option value="Crop Varieties">Crop Varieties</option>
                  <option value="Farmer Visits">Farmer Visits</option>
                  <option value="Seed Processing">Seed Processing</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Caption / Key Highlights</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Uniform bearing observed after 50 days"
                  value={newItem.caption}
                  onChange={e => setNewItem({ ...newItem, caption: e.target.value })}
                />
              </div>

              <ImageUploader 
                currentImageUrl={newItem.imageUrl}
                folder="gallery"
                onImageUploaded={(url, publicId) => {
                  setNewItem({
                    ...newItem,
                    imageUrl: url,
                    imagePublicId: publicId
                  });
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Uploading...' : 'Publish to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
