import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import { DemoRequestModal } from '../../components/marketing/DemoRequestModal.jsx';
import {
  Code,
  Palette,
  HardHat,
  Briefcase,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
  Zap,
  TrendingUp,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function SolutionsPage() {
  const [activeTab, setActiveTab] = useState('software');
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [industryTarget, setIndustryTarget] = useState('');

  const industries = [
    {
      id: 'software',
      label: 'Software & IT',
      title: 'Software Development & Cloud Engineering',
      icon: <Code size={20} />,
      tagline: 'Track Sprints, Hosting Subscriptions, Subcontractors & Deployment Handover Gates',
      metric: '0 Unpaid Code Releases',
      metricSub: '100% Final Invoices Settled Before Repo Transfer',
      challenge:
        'Software teams frequently release production deployments before the final 20% invoice is paid, leaving substantial sums tied up in protracted client disputes.',
      solution:
        'DASA EXPENCES ties deliverable releases to the Handover Verification Gate. Phase 1 (50% advance) is verified before sprint kickoff, and production credentials are only released after final balance clearance.',
      features: [
        'Milestone-based agile billing schedules (Sprint 1, Sprint 2, Release)',
        'Server and API hosting cost tracking linked directly to project ledger',
        'Subcontractor developer payouts categorized by project budget',
        'Signed Handover Certificates with authorized digital PIN verification',
      ],
      badgeColor: '#2563eb',
    },
    {
      id: 'agencies',
      label: 'Creative Agencies',
      title: 'Digital & Creative Agencies',
      icon: <Palette size={20} />,
      tagline: 'Control Media Budgets, Talent Fees, Revisions & High-Res Asset Release',
      metric: '100% Ad-Spend Isolated',
      metricSub: 'Separates Media Capital from Creative Net Margins',
      challenge:
        'Agencies suffer scope creep, unbilled change requests, and clients transferring combined retainers and ad-spends into varying accounts.',
      solution:
        'Enforce clear quotation revisions for creative scope changes. Record multi-method advance payments for paid media budgets, and safeguard high-resolution design assets until invoice clearance.',
      features: [
        'Change order tracking for approved additional creative revisions',
        'Advance split receipts separating ad-spend capital from agency fees',
        'Client portal for viewing approved briefs, invoices, and payment receipts',
        'Expense ledger for freelance voiceover artists, photographers, and studios',
      ],
      badgeColor: '#059669',
    },
    {
      id: 'contractors',
      label: 'Civil Contractors',
      title: 'Civil Contractors & Engineering Firms',
      icon: <HardHat size={20} />,
      tagline: 'Material Advances, Mixed Cash/Bank Splits, Site Expenses & Retention Money',
      metric: 'Full Cash & Bank Sync',
      metricSub: 'Petty Cash + Bank Wires in One Journal',
      challenge:
        'Contracting businesses handle substantial physical cash advances, supervisor petty cash, and retention money held back until structural inspection.',
      solution:
        'Maintain separate ledgers for site cash drawers and corporate bank accounts. Record mixed cash and wire receipts without accounting discrepancy, and track completion certificates systematically.',
      features: [
        'Multi-method cash and bank transfer split receipts in one entry',
        'On-site petty cash disbursements and vendor material bills with receipts',
        'Retention money milestone tracking with completion due dates',
        'Formal completion checklist and signed handover protocols',
      ],
      badgeColor: '#d97706',
    },
    {
      id: 'consultancies',
      label: 'Consultancies',
      title: 'Management & Financial Consultancies',
      icon: <Briefcase size={20} />,
      tagline: 'Retainers, Partner Disbursements, Travel Expenses & Audit-Ready Trails',
      metric: 'Audit-Grade Ledger',
      metricSub: 'Double-Entry Reversal Compliance',
      challenge:
        'Advisory firms require airtight audit trails for client expenses, multi-entity billing, and compliance with statutory tax requirements.',
      solution:
        'Generate branded formal retainer quotation letters, track consultant travel expenses against project pools, and export audit-ready financial statements in one click.',
      features: [
        'Formal letter generation for proposals and payment requests',
        'Consultant per-diem and travel expense tracking with receipt upload',
        'Strict role-based permissions for auditors, partners, and clients',
        'Exportable cashflow and profitability reports for annual reviews',
      ],
      badgeColor: '#7c3aed',
    },
    {
      id: 'startups',
      label: 'Startups',
      title: 'Startups & Service Ventures',
      icon: <Rocket size={20} />,
      tagline: 'Eliminate Revenue Leakage, Preserve Runway & Scale Operations',
      metric: 'Zero Unaccounted Cash',
      metricSub: 'Replaces Disconnected Spreadsheets',
      challenge:
        'Early-stage founders lack time to reconcile disconnected spreadsheets, leading to lost invoices and uncollected initial advance payments.',
      solution:
        'All-in-one financial visibility that tells you exactly how much money is unspent, what client invoices are overdue, and your real liquid bank balance.',
      features: [
        'Fast onboarding and automated quotation-to-invoice flows',
        'Instant WhatsApp notifications and payment reminder generation',
        'Clear difference between cash collected, unspent project funds, and net profit',
        'Affordable SaaS pricing that scales as your project roster expands',
      ],
      badgeColor: '#0891b2',
    },
  ];

  const current = industries.find((i) => i.id === activeTab) || industries[0];

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>Industry-Tailored FinOps</span>
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
              Built for How Project-Based Businesses{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Really Operate
              </span>
            </h1>
            
            <p style={{ fontSize: 16, color: '#71717a', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
              Whether you deliver custom software, architectural blueprints, advertising campaigns, or advisory reports —
              DASA EXPENCES aligns your milestones, cash, and handovers.
            </p>
          </div>

          {/* Trendy Pill Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 40,
            }}
          >
            {industries.map((ind) => {
              const active = ind.id === activeTab;
              return (
                <button
                  key={ind.id}
                  onClick={() => setActiveTab(ind.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: active ? 800 : 600,
                    color: active ? '#ffffff' : '#475569',
                    background: active
                      ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                      : 'rgba(255, 255, 255, 0.85)',
                    border: `1px solid ${active ? '#2563eb' : 'rgba(226, 232, 240, 0.8)'}`,
                    boxShadow: active
                      ? '0 8px 20px -3px rgba(37, 99, 235, 0.35)'
                      : '0 2px 6px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {ind.icon}
                  <span>{ind.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Industry Showcase Bento Card */}
          <div
            className="bento-card"
            style={{
              padding: '44px 40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 48,
              alignItems: 'center',
            }}
          >
            {/* Left Column: Solution Story */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                  }}
                >
                  {current.icon}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  SECTOR ARCHITECTURE
                </span>
              </div>

              <h2 style={{ fontSize: 26, fontWeight: 900, color: '#09090b', letterSpacing: '-0.02em', marginBottom: 8 }}>
                {current.title}
              </h2>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', marginBottom: 20 }}>
                {current.tagline}
              </div>

              {/* Contrast Narrative: The Friction vs The Solution */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                <div
                  style={{
                    background: 'rgba(254, 242, 242, 0.6)',
                    border: '1px solid #fecaca',
                    borderRadius: 12,
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#b91c1c', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
                    THE FINANCIAL RISK
                  </div>
                  <div style={{ fontSize: 13, color: '#450a0a', lineHeight: 1.6 }}>
                    {current.challenge}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(240, 253, 244, 0.7)',
                    border: '1px solid #bbf7d0',
                    borderRadius: 12,
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#15803d', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
                    DASA EXPENCES SOLUTION
                  </div>
                  <div style={{ fontSize: 13, color: '#052e16', lineHeight: 1.6 }}>
                    {current.solution}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setIndustryTarget(current.title);
                    setDemoModalOpen(true);
                  }}
                  className="btn-trendy-primary"
                >
                  <span>Request {current.label} Demo</span>
                  <ArrowRight size={14} />
                </button>

                <Link to="/product-tour" className="btn-trendy-secondary">
                  <span>Explore in Tour</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Key Capabilities Bento Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Highlight Metric Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                  borderRadius: 16,
                  padding: '24px 28px',
                  color: '#ffffff',
                  boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.35)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  VERIFIED OUTCOME
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {current.metric}
                </div>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
                  {current.metricSub}
                </div>
              </div>

              {/* Capabilities checklist */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  padding: '24px 28px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: '#09090b', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>
                  KEY CAPABILITIES INCLUDED:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {current.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <CheckCircle2 size={15} />
                      </div>
                      <span style={{ fontSize: 13, color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom All Sectors Mini Grid */}
          <div style={{ marginTop: 60 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#09090b' }}>
                Every Sector Benefits from Precision Project Accounting
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {industries.map((ind) => (
                <div
                  key={ind.id}
                  onClick={() => setActiveTab(ind.id)}
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '20px 22px',
                    borderRadius: 14,
                    border: ind.id === activeTab ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ color: ind.id === activeTab ? '#2563eb' : '#64748b' }}>{ind.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#09090b' }}>{ind.label}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#71717a', lineHeight: 1.5 }}>
                    {ind.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DemoRequestModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialFeature={industryTarget}
      />
    </MarketingLayout>
  );
}
