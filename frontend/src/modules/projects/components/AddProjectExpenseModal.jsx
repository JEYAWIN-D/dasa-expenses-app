import React, { useState } from 'react';
import { X, Wallet, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api.js';
import { useNotification } from '../../../contexts/NotificationContext.jsx';

export function AddProjectExpenseModal({ project, accounts = [], onClose, onSuccess }) {
  const notify = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    category: 'Cloud Hosting & Infra',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMode: 'BANK_TRANSFER',
    accountId: accounts.find((a) => a.accountType === 'BANK')?.id || '',
    description: '',
    referenceNumber: '',
    notes: '',
    isReimbursable: false,
    employeeName: '',
  });

  const categories = [
    'Cloud Hosting & Infra',
    'Consulting & Freelancers',
    'Software & API Licenses',
    'UI/UX Assets & Typography',
    'Hardware & Equipment',
    'Travel & Client Meetings',
    'Testing & QA Certification',
    'Office & Operational',
    'Employee Reimbursement',
    'Other Project Cost',
  ];

  const handleChange = (field, val) => {
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      if (field === 'paymentMode') {
        const matchType = val === 'CASH' ? 'CASH' : (val === 'UPI' ? 'UPI' : 'BANK');
        const acc = accounts.find((a) => a.accountType === matchType);
        if (acc) next.accountId = acc.id;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(form.amount);
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid expense amount greater than 0');
      return;
    }

    if (!form.description.trim()) {
      setError('Expense purpose/description is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        projectId: project.id,
        category: form.category,
        amount: amountNum,
        expenseDate: form.expenseDate,
        paymentMode: form.paymentMode,
        accountId: form.accountId || null,
        description: form.description,
        referenceNumber: form.referenceNumber || null,
        notes: form.notes || null,
        isReimbursable: Boolean(form.isReimbursable),
        employeeName: form.isReimbursable ? form.employeeName : null,
      };

      const res = await api.post('/expenses', payload);
      notify.success(`Expense of ₹${amountNum.toLocaleString('en-IN')} logged to project ledger!`);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record project expense');
      notify.error(err.message || 'Expense creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const amountVal = parseFloat(form.amount) || 0;
  const currentAvailableFunds = project?.financials?.remainingFunds || 0;
  const fundsAfterExpense = currentAvailableFunds - amountVal;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
              Log Project Expense
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 2 }}>
              Charge costs to <strong>{project?.projectCode}</strong> ledger
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-subtle)',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

            {/* Fund Utilization Impact Indicator */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Available Project Funds: </span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                  ₹{currentAvailableFunds.toLocaleString('en-IN')}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Remaining After Expense: </span>
                <strong style={{ fontSize: '14px', color: fundsAfterExpense >= 0 ? '#16a34a' : '#ef4444' }}>
                  ₹{fundsAfterExpense.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Expense Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Expense Date
                </label>
                <input
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => handleChange('expenseDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Payment Method
                </label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => handleChange('paymentMode', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                  <option value="UPI">Google Pay / UPI</option>
                  <option value="CASH">Cash in Hand</option>
                  <option value="CREDIT_CARD">Company Credit Card</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Deduct from Financial Account */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Deduct from Company Treasury Account
              </label>
              <select
                value={form.accountId}
                onChange={(e) => handleChange('accountId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">Do not deduct from bank balance</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountName} ({a.accountType} — Balance: ₹{a.currentBalance?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Purpose / Description *
              </label>
              <input
                type="text"
                placeholder="e.g. AWS Multi-region DB cluster, Freelance UI design contract"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Bill / Voucher / Invoice Ref #
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-99120, UTR-44821"
                  value={form.referenceNumber}
                  onChange={(e) => handleChange('referenceNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                  }}
                />
              </div>

              {/* Reimbursable Employee Checkbox */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  <input
                    type="checkbox"
                    checked={form.isReimbursable}
                    onChange={(e) => handleChange('isReimbursable', e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                  />
                  <span>Employee Reimbursable Expense</span>
                </label>
                {form.isReimbursable && (
                  <input
                    type="text"
                    placeholder="Employee Name"
                    value={form.employeeName}
                    onChange={(e) => handleChange('employeeName', e.target.value)}
                    style={{
                      marginTop: 6,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                    }}
                  />
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Notes / Audit Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Vendor or expenditure notes..."
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
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
              disabled={submitting}
              style={{
                padding: '9px 24px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Wallet size={16} />
              <span>{submitting ? 'Recording...' : `Log Expense (₹${(parseFloat(form.amount) || 0).toLocaleString('en-IN')})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
