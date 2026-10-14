import React, { useEffect, useState } from 'react';
import { 
  Inbox, 
  Phone, 
  MessageSquare, 
  Trash2, 
  Calendar, 
  MapPin, 
  RefreshCw
} from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { 
  CustomerEnquiry, 
  getAllEnquiriesAdmin, 
  updateEnquiryStatus, 
  deleteEnquiry 
} from '../../services/enquiryService';

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEnquiries = () => {
    setLoading(true);
    getAllEnquiriesAdmin()
      .then(setEnquiries)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: CustomerEnquiry['status']) => {
    setUpdatingId(id);
    try {
      await updateEnquiryStatus(id, newStatus);
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer enquiry record?')) {
      return;
    }
    await deleteEnquiry(id);
    setEnquiries(prev => prev.filter(e => e.id !== id));
  };

  const filteredEnquiries = enquiries.filter(e => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  const getStatusBadge = (status: CustomerEnquiry['status']) => {
    switch (status) {
      case 'new':
        return <span className="badge badge-gold">New Lead</span>;
      case 'contacted':
        return <span className="badge" style={{ background: '#E1F5FE', color: '#0288D1' }}>Contacted</span>;
      case 'quoted':
        return <span className="badge" style={{ background: '#FFF3E0', color: '#E65100' }}>Quoted</span>;
      case 'resolved':
        return <span className="badge badge-green">Resolved</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="admin-layout">
      <AdminNav />

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary-green-dark)' }}>
              Customer Enquiries
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Submitted leads, dealership applications & product inquiries
            </p>
          </div>
          <button 
            type="button" 
            className="btn btn-outline-white btn-sm"
            onClick={fetchEnquiries}
            style={{ color: 'var(--color-primary-green-dark)', borderColor: 'var(--color-border)' }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </header>

        <div className="admin-content">
          
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {['all', 'new', 'contacted', 'quoted', 'resolved'].map(st => (
              <button
                key={st}
                type="button"
                className={`category-chip ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
                style={{ textTransform: 'capitalize' }}
              >
                {st === 'all' ? `All (${enquiries.length})` : `${st} (${enquiries.filter(e => e.status === st).length})`}
              </button>
            ))}
          </div>

          {/* Table / List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
              Loading customer enquiries...
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
              <Inbox size={48} style={{ color: 'var(--color-primary-green)', margin: '0 auto 16px auto' }} />
              <h3>No Enquiries Found</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                {statusFilter === 'all' 
                  ? 'No visitor enquiries have been submitted through the website form yet.'
                  : `No enquiries match the '${statusFilter}' filter.`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredEnquiries.map(item => (
                <div 
                  key={item.id} 
                  className="card"
                  style={{ 
                    padding: '24px', 
                    borderLeft: item.status === 'new' ? '4px solid var(--color-harvest-gold)' : '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-title)', margin: 0 }}>
                          {item.fullName}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={13} />
                          <strong>{item.phone}</strong>
                        </span>
                        {(item.state || item.district) && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} />
                            {[item.district, item.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Quick Contact & Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a 
                        href={`tel:${item.phone}`} 
                        className="btn btn-outline btn-sm"
                        title={`Call ${item.fullName}`}
                        style={{ padding: '6px 12px' }}
                      >
                        <Phone size={14} />
                        <span>Call</span>
                      </a>
                      <a 
                        href={`https://wa.me/91${item.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${item.fullName}, regarding your enquiry for INDAS AGRI SEEDS (${item.interestedProduct})...`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        title={`Message ${item.fullName} on WhatsApp`}
                        style={{ padding: '6px 12px' }}
                      >
                        <MessageSquare size={14} />
                        <span>WhatsApp Lead</span>
                      </a>
                      <button 
                        type="button" 
                        onClick={() => item.id && handleDelete(item.id)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--color-error)', borderColor: '#F8B4B4', padding: '6px 10px' }}
                        title="Delete enquiry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Interested Product & Details Box */}
                  <div style={{ backgroundColor: '#F8FAF7', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>
                        Interested Variety
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary-green-dark)' }}>
                        {item.interestedProduct}
                      </strong>
                    </div>
                    {item.quantity && (
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>
                          Quantity Required
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-title)' }}>
                          {item.quantity}
                        </strong>
                      </div>
                    )}
                  </div>

                  {item.message && (
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                        Customer Notes / Message:
                      </span>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)', margin: 0, lineHeight: '1.5', fontStyle: 'italic' }}>
                        "{item.message}"
                      </p>
                    </div>
                  )}

                  {/* Status Controller */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      Update Processing Status:
                    </span>
                    <select
                      className="form-control"
                      style={{ width: 'auto', padding: '4px 10px', fontSize: '0.85rem' }}
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={e => item.id && handleStatusChange(item.id, e.target.value as any)}
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="quoted">Quoted</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
