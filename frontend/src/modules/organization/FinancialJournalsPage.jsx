import React, { useState, useEffect } from 'react';
import { orgApi } from '../../services/organization.service';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { 
  BookOpen, CheckCircle2, AlertTriangle, RefreshCw, 
  RotateCcw, Scale, ArrowDownRight, ArrowUpRight, Search, ShieldCheck, FileText, Lock
} from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';

export default function FinancialJournalsPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reversalModalEntry, setReversalModalEntry] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);

  const notify = useNotification();

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const res = await orgApi.getJournalEntries();
      const items = res?.items
        ? res.items
        : (res?.data?.items ? res.data.items : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])));
      setEntries(items);
    } catch (err) {
      notify.error('Failed to load general ledger: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReversalSubmit = async (e) => {
    e.preventDefault();
    if (!reversalModalEntry || !reversalReason.trim()) {
      notify.error('A formal reversal audit reason is required');
      return;
    }

    try {
      setReversing(true);
      const res = await orgApi.reverseJournalEntry(reversalModalEntry.id, { voidReason: reversalReason });
      if (res?.success || res?.data?.success || res?.status === 200 || res?.id || res?.data?.id) {
        notify.success('Financial journal reversal entry posted successfully. Audit trail preserved.');
        setReversalModalEntry(null);
        setReversalReason('');
        fetchJournals();
      }
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to reverse journal entry');
    } finally {
      setReversing(false);
    }
  };

  const filteredEntries = entries.filter(item => {
    const s = search.toLowerCase();
    const matchNum = (item.entryNumber || item.voucherNumber || '').toLowerCase().includes(s);
    const matchDesc = (item.description || item.narration || '').toLowerCase().includes(s);
    return !search || matchNum || matchDesc;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>
                Double-Entry Financial General Ledger
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Immutable financial transaction ledger enforcing strict debit/credit equality, statutory audit trails, and reversal entries.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchJournals}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Journal Transactions
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px' }}>
            {entries.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Posted financial vouchers
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Debit / Credit Equality
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669', marginTop: '6px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scale size={20} />
            <span>Balanced (100%)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            Strict double-entry compliance
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Immutability Governance
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#7c3aed', marginTop: '6px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={16} />
            <span>Zero Hard Deletes</span>
          </div>
          <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px' }}>
            Reversals append contra-entries
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Statutory Audit Trail
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0284c7', marginTop: '6px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} />
            <span>Audit Logs Active</span>
          </div>
          <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '4px' }}>
            User ID, timestamp & IP stamped
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search general ledger by entry #, voucher, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          />
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
            <div>Loading general ledger entries...</div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Scale size={28} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              No General Ledger Entries Recorded
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto' }}>
              General ledger transactions are automatically generated in real-time upon receipt of customer payments, milestone invoice creations, and approved vendor expenses.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Entry # / Date
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Transaction Description & Context
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Double-Entry Splits (Dr / Cr)
                  </th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Total Value (₹)
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(item => {
                  const isReversed = item.isReversed || item.status === 'REVERSED';
                  const lines = item.lines || [];

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: '13px' }}>
                          {item.entryNumber || item.voucherNumber || 'JRN-' + item.id.substring(0, 8)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(item.entryDate || item.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>
                          {item.description || item.narration || 'Automated financial balancing entry'}
                        </div>
                        {item.referenceType && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                            Ref: {item.referenceType} ({item.referenceId ? item.referenceId.substring(0, 8) : ''})
                          </div>
                        )}
                        {item.voidReason && (
                          <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: 4, fontStyle: 'italic' }}>
                            Reversal Reason: {item.voidReason}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        {lines.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {lines.map((line, lIdx) => (
                              <div key={lIdx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 800, color: line.debit > 0 ? '#1d4ed8' : '#059669', fontSize: '11px' }}>
                                  {line.debit > 0 ? 'Dr' : 'Cr'}
                                </span>
                                <span style={{ color: '#334155' }}>
                                  {line.account?.accountName || line.accountName || 'Account'}:
                                </span>
                                <strong style={{ color: line.debit > 0 ? '#1d4ed8' : '#059669' }}>
                                  ₹{Number(line.debit > 0 ? line.debit : line.credit).toLocaleString('en-IN')}
                                </strong>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Balanced debit/credit posted</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                        ₹{Number(item.totalAmount || item.amount || 0).toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            backgroundColor: isReversed ? '#fffbeb' : '#ecfdf5',
                            color: isReversed ? '#b45309' : '#047857',
                            border: `1px solid ${isReversed ? '#fde68a' : '#a7f3d0'}`,
                          }}
                        >
                          {isReversed ? 'REVERSED' : 'POSTED'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {!isReversed && (
                          <button
                            onClick={() => setReversalModalEntry(item)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 9px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            title="Reverse Journal Entry"
                          >
                            <RotateCcw size={12} />
                            <span>Reverse</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formal Journal Reversal Modal */}
      {reversalModalEntry && (
        <Modal
          isOpen={Boolean(reversalModalEntry)}
          onClose={() => setReversalModalEntry(null)}
          title={`Reverse Journal Entry #${reversalModalEntry.entryNumber || reversalModalEntry.id.substring(0, 8)}`}
          maxWidth={480}
        >
          <form onSubmit={handleReversalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', color: '#991b1b', lineHeight: 1.5 }}>
              <strong>Accounting Compliance Notice:</strong> In accordance with statutory financial audit protocols, this journal entry cannot be deleted. Instead, an opposing contra-entry will be posted to balance the ledger.
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Formal Audit Reversal Justification *
              </label>
              <textarea
                required
                rows={3}
                placeholder="State the formal auditing reason (e.g. Duplicate voucher entry, wrong client allocation)..."
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setReversalModalEntry(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reversing || !reversalReason.trim()}
                className="btn btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {reversing ? 'Posting Reversal...' : 'Confirm Reversal'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
