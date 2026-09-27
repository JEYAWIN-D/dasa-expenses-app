import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { TrendingUp, Wallet, ArrowDownRight, ArrowUpRight, Calendar, RefreshCw } from 'lucide-react';

export default function CashflowPage() {
  const [period, setPeriod] = useState('month'); // today, week, month, quarter, year
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const notify = useNotification();

  const fetchCashflow = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses/cashflow', { period });
      setData(res.data);
    } catch (err) {
      notify.error(err.message || 'Failed to load cash flow');
    } finally {
      setLoading(false);
    }
  }, [period, notify]);

  useEffect(() => {
    fetchCashflow();
  }, [fetchCashflow]);

  return (
    <div>
      {/* Top Header & Period Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Business Cash Flow & Cashbook</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Real-time reconciliation of opening liquidity, inflows, outgoing operational expenses, and closing balance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', padding: 4, borderRadius: 8 }}>
          {['today', 'week', 'month', 'quarter', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'capitalize',
                cursor: 'pointer',
                backgroundColor: period === p ? '#ffffff' : 'transparent',
                color: period === p ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: period === p ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <RefreshCw size={20} className="animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Cashbook Equation Waterfall Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* Opening Balance */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                1. Opening Balance
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: '#334155' }}>
                ₹{Number(data.openingBalance || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Balance before period start
              </div>
            </div>

            {/* Total Inflow */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowUpRight size={14} />
                <span>2. + Customer Income</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: '#059669' }}>
                +₹{Number(data.totalIncome || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Received invoice & advance payments
              </div>
            </div>

            {/* Total Outflow */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowDownRight size={14} />
                <span>3. - Operating Expenses</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: '#dc2626' }}>
                -₹{Number(data.totalExpense || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Vendor bills, salaries & subscriptions
              </div>
            </div>

            {/* Closing Balance */}
            <div
              className="card"
              style={{
                backgroundColor: data.netCashflow >= 0 ? '#f0fdf4' : '#fef2f2',
                borderColor: data.netCashflow >= 0 ? '#bbf7d0' : '#fecaca',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: data.netCashflow >= 0 ? '#15803d' : '#991b1b', textTransform: 'uppercase' }}>
                4. = Closing Liquidity
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  marginTop: 6,
                  color: data.netCashflow >= 0 ? '#16a34a' : '#dc2626',
                }}
              >
                ₹{Number(data.closingBalance || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Net period change: <strong>₹{Number(data.netCashflow || 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
              Expense Breakdown by Category ({period.toUpperCase()})
            </h3>

            {(!data.categoryBreakdown || data.categoryBreakdown.length === 0) ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>
                No expenses logged during this period.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.categoryBreakdown.map((item, idx) => {
                  const pct = data.totalExpense > 0 ? Math.round((item.amount / data.totalExpense) * 100) : 0;
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{item.category}</span>
                        <span>
                          <strong>₹{Number(item.amount).toLocaleString('en-IN')}</strong> ({pct}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 8, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: 'var(--primary)',
                            borderRadius: 99,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
