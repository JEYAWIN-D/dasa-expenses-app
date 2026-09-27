import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Plus, Search, Trash2, Building2, Phone, Mail, Eye } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';

export default function VendorsListPage() {
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal create state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendorDetails, setSelectedVendorDetails] = useState(null);
  const [formData, setFormData] = useState({
    vendorName: '',
    company: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    panNumber: '',
    bankDetails: '',
    totalPayable: '',
    totalPaid: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const notify = useNotification();

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors', { page, limit, search });
      setVendors(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      notify.error(err.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, notify]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.vendorName.trim()) {
      notify.error('Vendor name is required');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/vendors', {
        ...formData,
        totalPayable: Number(formData.totalPayable) || 0,
        totalPaid: Number(formData.totalPaid) || 0,
      });

      notify.success('Vendor added successfully!');
      setIsModalOpen(false);
      setFormData({
        vendorName: '',
        company: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        gstNumber: '',
        panNumber: '',
        bankDetails: '',
        totalPayable: '',
        totalPaid: '',
        notes: '',
      });
      fetchVendors();
    } catch (err) {
      notify.error(err.message || 'Failed to add vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetails = async (id) => {
    try {
      const res = await api.get(`/vendors/${id}`);
      setSelectedVendorDetails(res.data);
    } catch (e) {
      notify.error('Failed to load vendor details');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete vendor "${name}"?`)) return;
    try {
      await api.delete(`/vendors/${id}`);
      notify.success('Vendor deleted successfully');
      fetchVendors();
    } catch (err) {
      notify.error(err.message || 'Failed to delete vendor');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Vendors & Subcontractors</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Manage infrastructure providers, freelancers, API subscriptions, and payable accounts.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
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
            placeholder="Search vendor name, code, company, contact..."
            style={{ paddingLeft: 38 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: 130 }}>Vendor Code</th>
              <th style={{ minWidth: 190 }}>Vendor & Company</th>
              <th style={{ minWidth: 180 }}>Contact Details</th>
              <th style={{ minWidth: 130 }}>Total Payable</th>
              <th style={{ minWidth: 120 }}>Total Paid</th>
              <th style={{ minWidth: 130 }}>Outstanding</th>
              <th style={{ minWidth: 110 }}>Expenses Count</th>
              <th style={{ minWidth: 100, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Loading vendors...</span>
                  </div>
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No vendors recorded</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Add subcontractors, cloud hosting providers, or software vendors.</div>
                </td>
              </tr>
            ) : (
              vendors.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 13 }}>
                      {v.vendorCode}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.vendorName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.company || v.contactPerson}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: '#334155' }}>{v.email || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.phone || '—'}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#09090b' }}>
                      ₹{Number(v.totalPayable).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td style={{ color: '#059669', fontWeight: 700, fontSize: 13 }}>
                    ₹{Number(v.totalPaid).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: v.outstanding > 0 ? '#dc2626' : '#059669', fontSize: 13 }}>
                      ₹{Number(v.outstanding).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#475569' }}>{v._count?.expenses || 0}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        onClick={() => handleOpenDetails(v.id)}
                        className="btn btn-secondary btn-sm"
                        title="View Vendor Details"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.vendorName)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444' }}
                        title="Delete Vendor"
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

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} vendors
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-secondary btn-sm">
              Previous
            </button>
            <button disabled={page * limit >= total} onClick={() => setPage(page + 1)} className="btn btn-secondary btn-sm">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Third-Party Vendor"
        maxWidth={580}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Vendor'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Vendor Name *</label>
              <input
                required
                className="form-input"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                placeholder="CloudScale Services"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company / Entity</label>
              <input
                className="form-input"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="CloudScale Pte Ltd"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                className="form-input"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="David Miller"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="billing@cloudscale.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 415 555 0199"
              />
            </div>

            <div className="form-group">
              <label className="form-label">GST / Tax Number</label>
              <input
                className="form-input"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="Tax ID"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Payable Amount (₹)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.totalPayable}
                onChange={(e) => setFormData({ ...formData, totalPayable: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Paid Amount (₹)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.totalPaid}
                onChange={(e) => setFormData({ ...formData, totalPaid: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bank / Wire Details</label>
            <input
              className="form-input"
              value={formData.bankDetails}
              onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
              placeholder="Bank Name, IFSC / SWIFT, Account Number"
            />
          </div>
        </form>
      </Modal>

      {/* Vendor Details Modal */}
      {selectedVendorDetails && (
        <Modal
          isOpen={!!selectedVendorDetails}
          onClose={() => setSelectedVendorDetails(null)}
          title={`Vendor Details: ${selectedVendorDetails.vendorName}`}
          maxWidth={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
              <div style={{ padding: 10, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>TOTAL PAYABLE</div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>₹{Number(selectedVendorDetails.totalPayable).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ padding: 10, backgroundColor: '#ecfdf5', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#047857' }}>TOTAL PAID</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#047857' }}>₹{Number(selectedVendorDetails.totalPaid).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ padding: 10, backgroundColor: '#fef2f2', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#b91c1c' }}>OUTSTANDING</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#b91c1c' }}>₹{Number(selectedVendorDetails.outstanding).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.6, padding: '10px 0', borderTop: '1px solid var(--border-subtle)' }}>
              <div><strong>Company:</strong> {selectedVendorDetails.company || '—'}</div>
              <div><strong>Contact:</strong> {selectedVendorDetails.contactPerson || '—'}</div>
              <div><strong>Email:</strong> {selectedVendorDetails.email || '—'} | <strong>Phone:</strong> {selectedVendorDetails.phone || '—'}</div>
              <div><strong>Bank Details:</strong> {selectedVendorDetails.bankDetails || '—'}</div>
              {selectedVendorDetails.gstNumber && <div><strong>GST:</strong> {selectedVendorDetails.gstNumber}</div>}
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700 }}>Expense Transaction History</h4>
            {(!selectedVendorDetails.expenses || selectedVendorDetails.expenses.length === 0) ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No expense records linked yet.</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                <table className="data-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Expense #</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVendorDetails.expenses.map((e) => (
                      <tr key={e.id}>
                        <td>{e.expenseCode}</td>
                        <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
                        <td>{e.description}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{Number(e.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
