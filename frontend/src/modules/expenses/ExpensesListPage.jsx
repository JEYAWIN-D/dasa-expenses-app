import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Plus, Search, Trash2, Wallet, Building2, Filter } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';

export default function ExpensesListPage() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Record Expense Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    category: 'Software Subscription',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMode: 'BANK_TRANSFER',
    vendorId: '',
    description: '',
    referenceNumber: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const notify = useNotification();

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses', { page, limit, search, category });
      setExpenses(res.data);
      setTotal(res.pagination.total);
      setTotalAmount(res.totalExpenseAmount || 0);
    } catch (err) {
      notify.error(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, notify]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Load vendors list on opening modal
  const handleOpenModal = async () => {
    try {
      const res = await api.get('/vendors/search');
      setVendors(res.data);
    } catch (e) {
      // ignore
    }
    setIsModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      notify.error('Please enter a valid expense amount');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/expenses', {
        ...formData,
        amount: Number(formData.amount),
        vendorId: formData.vendorId || null,
      });

      notify.success('Expense recorded successfully!');
      setIsModalOpen(false);
      setFormData({
        category: 'Software Subscription',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMode: 'BANK_TRANSFER',
        vendorId: '',
        description: '',
        referenceNumber: '',
        notes: '',
      });
      fetchExpenses();
    } catch (err) {
      notify.error(err.message || 'Failed to record expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete expense ${code}?`)) return;
    try {
      await api.delete(`/expenses/${id}`);
      notify.success('Expense deleted successfully');
      fetchExpenses();
    } catch (err) {
      notify.error(err.message || 'Delete failed');
    }
  };

  const categoriesList = [
    'Office Rent',
    'Salary',
    'Software Subscription',
    'Hosting & Cloud',
    'Marketing',
    'Travel',
    'Fuel',
    'Internet',
    'Electricity',
    'Equipment',
    'Vendor Payment',
    'Miscellaneous',
  ];

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Business Expenses & Outgoings</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Track company operating costs, developer tooling, vendor invoices, and project expenditures.
          </p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
            placeholder="Search description, reference #, vendor..."
            style={{ paddingLeft: 38 }}
          />
        </div>

        <select
          className="form-select"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          style={{ width: 200 }}
        >
          <option value="">All Categories</option>
          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: 130 }}>Expense #</th>
              <th style={{ minWidth: 160 }}>Category</th>
              <th style={{ minWidth: 200 }}>Description</th>
              <th style={{ minWidth: 120 }}>Date</th>
              <th style={{ minWidth: 160 }}>Paid To / Vendor</th>
              <th style={{ minWidth: 130 }}>Payment Mode</th>
              <th style={{ minWidth: 140 }}>Reference #</th>
              <th style={{ minWidth: 130, textAlign: 'right' }}>Amount</th>
              <th style={{ minWidth: 90, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Loading expenses...</span>
                  </div>
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No expenses recorded</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Track server costs, salaries, subcontractor fees, or travel expenses.</div>
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 13 }}>
                      {exp.expenseCode}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{exp.description}</td>
                  <td style={{ fontSize: 12, color: '#475569' }}>
                    {new Date(exp.expenseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    {exp.vendor ? (
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{exp.vendor.vendorName}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Direct Expense</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: 999 }}>
                      {exp.paymentMode}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {exp.referenceNumber || '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626', fontSize: 14 }}>
                    ₹{Number(exp.amount).toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(exp.id, exp.expenseCode)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444' }}
                      title="Delete expense"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Total summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Total Filtered Expenses: <strong>₹{Number(totalAmount).toLocaleString('en-IN')}</strong>
        </div>
        {total > limit && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-secondary btn-sm">
              Previous
            </button>
            <button disabled={page * limit >= total} onClick={() => setPage(page + 1)} className="btn btn-secondary btn-sm">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Business Expense"
        maxWidth={540}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving...' : 'Record Expense'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 25000"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Expense Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select
                className="form-select"
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
              >
                <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="UPI">UPI</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Associated Vendor (Optional)</label>
            <select
              className="form-select"
              value={formData.vendorId}
              onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
            >
              <option value="">No Vendor (Direct Operating Cost)</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendorName} ({v.vendorCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Purpose *</label>
            <input
              required
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. September AWS Cloud Hosting & CDN bills"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Transaction / Reference #</label>
            <input
              className="form-input"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              placeholder="e.g. AWS-INV-889104"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
