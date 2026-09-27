import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import {
  Plus,
  Search,
  Eye,
  ShieldCheck,
  Printer,
  CreditCard,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge.jsx';
import { DocumentPreviewModal } from '../../components/common/DocumentPreviewModal.jsx';
import { PinSignatureModal } from '../../components/common/PinSignatureModal.jsx';
import { RecordPaymentModal } from '../payments/RecordPaymentModal.jsx';

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Reminders summary
  const [reminders, setReminders] = useState(null);

  // Modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [signTargetId, setSignTargetId] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);

  const notify = useNotification();

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const [resInvoices, resReminders] = await Promise.all([
        api.get('/invoices', { page, limit, search, status }),
        api.get('/invoices/reminders'),
      ]);
      setInvoices(resInvoices.data);
      setTotal(resInvoices.pagination.total);
      setReminders(resReminders.data);
    } catch (err) {
      notify.error(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, notify]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpenPreview = async (id) => {
    try {
      const res = await api.get(`/invoices/${id}`);
      setPreviewDoc(res.data);
    } catch (err) {
      notify.error('Failed to load invoice for preview');
    }
  };

  const handleSignConfirm = async (pin) => {
    if (!signTargetId) return;
    await api.post(`/invoices/${signTargetId}/sign`, { pin });
    notify.success('Invoice digitally signed successfully!');
    fetchInvoices();
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Invoices & Billing</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Track client invoices, advance/partial payments, due dates, and outstanding balances.
          </p>
        </div>
        <Link to="/invoices/new" className="btn btn-primary">
          <Plus size={16} />
          <span>Create New Invoice</span>
        </Link>
      </div>

      {/* Payment Due Reminders Banner */}
      {reminders && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div
            className="card"
            style={{
              padding: '12px 16px',
              backgroundColor: reminders.overdue?.count > 0 ? '#fef2f2' : '#ffffff',
              borderColor: reminders.overdue?.count > 0 ? '#fecaca' : 'var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#991b1b', fontSize: 11, fontWeight: 700 }}>
              <span>OVERDUE</span>
              <AlertTriangle size={15} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
              ₹{Number(reminders.overdue?.amount || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {reminders.overdue?.count || 0} overdue invoices
            </div>
          </div>

          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b45309', fontSize: 11, fontWeight: 700 }}>
              <span>DUE TODAY</span>
              <Clock size={15} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
              ₹{Number(reminders.dueToday?.amount || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {reminders.dueToday?.count || 0} invoice(s) due today
            </div>
          </div>

          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>
              <span>DUE THIS WEEK</span>
              <Clock size={15} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
              ₹{Number(reminders.dueThisWeek?.amount || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {reminders.dueThisWeek?.count || 0} upcoming invoice(s)
            </div>
          </div>

          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#065f46', fontSize: 11, fontWeight: 700 }}>
              <span>PAID IN FULL</span>
              <CheckCircle size={15} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#059669', marginTop: 4 }}>
              {reminders.paidCount || 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Invoices settled
            </div>
          </div>
        </div>
      )}

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
            placeholder="Search invoice number or client name..."
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
          style={{ width: 170 }}
        >
          <option value="">All Statuses</option>
          <option value="ISSUED">Issued</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: 140 }}>Invoice #</th>
              <th style={{ minWidth: 190 }}>Client</th>
              <th style={{ minWidth: 110 }}>Issue Date</th>
              <th style={{ minWidth: 110 }}>Due Date</th>
              <th style={{ minWidth: 130 }}>Total Amount</th>
              <th style={{ minWidth: 120 }}>Paid</th>
              <th style={{ minWidth: 130 }}>Balance Due</th>
              <th style={{ minWidth: 120 }}>Status</th>
              <th style={{ minWidth: 130, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Loading invoices...</span>
                  </div>
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No invoices found</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Create your first invoice or convert from an approved quotation.</div>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 13 }}>
                      <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{inv.client?.companyName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inv.client?.contactPerson}</div>
                  </td>
                  <td style={{ fontSize: 12, color: '#475569' }}>
                    {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ fontSize: 12, color: new Date(inv.dueDate) < new Date() && inv.balanceDue > 0 ? 'var(--danger)' : '#475569', fontWeight: new Date(inv.dueDate) < new Date() && inv.balanceDue > 0 ? 700 : 500 }}>
                    {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: 13, color: '#09090b' }}>
                      ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td style={{ color: '#059669', fontWeight: 700, fontSize: 13 }}>
                    ₹{Number(inv.paidAmount).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: 13, color: inv.balanceDue > 0 ? '#dc2626' : '#059669' }}>
                      ₹{Number(inv.balanceDue).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td><Badge status={inv.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => setPaymentInvoice(inv)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#059669', fontSize: 11, padding: '3px 8px' }}
                          title="Record Payment"
                        >
                          <CreditCard size={13} />
                          <span>Pay</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenPreview(inv.id)}
                        className="btn btn-secondary btn-sm"
                        title="Print / PDF Preview"
                      >
                        <Printer size={13} />
                      </button>

                      <Link to={`/invoices/${inv.id}`} className="btn btn-secondary btn-sm" title="View Details">
                        <Eye size={13} />
                      </Link>
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
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} invoices
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

      {/* Document Print/PDF Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
          type="INVOICE"
        />
      )}

      {/* Digital Signature PIN Modal */}
      <PinSignatureModal
        isOpen={!!signTargetId}
        onClose={() => setSignTargetId(null)}
        onConfirm={handleSignConfirm}
        documentName="Tax Invoice"
      />

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <RecordPaymentModal
          isOpen={!!paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          invoice={paymentInvoice}
          onSuccess={() => {
            setPaymentInvoice(null);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}
