import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { Product, ProductSpecification } from '../../types/product';
import { getProductById, saveProduct } from '../../services/productService';

export const AdminProductEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    slug: '',
    category: 'Bitter Gourd',
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
      setLoading(true);
      getProductById(id).then(prod => {
        if (prod) {
          setFormData(prod);
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

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

      const payload: Partial<Product> = {
        ...formData,
        name: formData.name.trim(),
        code: formData.code.trim(),
        slug,
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
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <optgroup label="Indus Crop Care Formulations">
                    <option value="Insecticides">Insecticides</option>
                    <option value="Herbicides">Herbicides</option>
                    <option value="Fungicides">Fungicides</option>
                    <option value="Plant Growth Regulator">Plant Growth Regulator (PGR)</option>
                    <option value="Organic Fertilizers">Organic Fertilizers</option>
                    <option value="Water-Soluble Fertilizers">Water-Soluble Fertilizers</option>
                    <option value="Biofertilizers">Biofertilizers</option>
                    <option value="Bio Stimulants">Bio Stimulants</option>
                    <option value="Micronutrients / Nutrients">Micronutrients / Nutrients</option>
                    <option value="Micronutrients Combo">Micronutrients Combo</option>
                    <option value="Antibiotic Products">Antibiotic Products</option>
                  </optgroup>
                  <optgroup label="INDAS Seeds Division Crops">
                    <option value="Bitter Gourd">Bitter Gourd (కాకరకాయ)</option>
                    <option value="Cucumber">Cucumber (దోసకాయ / కీరదోస)</option>
                    <option value="Tomato">Tomato (టమోటా)</option>
                    <option value="Okra">Okra (బెండకాయ)</option>
                    <option value="Brinjal">Brinjal (వంకాయ)</option>
                    <option value="Chilli">Chilli (మిర్చి)</option>
                    <option value="Ridge Gourd">Ridge Gourd (బీరకాయ)</option>
                    <option value="Bottle Gourd">Bottle Gourd (సొరకాయ)</option>
                    <option value="Watermelon">Watermelon (పుచ్చకాయ)</option>
                    <option value="Marigold">Marigold (బంతి)</option>
                    <option value="Seeds">General Seeds</option>
                  </optgroup>
                  <option value="Other">Other</option>
                </select>
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

            {/* Section 5: Publication Settings */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginTop: '20px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              5. Publication Status
            </h3>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  checked={formData.isPublished}
                  onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-green)' }}
                />
                <span>Published on Website (Visible to Public)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  checked={formData.isFeatured}
                  onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-green)' }}
                />
                <span>Featured on Homepage</span>
              </label>
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
    </div>
  );
};
