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
} from 'lucide-react';

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

          {/* Navigation Pill Strip (10 screens) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 16,
              marginBottom: 24,
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
                    padding: '9px 16px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: active ? 800 : 600,
                    color: active ? '#ffffff' : '#52525b',
                    background: active
                      ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                      : 'rgba(255, 255, 255, 0.85)',
                    border: `1px solid ${active ? '#2563eb' : 'rgba(226, 232, 240, 0.9)'}`,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: active ? '0 6px 18px rgba(37, 99, 235, 0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 800, opacity: active ? 1 : 0.6 }}>{s.id}</span>
                  {s.icon}
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>


          {/* Screen Showcase Container */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 20,
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
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
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, backgroundColor: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>
                    SCREEN {currentScreen}
                  </span>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {screens[currentIdx]?.title}
                  </h2>
                  <span style={{ fontSize: 11, color: '#64748b', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: 999 }}>
                    {screens[currentIdx]?.tag}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {prevScreen && (
                  <button
                    onClick={() => selectScreen(prevScreen.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
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
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>Next: {nextScreen.title}</span>
                    <ChevronRight size={14} />
                  </button>
                )}
                <Link
                  to="/login"
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
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
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                      Executive SaaS Dashboard • Consolidated Company Finances
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                      Real-time visibility into total contract pipeline, actual collections, unspent project funds, and liquid account balances.
                    </p>
                  </div>

                  {/* Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div style={{ padding: 18, borderRadius: 12, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1e40af' }}>TOTAL CONTRACT VALUE</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#1e3a8a', marginTop: 4 }}>₹37,80,000</div>
                      <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 4 }}>5 Active Projects Under Contract</div>
                    </div>

                    <div style={{ padding: 18, borderRadius: 12, backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46' }}>TOTAL ADVANCES & REVENUE</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#047857', marginTop: 4 }}>₹21,45,200</div>
                      <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>56.7% received across all phases</div>
                    </div>

                    <div style={{ padding: 18, borderRadius: 12, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#991b1b' }}>TOTAL PROJECT EXPENSES</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#b91c1c', marginTop: 4 }}>₹8,92,400</div>
                      <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>Deducts project pool, not client dues</div>
                    </div>

                    <div style={{ padding: 18, borderRadius: 12, backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#5b21b6' }}>LIQUID CASH & BANK</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#6d28d9', marginTop: 4 }}>₹12,52,800</div>
                      <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 4 }}>Reconciled across 4 active accounts</div>
                    </div>
                  </div>

                  {/* Active Projects Table Preview */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 18px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: 13, color: '#334155' }}>
                      ACTIVE CLIENT PROJECTS & FINANCIAL STATUS
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12 }}>
                            <th style={{ padding: '10px 18px' }}>Project Code & Name</th>
                            <th style={{ padding: '10px 18px' }}>Client</th>
                            <th style={{ padding: '10px 18px' }}>Contract Value</th>
                            <th style={{ padding: '10px 18px' }}>Advance Collected</th>
                            <th style={{ padding: '10px 18px' }}>Expenses</th>
                            <th style={{ padding: '10px 18px' }}>Handover Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 18px', fontWeight: 700, color: '#0f172a' }}>
                              PRJ-2026-0101 • Enterprise Cloud Migration
                            </td>
                            <td style={{ padding: '12px 18px', color: '#475569' }}>TechNova Global</td>
                            <td style={{ padding: '12px 18px', fontWeight: 700 }}>₹14,50,000</td>
                            <td style={{ padding: '12px 18px', color: '#059669', fontWeight: 700 }}>₹9,25,000</td>
                            <td style={{ padding: '12px 18px', color: '#dc2626' }}>₹3,40,000</td>
                            <td style={{ padding: '12px 18px' }}>
                              <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                                PENDING CLEARANCE
                              </span>
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 18px', fontWeight: 700, color: '#0f172a' }}>
                              PRJ-2026-0102 • Fintech Payment Microservices
                            </td>
                            <td style={{ padding: '12px 18px', color: '#475569' }}>Apex Solutions</td>
                            <td style={{ padding: '12px 18px', fontWeight: 700 }}>₹11,20,000</td>
                            <td style={{ padding: '12px 18px', color: '#059669', fontWeight: 700 }}>₹11,20,000</td>
                            <td style={{ padding: '12px 18px', color: '#dc2626' }}>₹2,80,000</td>
                            <td style={{ padding: '12px 18px' }}>
                              <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                                READY TO HANDOVER
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 18px', fontWeight: 700, color: '#0f172a' }}>
                              PRJ-2026-0103 • Mobile App Flutter Build
                            </td>
                            <td style={{ padding: '12px 18px', color: '#475569' }}>BlueStar Retail</td>
                            <td style={{ padding: '12px 18px', fontWeight: 700 }}>₹12,10,000</td>
                            <td style={{ padding: '12px 18px', color: '#059669', fontWeight: 700 }}>₹1,00,200</td>
                            <td style={{ padding: '12px 18px', color: '#dc2626' }}>₹2,72,400</td>
                            <td style={{ padding: '12px 18px' }}>
                              <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                        Quotation Builder #QT-2026-0104 • Revision 1
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b' }}>
                        Client: TechNova Global Solutions | Date: 27 Sep 2026 | Validity: 30 Days
                      </p>
                    </div>
                    <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      APPROVED & CONVERTED
                    </span>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, backgroundColor: '#f8fafc', marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>CLIENT DETAILS</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>TechNova Global Solutions Ltd</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>GSTIN: 29ABCDE1234F1Z5 • Bangalore, India</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>SERVICE SCOPE</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>AWS Microservices Architecture</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>Agile Fixed Scope Delivery</div>
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                          <th style={{ padding: 8 }}>Item Description</th>
                          <th style={{ padding: 8 }}>Qty</th>
                          <th style={{ padding: 8 }}>Unit Price</th>
                          <th style={{ padding: 8 }}>GST</th>
                          <th style={{ padding: 8, textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: 8 }}>AWS Cloud Architecture Design & Microservices Plan</td>
                          <td style={{ padding: 8 }}>1</td>
                          <td style={{ padding: 8 }}>₹3,50,000</td>
                          <td style={{ padding: 8 }}>18%</td>
                          <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>₹4,13,000</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: 8 }}>Kubernetes Cluster Provisioning & CI/CD Pipeline</td>
                          <td style={{ padding: 8 }}>1</td>
                          <td style={{ padding: 8 }}>₹5,00,000</td>
                          <td style={{ padding: 8 }}>18%</td>
                          <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>₹5,90,000</td>
                        </tr>
                        <tr>
                          <td style={{ padding: 8 }}>Disaster Recovery & 99.99% High Availability Setup</td>
                          <td style={{ padding: 8 }}>1</td>
                          <td style={{ padding: 8 }}>₹3,78,813</td>
                          <td style={{ padding: 8 }}>18%</td>
                          <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>₹4,47,000</td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: 12 }}>
                      <div style={{ width: 280 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span>Subtotal:</span>
                          <span>₹12,28,813</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span>GST (18%):</span>
                          <span>₹2,21,187</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900, color: '#2563eb', borderTop: '1px solid #cbd5e1', paddingTop: 6 }}>
                          <span>Grand Total:</span>
                          <span>₹14,50,000</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                      <CheckCircle2 size={16} /> Converted to Project PRJ-2026-0101
                    </span>
                    <button onClick={() => setDemoModalOpen(true)} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                      Test Quotation Workflow
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN 3: PROJECT DASHBOARD */}
              {currentScreen === '03' && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                      PRJ-2026-0101 • Enterprise Cloud Migration
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                      Client: TechNova Global | Budget: ₹14,50,000 | Assigned: 4 Engineers
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
                    <div style={{ padding: 18, borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>MILESTONE PROGRESS</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 26, fontWeight: 900, color: '#2563eb' }}>63.8%</span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Funds Collected</span>
                      </div>
                      <div style={{ width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 999, marginTop: 10, overflow: 'hidden' }}>
                        <div style={{ width: '63.8%', height: '100%', backgroundColor: '#2563eb' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                        ₹9,25,000 received out of ₹14,50,000 contract value
                      </div>
                    </div>

                    <div style={{ padding: 18, borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>PROJECT EXPENSE LEDGER</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 26, fontWeight: 900, color: '#dc2626' }}>₹3,40,000</span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Incurred</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, marginTop: 10 }}>
                        Estimated Net Profit: ₹11,10,000 (76.5% Margin)
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        3 Bills pending manager reimbursement approval
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 4: SPLIT PAYMENT COLLECTION */}
              {currentScreen === '04' && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                        FEATURE HIGHLIGHT
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Multi-Method Split Payment Entry (Interactive Demo)
                      </h3>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Demonstrating how a single advance receipt of ₹11,200 is collected across Cash (₹9k), GPay (₹1k), and Bank (₹1.2k). Try editing amounts below!
                    </p>
                  </div>

                  <div style={{ border: '1px solid #cbd5e1', borderRadius: 12, padding: 20, backgroundColor: '#ffffff', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>
                        Receipt #REC-2026-0104 • TechNova Advance Collection
                      </div>
                      <button
                        onClick={() => {
                          setSplitRows([
                            ...splitRows,
                            { id: Date.now(), mode: 'UPI', account: 'UPI / Google Pay', amount: 500, ref: 'UPI/EXTRA' },
                          ]);
                        }}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#2563eb',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: 6,
                          padding: '4px 10px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Plus size={13} />
                        <span>Add Payment Method</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {splitRows.map((row, idx) => (
                        <div
                          key={row.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '140px 1fr 140px 140px 40px',
                            gap: 12,
                            alignItems: 'center',
                            backgroundColor: '#f8fafc',
                            padding: '10px 14px',
                            borderRadius: 8,
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
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                            >
                              <option value="CASH">Cash in Hand</option>
                              <option value="UPI">Google Pay / UPI</option>
                              <option value="BANK_TRANSFER">Bank Wire / IMPS</option>
                              <option value="CHEQUE">Cheque</option>
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
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
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
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </div>

                          <div>
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) => {
                                const copy = [...splitRows];
                                copy[idx].amount = Number(e.target.value);
                                setSplitRows(copy);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700 }}
                            />
                          </div>

                          <div>
                            {splitRows.length > 1 && (
                              <button
                                onClick={() => setSplitRows(splitRows.filter((r) => r.id !== row.id))}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
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
                        marginTop: 18,
                        paddingTop: 14,
                        borderTop: '2px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Each method updates its respective ledger balance immediately upon receipt generation.
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 12, color: '#64748b', marginRight: 8 }}>Total Calculated:</span>
                        <span style={{ fontSize: 20, fontWeight: 900, color: '#2563eb' }}>
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
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                      Custom Payment Milestone Schedule Builder
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                      Enforce percentage or fixed-amount milestones. Validation ensures schedules equal 100% of contract value.
                    </p>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                      <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #bfdbfe' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#2563eb' }}>PHASE 1 (50% ADVANCE)</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>₹7,25,000</div>
                        <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, marginTop: 4 }}>Status: Fully Paid</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Paid via Split Receipt #REC-0104</div>
                      </div>

                      <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #fde68a' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#d97706' }}>PHASE 2 (30% DEVELOPMENT)</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>₹4,35,000</div>
                        <div style={{ fontSize: 12, color: '#d97706', fontWeight: 700, marginTop: 4 }}>Status: Partially Paid (₹2,00,000)</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Balance: ₹2,35,000</div>
                      </div>

                      <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>PHASE 3 (20% HANDOVER)</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>₹2,90,000</div>
                        <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 700, marginTop: 4 }}>Status: Pending Handover Gate</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Release conditioned on clearance</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 6: EXPENSE LEDGER */}
              {currentScreen === '06' && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                      Project Expense Ledger • Deducts Funds, Not Client Receivables
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                      Strict separation: Expenses reduce project profitability and internal cash balances without modifying customer contracts.
                    </p>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: 10 }}>Expense ID</th>
                        <th style={{ padding: 10 }}>Category</th>
                        <th style={{ padding: 10 }}>Description & Vendor</th>
                        <th style={{ padding: 10 }}>Paid By</th>
                        <th style={{ padding: 10 }}>Amount</th>
                        <th style={{ padding: 10 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 10, fontWeight: 700 }}>EXP-2026-0104</td>
                        <td style={{ padding: 10 }}>Cloud Hosting</td>
                        <td style={{ padding: 10 }}>AWS Production Cluster Subscriptions</td>
                        <td style={{ padding: 10 }}>HDFC Bank</td>
                        <td style={{ padding: 10, fontWeight: 700, color: '#dc2626' }}>₹1,45,000</td>
                        <td style={{ padding: 10 }}><span style={{ color: '#059669', fontWeight: 700 }}>Approved</span></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 10, fontWeight: 700 }}>EXP-2026-0105</td>
                        <td style={{ padding: 10 }}>Software Licenses</td>
                        <td style={{ padding: 10 }}>Docker Enterprise & Security Scans</td>
                        <td style={{ padding: 10 }}>Google Pay</td>
                        <td style={{ padding: 10, fontWeight: 700, color: '#dc2626' }}>₹48,000</td>
                        <td style={{ padding: 10 }}><span style={{ color: '#059669', fontWeight: 700 }}>Approved</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* SCREEN 7: CASH & BANK */}
              {currentScreen === '07' && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                      Cash, Bank & UPI Management • No Double Counting
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                      Each UPI payment maps directly to its verified settlement bank account. Internal transfers balance automatically.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    <div style={{ padding: 18, borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>ACC-CASH</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Cash in Hand (Office Vault)</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#2563eb', marginTop: 6 }}>₹32,000</div>
                      <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>Reconciled with physical register</div>
                    </div>

                    <div style={{ padding: 18, borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>ACC-GPAY</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Google Pay / UPI Business</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#059669', marginTop: 6 }}>₹28,000</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Auto-settles to HDFC Current A/C</div>
                    </div>

                    <div style={{ padding: 18, borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>ACC-HDFC</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>HDFC Bank Ltd Current A/C</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#7c3aed', marginTop: 6 }}>₹8,42,800</div>
                      <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>Primary Operational Account</div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 8: DOCUMENT GENERATOR */}
              {currentScreen === '08' && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                      Document Studio • Branded Official Letters & Certificates
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                      Generate PDF letters for Advance Payment Requests, Receipt Acknowledgements, Milestone Claims, and Final Handover Certificates.
                    </p>
                  </div>

                  <div style={{ border: '1px solid #cbd5e1', borderRadius: 12, padding: 24, backgroundColor: '#ffffff', maxWidth: 680, margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563eb', paddingBottom: 14, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#1e3a8a' }}>DASA TECH</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Erode, Tamil Nadu, India • +91 76399 30148</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb' }}>ADVANCE RECEIPT ACKNOWLEDGEMENT</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>DOC-REC-2026-0104</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                      We gratefully acknowledge receipt of <strong>₹11,200</strong> from <strong>TechNova Global Solutions Ltd</strong> as partial advance for <em>PRJ-2026-0101 (Enterprise Cloud Migration)</em>.
                      The payment has been credited to our ledgers via Cash (₹9,000), Google Pay (₹1,000), and Bank Transfer (₹1,200).
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        Verified by DASA TECH Financial Gateway
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>Authorized Signatory</div>
                        <div style={{ fontSize: 11, color: '#2563eb' }}>DASA TECH Accounts Dept</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 9: HANDOVER CONTROL (INTERACTIVE CHECKLIST) */}
              {currentScreen === '09' && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                        STRICT GOVERNANCE
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Project Handover Verification Gate (Interactive Checklist)
                      </h3>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Prevents premature project closure and unpaid deliverable handover. Try checking all items to authorize release!
                    </p>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.scopeReconciled}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, scopeReconciled: e.target.checked })}
                          style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                        />
                        <span>Approved Quotation & all Scope Change Orders reconciled</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.allMilestonesBilled}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, allMilestonesBilled: e.target.checked })}
                          style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                        />
                        <span>All milestone deliverables verified by technical lead</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.advancesCleared}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, advancesCleared: e.target.checked })}
                          style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                        />
                        <span>All customer advance & milestone cheques/UTR payments cleared into bank</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.expensesDocumented}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, expensesDocumented: e.target.checked })}
                          style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                        />
                        <span>All subcontractor & team project expenses settled with receipt attachments</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.balanceZeroOrException}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, balanceZeroOrException: e.target.checked })}
                          style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                        />
                        <span>Customer contract balance is ₹0 OR documented management-approved exception on file</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={handoverChecks.finalSignoff}
                          onChange={(e) => setHandoverChecks({ ...handoverChecks, finalSignoff: e.target.checked })}
                          style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                        />
                        <span>Finance Manager PIN signature authorization provided</span>
                      </label>
                    </div>

                    <div
                      style={{
                        padding: 16,
                        borderRadius: 8,
                        backgroundColor: allChecksPassed ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${allChecksPassed ? '#a7f3d0' : '#fecaca'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: allChecksPassed ? '#065f46' : '#991b1b' }}>
                          {allChecksPassed ? 'HANDOVER AUTHORIZED & VERIFIED' : 'HANDOVER LOCKED — UNCLEARED ITEMS'}
                        </div>
                        <div style={{ fontSize: 12, color: allChecksPassed ? '#047857' : '#b91c1c' }}>
                          {allChecksPassed
                            ? 'Ready to generate official signed Handover Certificate and transfer project assets.'
                            : 'Deliverables and certificates are locked until all 6 criteria are verified.'}
                        </div>
                      </div>

                      <button
                        disabled={!allChecksPassed}
                        onClick={() => alert('Certificate generated! In production, this issues the signed PDF.')}
                        style={{
                          backgroundColor: allChecksPassed ? '#059669' : '#cbd5e1',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 18px',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: allChecksPassed ? 'pointer' : 'not-allowed',
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
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                      Company-Wide Financial Intelligence & Cashflow Aging
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                      Downloadable financial statements, project margins, and automated reconciliation audit trails.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                        Project Margin Breakdown
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                        Average company gross profit margin: <strong>72.4%</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span>Cloud Migration (PRJ-0101)</span>
                            <span style={{ fontWeight: 700 }}>76.5%</span>
                          </div>
                          <div style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 999 }}>
                            <div style={{ width: '76.5%', height: '100%', backgroundColor: '#2563eb' }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span>Fintech Payment Services (PRJ-0102)</span>
                            <span style={{ fontWeight: 700 }}>75.0%</span>
                          </div>
                          <div style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 999 }}>
                            <div style={{ width: '75%', height: '100%', backgroundColor: '#10b981' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                        Exportable Audit Statements
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                        Instant export for auditors, tax filing, and Tally/ERP migration.
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button
                          onClick={() => alert('Exporting Financial Summary PDF...')}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            fontSize: 12,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Financial Summary Statement (FY 2026-27)</span>
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => alert('Exporting Split Payment Ledger Excel...')}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            fontSize: 12,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Split Payment & Multi-Account Journal (Excel)</span>
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div
            style={{
              marginTop: 48,
              textAlign: 'center',
              padding: '40px 24px',
              backgroundColor: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
              Ready to Experience the Live Application?
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 560, margin: '0 auto 20px' }}>
              Request a guided walkthrough with a DASA TECH fintech specialist or login directly to the test organization.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setDemoModalOpen(true)}
                className="btn btn-primary"
                style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Request a Custom Demo
              </button>
              <Link
                to="/login"
                style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  textDecoration: 'none',
                }}
              >
                Sign In to Web App →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <DemoRequestModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </MarketingLayout>
  );
}
