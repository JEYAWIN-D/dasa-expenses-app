import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  Clock,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { DocumentPreviewModal } from '../../components/common/DocumentPreviewModal.jsx';
import { PinSignatureModal } from '../../components/common/PinSignatureModal.jsx';
import { RecordPaymentModal } from '../payments/RecordPaymentModal.jsx';

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const notify = useNotification();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPreview, setShowPreview] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      notify.error(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleSignConfirm = async (pin) => {
    await api.post(`/invoices/${id}/sign`, { pin });
    notify.success('Invoice digitally signed successfully!');
    fetchInvoice();
  };

  if (loading && !invoice) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <RefreshCw size={20} className="animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return <div className="card">Invoice not found.</div>;
  }

  const client = invoice.client || {};
  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.balanceDue > 0;

  return (
    <div>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/invoices" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {invoice.invoiceNumber}
          </span>
          <Badge status={invoice.status} />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShowPreview(true)} className="btn btn-secondary">
            <Printer size={15} />
            <span>Print / PDF</span>
          </button>

          {!invoice.isDigitallySigned && (
            <button onClick={() => setShowSignModal(true)} className="btn btn-secondary" style={{ color: '#16a34a' }}>
              <ShieldCheck size={15} />
              <span>Apply Digital Signature</span>
            </button>
          )}

          {invoice.balanceDue > 0 && (
            <button onClick={() => setShowPaymentModal(true)} className="btn btn-primary">
              <CreditCard size={15} />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {isOverdue && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 18px',
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={18} />
          <span>This invoice is past due ({new Date(invoice.dueDate).toLocaleDateString()}). Please issue a payment reminder.</span>
        </div>
      )}

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Left Column: Scope & Items */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Billed To
                </span>
                <div style={{ fontSize: 17, fontWeight: 800 }}>
                  <Link to={`/clients/${client.id}`}>{client.companyName}</Link>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Attn: {client.contactPerson} ({client.email})
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Dates
                </span>
                <div style={{ fontSize: 13 }}>Issued: {new Date(invoice.invoiceDate).toLocaleDateString()}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isOverdue ? '#dc2626' : 'var(--text-muted)' }}>
                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Billed Products & Services</th>
                    <th style={{ textAlign: 'right', width: 80 }}>Qty</th>
                    <th style={{ textAlign: 'right', width: 120 }}>Unit Price</th>
                    <th style={{ textAlign: 'right', width: 80 }}>Tax %</th>
                    <th style={{ textAlign: 'right', width: 120 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, idx) => (
                    <tr key={item.id} style={{ verticalAlign: 'top' }}>
                      <td style={{ color: 'var(--text-muted)', paddingTop: 14 }}>{idx + 1}</td>
                      <td style={{ padding: '12px 10px' }}>
                        {item.title && (
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)', marginBottom: item.description ? 4 : 0 }}>
                            {item.title}
                          </div>
                        )}
                        {item.description && (
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', paddingTop: 14 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', paddingTop: 14 }}>₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', paddingTop: 14 }}>{item.taxPercent}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, paddingTop: 14 }}>
                        ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <div style={{ width: 280, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal:</span>
                  <span>₹{Number(invoice.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                    <span>Discount:</span>
                    <span>-₹{Number(invoice.discountAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {invoice.taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Tax / GST:</span>
                    <span>+₹{Number(invoice.taxAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 16,
                    fontWeight: 800,
                    borderTop: '2px solid var(--border-subtle)',
                    paddingTop: 8,
                  }}
                >
                  <span>Invoice Total:</span>
                  <span>₹{Number(invoice.totalAmount).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                  <span>Total Payments Cleared:</span>
                  <span>-₹{Number(invoice.paidAmount).toLocaleString('en-IN')}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 18,
                    fontWeight: 800,
                    borderTop: '1px dashed #cbd5e1',
                    paddingTop: 6,
                    color: invoice.balanceDue > 0 ? '#dc2626' : '#059669',
                  }}
                >
                  <span>Balance Due:</span>
                  <span>₹{Number(invoice.balanceDue).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receipts History on this Invoice */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Payments Received on this Invoice</h3>
              {invoice.balanceDue > 0 && (
                <button onClick={() => setShowPaymentModal(true)} className="btn btn-secondary btn-sm">
                  <CreditCard size={14} />
                  <span>Record Payment</span>
                </button>
              )}
            </div>

            {(!invoice.payments || invoice.payments.length === 0) ? (
              <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                No payments have been recorded yet for this invoice.
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Mode</th>
                      <th>Reference #</th>
                      <th style={{ textAlign: 'right' }}>Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{p.receiptNumber}</td>
                        <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td><Badge status={p.paymentType} /></td>
                        <td>{p.paymentMode}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.referenceNumber || '—'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                          ₹{Number(p.amount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status & Authorization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Balance Status Card */}
          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Settlement Status</h4>
            <div style={{ padding: 14, backgroundColor: invoice.balanceDue > 0 ? '#fef2f2' : '#ecfdf5', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: invoice.balanceDue > 0 ? '#991b1b' : '#065f46', fontWeight: 600 }}>
                {invoice.balanceDue > 0 ? 'OUTSTANDING PAYMENT DUE' : 'FULLY SETTLED & PAID'}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: invoice.balanceDue > 0 ? '#dc2626' : '#059669', marginTop: 4 }}>
                ₹{Number(invoice.balanceDue).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Signature badge */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              {invoice.isDigitallySigned ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
                  <ShieldCheck size={18} />
                  <div>
                    <div>Digitally Signed & Authorized</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                      {invoice.signedBy} ({new Date(invoice.signedAt).toLocaleDateString()})
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowSignModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', color: '#16a34a' }}
                >
                  <ShieldCheck size={14} />
                  <span>Authorize & Sign with PIN</span>
                </button>
              )}
            </div>
          </div>

          {/* Linked Quotation info */}
          {invoice.quotation && (
            <div className="card">
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Origin Quotation</h4>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Generated from commercial proposal:
              </div>
              <div style={{ marginTop: 6, fontWeight: 700 }}>
                <Link to={`/quotations/${invoice.quotation.id}`} style={{ color: 'var(--primary)' }}>
                  {invoice.quotation.quotationNumber}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Print/PDF Modal */}
      {showPreview && (
        <DocumentPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          document={invoice}
          type="INVOICE"
        />
      )}

      {/* Digital Signature PIN Modal */}
      <PinSignatureModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onConfirm={handleSignConfirm}
        documentName={invoice.invoiceNumber}
      />

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <RecordPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          invoice={invoice}
          onSuccess={() => {
            setShowPaymentModal(false);
            fetchInvoice();
          }}
        />
      )}
    </div>
  );
}
