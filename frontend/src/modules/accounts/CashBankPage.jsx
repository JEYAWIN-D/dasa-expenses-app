import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Wallet,
  ArrowRightLeft,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle,
  RefreshCw,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';
import { accountsService } from '../../services/accounts.service.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';

export default function CashBankPage() {
  const notify = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);

  // Transfer Form state
  const [transferForm, setTransferForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    referenceNumber: '',
    notes: '',
  });
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferError, setTransferError] = useState('');

  // Create Account Form state
  const [newAccForm, setNewAccForm] = useState({
    accountCode: '',
    accountName: '',
    accountType: 'BANK',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    openingBalance: '',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await accountsService.getAccounts();
      setData(res.data);
      if (res.data?.accounts?.length >= 2) {
        setTransferForm((prev) => ({
          ...prev,
          fromAccountId: res.data.accounts[0].id,
          toAccountId: res.data.accounts[1].id,
        }));
      }
    } catch (err) {
      notify.error(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setTransferError('');

    const amt = parseFloat(transferForm.amount);
    if (!amt || amt <= 0) {
      setTransferError('Please enter a valid transfer amount greater than 0');
      return;
    }

    if (transferForm.fromAccountId === transferForm.toAccountId) {
      setTransferError('Source and destination accounts must be different');
      return;
    }

    setTransferSubmitting(true);
    try {
      await accountsService.transferFunds({
        fromAccountId: transferForm.fromAccountId,
        toAccountId: transferForm.toAccountId,
        amount: amt,
        referenceNumber: transferForm.referenceNumber,
        notes: transferForm.notes,
      });

      notify.success(`Transferred ₹${amt.toLocaleString('en-IN')} successfully!`);
      setTransferModalOpen(false);
      setTransferForm({
        fromAccountId: data?.accounts?.[0]?.id || '',
        toAccountId: data?.accounts?.[1]?.id || '',
        amount: '',
        referenceNumber: '',
        notes: '',
      });
      fetchAccounts();
    } catch (err) {
      setTransferError(err.message || 'Transfer failed');
      notify.error(err.message || 'Fund transfer failed');
    } finally {
      setTransferSubmitting(false);
    }
  };

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!newAccForm.accountName.trim() || !newAccForm.accountCode.trim()) {
      setCreateError('Account Name and Unique Code are required');
      return;
    }

    setCreateSubmitting(true);
    try {
      await accountsService.createAccount(newAccForm);
      notify.success(`Account ${newAccForm.accountName} created!`);
      setCreateAccountModalOpen(false);
      setNewAccForm({
        accountCode: '',
        accountName: '',
        accountType: 'BANK',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        openingBalance: '',
      });
      fetchAccounts();
    } catch (err) {
      setCreateError(err.message || 'Account creation failed');
      notify.error(err.message || 'Failed to create account');
    } finally {
      setCreateSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <div>Loading cash & bank accounts...</div>
      </div>
    );
  }

  const { accounts = [], summary = {}, recentTransactions = [] } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Cash and Bank Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>
            Monitor cash in hand, GPay / UPI, and bank account balances with automated multi-channel reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setTransferModalOpen(true)}
            style={{
              padding: '9px 16px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ArrowRightLeft size={16} color="#2563eb" />
            <span>Transfer Funds</span>
          </button>

          <button
            onClick={() => setCreateAccountModalOpen(true)}
            style={{
              padding: '9px 18px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Plus size={16} />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Consolidated Liquidity Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            <Wallet size={16} />
            <span>Cash in Hand</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            ₹{summary.totalCashInHand?.toLocaleString('en-IN') || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>Physical cash vault & petty cash</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            <Landmark size={16} />
            <span>Bank & UPI Balances</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', marginTop: 8 }}>
            ₹{summary.totalBankBalance?.toLocaleString('en-IN') || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>Across all operational bank & UPI accounts</div>
        </div>

        <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            <TrendingUp size={16} />
            <span>Total Available Liquidity</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginTop: 8 }}>
            ₹{summary.totalLiquidity?.toLocaleString('en-IN') || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: 4 }}>Total available company funds</div>
        </div>
      </div>

      {/* Individual Account Cards */}
      <div>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
          Treasury Accounts
        </h2>

        {accounts.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '48px 24px',
              borderRadius: '16px',
              border: '2px dashed var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <Landmark size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              No Treasury Accounts Configured
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
              All default test bank balances and cash have been cleared. Click below to manually add the exact bank accounts, physical cash drawers, or UPI accounts you use.
            </p>
            <button
              onClick={() => setCreateAccountModalOpen(true)}
              style={{
                padding: '10px 22px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Plus size={16} />
              <span>Add Your First Account</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {accounts.map((acc) => (
              <div
                key={acc.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                      {acc.accountCode}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: acc.accountType === 'CASH' ? '#ecfdf5' : (acc.accountType === 'UPI' ? '#eff6ff' : '#f8fafc'),
                        color: acc.accountType === 'CASH' ? '#047857' : (acc.accountType === 'UPI' ? '#1d4ed8' : '#334155'),
                      }}
                    >
                      {acc.accountType}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginTop: 10 }}>
                    {acc.accountName}
                  </h3>

                  {acc.bankName && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
                      {acc.bankName} {acc.accountNumber ? `— ...${acc.accountNumber.slice(-4)}` : ''}
                    </div>
                  )}
                  {acc.ifscCode && (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>IFSC: {acc.ifscCode}</div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Current Balance</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: acc.currentBalance >= 0 ? '#0f172a' : '#ef4444' }}>
                      ₹{acc.currentBalance?.toLocaleString('en-IN') || 0}
                    </div>
                  </div>

                  {acc.isDefault && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '4px' }}>
                      Default A/C
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Centralized Transactions Ledger */}
      <div>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
          Centralized Cash & Bank Ledger Transactions
        </h2>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 120 }}>Date</th>
                <th style={{ minWidth: 180 }}>Account</th>
                <th style={{ minWidth: 130 }}>Type</th>
                <th style={{ minWidth: 220 }}>Category & Description</th>
                <th style={{ minWidth: 150 }}>Ref / Txn #</th>
                <th style={{ minWidth: 130, textAlign: 'right' }}>Amount</th>
                <th style={{ minWidth: 140, textAlign: 'right' }}>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No transactions recorded yet in the ledger.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => {
                  const isCredit = tx.transactionType === 'CREDIT' || tx.transactionType === 'TRANSFER_IN';
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        {new Date(tx.transactionDate).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                        {tx.account?.accountName || 'Treasury Account'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: isCredit ? '#ecfdf5' : '#fef2f2',
                            color: isCredit ? '#047857' : '#b91c1c',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          <span>{tx.transactionType}</span>
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>{tx.description}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{tx.category}</div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>
                        {tx.referenceNumber || '—'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: isCredit ? '#15803d' : '#b91c1c' }}>
                        {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        ₹{tx.balanceAfter?.toLocaleString('en-IN') || 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Funds Modal */}
      {transferModalOpen && (
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
          onClick={() => setTransferModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                Transfer Funds Between Accounts
              </h2>
              <button onClick={() => setTransferModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-subtle)" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {transferError && (
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={16} />
                  <span>{transferError}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Source Account (From) *
                </label>
                <select
                  value={transferForm.fromAccountId}
                  onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px', backgroundColor: '#ffffff' }}
                  required
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (Balance: ₹{a.currentBalance?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Destination Account (To) *
                </label>
                <select
                  value={transferForm.toAccountId}
                  onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px', backgroundColor: '#ffffff' }}
                  required
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (Balance: ₹{a.currentBalance?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Transfer Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 20000"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '14px', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Reference Number / UTR / Cheque #
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN-998821"
                  value={transferForm.referenceNumber}
                  onChange={(e) => setTransferForm({ ...transferForm, referenceNumber: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Notes / Transfer Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cash withdrawal from bank for office expenses"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferSubmitting}
                  style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: transferSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {transferSubmitting ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {createAccountModalOpen && (
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
          onClick={() => setCreateAccountModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                Add Financial Account
              </h2>
              <button onClick={() => setCreateAccountModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-subtle)" />
              </button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {createError && (
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={16} />
                  <span>{createError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Account Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACC-SBI"
                    value={newAccForm.accountCode}
                    onChange={(e) => setNewAccForm({ ...newAccForm, accountCode: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Account Type *
                  </label>
                  <select
                    value={newAccForm.accountType}
                    onChange={(e) => setNewAccForm({ ...newAccForm, accountType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px', backgroundColor: '#ffffff' }}
                  >
                    <option value="BANK">Bank Account</option>
                    <option value="UPI">Google Pay / UPI</option>
                    <option value="CASH">Cash in Hand</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Account Display Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India Current A/C"
                  value={newAccForm.accountName}
                  onChange={(e) => setNewAccForm({ ...newAccForm, accountName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                  required
                />
              </div>

              {newAccForm.accountType === 'BANK' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SBI, HDFC"
                      value={newAccForm.bankName}
                      onChange={(e) => setNewAccForm({ ...newAccForm, bankName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="Full account #"
                      value={newAccForm.accountNumber}
                      onChange={(e) => setNewAccForm({ ...newAccForm, accountNumber: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Opening Balance (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newAccForm.openingBalance}
                  onChange={(e) => setNewAccForm({ ...newAccForm, openingBalance: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCreateAccountModalOpen(false)}
                  style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: createSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {createSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
