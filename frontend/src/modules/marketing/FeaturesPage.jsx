import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import { DemoRequestModal } from '../../components/marketing/DemoRequestModal.jsx';
import {
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
  CheckCircle2,
  Sparkles,
  Zap,
  Lock,
  Layers,
  Clock,
  Coins,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function FeaturesPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const openDemoFor = (feat) => {
    setSelectedFeature(feat);
    setDemoModalOpen(true);
  };

  const featureSections = [
    {
      id: 'quotations',
      category: 'sales',
      title: 'Quotation Management & Versioning',
      icon: <FileSpreadsheet size={22} color="#2563eb" />,
      tagline: 'Itemized Pricing, Revisions, GST, and 1-Click Conversion',
      desc: 'Build detailed professional quotations with granular line items, custom taxes, discount limits, and payment terms. Maintain complete revision histories (Rev 0, Rev 1, Rev 2) so negotiations are completely transparent.',
      points: [
        'Itemized line items with description, quantity, rates, and individual discounts',
        'Built-in GST & TDS compliance with automatic CGST, SGST, IGST calculations',
        'Revision audit snapshots preserving every client negotiation proposal',
        'Digital signature and official company seal stamping with secure PIN authorization',
        'One-click conversion into an active project upon client approval',
        'Change order handling to track approved additional scope without overwriting base quote',
      ],
      badge: 'Sales Acceleration',
      accentColor: '#2563eb',
      previewDetails: {
        code: 'Q-2026-084',
        client: 'Apex Global Tech Ltd',
        total: '₹4,50,000 + GST',
        revCount: 'Rev 2 (Final Locked)',
      },
    },
    {
      id: 'projects',
      category: 'operations',
      title: 'Project Governance & Health',
      icon: <FolderKanban size={22} color="#059669" />,
      tagline: 'Multi-Project Dashboards, Contract Values & Team Allocations',
      desc: 'Treat every project as an independent financial entity with unique project codes (e.g. PRJ-2026-0101), contractual deliverables, milestone schedules, and live profit margins.',
      points: [
        'Dedicated project-level financial and operational dashboards',
        'Real-time comparison between approved contract budget and actual costs',
        'Assigned project managers, engineering team members, and role permissions',
        'Document repository for client contracts, scopes, and signoff deliverables',
        'Real-time status tracking from Planning, In Progress, Handed Over, to Closed',
      ],
      badge: 'Operational Control',
      accentColor: '#059669',
      previewDetails: {
        code: 'PRJ-2026-0101',
        health: '98% On Budget',
        profit: '+34.2% Margin',
        manager: 'DASA Lead Architect',
      },
    },
    {
      id: 'split-payments',
      category: 'fintech',
      title: 'Advance Split Payments',
      icon: <Receipt size={22} color="#0891b2" />,
      tagline: 'Multi-Method Receipts: Cash ₹9k + GPay ₹1k + Bank ₹1.2k = ₹11.2k',
      desc: 'The fintech engine built for the way Indian and global businesses actually get paid. When a client pays through multiple channels in one transaction, DASA EXPENCES records the split seamlessly.',
      points: [
        'Dynamic multi-method payment rows within a single verified receipt',
        'Independent cash, UPI, and bank account selection with transaction reference IDs',
        'Elimination of double-counted GPay / bank settlements',
        'Automatic calculation of client outstanding receivable balances',
        'Separation of reported payment from cleared bank funds',
      ],
      badge: 'Zero Discrepancy',
      accentColor: '#0891b2',
      previewDetails: {
        split: 'Cash ₹9k + UPI ₹1k + Bank ₹1.2k',
        sum: '₹11,200 Balanced',
        status: 'Audit Verified',
      },
    },
    {
      id: 'milestones',
      category: 'fintech',
      title: 'Custom Payment Milestones',
      icon: <Milestone size={22} color="#d97706" />,
      tagline: 'Flexible % or Fixed Schedules (e.g. 50% Advance, 30% Dev, 20% Handover)',
      desc: 'Create unlimited project phases tailored to your billing agreements. Automatic mathematical validation ensures all percentage milestones total exactly 100%.',
      points: [
        'Percentage-based or fixed-amount milestone billing schedules',
        'Automated payment due date tracking and reminder generation',
        'Partial payment collection and reconciliation against each milestone phase',
        'Automatic triggering of milestone invoices upon phase completion',
        'Visual milestone timeline indicators across the project lifecycle',
      ],
      badge: 'Predictable Cashflow',
      accentColor: '#d97706',
      previewDetails: {
        m1: 'Phase 1: 50% Advance (Paid)',
        m2: 'Phase 2: 30% Dev Signoff (Active)',
        m3: 'Phase 3: 20% Handover Gate (Pending)',
      },
    },
    {
      id: 'expenses',
      category: 'fintech',
      title: 'Project Expense Ledger & Deductions',
      icon: <Wallet size={22} color="#db2777" />,
      tagline: 'Tag Cloud Costs, Subcontractors & Travel Directly to Project P&L',
      desc: 'Stop losing money to untracked miscellaneous costs. Every expense incurred during project delivery is logged against the project code and deducted from net profitability.',
      points: [
        'Project-tagged expense logging with bill attachments and vendor names',
        'Categorization by Cloud Hosting, Hardware, Freelancers, Licenses, and Travel',
        'Real-time remaining project budget calculations',
        'Multi-currency and statutory tax tracking on internal expenses',
        'Direct connection to bank account or cash vault deductions',
      ],
      badge: 'Margin Defense',
      accentColor: '#db2777',
      previewDetails: {
        burn: '₹42,300 spent of ₹1,80,000 budget',
        safety: '76.5% Net Margin Protected',
      },
    },
    {
      id: 'accounts',
      category: 'operations',
      title: 'Multi-Account Cash & Bank Balancing',
      icon: <Landmark size={22} color="#7c3aed" />,
      tagline: 'Total Clarity on Cash Vaults, Current Accounts & UPI Settlements',
      desc: 'Indian project firms juggle physical cash drawers, current bank accounts, and UPI Merchant accounts. DASA EXPENCES keeps balances synchronized with zero double counting.',
      points: [
        'Real-time cash in hand vs bank balance visibility across all branches',
        'Audit-grade double-entry journal logs behind every transaction',
        'Inter-account transfers (e.g. Cash withdrawal to petty cash drawer)',
        'Monthly bank reconciliation with balance discrepancy detection',
        'No confusion between unearned advance receipts and earned company profit',
      ],
      badge: 'Audit Grade',
      accentColor: '#7c3aed',
      previewDetails: {
        bankBalance: 'HDFC Current: ₹8,42,100',
        cashDrawer: 'Main Safe: ₹46,500',
        upiSettled: 'GPay/Razorpay: ₹98,200',
      },
    },
    {
      id: 'documents',
      category: 'sales',
      title: 'Document Studio (Branded Official Papers)',
      icon: <FileCheck2 size={22} color="#4f46e5" />,
      tagline: 'Auto-Generate Quotations, Split Receipts, Invoices & Handover Certificates',
      desc: 'Generate executive-grade PDF documents with your corporate letterhead, digital authorized signature, and official seal with one click.',
      points: [
        'Quotation Proposals with itemized pricing, milestones, and terms',
        'Advance Payment Request Letters with auto-filled project details',
        'Advance Receipt Acknowledgements detailing payment method splits',
        'Milestone Payment Invoices and overdue payment notices',
        'Final Handover Certificates and Full & Final Settlement Statements',
        'Reusable templates with company branding and authorized signatory',
      ],
      badge: 'Executive Branding',
      accentColor: '#4f46e5',
      previewDetails: {
        docType: 'Full & Final Handover Certificate',
        auth: 'Digitally Signed & Sealed',
        export: 'Vector PDF Ready',
      },
    },
    {
      id: 'handover',
      category: 'operations',
      title: 'Final Handover Verification Gate',
      icon: <ShieldAlert size={22} color="#dc2626" />,
      tagline: 'Block Premature Deliverable Release until Every Rupee Clears',
      desc: 'Eliminate the common problem of clients receiving final deliverables while leaving final invoices or expenses unsettled. The Handover Gate enforces systematic reconciliation before release.',
      points: [
        'Systematic 6-point completion and payment reconciliation checklist',
        'Automatic flags for unsettled cheques, pending change orders, or open invoices',
        'Blocks final handover release until full customer payment clears',
        'Documented management override logs for approved exceptions',
        'Issues authorized Handover Certificate upon full verification',
      ],
      badge: 'Revenue Protection',
      accentColor: '#dc2626',
      previewDetails: {
        check1: 'Contract Scope 100% Delivered (Checked)',
        check2: 'Invoices Paid: ₹4,50,000 / ₹4,50,000 (Checked)',
        check3: 'Outstanding Balance: ₹0.00 (Cleared)',
        gateStatus: 'GATE UNLOCKED — OK TO HAND OVER',
      },
    },
  ];

  const filteredFeatures =
    activeCategory === 'all'
      ? featureSections
      : featureSections.filter((f) => f.category === activeCategory);

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>Enterprise FinOps Capabilities</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 900,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#09090b',
                maxWidth: 820,
                margin: '0 auto 16px',
              }}
            >
              Engineered for Complete{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Project Financial Integrity
              </span>
            </h1>

            <p style={{ fontSize: 16, color: '#71717a', maxWidth: 680, margin: '0 auto 30px', lineHeight: 1.6 }}>
              Every feature in DASA EXPENCES was purpose-built to eliminate leakages, dispute delays, and uncollected
              receivables in project-based businesses.
            </p>

            {/* Category Filter Pills */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(226, 232, 240, 0.7)',
                padding: 4,
                borderRadius: 999,
                backdropFilter: 'blur(10px)',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {[
                { id: 'all', label: 'All Modules (8)' },
                { id: 'sales', label: 'Sales & Documents' },
                { id: 'operations', label: 'Governance & Handover' },
                { id: 'fintech', label: 'Fintech & Split Payments' },
              ].map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      padding: '7px 18px',
                      borderRadius: 999,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: active ? 800 : 600,
                      backgroundColor: active ? '#ffffff' : 'transparent',
                      color: active ? '#09090b' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: active ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Features Bento List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {filteredFeatures.map((sec, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="bento-card"
                  style={{
                    padding: '36px 36px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 36,
                    alignItems: 'center',
                  }}
                >
                  {/* Left Column: Details & Checklist */}
                  <div style={{ order: isEven ? 1 : 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: `${sec.accentColor}12`,
                          border: `1px solid ${sec.accentColor}25`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {sec.icon}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: 999,
                          backgroundColor: `${sec.accentColor}15`,
                          color: sec.accentColor,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {sec.badge}
                      </span>
                    </div>

                    <h2 style={{ fontSize: 24, fontWeight: 900, color: '#09090b', marginBottom: 6, letterSpacing: '-0.02em' }}>
                      {sec.title}
                    </h2>
                    
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', marginBottom: 14 }}>
                      {sec.tagline}
                    </div>

                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, marginBottom: 20 }}>
                      {sec.desc}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
                      {sec.points.map((pt, pIdx) => (
                        <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 3 }} />
                          <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{pt}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => openDemoFor(sec.title)}
                        className="btn-trendy-primary"
                        style={{ padding: '9px 20px', fontSize: 13 }}
                      >
                        <span>Demo This Module</span>
                        <ArrowRight size={14} />
                      </button>
                      <Link
                        to="/product-tour"
                        className="btn-trendy-secondary"
                        style={{ padding: '9px 18px', fontSize: 13 }}
                      >
                        <span>Interactive Tour</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Sleek Titanium Sandbox Preview Card */}
                  <div
                    style={{
                      order: isEven ? 2 : 1,
                      backgroundColor: '#090d16',
                      borderRadius: 18,
                      padding: 24,
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 20px 40px -15px rgba(2, 6, 23, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                    }}
                  >
                    {/* Window Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingBottom: 14,
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                        <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                        <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#10b981' }} />
                        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8, fontWeight: 600 }}>
                          {sec.title}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#38bdf8',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          padding: '3px 8px',
                          borderRadius: 999,
                          letterSpacing: '0.04em',
                        }}
                      >
                        ENTERPRISE ENGINE
                      </span>
                    </div>

                    {/* Content Box */}
                    <div
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.7)',
                        borderRadius: 12,
                        padding: 18,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Live Architecture Preview
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc', marginBottom: 14 }}>
                        {sec.tagline}
                      </div>

                      {/* Dynamic simulation data */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {Object.entries(sec.previewDetails).map(([k, v]) => (
                          <div
                            key={k}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: 8,
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              fontSize: 12,
                            }}
                          >
                            <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{k}</span>
                            <span style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>{v}</span>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 12,
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          color: '#10b981',
                          fontWeight: 700,
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                          Verified PostgreSQL Double-Entry Journal
                        </span>
                        <span style={{ color: '#64748b' }}>Rev. 2026.4</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA Banner */}
          <div
            style={{
              marginTop: 54,
              backgroundColor: '#090d16',
              borderRadius: 24,
              padding: '48px 36px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.4)',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 500,
                height: 300,
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(6, 182, 212, 0) 70%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <span className="pill-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#38bdf8', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
                <Sparkles size={12} />
                <span>Ready to Transform Your Project Financials?</span>
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, marginTop: 14, marginBottom: 12 }}>
                Schedule a Tailored Demonstration
              </h2>
              <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 540, margin: '0 auto 24px' }}>
                Join forward-thinking agencies, engineering teams, and consultancies powered by DASA TECH.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setDemoModalOpen(true)}
                  className="btn-trendy-primary"
                  style={{ padding: '12px 28px', fontSize: 14 }}
                >
                  <span>Request a Free Demo</span>
                  <ArrowRight size={16} />
                </button>
                <a
                  href="https://wa.me/917639930148?text=Hello%20DASA%20TECH%2C%20I%20would%20like%20to%20see%20a%20demo%20of%20DASA%20EXPENCES."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-trendy-secondary"
                  style={{
                    padding: '12px 24px',
                    fontSize: 14,
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.18)',
                  }}
                >
                  <span>Chat on WhatsApp (+91 76399 30148)</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <DemoRequestModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialFeature={selectedFeature}
      />
    </MarketingLayout>
  );
}
