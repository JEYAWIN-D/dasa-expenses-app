import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  TrendingUp,
  Wallet,
  AlertTriangle,
  FileCheck2,
  Users,
  FileSpreadsheet,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle2,
  FolderKanban,
  Landmark,
  ArrowRight,
  Lock,
  Layers,
  Award,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
          <RefreshCw size={20} className="animate-spin" />
          <span>Loading centralized company & project dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>
        <button onClick={fetchDashboard} className="btn btn-secondary">Retry</button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const projectMetrics = data?.projectMetrics || {};
  const projectProfitabilityTable = data?.projectProfitabilityTable || [];
  const accountsMetrics = data?.accountsMetrics || {};
  const trends = data?.monthlyTrends || [];
  const activities = data?.recentActivities || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Dashboard Topbar / Action row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', letterSpacing: -0.5 }}>
            Centralized Business & Project Financial Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Consolidated overview of all active & completed projects, quotation values, advance collections, cash/bank balances and profitability.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchDashboard} className="btn btn-secondary" title="Refresh metrics">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <Link to="/projects" className="btn btn-secondary">
            <FolderKanban size={15} color="#2563eb" />
            <span>View All Projects</span>
          </Link>
          <Link to="/quotations/new" className="btn btn-secondary">
            <Plus size={15} />
            <span>New Quote</span>
          </Link>
          <Link to="/invoices/new" className="btn btn-primary">
            <Plus size={15} />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid: Requirement #8 Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
        }}
      >
        {/* Total Project Portfolio Value */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Portfolio Quotation Value</span>
            <div style={{ color: '#2563eb' }}><FolderKanban size={18} /></div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            ₹{Number(projectMetrics.totalProjectValue || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {projectMetrics.activeProjectsCount || 0} active, {projectMetrics.completedProjectsCount || 0} completed
          </div>
        </div>

        {/* Payments Received */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Collections Received</span>
            <div style={{ color: '#059669' }}><TrendingUp size={18} /></div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>
            ₹{Number(projectMetrics.totalReceived || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 }}>
            Advance & milestone collections
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Outstanding Payments</span>
            <div style={{ color: '#b45309' }}><AlertTriangle size={18} /></div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: projectMetrics.totalOutstanding > 0 ? '#b45309' : '#059669' }}>
            ₹{Number(projectMetrics.totalOutstanding || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Pending customer dues
          </div>
        </div>

        {/* Overall Project Expenses */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Project Expenses</span>
            <div style={{ color: '#475569' }}><Wallet size={18} /></div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#475569' }}>
            ₹{Number(projectMetrics.totalExpenses || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Utilized from project collections
          </div>
        </div>

        {/* Cash in Hand */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Cash in Hand</span>
            <div style={{ color: '#059669' }}><Wallet size={18} /></div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            ₹{Number(accountsMetrics.totalCashInHand || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Physical cash vault & cashier
          </div>
        </div>

        {/* Bank Balances */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Bank Balances</span>
            <div style={{ color: '#2563eb' }}><Landmark size={18} /></div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>
            ₹{Number(accountsMetrics.totalBankBalance || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {accountsMetrics.accounts && accountsMetrics.accounts.length > 0
              ? accountsMetrics.accounts.map((a) => a.name).slice(0, 2).join(', ') + (accountsMetrics.accounts.length > 2 ? ' & more' : '')
              : 'No bank accounts linked'}
          </div>
        </div>
      </div>

      {/* Project-Wise Profitability Matrix / Table (Requirement #8) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
              Project-Wise Financial Position & Profitability Matrix
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Track quotation value, advance received, utilized expenses, net profit and handover clearance for every project.
            </p>
          </div>

          <Link
            to="/projects"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Manage All Projects</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 180 }}>Project Code & Name</th>
                <th style={{ minWidth: 160 }}>Customer</th>
                <th style={{ minWidth: 130, textAlign: 'right' }}>Total Value</th>
                <th style={{ minWidth: 120, textAlign: 'right' }}>Received</th>
                <th style={{ minWidth: 130, textAlign: 'right' }}>Balance Due</th>
                <th style={{ minWidth: 120, textAlign: 'right' }}>Expenses</th>
                <th style={{ minWidth: 130, textAlign: 'right' }}>Est. Net Profit</th>
                <th style={{ minWidth: 100, textAlign: 'center' }}>Margin %</th>
                <th style={{ minWidth: 130, textAlign: 'center' }}>Handover Status</th>
              </tr>
            </thead>
            <tbody>
              {projectProfitabilityTable.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No projects found. Create or convert quotations into projects to populate the matrix.
                  </td>
                </tr>
              ) : (
                projectProfitabilityTable.map((p) => {
                  const isHandedOver = p.status === 'HANDED_OVER';
                  const isZeroBalance = p.outstandingBalance === 0;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                          {p.projectCode}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', color: '#475569', fontWeight: 500 }}>
                        {p.clientName}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700 }}>
                        ₹{p.totalProjectValue.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        ₹{p.totalPaid.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: p.outstandingBalance > 0 ? '#b45309' : '#059669' }}>
                        ₹{p.outstandingBalance.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                        ₹{p.totalExpenses.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: '#6d28d9' }}>
                        ₹{p.estimatedProfit.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 700 }}>
                        <span style={{ backgroundColor: '#f5f3ff', color: '#6d28d9', padding: '3px 8px', borderRadius: 4, fontSize: 11 }}>
                          {p.profitMarginPercent}%
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        {isHandedOver ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#6d28d9', backgroundColor: '#f5f3ff', padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Award size={12} />
                            <span>Handed Over</span>
                          </span>
                        ) : isZeroBalance ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', backgroundColor: '#f0fdf4', padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={12} />
                            <span>Handover Cleared</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#b45309', backgroundColor: '#fffbeb', padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Lock size={12} />
                            <span>Locked (Pending Dues)</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash and Bank Accounts Live Balances Strip */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Landmark size={18} color="#2563eb" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
              Cash & Bank Treasury Balances
            </h3>
          </div>
          <Link to="/cash-bank" style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>
            Treasury Management →
          </Link>
        </div>

        {!accountsMetrics.accounts || accountsMetrics.accounts.length === 0 ? (
          <div
            style={{
              padding: '24px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              border: '1px dashed #cbd5e1',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              No bank or cash accounts configured yet. All test balances have been cleared.
            </p>
            <Link
              to="/cash-bank"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
              }}
            >
              <Plus size={14} />
              <span>Configure Your Bank & Cash Accounts in Treasury</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {accountsMetrics.accounts.map((acc) => (
              <div
                key={acc.id}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{acc.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{acc.type} ({acc.code})</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  ₹{acc.balance?.toLocaleString('en-IN') || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Trends & Audit Activities Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Trend Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
            6-Month Income vs Expense Trends
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trends.map((m, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{m.month}</span>
                  <span>
                    Income: <strong style={{ color: '#059669' }}>₹{m.income.toLocaleString('en-IN')}</strong> | Exp:{' '}
                    <strong style={{ color: '#475569' }}>₹{m.expense.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
                <div style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${Math.min(100, (m.income / 200000) * 100)}%`, backgroundColor: '#10b981' }} />
                  <div style={{ width: `${Math.min(100, (m.expense / 200000) * 100)}%`, backgroundColor: '#ef4444' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
            Recent Financial & Project Audit Trail
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 12,
                  padding: '8px 10px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 8,
                }}
              >
                <div style={{ padding: '2px 6px', borderRadius: 4, backgroundColor: '#e2e8f0', fontWeight: 700, fontSize: 10 }}>
                  {act.action}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#0f172a', fontWeight: 500 }}>{act.details}</div>
                  <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                    {act.userEmail} • {new Date(act.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
