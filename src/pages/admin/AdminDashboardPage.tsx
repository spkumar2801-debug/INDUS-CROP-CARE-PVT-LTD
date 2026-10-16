import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  Image as ImageIcon, 
  Inbox,
  Layers, 
  PlusCircle, 
  CheckCircle2, 
  Phone, 
  Cloud, 
  Database,
  ArrowRight
} from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { Product } from '../../types/product';
import { getAllProductsAdmin } from '../../services/productService';
import { getAllGalleryItemsAdmin } from '../../services/galleryService';
import { getSiteSettings } from '../../services/settingsService';
import { getAllEnquiriesAdmin } from '../../services/enquiryService';
import { isFirebaseConfigured, firebaseConfig, verifyFirebaseConnectivity } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [galleryCount, setGalleryCount] = useState<number>(0);
  const [enquiriesCount, setEnquiriesCount] = useState<number>(0);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [firebaseStatus, setFirebaseStatus] = useState<{ connected: boolean; status: string; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyFirebaseConnectivity().then(setFirebaseStatus);

    Promise.all([
      getAllProductsAdmin(),
      getAllGalleryItemsAdmin(),
      getSiteSettings(),
      getAllEnquiriesAdmin()
    ]).then(([prods, gallery, settings, enqs]) => {
      setProducts(prods);
      setGalleryCount(gallery.length);
      setWhatsappNumber(settings.customerCareWhatsAppNumber || settings.whatsappNumber || '');
      setEnquiriesCount(enqs.length);
    }).finally(() => setLoading(false));
  }, [user]);

  const publishedCount = products.filter(p => p.isPublished).length;
  const categoriesCount = new Set(products.map(p => p.category)).size;

  return (
    <div className="admin-layout">
      <AdminNav />

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary-green-dark)' }}>
              Portal Overview
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Live production catalog & integration status
            </p>
          </div>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Add New Product</span>
          </Link>
        </header>

        <div className="admin-content">
          
          {/* Actual Stats Grid (Real Database Records) */}
          <div className="admin-stats-grid">
            
            <div className="admin-stat-card">
              <div className="stat-icon">
                <Sprout size={24} />
              </div>
              <div className="stat-info">
                <h3>{loading ? '...' : products.length}</h3>
                <p>Total Products</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-info">
                <h3>{loading ? '...' : publishedCount}</h3>
                <p>Published Live</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}>
                <Layers size={24} />
              </div>
              <div className="stat-info">
                <h3>{loading ? '...' : categoriesCount}</h3>
                <p>Crop Categories</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#E1F5FE', color: '#0288D1' }}>
                <ImageIcon size={24} />
              </div>
              <div className="stat-info">
                <h3>{loading ? '...' : galleryCount}</h3>
                <p>Gallery Visuals</p>
              </div>
            </div>

            <Link to="/admin/enquiries" className="admin-stat-card" style={{ textDecoration: 'none' }}>
              <div className="stat-icon" style={{ backgroundColor: '#EDE7F6', color: '#5E35B1' }}>
                <Inbox size={24} />
              </div>
              <div className="stat-info">
                <h3>{loading ? '...' : enquiriesCount}</h3>
                <p>Customer Leads</p>
              </div>
            </Link>

          </div>

          {/* Integration Status Card */}
          <div className="integration-status-card">
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary-green-dark)', marginBottom: '16px' }}>
              Backend & Services Connectivity Status
            </h3>

            <div className="integration-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database size={20} style={{ color: 'var(--color-primary-green)' }} />
                <div>
                  <strong>Firebase Firestore & Auth</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Project ID: <code>{firebaseConfig.projectId}</code> | App ID: <code>{firebaseConfig.appId}</code>
                  </div>
                </div>
              </div>
              <span className={`status-indicator ${
                firebaseStatus?.status === 'connected' ? 'connected' :
                firebaseStatus?.status === 'error' ? 'error' : 'pending'
              }`}>
                {firebaseStatus ? firebaseStatus.message : (isFirebaseConfigured ? 'Verifying live connection...' : 'Pending VITE_FIREBASE_API_KEY in environment configuration')}
              </span>
            </div>

            <div className="integration-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Cloud size={20} style={{ color: '#0288D1' }} />
                <div>
                  <strong>Cloudinary Image Delivery</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Cloud: <code>qnkatbvo</code> | Preset: <code>INDAS AGRI SEED IND PVT LTD</code>
                  </div>
                </div>
              </div>
              <span className="status-indicator connected">
                Active & Configured
              </span>
            </div>

            <div className="integration-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={20} style={{ color: '#25D366' }} />
                <div>
                  <strong>Customer Care & WhatsApp Desk</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {whatsappNumber ? `Configured Number: +${whatsappNumber}` : 'Number pending owner configuration in Site Settings'}
                  </div>
                </div>
              </div>
              <span className={`status-indicator ${whatsappNumber ? 'connected' : 'pending'}`}>
                {whatsappNumber ? 'Active' : 'Pending Settings Config'}
              </span>
            </div>

          </div>

          {/* Quick Product Table Preview */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-title)' }}>
                Products & Formulations Overview
              </h3>
              <Link to="/admin/products" style={{ fontSize: '0.88rem', color: 'var(--color-primary-green)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Manage All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Visual</th>
                  <th>Variety Code</th>
                  <th>Crop Name</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td>
                      <img src={p.imageUrl} alt={p.name} className="table-thumb" />
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary-green-dark)' }}>{p.code}</strong>
                    </td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>
                      <span className={`badge ${p.isPublished ? 'badge-green' : 'badge-gold'}`}>
                        {p.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};
