import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import { DemoRequestModal } from '../../components/marketing/DemoRequestModal.jsx';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FolderKanban,
  Receipt,
  Milestone,
  Wallet,
  Landmark,
  FileCheck2,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Lock,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Building2,
  Calendar,
  FileText,
  CreditCard,
  Activity,
  Check,
} from 'lucide-react';
import { DasaLogo } from '../../components/common/DasaLogo.jsx';

export default function ProductTourPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const screenParam = searchParams.get('screen') || '01';
  const [currentScreen, setCurrentScreen] = useState(screenParam);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Sync state with URL query param
  useEffect(() => {
    if (searchParams.get('screen')) {
      setCurrentScreen(searchParams.get('screen'));
    }
  }, [searchParams]);

  const selectScreen = (id) => {
    setCurrentScreen(id);
    setSearchParams({ screen: id });
  };

  const screens = [
    { id: '01', title: 'Overall Dashboard', icon: <LayoutDashboard size={16} />, tag: 'Executive Overview' },
    { id: '02', title: 'Quotation Builder', icon: <FileSpreadsheet size={16} />, tag: 'Sales & Revisions' },
    { id: '03', title: 'Project Dashboard', icon: <FolderKanban size={16} />, tag: 'Project Governance' },
    { id: '04', title: 'Split Payment Collection', icon: <Receipt size={16} />, tag: 'Fintech Breakthrough' },
    { id: '05', title: 'Milestone Builder', icon: <Milestone size={16} />, tag: 'Phased Schedules' },
    { id: '06', title: 'Expense Ledger', icon: <Wallet size={16} />, tag: 'Cost Control' },
    { id: '07', title: 'Cash & Bank Dashboard', icon: <Landmark size={16} />, tag: 'Multi-Account Balances' },
    { id: '08', title: 'Document Generator', icon: <FileCheck2 size={16} />, tag: 'Letters & Certificates' },
    { id: '09', title: 'Handover Control', icon: <ShieldCheck size={16} />, tag: 'Settlement Gate' },
    { id: '10', title: 'Financial Analytics', icon: <BarChart3 size={16} />, tag: 'Reports & Intelligence' },
  ];

  const currentIdx = screens.findIndex((s) => s.id === currentScreen);
  const prevScreen = currentIdx > 0 ? screens[currentIdx - 1] : null;
  const nextScreen = currentIdx < screens.length - 1 ? screens[currentIdx + 1] : null;

  // Interactive state for Screen 4 (Split Payment form)
  const [splitRows, setSplitRows] = useState([
    { id: 1, mode: 'CASH', account: 'Cash in Hand (Office Vault)', amount: 9000, ref: 'CHQ-VAULT-04' },
    { id: 2, mode: 'UPI', account: 'Google Pay (DASA TECH)', amount: 1000, ref: 'UPI/294029410' },
    { id: 3, mode: 'BANK_TRANSFER', account: 'HDFC Current A/C (*5678)', amount: 1200, ref: 'IMPS/HDFC/88491' },
  ]);

  const totalSplitPayment = splitRows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  // Interactive state for Screen 9 (Handover Checklist)
  const [handoverChecks, setHandoverChecks] = useState({
    scopeReconciled: true,
    allMilestonesBilled: true,
    advancesCleared: true,
    expensesDocumented: true,
    balanceZeroOrException: false,
    finalSignoff: false,
  });

  const allChecksPassed =
    handoverChecks.scopeReconciled &&
    handoverChecks.allMilestonesBilled &&
    handoverChecks.advancesCleared &&
    handoverChecks.expensesDocumented &&
    handoverChecks.balanceZeroOrException &&
    handoverChecks.finalSignoff;

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ minHeight: '90vh', padding: '50px 24px 90px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', marginBottom: 12 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>Live Interactive UI Exploration</span>
              </span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 46px)',
                fontWeight: 900,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#09090b',
                marginTop: 6,
              }}
            >
              DASA EXPENCES Screen by Screen
            </h1>
            <p style={{ fontSize: 16, color: '#71717a', maxWidth: 640, margin: '10px auto 0' }}>
              Explore the actual user experience and workflows designed for precision project accounting.
            </p>
          </div>

          {/* Navigation Pill Strip (Executive Segmented Control) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              overflowX: 'auto',
              padding: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              borderRadius: 999,
              marginBottom: 28,
              boxShadow: '0 4px 14px -2px rgba(0, 0, 0, 0.04)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {screens.map((s) => {
              const active = s.id === currentScreen;
              return (
                <button
                  key={s.id}
                  onClick={() => selectScreen(s.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: active ? 800 : 600,
                    color: active ? '#ffffff' : '#64748b',
                    background: active
                      ? 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)'
                      : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: active ? '0 4px 14px rgba(194, 65, 12, 0.35)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#0f172a';
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      opacity: active ? 1 : 0.6,
                      backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.06)',
                      padding: '1px 6px',
                      borderRadius: 999,
                    }}
                  >
                    {s.id}
                  </span>
                  {s.icon}
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>


          {/* Screen Showcase Container (Executive MacBook Window) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 20,
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              overflow: 'hidden',
            }}
          >
            {/* Window Titlebar */}
            <div
              style={{
                backgroundColor: '#170e0a',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#10b981' }} />
              </div>

              {/* URL Enclave Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 999,
                  padding: '4px 16px',
                  fontSize: 11,
                  color: '#a8a29e',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                <Lock size={11} color="#fbbf24" />
                <span style={{ color: '#ffffff', fontWeight: 600 }}>app.dasaexpences.com</span>
                <span style={{ color: '#78716c' }}>/interactive-tour/{screens[currentIdx]?.id}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: '#fdba74', letterSpacing: '0.04em' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399' }} />
                <span>TENANT ISOLATED</span>
              </div>
            </div>

            {/* Top Toolbar */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                backgroundColor: '#fafafa',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
                      color: '#fff',
                      padding: '3px 10px',
                      borderRadius: 6,
                      letterSpacing: '0.04em',
                    }}
                  >
                    SCREEN {currentScreen} / 10
                  </span>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                    {screens[currentIdx]?.title}
                  </h2>
                  <span style={{ fontSize: 11, color: '#c2410c', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                    {screens[currentIdx]?.tag}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {prevScreen && (
                  <button
                    onClick={() => selectScreen(prevScreen.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    <ChevronLeft size={14} />
                    <span>Prev: {prevScreen.title}</span>
                  </button>
                )}
                {nextScreen && (
                  <button
                    onClick={() => selectScreen(nextScreen.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    <span>Next: {nextScreen.title}</span>
                    <ChevronRight size={14} />
                  </button>
                )}
                <Link
                  to="/login"
                  style={{
                    padding: '7px 16px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(194, 65, 12, 0.3)',
                  }}
                >
                  <span>Launch in App</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>

            {/* SCREEN CONTENT SWITCHER */}
            <div style={{ padding: 28 }}>
              {/* SCREEN 1: OVERALL DASHBOARD */}
              {currentScreen === '01' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        Executive SaaS Dashboard • Consolidated Company Finances
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                        Real-time visibility into total contract pipeline, actual collections, unspent project funds, and liquid account balances.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          padding: '5px 12px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                        <span>FY 2026-27 • Live Ledger Active</span>
                      </span>
                    </div>
                  </div>

                  {/* 4 Luxury Bento Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 26 }}>
                    {/* Card 1 */}
                    <div
                      style={{
                        padding: '20px 22px',
                        borderRadius: 14,
                        border: '1px solid #fed7aa',
                        backgroundColor: '#fffaf5',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: 4 }}>
                            CONTRACT PIPELINE
                          </span>
                          <span style={{ fontSize: 11, color: '#059669', fontWeight: 800 }}>+18.4% QoQ</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#78716c' }}>Total Contract Value</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#c2410c', marginTop: 4, letterSpacing: '-0.02em' }}>
                          ₹37,80,000
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #fed7aa', fontSize: 11, color: '#78716c' }}>
                        5 Active Projects Under Contract
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div
                      style={{
                        padding: '20px 22px',
                        borderRadius: 14,
                        border: '1px solid #bbf7d0',
                        backgroundColor: '#f6fdf9',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 4 }}>
                            REVENUE COLLECTED
                          </span>
                          <span style={{ fontSize: 11, color: '#059669', fontWeight: 800 }}>56.7% Realized</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#78716c' }}>Total Advances & Milestones</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#059669', marginTop: 4, letterSpacing: '-0.02em' }}>
                          ₹21,45,200
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #bbf7d0', fontSize: 11, color: '#78716c' }}>
                        Reconciled across all project phases
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div
                      style={{
                        padding: '20px 22px',
                        borderRadius: 14,
                        border: '1px solid #fecaca',
                        backgroundColor: '#fff8f8',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 4 }}>
                            PROJECT EXPENSES
                          </span>
                          <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 800 }}>Deducts Pool</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#78716c' }}>Total Project Costs Incurred</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#dc2626', marginTop: 4, letterSpacing: '-0.02em' }}>
                          ₹8,92,400
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #fecaca', fontSize: 11, color: '#78716c' }}>
                        Zero impact on client contract receivables
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div
                      style={{
                        padding: '20px 22px',
                        borderRadius: 14,
                        border: '1px solid #fed7aa',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#ffedd5', color: '#9a3412', padding: '2px 8px', borderRadius: 4 }}>
                            LIQUID OPERATING RESERVES
                          </span>
                          <span style={{ fontSize: 11, color: '#059669', fontWeight: 800 }}>● Balanced</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#78716c' }}>Cash, UPI & Bank Accounts</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginTop: 4, letterSpacing: '-0.02em' }}>
                          ₹12,52,800
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #e2e8f0', fontSize: 11, color: '#78716c' }}>
                        HDFC + ICICI + GPay + Office Vault
                      </div>
                    </div>
                  </div>

                  {/* Active Projects Table Preview */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
                    <div style={{ padding: '14px 20px', backgroundColor: '#fafafa', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
                        ACTIVE CLIENT PROJECTS & FINANCIAL STATUS
                      </div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        Real-time Double-Entry Telemetry
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <th style={{ padding: '12px 18px' }}>Project Code & Name</th>
                            <th style={{ padding: '12px 18px' }}>Client</th>
                            <th style={{ padding: '12px 18px' }}>Contract Value</th>
                            <th style={{ padding: '12px 18px' }}>Advance Collected</th>
                            <th style={{ padding: '12px 18px' }}>Expenses</th>
                            <th style={{ padding: '12px 18px' }}>Handover Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>PRJ-2026-0101 • Enterprise Cloud Migration</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>AWS Architecture & Kubernetes Provisioning</div>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 700, color: '#1e293b' }}>TechNova Global Ltd</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>GSTIN: 29ABCDE1234F1Z5</div>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>₹14,50,000</td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 800, color: '#059669' }}>₹9,25,000</div>
                              <div style={{ fontSize: 11, color: '#059669' }}>63.8% Collected</div>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 700, color: '#dc2626' }}>₹3,40,000</td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                                PENDING CLEARANCE
                              </span>
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>PRJ-2026-0102 • Fintech Payment Microservices</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>UPI Switch & Split Settlement Engine</div>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 700, color: '#1e293b' }}>Apex Solutions Ltd</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>GSTIN: 33AABCA5678B1Z2</div>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>₹11,20,000</td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 800, color: '#059669' }}>₹11,20,000</div>
                              <div style={{ fontSize: 11, color: '#059669' }}>100.0% Settled</div>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 700, color: '#dc2626' }}>₹2,80,000</td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                                READY TO HANDOVER
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>PRJ-2026-0103 • Mobile App Flutter Build</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>iOS & Android Cross-Platform Storefront</div>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 700, color: '#1e293b' }}>BlueStar Retail Ltd</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>GSTIN: 27AABCB9012C1Z4</div>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>₹12,10,000</td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 800, color: '#059669' }}>₹1,00,200</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>8.3% Token Recd</div>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 700, color: '#dc2626' }}>₹2,72,400</td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                                IN PLANNING
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 2: QUOTATION BUILDER */}
              {currentScreen === '02' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        Quotation Builder #QT-2026-0104 • Revision 1
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                        Client: TechNova Global Solutions | Issued: 27 Sep 2026 | Validity: 30 Days
                      </p>
                    </div>
                    <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                      APPROVED & CONVERTED TO PROJECT
                    </span>
                  </div>

                  <div style={{ border: '1px solid #fed7aa', borderRadius: 14, padding: 24, backgroundColor: '#ffffff', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)', marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>BILL TO CLIENT</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>TechNova Global Solutions Ltd</div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>GSTIN: 29ABCDE1234F1Z5 • Bangalore, India</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Attn: Chief Technology Officer</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>SERVICE SPECIFICATION</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>AWS Microservices & Kubernetes Architecture</div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>SAC: 998313 • Agile Fixed Scope Milestones</div>
                        <div style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>50% Advance Requirement Enforced</div>
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            <th style={{ padding: '10px 8px' }}>Deliverable Description</th>
                            <th style={{ padding: '10px 8px' }}>SAC</th>
                            <th style={{ padding: '10px 8px' }}>Qty</th>
                            <th style={{ padding: '10px 8px' }}>Unit Price</th>
                            <th style={{ padding: '10px 8px' }}>GST Rate</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Total (INR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>AWS Cloud Architecture Design & Microservices Plan</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>High availability topology, security compliance audit</div>
                            </td>
                            <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: '#64748b' }}>998313</td>
                            <td style={{ padding: '12px 8px' }}>1</td>
                            <td style={{ padding: '12px 8px', fontWeight: 700 }}>₹3,50,000</td>
                            <td style={{ padding: '12px 8px' }}>18%</td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹4,13,000</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>Kubernetes Cluster Provisioning & CI/CD Pipeline</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>Production EKS, automated staging, canary rollout</div>
                            </td>
                            <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: '#64748b' }}>998314</td>
                            <td style={{ padding: '12px 8px' }}>1</td>
                            <td style={{ padding: '12px 8px', fontWeight: 700 }}>₹5,00,000</td>
                            <td style={{ padding: '12px 8px' }}>18%</td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹5,90,000</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>Disaster Recovery & 99.99% High Availability Setup</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>Multi-region failover, 15-minute RPO/RTO verification</div>
                            </td>
                            <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: '#64748b' }}>998315</td>
                            <td style={{ padding: '12px 8px' }}>1</td>
                            <td style={{ padding: '12px 8px', fontWeight: 700 }}>₹3,78,813</td>
                            <td style={{ padding: '12px 8px' }}>18%</td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹4,47,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                      <div style={{ width: 320, backgroundColor: '#fffaf5', border: '1px solid #fed7aa', borderRadius: 10, padding: '14px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: '#64748b' }}>
                          <span>Taxable Subtotal:</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>₹12,28,813.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: '#64748b' }}>
                          <span>CGST (9.0%):</span>
                          <span>₹1,10,593.50</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, color: '#64748b' }}>
                          <span>SGST (9.0%):</span>
                          <span>₹1,10,593.50</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 900, color: '#c2410c', borderTop: '1px solid #fed7aa', paddingTop: 8 }}>
                          <span>Grand Total:</span>
                          <span>₹14,50,000.00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                      <CheckCircle2 size={16} /> Converted to Live Project PRJ-2026-0101 • Milestones Activated
                    </span>
                    <button
                      onClick={() => setDemoModalOpen(true)}
                      className="btn-trendy-primary"
                      style={{ padding: '8px 18px', fontSize: 13 }}
                    >
                      <span>Test Quotation Workflow</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN 3: PROJECT DASHBOARD */}
              {currentScreen === '03' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        PRJ-2026-0101 • Enterprise Cloud Migration
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                        Client: TechNova Global | Total Budget: ₹14,50,000 | Assigned: 4 Core Cloud Engineers
                      </p>
                    </div>
                    <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                      STAGE 2: ACTIVE DEVELOPMENT
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 24 }}>
                    <div style={{ padding: '20px 22px', borderRadius: 14, border: '1px solid #fed7aa', backgroundColor: '#fffaf5' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                        MILESTONE COLLECTIONS
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ fontSize: 28, fontWeight: 900, color: '#c2410c', letterSpacing: '-0.02em' }}>63.8%</span>
                        <span style={{ fontSize: 12, color: '#78716c', fontWeight: 600 }}>Funds Received</span>
                      </div>
                      <div style={{ width: '100%', height: 8, backgroundColor: '#fed7aa', borderRadius: 999, marginTop: 12, overflow: 'hidden' }}>
                        <div style={{ width: '63.8%', height: '100%', background: 'linear-gradient(90deg, #c2410c 0%, #ea580c 100%)' }} />
                      </div>
                      <div style={{ fontSize: 12, color: '#78716c', marginTop: 10 }}>
                        <strong>₹9,25,000</strong> received out of ₹14,50,000 contract value
                      </div>
                    </div>

                    <div style={{ padding: '20px 22px', borderRadius: 14, border: '1px solid #fecaca', backgroundColor: '#fff8f8' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                        PROJECT EXPENSE POOL
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ fontSize: 28, fontWeight: 900, color: '#dc2626', letterSpacing: '-0.02em' }}>₹3,40,000</span>
                        <span style={{ fontSize: 12, color: '#78716c', fontWeight: 600 }}>Incurred</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#059669', fontWeight: 800, marginTop: 10 }}>
                        Estimated Net Profit: ₹11,10,000 (76.5% Margin)
                      </div>
                      <div style={{ fontSize: 12, color: '#78716c', marginTop: 4 }}>
                        Deducted from internal liquidity pool, NOT client dues
                      </div>
                    </div>
                  </div>

                  {/* Phased Milestones Pipeline */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
                    <div style={{ padding: '14px 20px', backgroundColor: '#fafafa', borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
                      PHASED PAYMENT MILESTONES & REVENUE CLEARANCE
                    </div>
                    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, backgroundColor: '#f6fdf9', border: '1px solid #bbf7d0' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Phase 1 (50% Advance on Agreement)</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Cleared via Split Voucher #REC-2026-0104</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>₹7,25,000</div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#065f46', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: 4 }}>
                            FULLY PAID
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, backgroundColor: '#fffaf5', border: '1px solid #fed7aa' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Phase 2 (30% Cloud Infrastructure Deployment)</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Partial payment received: ₹2,00,000 • Outstanding: ₹2,35,000</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#c2410c' }}>₹4,35,000</div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#9a3412', backgroundColor: '#ffedd5', padding: '2px 8px', borderRadius: 4 }}>
                            IN PROGRESS
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Phase 3 (20% Production Handover Gate)</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Strict settlement release • Blocked until all deliverables verified</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#64748b' }}>₹2,90,000</div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: 4 }}>
                            HANDOVER GATE LOCKED
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 4: SPLIT PAYMENT COLLECTION */}
              {currentScreen === '04' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ backgroundColor: '#c2410c', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                          PATENTED FINTECH CAPABILITY
                        </span>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                          Multi-Method Advance Split Payment Entry
                        </h3>
                      </div>
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                        Accept advance receipts split simultaneously across Cash, UPI QR, and RTGS/IMPS wire transfers in a single atomic transaction.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSplitRows([
                          ...splitRows,
                          { id: Date.now(), mode: 'UPI', account: 'UPI / Google Pay (DASA TECH)', amount: 500, ref: 'UPI/EXTRA' },
                        ]);
                      }}
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#c2410c',
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderRadius: 8,
                        padding: '6px 14px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      }}
                    >
                      <Plus size={14} />
                      <span>Add Payment Method</span>
                    </button>
                  </div>

                  <div style={{ border: '1px solid #fed7aa', borderRadius: 14, padding: 22, backgroundColor: '#ffffff', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>
                          Receipt Voucher #REC-2026-0104 • TechNova Advance Split
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Target Contract: PRJ-2026-0101 • Atomic Split Allocation
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#065f46', backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: 999 }}>
                        ● 3-Way Auto Split
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {splitRows.map((row, idx) => (
                        <div
                          key={row.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 1fr 150px 140px 36px',
                            gap: 12,
                            alignItems: 'center',
                            backgroundColor: '#fafafa',
                            padding: '12px 14px',
                            borderRadius: 10,
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <div>
                            <select
                              value={row.mode}
                              onChange={(e) => {
                                const copy = [...splitRows];
                                copy[idx].mode = e.target.value;
                                setSplitRows(copy);
                              }}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, backgroundColor: '#fff' }}
                            >
                              <option value="CASH">Cash in Hand</option>
                              <option value="UPI">Google Pay / UPI</option>
                              <option value="BANK_TRANSFER">Bank Wire / IMPS</option>
                              <option value="CHEQUE">Cheque Clearance</option>
                            </select>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={row.account}
                              onChange={(e) => {
                                const copy = [...splitRows];
                                copy[idx].account = e.target.value;
                                setSplitRows(copy);
                              }}
                              placeholder="Account description"
                              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, backgroundColor: '#fff' }}
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={row.ref}
                              onChange={(e) => {
                                const copy = [...splitRows];
                                copy[idx].ref = e.target.value;
                                setSplitRows(copy);
                              }}
                              placeholder="Ref # / UTR"
                              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, backgroundColor: '#fff', fontFamily: 'monospace' }}
                            />
                          </div>

                          <div>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: 8, top: 8, fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>₹</span>
                              <input
                                type="number"
                                value={row.amount}
                                onChange={(e) => {
                                  const copy = [...splitRows];
                                  copy[idx].amount = Number(e.target.value);
                                  setSplitRows(copy);
                                }}
                                style={{ width: '100%', padding: '8px 10px 8px 20px', borderRadius: 6, border: '1px solid #fed7aa', fontSize: 13, fontWeight: 800, color: '#c2410c', backgroundColor: '#fff' }}
                              />
                            </div>
                          </div>

                          <div>
                            {splitRows.length > 1 && (
                              <button
                                onClick={() => setSplitRows(splitRows.filter((r) => r.id !== row.id))}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                                title="Remove line"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 20,
                        paddingTop: 16,
                        borderTop: '2px dashed #fed7aa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 14,
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Each split leg updates its respective underlying account immediately with zero double counting.
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 13, color: '#64748b', marginRight: 10, fontWeight: 700 }}>Total Advance Voucher:</span>
                        <span style={{ fontSize: 24, fontWeight: 900, color: '#c2410c', letterSpacing: '-0.02em' }}>
                          ₹{totalSplitPayment.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 5: MILESTONE BUILDER */}
              {currentScreen === '05' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        Custom Payment Milestone Schedule Builder
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                        Enforce percentage or fixed-amount milestones. Validation ensures schedules equal 100% of contract value.
                      </p>
                    </div>
                    <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                      100.0% RECONCILED (₹14,50,000)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div style={{ backgroundColor: '#ffffff', padding: 22, borderRadius: 14, border: '1px solid #fed7aa', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: 4 }}>
                          PHASE 1 (50% ADVANCE)
                        </span>
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 800 }}>● Settled</span>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>₹7,25,000</div>
                      <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, marginTop: 4 }}>Status: Fully Paid</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Paid via Split Receipt #REC-2026-0104</div>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', padding: 22, borderRadius: 14, border: '1px solid #fde68a', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 4 }}>
                          PHASE 2 (30% DEVELOPMENT)
                        </span>
                        <span style={{ fontSize: 11, color: '#d97706', fontWeight: 800 }}>● Active</span>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>₹4,35,000</div>
                      <div style={{ fontSize: 12, color: '#d97706', fontWeight: 700, marginTop: 4 }}>Status: Partially Paid (₹2,00,000)</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Remaining Balance: ₹2,35,000</div>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', padding: 22, borderRadius: 14, border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4 }}>
                          PHASE 3 (20% HANDOVER)
                        </span>
                        <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 800 }}>● Gated</span>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>₹2,90,000</div>
                      <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 700, marginTop: 4 }}>Status: Pending Handover Gate</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Release conditioned on clearance</div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 6: EXPENSE LEDGER */}
              {currentScreen === '06' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        Project Expense Ledger • Deducts Funds, Not Client Receivables
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                        Strict separation: Expenses reduce project profitability and internal cash balances without modifying customer contracts.
                      </p>
                    </div>
                    <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                      ZERO DOUBLE-ENTRY TAMPERING
                    </span>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: '#fafafa' }}>
                            <th style={{ padding: '12px 18px' }}>Expense ID</th>
                            <th style={{ padding: '12px 18px' }}>Category</th>
                            <th style={{ padding: '12px 18px' }}>Description & Vendor</th>
                            <th style={{ padding: '12px 18px' }}>Paid By Account</th>
                            <th style={{ padding: '12px 18px', textAlign: 'right' }}>Amount</th>
                            <th style={{ padding: '12px 18px', textAlign: 'center' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                              EXP-2026-0104
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                                Cloud Hosting
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>AWS Production Cluster Subscriptions</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>Amazon Web Services India • GST Invoice #AWS-8821</div>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 600 }}>HDFC Bank (*5678)</td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 900, color: '#dc2626' }}>
                              ₹1,45,000.00
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                              <span style={{ color: '#059669', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
                                Approved
                              </span>
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                              EXP-2026-0105
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                                Software Licenses
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>Docker Enterprise & Security Scans</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>Docker Inc • Annual Team Tier</div>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 600 }}>Google Pay Business</td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 900, color: '#dc2626' }}>
                              ₹48,000.00
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                              <span style={{ color: '#059669', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
                                Approved
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                              EXP-2026-0106
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                                Professional Services
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>DevOps Cloud Security Consulting</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>Subcontractor Audit • Form 16A Reconciled</div>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 600 }}>HDFC Bank (*5678)</td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 900, color: '#dc2626' }}>
                              ₹1,47,000.00
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                              <span style={{ color: '#059669', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
                                Approved
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 7: CASH & BANK (EXECUTIVE LIQUIDITY & MULTI-ACCOUNT JOURNAL) */}
              {currentScreen === '07' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        Cash, Bank & UPI Management • No Double Counting
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                        Each UPI scan or cash payment is mapped directly to its underlying physical or bank account. Internal transfers auto-balance.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          padding: '5px 12px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <CheckCircle2 size={14} color="#10b981" />
                        <span>All 3 Ledgers Auto-Balanced</span>
                      </span>
                    </div>
                  </div>

                  {/* Liquidity Overview Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #170e0a 0%, #261610 50%, #150d09 100%)',
                      borderRadius: 16,
                      padding: '24px 28px',
                      color: '#ffffff',
                      marginBottom: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 20,
                      boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#fed7aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        TOTAL LIQUID OPERATING RESERVES
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', marginTop: 4, letterSpacing: '-0.03em' }}>
                        ₹9,02,800.00
                      </div>
                      <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 4 }}>
                        Available immediately across Cash Vault (₹32k) + UPI GPay (₹28k) + HDFC Current (₹8.42L)
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 24, borderLeft: '1px solid rgba(255, 255, 255, 0.12)', paddingLeft: 24 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#a8a29e', fontWeight: 700, textTransform: 'uppercase' }}>30-DAY COLLECTIONS</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399', marginTop: 2 }}>+₹21,45,200</div>
                        <div style={{ fontSize: 11, color: '#a7f3d0' }}>56.7% contract total</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#a8a29e', fontWeight: 700, textTransform: 'uppercase' }}>30-DAY EXPENSE OUTFLOW</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#f87171', marginTop: 2 }}>-₹8,92,400</div>
                        <div style={{ fontSize: 11, color: '#fca5a5' }}>Project ledger costs</div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Account Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
                    {/* Account 1: Cash Vault */}
                    <div
                      style={{
                        padding: '20px 22px',
                        borderRadius: 14,
                        border: '1px solid #fed7aa',
                        backgroundColor: '#fffaf5',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: 4 }}>
                            PHYSICAL VAULT
                          </span>
                          <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>● Daily Logged</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#64748b' }}>ACC-CASH-01</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                          Cash in Hand (Office Vault)
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#c2410c', marginTop: 10, letterSpacing: '-0.02em' }}>
                          ₹32,000.00
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #fed7aa', fontSize: 11, color: '#78716c' }}>
                        Last split entry: <strong>+₹9,000</strong> (TechNova Advance)
                      </div>
                    </div>

                    {/* Account 2: Google Pay UPI */}
                    <div
                      style={{
                        padding: '20px 22px',
                        borderRadius: 14,
                        border: '1px solid #bbf7d0',
                        backgroundColor: '#f6fdf9',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 4 }}>
                            UPI MERCHANT
                          </span>
                          <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>● QR Live</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#64748b' }}>ACC-GPAY-02</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                          Google Pay / UPI Business
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#059669', marginTop: 10, letterSpacing: '-0.02em' }}>
                          ₹28,000.00
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #bbf7d0', fontSize: 11, color: '#78716c' }}>
                        VPA: <strong>dasatech@hdfcbank</strong> • Auto-Sweep
                      </div>
                    </div>

                    {/* Account 3: HDFC Current Account */}
                    <div
                      style={{
                        padding: '20px 22px',
                        borderRadius: 14,
                        border: '1px solid #fed7aa',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#ffedd5', color: '#9a3412', padding: '2px 8px', borderRadius: 4 }}>
                            PRIMARY BANK A/C
                          </span>
                          <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>● Core Operating</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#64748b' }}>ACC-HDFC-03 (*5678)</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                          HDFC Bank Ltd Current A/C
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginTop: 10, letterSpacing: '-0.02em' }}>
                          ₹8,42,800.00
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #e2e8f0', fontSize: 11, color: '#78716c' }}>
                        IFSC: <strong>HDFC0001234</strong> • RTGS / NEFT / IMPS
                      </div>
                    </div>
                  </div>

                  {/* Multi-Account Settlement Journal Table */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
                    <div style={{ padding: '14px 20px', backgroundColor: '#fafafa', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
                        LIVE MULTI-ACCOUNT SETTLEMENT JOURNAL
                      </div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        Synchronized with Double-Entry Ledger
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <th style={{ padding: '10px 18px' }}>Ref / Voucher</th>
                            <th style={{ padding: '10px 18px' }}>Project / Description</th>
                            <th style={{ padding: '10px 18px' }}>Target Account</th>
                            <th style={{ padding: '10px 18px', textAlign: 'right' }}>Credit (+)</th>
                            <th style={{ padding: '10px 18px', textAlign: 'right' }}>Debit (-)</th>
                            <th style={{ padding: '10px 18px', textAlign: 'right' }}>Balance After</th>
                            <th style={{ padding: '10px 18px', textAlign: 'center' }}>Verification</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                              VR-2026-0891
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>TechNova Cloud Split Advance</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>PRJ-2026-0101 • Cash Token</div>
                            </td>
                            <td style={{ padding: '12px 18px', fontWeight: 600 }}>Cash Vault</td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                              +₹9,000.00
                            </td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700 }}>₹32,000.00</td>
                            <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#065f46', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 4 }}>
                                Physical Stamp
                              </span>
                            </td>
                          </tr>

                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                              VR-2026-0892
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>TechNova Cloud Split Advance</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>PRJ-2026-0101 • GPay UPI Scan</div>
                            </td>
                            <td style={{ padding: '12px 18px', fontWeight: 600 }}>UPI / GPay Business</td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                              +₹1,000.00
                            </td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700 }}>₹28,000.00</td>
                            <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#065f46', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 4 }}>
                                UPI UTR Confirmed
                              </span>
                            </td>
                          </tr>

                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                              VR-2026-0893
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>TechNova Cloud Split Advance</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>PRJ-2026-0101 • Bank Wire</div>
                            </td>
                            <td style={{ padding: '12px 18px', fontWeight: 600 }}>HDFC Current A/C</td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                              +₹1,200.00
                            </td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700 }}>₹8,42,800.00</td>
                            <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#065f46', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 4 }}>
                                IMPS Cleared
                              </span>
                            </td>
                          </tr>

                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                              VR-2026-0885
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>AWS Cloud Hosting Production Cluster</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>Project Expense Deducted from Pool</div>
                            </td>
                            <td style={{ padding: '12px 18px', fontWeight: 600 }}>HDFC Current A/C</td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>
                              -₹8,400.00
                            </td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700 }}>₹8,41,600.00</td>
                            <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#9a3412', backgroundColor: '#fff7ed', padding: '2px 8px', borderRadius: 4 }}>
                                GST Bill Matched
                              </span>
                            </td>
                          </tr>

                          <tr>
                            <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                              VR-2026-0880
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>Apex Solutions Milestone 1 Settlement</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>PRJ-2026-0102 • Direct RTGS</div>
                            </td>
                            <td style={{ padding: '12px 18px', fontWeight: 600 }}>HDFC Current A/C</td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                              +₹11,20,000.00
                            </td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                            <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700 }}>₹8,50,000.00</td>
                            <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#065f46', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 4 }}>
                                RTGS Reconciled
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 8: DOCUMENT GENERATOR */}
              {currentScreen === '08' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        Document Studio • Branded Official Letters & Certificates
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                        Automated high-fidelity PDF letters for Advance Receipts, Payment Requests, Milestone Invoices, and Handover Certificates.
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Exporting Official Signed PDF Letterhead...')}
                      className="btn-trendy-primary"
                      style={{ padding: '8px 18px', fontSize: 13 }}
                    >
                      <Download size={14} />
                      <span>Download Signed Letter PDF</span>
                    </button>
                  </div>

                  {/* Letterhead Container (Museum Grade Document Preview) */}
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 14,
                      padding: '36px 40px',
                      backgroundColor: '#ffffff',
                      maxWidth: 720,
                      margin: '0 auto',
                      boxShadow: '0 10px 30px -8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
                      position: 'relative',
                    }}
                  >
                    {/* Watermark */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-25deg)',
                        fontSize: 64,
                        fontWeight: 900,
                        color: 'rgba(194, 65, 12, 0.04)',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        letterSpacing: '0.1em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      DASA TECH OFFICIAL
                    </div>

                    {/* Letterhead Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #c2410c', paddingBottom: 18, marginBottom: 20 }}>
                      <div>
                        <DasaLogo size="sm" variant="horizontal" />
                        <div style={{ fontSize: 11, color: '#78716c', marginTop: 6, lineHeight: 1.5 }}>
                          EB Colony, Erode, Tamil Nadu — 638002, India<br />
                          GSTIN: <strong>29ABCDE1234F1Z5</strong> • Phone: +91 76399 30148
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#c2410c', letterSpacing: '0.04em' }}>
                          OFFICIAL RECEIPT ACKNOWLEDGEMENT
                        </div>
                        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#0f172a', fontWeight: 700, marginTop: 2 }}>
                          DOC-REC-2026-0104
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          Date: <strong>27 Sep 2026</strong>
                        </div>
                      </div>
                    </div>

                    {/* Recipient Details */}
                    <div style={{ marginBottom: 18, fontSize: 12, color: '#334155', lineHeight: 1.6 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>ISSUED TO:</div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>TechNova Global Solutions Ltd</div>
                      <div>Attn: Finance & Procurement Directorate</div>
                      <div>Bangalore, Karnataka, India • GSTIN: 29ABCDE1234F1Z5</div>
                    </div>

                    {/* Letter Body */}
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.75, marginBottom: 22 }}>
                      <p style={{ margin: '0 0 12px' }}>
                        We gratefully acknowledge the receipt of <strong>₹11,200.00 (Eleven Thousand Two Hundred Rupees Only)</strong> from <strong>TechNova Global Solutions Ltd</strong> as verified advance payment toward project contract <strong>PRJ-2026-0101 (Enterprise Cloud Migration)</strong>.
                      </p>
                      <div style={{ backgroundColor: '#fffaf5', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 16px', margin: '14px 0' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', marginBottom: 6 }}>
                          MULTI-METHOD SETTLEMENT BREAKDOWN:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12 }}>
                          <div>
                            <span style={{ color: '#78716c' }}>Cash in Vault:</span><br />
                            <strong style={{ color: '#0f172a' }}>₹9,000.00</strong>
                          </div>
                          <div>
                            <span style={{ color: '#78716c' }}>UPI (Google Pay):</span><br />
                            <strong style={{ color: '#0f172a' }}>₹1,000.00</strong>
                          </div>
                          <div>
                            <span style={{ color: '#78716c' }}>Bank Wire (HDFC):</span><br />
                            <strong style={{ color: '#0f172a' }}>₹1,200.00</strong>
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: 0 }}>
                        This payment has been duly credited to the project advance ledger and acknowledged under double-entry verification voucher <strong>#VR-2026-0891/92/93</strong>.
                      </p>
                    </div>

                    {/* Signatory Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 18, marginTop: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#475569' }}>
                          QR CODE
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          <span style={{ fontWeight: 800, color: '#065f46' }}>● Digitally Cryptographically Signed</span><br />
                          Hash: <strong>sha256-8f92a1...</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a' }}>Authorized Financial Signatory</div>
                        <div style={{ fontSize: 11, color: '#c2410c', fontWeight: 700 }}>DASA TECH Accounts & Finance</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>Stamp Ref: DASA-FIN-2026-GATE</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 9: HANDOVER CONTROL (INTERACTIVE CHECKLIST) */}
              {currentScreen === '09' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                          SETTLEMENT GATE
                        </span>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                          Project Handover Verification Gate (Interactive Compliance)
                        </h3>
                      </div>
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                        Prevents premature deliverable release and zero-balance handover leakage. Check all 6 items to unlock release authorization!
                      </p>
                    </div>

                    <span
                      style={{
                        backgroundColor: allChecksPassed ? '#ecfdf5' : '#fff1f2',
                        color: allChecksPassed ? '#065f46' : '#9f1239',
                        border: `1px solid ${allChecksPassed ? '#a7f3d0' : '#fecdd3'}`,
                        padding: '6px 14px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Lock size={12} color={allChecksPassed ? '#10b981' : '#e11d48'} />
                      <span>{allChecksPassed ? 'GATE UNLOCKED • AUTHORIZED' : 'GATE LOCKED • SETTLEMENT REQUIRED'}</span>
                    </span>
                  </div>

                  <div style={{ border: '1px solid #fed7aa', borderRadius: 14, padding: 24, backgroundColor: '#ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, backgroundColor: handoverChecks.scopeReconciled ? '#f0fdf4' : '#fafafa', border: `1px solid ${handoverChecks.scopeReconciled ? '#bbf7d0' : '#e2e8f0'}`, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s ease' }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.scopeReconciled}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, scopeReconciled: e.target.checked })}
                          style={{ accentColor: '#ea580c', width: 18, height: 18 }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>1. Scope Reconciliation:</span> Approved Quotation & all Scope Change Orders reconciled with zero variance.
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: handoverChecks.scopeReconciled ? '#059669' : '#94a3b8' }}>
                          {handoverChecks.scopeReconciled ? 'Verified' : 'Pending'}
                        </span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, backgroundColor: handoverChecks.allMilestonesBilled ? '#f0fdf4' : '#fafafa', border: `1px solid ${handoverChecks.allMilestonesBilled ? '#bbf7d0' : '#e2e8f0'}`, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s ease' }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.allMilestonesBilled}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, allMilestonesBilled: e.target.checked })}
                          style={{ accentColor: '#ea580c', width: 18, height: 18 }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>2. Technical Milestones:</span> All deliverable code, tests, and documentation approved by Technical Lead.
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: handoverChecks.allMilestonesBilled ? '#059669' : '#94a3b8' }}>
                          {handoverChecks.allMilestonesBilled ? 'Verified' : 'Pending'}
                        </span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, backgroundColor: handoverChecks.advancesCleared ? '#f0fdf4' : '#fafafa', border: `1px solid ${handoverChecks.advancesCleared ? '#bbf7d0' : '#e2e8f0'}`, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s ease' }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.advancesCleared}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, advancesCleared: e.target.checked })}
                          style={{ accentColor: '#ea580c', width: 18, height: 18 }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>3. Bank Clearance:</span> All advance receipts, split vouchers, and final milestone wires cleared into primary bank account.
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: handoverChecks.advancesCleared ? '#059669' : '#94a3b8' }}>
                          {handoverChecks.advancesCleared ? 'Verified' : 'Pending'}
                        </span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, backgroundColor: handoverChecks.expensesDocumented ? '#f0fdf4' : '#fafafa', border: `1px solid ${handoverChecks.expensesDocumented ? '#bbf7d0' : '#e2e8f0'}`, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s ease' }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.expensesDocumented}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, expensesDocumented: e.target.checked })}
                          style={{ accentColor: '#ea580c', width: 18, height: 18 }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>4. Expense Settlement:</span> All cloud, contractor, and licensing expenses reconciled with valid GST bills.
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: handoverChecks.expensesDocumented ? '#059669' : '#94a3b8' }}>
                          {handoverChecks.expensesDocumented ? 'Verified' : 'Pending'}
                        </span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, backgroundColor: handoverChecks.balanceZeroOrException ? '#f0fdf4' : '#fafafa', border: `1px solid ${handoverChecks.balanceZeroOrException ? '#bbf7d0' : '#e2e8f0'}`, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s ease' }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.balanceZeroOrException}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, balanceZeroOrException: e.target.checked })}
                          style={{ accentColor: '#ea580c', width: 18, height: 18 }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>5. Zero Customer Balance:</span> Customer ledger balance is strictly ₹0.00 (or formal waiver exception on file).
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: handoverChecks.balanceZeroOrException ? '#059669' : '#94a3b8' }}>
                          {handoverChecks.balanceZeroOrException ? 'Verified' : 'Action Required'}
                        </span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, backgroundColor: handoverChecks.finalSignoff ? '#f0fdf4' : '#fafafa', border: `1px solid ${handoverChecks.finalSignoff ? '#bbf7d0' : '#e2e8f0'}`, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s ease' }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.finalSignoff}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, finalSignoff: e.target.checked })}
                          style={{ accentColor: '#ea580c', width: 18, height: 18 }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>6. Finance Director PIN Authorization:</span> Two-factor PIN signature submitted by authorized finance manager.
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: handoverChecks.finalSignoff ? '#059669' : '#94a3b8' }}>
                          {handoverChecks.finalSignoff ? 'Signed' : 'Action Required'}
                        </span>
                      </label>
                    </div>

                    <div
                      style={{
                        padding: '18px 22px',
                        borderRadius: 12,
                        backgroundColor: allChecksPassed ? '#ecfdf5' : '#fff1f2',
                        border: `1px solid ${allChecksPassed ? '#a7f3d0' : '#fecdd3'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 14,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: allChecksPassed ? '#065f46' : '#9f1239' }}>
                          {allChecksPassed ? 'HANDOVER AUTHORIZED & VERIFIED' : 'HANDOVER LOCKED — UNCLEARED CRITERIA'}
                        </div>
                        <div style={{ fontSize: 12, color: allChecksPassed ? '#047857' : '#be123c', marginTop: 2 }}>
                          {allChecksPassed
                            ? 'All 6 compliance gates cleared. Ready to issue official signed Handover Certificate.'
                            : 'Deliverables and production credentials remain locked until all criteria are verified.'}
                        </div>
                      </div>

                      <button
                        disabled={!allChecksPassed}
                        onClick={() => alert('Certificate generated! In production, this issues the cryptographic PDF.')}
                        style={{
                          backgroundColor: allChecksPassed ? '#059669' : '#cbd5e1',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '10px 20px',
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: allChecksPassed ? 'pointer' : 'not-allowed',
                          boxShadow: allChecksPassed ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none',
                        }}
                      >
                        Issue Handover Certificate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 10: ANALYTICS & REPORTS */}
              {currentScreen === '10' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        Company-Wide Financial Intelligence & Cashflow Aging
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                        Instant financial statements, gross project margins, zero-delinquency cashflow telemetry, and audit exports.
                      </p>
                    </div>

                    <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                      0% DELINQUENT RECEIVABLES
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                    <div style={{ border: '1px solid #fed7aa', borderRadius: 14, padding: 22, backgroundColor: '#ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                        Project Gross Margin Telemetry
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                        Consolidated average gross profit margin: <strong style={{ color: '#059669' }}>72.4%</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>Cloud Migration (PRJ-0101)</span>
                            <span style={{ fontWeight: 800, color: '#c2410c' }}>76.5% Margin</span>
                          </div>
                          <div style={{ height: 8, backgroundColor: '#fed7aa', borderRadius: 999 }}>
                            <div style={{ width: '76.5%', height: '100%', background: 'linear-gradient(90deg, #c2410c 0%, #ea580c 100%)', borderRadius: 999 }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>Fintech Payment Services (PRJ-0102)</span>
                            <span style={{ fontWeight: 800, color: '#059669' }}>75.0% Margin</span>
                          </div>
                          <div style={{ height: 8, backgroundColor: '#bbf7d0', borderRadius: 999 }}>
                            <div style={{ width: '75%', height: '100%', backgroundColor: '#10b981', borderRadius: 999 }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>Mobile App Storefront (PRJ-0103)</span>
                            <span style={{ fontWeight: 800, color: '#d97706' }}>68.2% Margin</span>
                          </div>
                          <div style={{ height: 8, backgroundColor: '#fde68a', borderRadius: 999 }}>
                            <div style={{ width: '68.2%', height: '100%', backgroundColor: '#f59e0b', borderRadius: 999 }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #fed7aa', borderRadius: 14, padding: 22, backgroundColor: '#ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                        Exportable Compliance Audit Statements
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                        Instant 1-click export for auditors, GST filing, and Tally/ERP migration.
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button
                          onClick={() => alert('Exporting Financial Summary Statement PDF...')}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #fed7aa',
                            background: '#fffaf5',
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#9a3412',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Financial Summary Statement (FY 2026-27 PDF)</span>
                          <Download size={15} color="#c2410c" />
                        </button>
                        <button
                          onClick={() => alert('Exporting Split Payment & Multi-Account Journal (Excel)...')}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #fed7aa',
                            background: '#fffaf5',
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#9a3412',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Split Payment & Multi-Account Journal (Excel)</span>
                          <Download size={15} color="#c2410c" />
                        </button>
                        <button
                          onClick={() => alert('Exporting Tally Prime XML Double-Entry Vouchers...')}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            background: '#fafafa',
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Tally Prime XML Double-Entry Vouchers</span>
                          <Download size={15} color="#64748b" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom CTA Banner (Luxury Executive Mahogany Finish) */}
          <div
            style={{
              marginTop: 48,
              textAlign: 'center',
              padding: '48px 32px',
              background: 'linear-gradient(135deg, #170e0a 0%, #22140e 50%, #150d09 100%)',
              borderRadius: 20,
              border: '1px solid rgba(234, 88, 12, 0.35)',
              boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.3)',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'inline-flex', marginBottom: 12 }}>
              <span style={{ backgroundColor: 'rgba(234, 88, 12, 0.2)', color: '#fdba74', border: '1px solid rgba(234, 88, 12, 0.4)', padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                ● PRODUCTION-READY ENTERPRISE SAAS
              </span>
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Ready to Experience the Live Application?
            </h3>
            <p style={{ fontSize: 15, color: '#a8a29e', maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Request a guided walkthrough with a DASA TECH fintech specialist or sign in directly to the tenant system.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setDemoModalOpen(true)}
                className="btn-trendy-primary"
                style={{
                  padding: '14px 28px',
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                <span>Request a Custom Demo</span>
                <ArrowRight size={16} />
              </button>
              <Link
                to="/login"
                style={{
                  padding: '14px 26px',
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>Sign In to App</span>
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <DemoRequestModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </MarketingLayout>
  );
}
