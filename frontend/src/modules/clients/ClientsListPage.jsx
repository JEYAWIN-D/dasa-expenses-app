import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Plus, Search, Filter, Eye, Trash2, Edit, Building2, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';

export default function ClientsListPage() {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal create state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    gstNumber: '',
    panNumber: '',
    industry: '',
    clientType: 'Corporate',
    tags: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const notify = useNotification();

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients', { page, limit, search, status });
      setClients(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      notify.error(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, notify]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/clients', formData);
      notify.success('Client created successfully');
      setIsModalOpen(false);
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        state: '',
        gstNumber: '',
        panNumber: '',
        industry: '',
        clientType: 'Corporate',
        tags: '',
        notes: '',
      });
      fetchClients();
    } catch (err) {
      notify.error(err.message || 'Failed to create client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete client "${name}"?`)) return;
    try {
      await api.delete(`/clients/${id}`);
      notify.success('Client deleted successfully');
      fetchClients();
    } catch (err) {
      notify.error(err.message || 'Failed to delete client');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Client Management</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Manage client accounts, contacts, transaction histories, and pending balances.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div
        className="card"
        style={{
          padding: 14,
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            className="form-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by company name, contact, email, phone, code..."
            style={{ paddingLeft: 38 }}
          />
        </div>

        <select
          className="form-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          style={{ width: 160 }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="LEAD">Lead</option>
        </select>
      </div>

      {/* Clients Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: 130 }}>Client Code</th>
              <th style={{ minWidth: 200 }}>Company & Contact</th>
              <th style={{ minWidth: 180 }}>Contact Details</th>
              <th style={{ minWidth: 140 }}>Location</th>
              <th style={{ minWidth: 110 }}>Quotations</th>
              <th style={{ minWidth: 110 }}>Invoices</th>
              <th style={{ minWidth: 110 }}>Status</th>
              <th style={{ minWidth: 100, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Loading client records...</span>
                  </div>
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No clients found</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Click "Add New Client" to create your first client profile.</div>
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 13 }}>
                      {c.clientCode}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      <Link to={`/clients/${c.id}`} style={{ color: 'inherit' }}>
                        {c.companyName}
                      </Link>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Attn: {c.contactPerson}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
                      <Mail size={12} color="#64748b" />
                      <span>{c.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      <Phone size={12} color="#64748b" />
                      <span>{c.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: '#475569' }}>{c.city || '—'}, {c.state || ''}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#09090b' }}>{c._count?.quotations || 0}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#09090b' }}>{c._count?.invoices || 0}</span>
                  </td>
                  <td>
                    <Badge status={c.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <Link to={`/clients/${c.id}`} className="btn btn-secondary btn-sm" title="View Profile">
                        <Eye size={13} />
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id, c.companyName)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444' }}
                        title="Delete Client"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} clients
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <button
              disabled={page * limit >= total}
              onClick={() => setPage(page + 1)}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Client"
        maxWidth={640}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Creating...' : 'Save Client'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                required
                className="form-input"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Acme Technologies Ltd"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Contact Person *</label>
              <input
                required
                className="form-input"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="billing@acme.com (optional)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                required
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="form-group">
              <label className="form-label">GST / VAT Number</label>
              <input
                className="form-input"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="29ABCDE1234F1Z5"
              />
            </div>

            <div className="form-group">
              <label className="form-label">PAN Number</label>
              <input
                className="form-input"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                placeholder="ABCDE1234F"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Bangalore"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                className="form-input"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Karnataka"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Office Address</label>
            <input
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Suite 100, Cyber Tower, Ring Road"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags / Categorization (comma-separated)</label>
            <input
              className="form-input"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Enterprise, High-Priority, SaaS"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
