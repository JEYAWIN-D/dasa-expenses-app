import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Search, Printer, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge.jsx';
import { DocumentPreviewModal } from '../../components/common/DocumentPreviewModal.jsx';
import { PinSignatureModal } from '../../components/common/PinSignatureModal.jsx';

export default function PaymentsListPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [signTargetId, setSignTargetId] = useState(null);

  const notify = useNotification();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments', { page, limit, search, paymentMode });
      setPayments(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      notify.error(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, paymentMode, notify]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleOpenPreview = async (id) => {
    try {
      const res = await api.get(`/payments/${id}`);
      setPreviewDoc(res.data);
    } catch (err) {
      notify.error('Failed to load payment receipt');
    }
  };

  const handleSignConfirm = async (pin) => {
    if (!signTargetId) return;
    await api.post(`/payments/${signTargetId}/sign`, { pin });
    notify.success('Payment receipt digitally signed!');
    fetchPayments();
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Payments Received</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Official transaction audit trail, payment receipts, UTR numbers, and bank account reconciliations.
          </p>
        </div>
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
            placeholder="Search receipt #, reference / UTR, client, invoice..."
            style={{ paddingLeft: 38 }}
          />
        </div>

        <select
          className="form-select"
          value={paymentMode}
          onChange={(e) => {
            setPaymentMode(e.target.value);
            setPage(1);
          }}
          style={{ width: 170 }}
        >
          <option value="">All Payment Modes</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="UPI">UPI</option>
          <option value="CREDIT_CARD">Credit Card</option>
          <option value="DEBIT_CARD">Debit Card</option>
          <option value="CHEQUE">Cheque</option>
          <option value="CASH">Cash</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: 140 }}>Receipt #</th>
              <th style={{ minWidth: 190 }}>Client</th>
              <th style={{ minWidth: 140 }}>Invoice / Project</th>
              <th style={{ minWidth: 120 }}>Date</th>
              <th style={{ minWidth: 130 }}>Mode</th>
              <th style={{ minWidth: 150 }}>Reference / UTR</th>
              <th style={{ minWidth: 140 }}>Amount Received</th>
              <th style={{ minWidth: 120 }}>Digital Sign</th>
              <th style={{ minWidth: 100, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Loading payment transactions...</span>
                  </div>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No payment records found</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Record your first client advance or milestone payment receipt.</div>
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 13 }}>
                      {p.receiptNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.client?.companyName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.client?.contactPerson}</div>
                  </td>
                  <td>
                    {p.invoice ? (
                      <Link to={`/invoices/${p.invoice.id}`} style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>
                        {p.invoice.invoiceNumber}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Direct Advance</span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: '#475569' }}>
                    {new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 800, backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: 999, border: '1px solid #bfdbfe' }}>
                      {p.paymentMode}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.referenceNumber || '—'}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: 14 }}>
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    {p.isDigitallySigned ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: 11, fontWeight: 700 }}>
                        <ShieldCheck size={13} />
                        Signed
                      </span>
                    ) : (
                      <button
                        onClick={() => setSignTargetId(p.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999 }}
                      >
                        Sign (PIN)
                      </button>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenPreview(p.id)}
                      className="btn btn-secondary btn-sm"
                      title="Print Official Receipt"
                    >
                      <Printer size={14} />
                      <span>Receipt</span>
                    </button>
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
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} payments
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
          type="PAYMENT"
        />
      )}

      {/* Digital Signature PIN Modal */}
      <PinSignatureModal
        isOpen={!!signTargetId}
        onClose={() => setSignTargetId(null)}
        onConfirm={handleSignConfirm}
        documentName="Payment Receipt"
      />
    </div>
  );
}
