import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, IndianRupee, ShieldCheck, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../../services/api.js';
import { useNotification } from '../../../contexts/NotificationContext.jsx';

export function RecordPaymentModal({ project, accounts = [], preselectedInvoice = null, onClose, onSuccess }) {
  const notify = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [paymentType, setPaymentType] = useState(preselectedInvoice ? 'PARTIAL' : 'ADVANCE');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceId, setInvoiceId] = useState(preselectedInvoice?.id || '');
  const [milestoneId, setMilestoneId] = useState(
    preselectedInvoice?.milestoneId || project?.milestones?.find((m) => m.status !== 'PAID')?.id || ''
  );
  const [notes, setNotes] = useState(preselectedInvoice ? `Settlement for GST Invoice ${preselectedInvoice.invoiceNumber}` : '');

  // Calculate target due amount dynamically
  const selectedInvoice = (project?.invoices || []).find((i) => i.id === invoiceId) || preselectedInvoice;
  const selectedMilestone = (project?.milestones || []).find((m) => m.id === milestoneId);

  const payableDueAmount = selectedInvoice
    ? Number(selectedInvoice.balanceDue ?? selectedInvoice.totalAmount ?? 0)
    : selectedMilestone
    ? Math.max(0, Number(selectedMilestone.amount || 0) - Number(selectedMilestone.paidAmount || 0))
    : Number(project?.financials?.outstandingBalance || 0);

  // Multi-Method Splits State
  const [splits, setSplits] = useState(() => {
    if (preselectedInvoice && (preselectedInvoice.balanceDue > 0 || preselectedInvoice.totalAmount > 0)) {
      const defaultAmt = String(preselectedInvoice.balanceDue || preselectedInvoice.totalAmount);
      const bankAcc = accounts.find((a) => a.accountType === 'BANK');
      return [
        {
          paymentMode: 'BANK_TRANSFER',
          amount: defaultAmt,
          accountId: bankAcc?.id || '',
          referenceNumber: '',
          notes: `Settlement for GST Invoice ${preselectedInvoice.invoiceNumber}`,
        },
      ];
    }

    return [
      {
        paymentMode: 'CASH',
        amount: '',
        accountId: accounts.find((a) => a.accountType === 'CASH')?.id || '',
        referenceNumber: '',
        notes: 'Cash physically collected',
      },
      {
        paymentMode: 'UPI',
        amount: '',
        accountId: accounts.find((a) => a.accountType === 'UPI')?.id || '',
        referenceNumber: '',
        notes: 'Google Pay / UPI transfer',
      },
      {
        paymentMode: 'BANK_TRANSFER',
        amount: '',
        accountId: accounts.find((a) => a.accountType === 'BANK')?.id || '',
        referenceNumber: '',
        notes: 'Bank IMPS / NEFT transfer',
      },
    ];
  });

  const handleFillDueAmount = (amt) => {
    if (!amt || amt <= 0) return;
    const next = [...splits];
    if (next.length > 0) {
      next[0].amount = String(amt);
      for (let i = 1; i < next.length; i++) {
        next[i].amount = '';
      }
      setSplits(next);
    } else {
      setSplits([
        {
          paymentMode: 'BANK_TRANSFER',
          amount: String(amt),
          accountId: accounts.find((a) => a.accountType === 'BANK')?.id || '',
          referenceNumber: '',
          notes: selectedInvoice ? `Payment for Invoice ${selectedInvoice.invoiceNumber}` : 'Full payment received',
        },
      ]);
    }
  };

  // Setup clean multi-channel split rows (Cash + UPI + Bank) without any dummy placeholder amounts
  const handleSetupMultiChannelSplits = () => {
    const cashAcc = accounts.find((a) => a.accountType === 'CASH');
    const upiAcc = accounts.find((a) => a.accountType === 'UPI');
    const bankAcc = accounts.find((a) => a.accountType === 'BANK');

    setPaymentType('ADVANCE');
    setSplits([
      {
        paymentMode: 'CASH',
        amount: '',
        accountId: cashAcc?.id || '',
        referenceNumber: 'CASH-REC',
        notes: 'Cash physically collected',
      },
      {
        paymentMode: 'UPI',
        amount: '',
        accountId: upiAcc?.id || '',
        referenceNumber: '',
        notes: 'Google Pay / PhonePe / UPI transfer',
      },
      {
        paymentMode: 'BANK_TRANSFER',
        amount: '',
        accountId: bankAcc?.id || '',
        referenceNumber: '',
        notes: 'Bank IMPS / NEFT transfer',
      },
    ]);
  };

  const handleAddSplitRow = () => {
    setSplits([
      ...splits,
      {
        paymentMode: 'BANK_TRANSFER',
        amount: '',
        accountId: accounts.find((a) => a.accountType === 'BANK')?.id || '',
        referenceNumber: '',
        notes: '',
      },
    ]);
  };

  const handleRemoveSplitRow = (index) => {
    if (splits.length === 1) return;
    setSplits(splits.filter((_, i) => i !== index));
  };

  const handleSplitChange = (index, field, value) => {
    const next = [...splits];
    next[index][field] = value;

    if (field === 'paymentMode') {
      const matchType = value === 'CASH' ? 'CASH' : (value === 'UPI' ? 'UPI' : 'BANK');
      const acc = accounts.find((a) => a.accountType === matchType);
      if (acc) {
        next[index].accountId = acc.id;
      }
    }

    setSplits(next);
  };

  // Calculations
  const totalReceivedAmount = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  const remainingDue = Math.max(0, payableDueAmount - totalReceivedAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (totalReceivedAmount <= 0) {
      setError('Total payment amount must be greater than ₹0');
      return;
    }

    const activeSplits = splits
      .filter((s) => parseFloat(s.amount) > 0)
      .map((s) => ({
        paymentMode: s.paymentMode,
        amount: parseFloat(s.amount),
        accountId: s.accountId || null,
        accountName: accounts.find((a) => a.id === s.accountId)?.accountName || null,
        referenceNumber: s.referenceNumber || null,
        notes: s.notes || null,
      }));

    if (activeSplits.length === 0) {
      setError('Please specify at least one payment method with an amount');
      return;
    }

    setSubmitting(true);
    try {
      // Auto-compute dynamic split summary note if user has not typed custom memo or if it has stale text
      const splitSummary = activeSplits
        .map((s) => `${s.paymentMode} (₹${Number(s.amount).toLocaleString('en-IN')}${s.referenceNumber ? ' Ref: ' + s.referenceNumber : ''})`)
        .join(', ');
      const isStaleNote = !notes || notes.includes('Cash (₹9,000)') || notes.startsWith('Advance payment received in multiple channels:');
      const finalNotes = isStaleNote
        ? (activeSplits.length > 1
            ? `Advance payment received in multiple channels: ${splitSummary}`
            : `Payment received: ${splitSummary}`)
        : notes;

      const payload = {
        clientId: project.clientId,
        projectId: project.id,
        invoiceId: invoiceId || null,
        milestoneId: milestoneId || null,
        paymentType,
        paymentDate,
        notes: finalNotes,
        splits: activeSplits,
      };

      const res = await api.post('/payments', payload);
      notify.success(`Payment of ₹${totalReceivedAmount.toLocaleString('en-IN')} recorded successfully!`);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
      notify.error(err.message || 'Payment recording failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
              Record Payment Received
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, marginTop: 2 }}>
              Project: <strong>{project?.projectCode}</strong> — {project?.name}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* PROMINENT DUE AMOUNT BANNER */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                color: '#ffffff',
                padding: '18px 20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#bfdbfe' }}>
                  {selectedInvoice
                    ? `Payment Due for GST Invoice: ${selectedInvoice.invoiceNumber}`
                    : selectedMilestone
                    ? `Payment Due for Milestone: ${selectedMilestone.title}`
                    : 'Total Project Outstanding Due'}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 900, marginTop: 4, letterSpacing: '-0.5px' }}>
                  ₹{payableDueAmount.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '12px', color: '#dbeafe', marginTop: 2 }}>
                  {selectedInvoice
                    ? `Invoice Bill Total: ₹${Number(selectedInvoice.totalAmount || 0).toLocaleString('en-IN')} | Already Received: ₹${Number(selectedInvoice.paidAmount || 0).toLocaleString('en-IN')}`
                    : `Customer: ${project?.client?.companyName || 'Client'}`}
                </div>
              </div>

              {payableDueAmount > 0 && (
                <button
                  type="button"
                  onClick={() => handleFillDueAmount(payableDueAmount)}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#ffffff',
                    color: '#1e40af',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IndianRupee size={15} />
                  <span>Auto-Fill ₹{payableDueAmount.toLocaleString('en-IN')}</span>
                </button>
              )}
            </div>

            {/* Quick Fill Button */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Multi-channel allocation: Record separate portions received across Cash, UPI, and Bank accounts.
              </div>
              <button
                type="button"
                onClick={handleSetupMultiChannelSplits}
                style={{
                  padding: '5px 12px',
                  backgroundColor: '#ffffff',
                  color: '#2563eb',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Prepare Cash / UPI / Bank Splits
              </button>
            </div>

            {/* General Info Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Payment Type
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  <option value="ADVANCE">Advance Payment</option>
                  <option value="PARTIAL">Milestone / Partial</option>
                  <option value="FULL">Final Full Payment</option>
                  <option value="OTHER_INCOME">Other Project Income</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Link to GST Invoice
                </label>
                <select
                  value={invoiceId}
                  onChange={(e) => {
                    const invId = e.target.value;
                    setInvoiceId(invId);
                    const chosen = project?.invoices?.find((i) => i.id === invId);
                    if (chosen && chosen.balanceDue > 0) {
                      handleFillDueAmount(chosen.balanceDue);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  <option value="">No Invoice Linked (Direct Project)</option>
                  {project?.invoices?.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — Due: ₹{inv.balanceDue?.toLocaleString('en-IN')} (Total ₹{inv.totalAmount?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Link to Milestone
                </label>
                <select
                  value={milestoneId}
                  onChange={(e) => setMilestoneId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  <option value="">General Project Account</option>
                  {project?.milestones?.map((m) => (
                    <option key={m.id} value={m.id}>
                      Phase {m.milestoneOrder}: {m.title} (₹{m.amount?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split Breakdown Area */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    Payment Channels & Split Breakdown
                  </label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Specify amounts received through each method (Cash, GPay / UPI, Bank Accounts).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSplitRow}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Plus size={14} />
                  <span>Add Method</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {splits.map((split, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'grid',
                      gridTemplateColumns: '130px 140px 1fr 140px 36px',
                      gap: 10,
                      alignItems: 'center',
                    }}
                  >
                    {/* Method Mode */}
                    <select
                      value={split.paymentMode}
                      onChange={(e) => handleSplitChange(index, 'paymentMode', e.target.value)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 600,
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">GPay / UPI</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="ONLINE">Card / Gateway</option>
                    </select>

                    {/* Amount */}
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '12px',
                          color: '#64748b',
                          fontWeight: 700,
                        }}
                      >
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Amount"
                        value={split.amount}
                        onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 8px 8px 22px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
                      />
                    </div>

                    {/* Target Treasury Account */}
                    <select
                      value={split.accountId}
                      onChange={(e) => handleSplitChange(index, 'accountId', e.target.value)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">Select Treasury Account (Optional)...</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountName} ({acc.accountType}) — Bal: ₹{acc.currentBalance?.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>

                    {/* Ref / Txn ID */}
                    <input
                      type="text"
                      placeholder="Ref / Txn ID"
                      value={split.referenceNumber}
                      onChange={(e) => handleSplitChange(index, 'referenceNumber', e.target.value)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                      }}
                    />

                    {/* Remove Action */}
                    <button
                      type="button"
                      disabled={splits.length === 1}
                      onClick={() => handleRemoveSplitRow(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: splits.length === 1 ? '#cbd5e1' : '#ef4444',
                        cursor: splits.length === 1 ? 'not-allowed' : 'pointer',
                        padding: 4,
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Strip */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Payable / Due Amount
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#b45309', marginTop: 2 }}>
                  ₹{payableDueAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Total Received in this Payment
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
                  ₹{totalReceivedAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Remaining Balance Due
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: remainingDue === 0 ? '#16a34a' : '#0f172a',
                    marginTop: 2,
                  }}
                >
                  ₹{remainingDue.toLocaleString('en-IN')}
                  {remainingDue === 0 && (
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginLeft: 6 }}>
                      (Fully Cleared!)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Payment Notes / Acknowledgment Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Remarks, check clearing details, bank transaction notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || totalReceivedAmount <= 0}
              style={{
                padding: '9px 24px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: submitting || totalReceivedAmount <= 0 ? 'not-allowed' : 'pointer',
                opacity: submitting || totalReceivedAmount <= 0 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} />
              <span>{submitting ? 'Recording Payment...' : `Record Payment (₹${totalReceivedAmount.toLocaleString('en-IN')})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
