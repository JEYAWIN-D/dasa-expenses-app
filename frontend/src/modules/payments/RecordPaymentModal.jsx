import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export function RecordPaymentModal({ isOpen, onClose, invoice, onSuccess }) {
  if (!invoice) return null;

  const [paymentType, setPaymentType] = useState('PARTIAL');
  const [amount, setAmount] = useState(invoice.balanceDue || 0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('HDFC Bank (...5678)');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const notify = useNotification();

  const handleAmountChange = (val) => {
    const num = Number(val);
    setAmount(num);
    if (num >= invoice.balanceDue) {
      setPaymentType('FULL');
    } else if (invoice.paidAmount === 0 && num < invoice.balanceDue) {
      setPaymentType('ADVANCE');
    } else {
      setPaymentType('PARTIAL');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount <= 0) {
      notify.error('Payment amount must be greater than zero');
      return;
    }

    try {
      setLoading(true);
      await api.post('/payments', {
        invoiceId: invoice.id,
        clientId: invoice.clientId || invoice.client?.id,
        paymentType,
        amount: Number(amount),
        paymentDate,
        paymentMode,
        referenceNumber,
        bankAccount,
        notes,
      });

      notify.success('Payment recorded successfully!');
      onSuccess();
    } catch (err) {
      notify.error(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const remainingAfterPayment = Math.max(0, (invoice.balanceDue || 0) - (Number(amount) || 0));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment for ${invoice.invoiceNumber}`}
      maxWidth={520}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Recording...' : 'Confirm & Save Receipt'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Invoice Summary Box */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid var(--border-subtle)',
            fontSize: 13,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>Client:</span>
            <span style={{ fontWeight: 700 }}>{invoice.client?.companyName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>Invoice Total:</span>
            <span style={{ fontWeight: 600 }}>₹{Number(invoice.totalAmount).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>Currently Paid:</span>
            <span style={{ color: '#059669', fontWeight: 600 }}>₹{Number(invoice.paidAmount).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
            <span style={{ fontWeight: 700, color: '#dc2626' }}>Outstanding Due:</span>
            <span style={{ fontWeight: 800, color: '#dc2626', fontSize: 15 }}>
              ₹{Number(invoice.balanceDue).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Payment Amount (₹) *</label>
            <input
              type="number"
              min="1"
              max={invoice.balanceDue}
              required
              className="form-input"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Type</label>
            <select
              className="form-select"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="ADVANCE">Advance Payment</option>
              <option value="PARTIAL">Partial Payment</option>
              <option value="FULL">Full Settlement</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <input
              type="date"
              required
              className="form-input"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Mode</label>
            <select
              className="form-select"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="BANK_TRANSFER">Bank Transfer / NEFT / RTGS</option>
              <option value="UPI">UPI / GooglePay / PhonePe</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Transaction / UTR / Cheque #</label>
            <input
              className="form-input"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UTR-998200114"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deposit Bank Account</label>
            <input
              className="form-input"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="HDFC Bank"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes / Remarks</label>
          <input
            className="form-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment acknowledgment details..."
          />
        </div>

        {/* Dynamic calculation banner */}
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: remainingAfterPayment === 0 ? '#ecfdf5' : '#eff6ff',
            border: `1px solid ${remainingAfterPayment === 0 ? '#a7f3d0' : '#bfdbfe'}`,
            borderRadius: 6,
            fontSize: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Remaining Invoice Balance After This Payment:</span>
          <strong style={{ fontSize: 13, color: remainingAfterPayment === 0 ? '#065f46' : 'var(--primary)' }}>
            ₹{remainingAfterPayment.toLocaleString('en-IN')} {remainingAfterPayment === 0 && ' (Fully Paid)'}
          </strong>
        </div>
      </form>
    </Modal>
  );
}
