import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, Shield, Phone, Mail, Building, MapPin } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { SiteSettings } from '../../types/settings';
import { getSiteSettings, updateSiteSettings } from '../../services/settingsService';
import { firebaseConfig } from '../../lib/firebase';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then(s => setSettings(s))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateSiteSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to update settings:', err);
      alert('Error updating settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="admin-layout">
        <AdminNav />
        <main className="admin-main" style={{ padding: '60px', textAlign: 'center' }}>
          Loading system settings...
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminNav />

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary-green-dark)' }}>
              Site & Channel Configuration
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Configure official company WhatsApp number, contact addresses, and cloud parameters
            </p>
          </div>
        </header>

        <div className="admin-content" style={{ maxWidth: '900px' }}>
          
          {savedSuccess && (
            <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7', padding: '14px 20px', borderRadius: 'var(--radius-md)', color: '#2E7D32', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} />
              <span>Settings updated successfully and applied across all public touchpoints!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF' }}>
            
            {/* 1. Direct Lines: WhatsApp & Telephone */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={18} style={{ color: '#25D366' }} />
              <span>1. Direct Contact Lines (WhatsApp & Telephone)</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '18px' }}>
              Drives customer contact across header, footer, product enquiry 1-click WhatsApp buttons, and contact page.
            </p>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="customer-care-whatsapp">
                  Official Mobile / WhatsApp Number
                </label>
                <input 
                  type="text" 
                  id="customer-care-whatsapp"
                  className="form-control"
                  placeholder="e.g. +91 88860 69143 or 918886069143"
                  value={settings.customerCareWhatsAppNumber || settings.whatsappNumber || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setSettings({ 
                      ...settings, 
                      customerCareWhatsAppNumber: val,
                      whatsappNumber: val 
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="telephone-line">
                  Landline Telephone
                </label>
                <input 
                  type="text" 
                  id="telephone-line"
                  className="form-control"
                  placeholder="e.g. 040-24110478"
                  value={settings.telephone || ''}
                  onChange={e => setSettings({ ...settings, telephone: e.target.value })}
                />
              </div>
            </div>

            {/* 2. Email & Official Website */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginTop: '32px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} style={{ color: 'var(--color-harvest-gold)' }} />
              <span>2. Approved Company Contact & Domain</span>
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="company-email">
                  Official Email Address <span className="req">*</span>
                </label>
                <input 
                  type="email" 
                  id="company-email"
                  className="form-control"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="company-website">
                  Official Website URL
                </label>
                <input 
                  type="text" 
                  id="company-website"
                  className="form-control"
                  placeholder="e.g. https://www.induscropcare.com"
                  value={settings.websiteUrl || ''}
                  onChange={e => setSettings({ ...settings, websiteUrl: e.target.value })}
                />
              </div>
            </div>

            {/* 3. Official Addresses */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginTop: '32px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} style={{ color: '#0284C7' }} />
              <span>3. Official Addresses (Source of Truth)</span>
            </h3>

            <div className="form-group">
              <label className="form-label" htmlFor="corp-office">
                Corporate Office Address
              </label>
              <textarea 
                id="corp-office"
                className="form-control"
                rows={2}
                value={settings.corporateOfficeAddress || ''}
                onChange={e => setSettings({ ...settings, corporateOfficeAddress: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-office">
                Registered Office Address
              </label>
              <textarea 
                id="reg-office"
                className="form-control"
                rows={2}
                value={settings.registeredOfficeAddress || ''}
                onChange={e => setSettings({ ...settings, registeredOfficeAddress: e.target.value })}
              />
            </div>

            {/* 4. Corporate Heritage Information */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginTop: '32px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} style={{ color: 'var(--color-primary-green)' }} />
              <span>4. Corporate Identity & Slogans</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input 
                type="text" 
                className="form-control"
                value={settings.companyName}
                onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Official Tagline (English)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={settings.tagline}
                  onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Telugu Motto</label>
                <input 
                  type="text" 
                  className="form-control telugu-quote"
                  value={settings.teluguTagline}
                  onChange={e => setSettings({ ...settings, teluguTagline: e.target.value })}
                />
              </div>
            </div>

            {/* 5. Cloud Backend Summary */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-green-dark)', marginTop: '32px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--color-primary-green)' }} />
              <span>5. Preserved Cloud Infrastructure Parameters</span>
            </h3>

            <div style={{ backgroundColor: 'var(--color-bg-warm)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
              <div className="form-grid-2">
                <div>
                  <strong>Firebase Project:</strong> <code>{firebaseConfig.projectId}</code>
                </div>
                <div>
                  <strong>Auth Domain:</strong> <code>{firebaseConfig.authDomain}</code>
                </div>
                <div>
                  <strong>Cloudinary Cloud:</strong> <code>qnkatbvo</code>
                </div>
                <div>
                  <strong>Upload Preset:</strong> <code>INDAS AGRI SEED IND PVT LTD</code>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={saving}
              >
                <Save size={18} />
                <span>{saving ? 'Saving Settings...' : 'Save Configuration Changes'}</span>
              </button>
            </div>

          </form>

        </div>
      </main>
    </div>
  );
};
