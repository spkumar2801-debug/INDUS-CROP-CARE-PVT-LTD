import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { Product, ProductSpecification } from '../../types/product';
import {
  getProductById,
  saveProduct,
  IMPORTANT_PRODUCT_CATEGORIES,
  getCustomProductCategories,
  saveCustomProductCategory,
  deleteCustomProductCategory
} from '../../services/productService';

export const AdminProductEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customProductCategories, setCustomProductCategories] = useState<string[]>(() => getCustomProductCategories());
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  useEffect(() => {
    const syncCategories = () => {
      setCustomProductCategories(getCustomProductCategories());
    };
    window.addEventListener('indus:product-categories-updated', syncCategories);
    window.addEventListener('storage', syncCategories);
    return () => {
      window.removeEventListener('indus:product-categories-updated', syncCategories);
      window.removeEventListener('storage', syncCategories);
    };
  }, []);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    slug: '',
    category: 'Insecticides',
    categoryTelugu: '',
    shortDescription: '',
    description: '',
    teluguDescription: '',
    features: [''],
    specifications: [
      { label: 'Plant Habit', value: '', labelTelugu: 'మొక్క స్వభావం', valueTelugu: '' },
      { label: 'Fruit Length', value: '', labelTelugu: 'కాయ పొడవు', valueTelugu: '' },
      { label: 'Average Fruit Weight', value: '', labelTelugu: 'సగటు బరువు', valueTelugu: '' },
      { label: 'Harvest Period', value: '', labelTelugu: 'కోత కాలం', valueTelugu: '' }
    ],
    imageUrl: '/images/products/ias-405.jpg',
    isPublished: true,
    isFeatured: false,
    daysToHarvest: '',
    fruitLength: '',
    averageWeight: '',
    cropSeason: 'Year Round'
  });

  useEffect(() => {
    if (id) {
      getProductById(id).then(prod => {
        if (prod) {
          setFormData({
            ...prod,
            category: prod.category === 'Other' ? 'Others' : prod.category
          });
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setNewCategoryError('Please enter a category name.');
      return;
    }

    const allExisting = [
      ...IMPORTANT_PRODUCT_CATEGORIES,
      'Others',
      'Other',
      ...customProductCategories
    ];
    if (allExisting.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setNewCategoryError(`Category "${trimmed}" already exists.`);
      return;
    }

    saveCustomProductCategory(trimmed);
    const updated = getCustomProductCategories();
    setCustomProductCategories(updated);
    setFormData(prev => ({ ...prev, category: trimmed }));

    setShowNewCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryError(null);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeletingCategory(true);
    const cat = categoryToDelete;
    try {
      await deleteCustomProductCategory(cat);
      const updated = getCustomProductCategories();
      setCustomProductCategories(updated);

      // If current form has this category, move it to 'Others'
      if (formData.category && formData.category.trim().toLowerCase() === cat.toLowerCase()) {
        setFormData(prev => ({ ...prev, category: 'Others' }));
      }

      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete category:', err);
    } finally {
      setDeletingCategory(false);
    }
  };

  const handleSpecChange = (index: number, field: keyof ProductSpecification, val: string) => {
    const specs = [...(formData.specifications || [])];
    specs[index] = { ...specs[index], [field]: val };
    setFormData({ ...formData, specifications: specs });
  };

  const addSpec = () => {
    setFormData({
      ...formData,
      specifications: [
        ...(formData.specifications || []),
        { label: '', value: '', labelTelugu: '', valueTelugu: '' }
      ]
    });
  };

  const removeSpec = (index: number) => {
    const specs = [...(formData.specifications || [])];
    specs.splice(index, 1);
    setFormData({ ...formData, specifications: specs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(false);

    if (!formData.name?.trim()) {
      setErrorMsg('Product / Crop Name is required.');
      return;
    }
    if (!formData.code?.trim()) {
      setErrorMsg('Variety / Product Code is required.');
      return;
    }

    setSaving(true);

    try {
      const slug = formData.slug || `${formData.name}-${formData.code}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const cleanFeatures = (formData.features || []).filter(f => f.trim() !== '');
      const cleanSpecs = (formData.specifications || []).filter(s => s.label.trim() !== '');

      const isPublished = formData.isPublished ?? true;
      const isFeatured = Boolean(isPublished && formData.isFeatured);

      const payload: Partial<Product> = {
        ...formData,
        name: formData.name.trim(),
        code: formData.code.trim(),
        slug,
        isPublished,
        isFeatured,
        featuredAt: isFeatured ? (formData.featuredAt || new Date().toISOString()) : undefined,
        features: cleanFeatures,
        specifications: cleanSpecs
      };

      await saveProduct(payload, id);
      setSuccessMsg(true);
      setTimeout(() => navigate('/admin/products'), 1200);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMsg(err?.message || 'Failed to save product to database. Please check your connection and administrator permissions.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminNav />
        <main className="admin-main" style={{ padding: '60px', textAlign: 'center' }}>
          Loading variety record...
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminNav />

      <main className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/admin/products" className="btn-icon">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary-green-dark)' }}>
                {isEditing ? `Edit Product: ${formData.code}` : 'Add New Seed Variety'}
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Manage product details, Telugu agronomic traits, and Cloudinary photographs
              </p>
            </div>
          </div>
        </header>

        <div className="admin-content" style={{ maxWidth: '960px' }}>

          {errorMsg && (
            <div style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', padding: '14px 20px', borderRadius: 'var(--radius-md)', color: '#C62828', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7', padding: '14px 20px', borderRadius: 'var(--radius-md)', color: '#2E7D32', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} />
              <span>Product successfully saved! Redirecting to products list...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF' }}>

            {/* Section 1: Basic Identifiers */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              1. Basic Identification
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="prod-code">
                  Variety Code <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="prod-code"
                  className="form-control"
                  placeholder="e.g. IAS 405"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-name">
                  Product / Crop Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="prod-name"
                  className="form-control"
                  placeholder="e.g. F1 Hybrid Bitter Gourd"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="prod-category">
                  Product Category <span className="req">*</span>
                </label>
                <select
                  id="prod-category"
                  className="form-control"
                  value={formData.category === 'Other' ? 'Others' : (formData.category || 'Insecticides')}
                  onChange={e => {
                    if (e.target.value === '__CREATE_NEW__') {
                      setNewCategoryName('');
                      setNewCategoryError(null);
                      setShowNewCategoryModal(true);
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  required
                >
                  {/* Important Existing Indus Crop Care Categories */}
                  {IMPORTANT_PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}

                  {/* Custom Product Categories Created by Admin */}
                  {customProductCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}

                  {/* Preserve existing saved category if editing a product with a legacy/specific category */}
                  {formData.category &&
                    !IMPORTANT_PRODUCT_CATEGORIES.includes(formData.category) &&
                    !customProductCategories.includes(formData.category) &&
                    formData.category !== 'Others' &&
                    formData.category !== 'Other' && (
                      <option value={formData.category}>{formData.category}</option>
                    )}

                  {/* Exactly ONE Others option */}
                  <option value="Others">Others</option>

                  {/* Create New Category Action */}
                  <option value="__CREATE_NEW__" style={{ fontWeight: 700, color: 'var(--color-primary-green)' }}>
                    + Create New Category
                  </option>
                </select>

                {/* Manage Custom Product Categories Chips */}
                {customProductCategories.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                      Custom Categories:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {customProductCategories.map(cat => (
                        <span
                          key={cat}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: formData.category === cat ? '#E8F5E9' : '#F3F4F6',
                            border: formData.category === cat ? '1px solid #A5D6A7' : '1px solid #E5E7EB',
                            borderRadius: '16px',
                            padding: '3px 10px',
                            fontSize: '0.82rem',
                            color: formData.category === cat ? '#1B5E20' : '#374151',
                            fontWeight: 500
                          }}
                        >
                          <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFormData({ ...formData, category: cat })}
                            title={`Click to select "${cat}"`}
                          >
                            {cat}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCategoryToDelete(cat);
                              setShowDeleteCategoryModal(true);
                            }}
                            title={`Delete custom category "${cat}"`}
                            aria-label={`Delete custom category ${cat}`}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px',
                              cursor: 'pointer',
                              color: '#DC2626',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-broad-group">
                  Broad Navigation Group
                </label>
                <select
                  id="prod-broad-group"
                  className="form-control"
                  value={formData.broadGroup || ''}
                  onChange={e => setFormData({ ...formData, broadGroup: e.target.value })}
                >
                  <option value="">Auto / Same as Category</option>
                  <option value="Insecticides">Insecticides</option>
                  <option value="Herbicides">Herbicides</option>
                  <option value="Fungicides">Fungicides</option>
                  <option value="Organic Fertilizers">Organic Fertilizers</option>
                  <option value="Water-Soluble Fertilizers">Water-Soluble Fertilizers</option>
                  <option value="Biofertilizers">Biofertilizers</option>
                  <option value="Micronutrients / Nutrients">Micronutrients / Nutrients</option>
                  <option value="Micronutrients Combo">Micronutrients Combo</option>
                  <option value="Biostimulants">Biostimulants</option>
                  <option value="PGR">PGR</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Seeds">Seeds</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="prod-formulation">
                  Active Formulation / Chemical Composition
                </label>
                <input
                  type="text"
                  id="prod-formulation"
                  className="form-control"
                  placeholder="e.g. Diafenthiuron 50% WP, Azoxystrobin 11% + Tebuconazole 18.3% SC"
                  value={formData.formulation || formData.composition || ''}
                  onChange={e => setFormData({ ...formData, formulation: e.target.value, composition: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-source-page">
                  Official Catalogue Source Page (Pages 7–19)
                </label>
                <input
                  type="number"
                  id="prod-source-page"
                  className="form-control"
                  placeholder="e.g. 7"
                  value={formData.sourcePage || ''}
                  onChange={e => setFormData({ ...formData, sourcePage: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="admin-metrics-grid">
              <div className="form-group">
                <label className="form-label">Fruit Length</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 10 - 12 cm"
                  value={formData.fruitLength}
                  onChange={e => setFormData({ ...formData, fruitLength: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Average Weight</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 110 - 140 g"
                  value={formData.averageWeight}
                  onChange={e => setFormData({ ...formData, averageWeight: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Days to Harvest</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 50 - 55 Days"
                  value={formData.daysToHarvest}
                  onChange={e => setFormData({ ...formData, daysToHarvest: e.target.value })}
                />
              </div>
            </div>

            {/* Section 2: Descriptions */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginTop: '20px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              2. Descriptions & Telugu Agronomic Copy
            </h3>

            <div className="form-group">
              <label className="form-label">Short Summary (Catalogue Card)</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Brief commercial summary..."
                value={formData.shortDescription}
                onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Agronomic Description</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Full agronomic characterization..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">తెలుగు సాంకేతిక వివరణ (Telugu Agronomic Copy)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="తెలుగు వివరణలు..."
                value={formData.teluguDescription}
                onChange={e => setFormData({ ...formData, teluguDescription: e.target.value })}
              />
            </div>

            {/* Section 3: Photograph Upload */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginTop: '20px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              3. Cloudinary Product Photograph
            </h3>

            <ImageUploader
              currentImageUrl={formData.imageUrl}
              folder="products"
              onImageUploaded={(url, publicId) => {
                setFormData({
                  ...formData,
                  imageUrl: url,
                  imagePublicId: publicId
                });
              }}
            />

            {/* Section 4: Specifications Table */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginTop: '20px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              4. Technical Specifications
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {(formData.specifications || []).map((spec, i) => (
                <div key={i} className="admin-spec-row">
                  <input
                    type="text"
                    placeholder="Trait (English)"
                    className="form-control"
                    value={spec.label}
                    onChange={e => handleSpecChange(i, 'label', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Value (English)"
                    className="form-control"
                    value={spec.value}
                    onChange={e => handleSpecChange(i, 'value', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="లక్షణం (Telugu)"
                    className="form-control"
                    value={spec.labelTelugu || ''}
                    onChange={e => handleSpecChange(i, 'labelTelugu', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="విలువ (Telugu)"
                    className="form-control"
                    value={spec.valueTelugu || ''}
                    onChange={e => handleSpecChange(i, 'valueTelugu', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-icon delete"
                    onClick={() => removeSpec(i)}
                    title="Remove trait row"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={addSpec}
                style={{ alignSelf: 'flex-start' }}
              >
                <Plus size={14} />
                <span>Add Specification Row</span>
              </button>
            </div>

            {/* Section 5: Publication Status */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              5. Publication Status
            </h3>

            <div style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid var(--color-border-light)',
              borderRadius: '8px',
              padding: '20px 24px',
              marginBottom: '32px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="prod-is-published"
                  checked={formData.isPublished ?? true}
                  onChange={e => {
                    const checked = e.target.checked;
                    if (!checked) {
                      setFormData(prev => ({
                        ...prev,
                        isPublished: false,
                        isFeatured: false
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        isPublished: true
                      }));
                    }
                  }}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary-green)', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--color-primary-green-dark)' }}>
                    Publish on Website
                  </span>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                    {formData.isPublished
                      ? 'Published — Visible to visitors on the public website and in product categories.'
                      : 'Draft — Saved privately for administration only. Not visible on the public website.'}
                  </p>
                </div>
              </label>

              {/* Optional Homepage Spotlight Showcase */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #E5E7EB' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    id="prod-is-featured"
                    checked={Boolean(formData.isFeatured)}
                    onChange={e => {
                      const checked = e.target.checked;
                      if (checked && !formData.isPublished) {
                        alert("Only published products can be featured on the homepage. Please enable 'Publish on Website' first.");
                        return;
                      }
                      setFormData(prev => ({
                        ...prev,
                        isFeatured: checked,
                        featuredAt: checked ? (prev.featuredAt || new Date().toISOString()) : undefined
                      }));
                    }}
                    style={{ width: '17px', height: '17px', accentColor: 'var(--color-primary-green)', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-charcoal-700)' }}>
                      Featured on Homepage <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>(Optional Spotlight)</span>
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {formData.isPublished
                        ? 'Spotlight this product on the homepage showcase. Moving newest featured products to position #1.'
                        : 'Draft products cannot be featured. Please enable "Publish on Website" first.'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={saving}
              >
                <Save size={18} />
                <span>{saving ? 'Saving Variety...' : 'Save Product Record'}</span>
              </button>

              <Link to="/admin/products" className="btn btn-outline btn-lg">
                <span>Cancel</span>
              </Link>
            </div>

          </form>

        </div>
      </main>

      {/* ========================================================
          CREATE NEW PRODUCT CATEGORY MODAL
          ======================================================== */}
      {showNewCategoryModal && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1400 }}
          onClick={() => {
            setShowNewCategoryModal(false);
            setNewCategoryName('');
            setNewCategoryError(null);
          }}
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: '460px', padding: '24px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', margin: 0, fontWeight: 700 }}>
                  Create New Category
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                  Add a custom product category for Indus Crop Care products
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowNewCategoryModal(false);
                  setNewCategoryName('');
                  setNewCategoryError(null);
                }}
              >
                ✕
              </button>
            </div>

            {newCategoryError && (
              <div className="category-modal-error" style={{
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '14px',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{newCategoryError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewCategory}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Category Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Bio Pesticides, Specialty Seeds, Foliar Nutrition..."
                  value={newCategoryName}
                  onChange={e => {
                    setNewCategoryName(e.target.value);
                    if (newCategoryError) setNewCategoryError(null);
                  }}
                  autoFocus
                  required
                  style={{ padding: '9px 12px', fontSize: '0.92rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border-light)' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setShowNewCategoryModal(false);
                    setNewCategoryName('');
                    setNewCategoryError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CUSTOM PRODUCT CATEGORY CONFIRMATION MODAL
          ======================================================== */}
      {showDeleteCategoryModal && categoryToDelete && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1500 }}
          onClick={() => {
            if (!deletingCategory) {
              setShowDeleteCategoryModal(false);
              setCategoryToDelete(null);
            }
          }}
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: '440px', padding: '24px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                flexShrink: 0
              }}>
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#111827', margin: 0, fontWeight: 700 }}>
                  Delete Category
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: 600 }}>
                  {categoryToDelete}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#1F2937', lineHeight: '1.5', margin: '0 0 10px 0' }}>
              <strong>Are you sure you want to permanently delete this category?</strong>
            </p>

            <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0 0 20px 0', lineHeight: '1.45' }}>
              Existing products will not be deleted. Any product currently in this category will be safely moved to <strong>Others</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setShowDeleteCategoryModal(false);
                  setCategoryToDelete(null);
                }}
                disabled={deletingCategory}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: '1px solid #DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={handleConfirmDeleteCategory}
                disabled={deletingCategory}
              >
                <Trash2 size={13} />
                <span>{deletingCategory ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
