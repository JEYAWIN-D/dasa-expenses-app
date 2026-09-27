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
  FileCheck,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Lock,
  Building2,
  Users,
  Briefcase,
  Play,
  Clock,
  Coins,
  Check,
  Zap,
  MessageSquare,
  Activity,
  CreditCard,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Split payment interactive state
  const [splitAmounts, setSplitAmounts] = useState({
    cash: 9000,
    gpay: 1000,
    bank: 1200,
  });

  const totalSplit = splitAmounts.cash + splitAmounts.gpay + splitAmounts.bank;

  // Handover gate interactive checklist state
  const [gateChecks, setGateChecks] = useState({
    scopeReconciled: true,
    milestonesSettled: true,
    bankCleared: true,
    expensesDocumented: true,
    clientBalanceZero: false,
    managerSignoff: false,
  });

  const gateReady = Object.values(gateChecks).every(Boolean);

  return (
    <MarketingLayout>
      {/* 1. HERO SECTION (2026 MESH GRADIENT & AMBIENT GLOW) */}
      <section
        className="mesh-bg grid-bg-subtle"
        style={{
          position: 'relative',
          padding: '80px 24px 100px',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        {/* Ambient Glowing Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 700,
            height: 350,
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 80%)',
            filter: 'blur(70px)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          
          {/* Top Pill Badge */}
          <div style={{ display: 'inline-flex', marginBottom: 20 }}>
            <span className="pill-badge">
              <Sparkles size={13} color="#2563eb" />
              <span>Next-Gen Project Finance & Handover SaaS</span>
              <span style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)', color: '#fff', fontSize: 9, padding: '2px 7px', borderRadius: 999, fontWeight: 800 }}>
                V1.0
              </span>
            </span>
          </div>

          {/* Master Headline */}
          <h1
            style={{
              fontSize: 'clamp(34px, 5.5vw, 62px)',
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: '-0.04em',
              color: '#09090b',
              maxWidth: 980,
              margin: '0 auto 20px',
            }}
          >
            From Quotation to Project Handover.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 50%, #0d9488 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Every Rupee Accounted For.
            </span>
          </h1>

          {/* Supporting Text */}
          <p
            style={{
              fontSize: 'clamp(16px, 2.2vw, 19px)',
              lineHeight: 1.65,
              color: '#52525b',
              maxWidth: 780,
              margin: '0 auto 36px',
              fontWeight: 500,
            }}
          >
            Manage quotations, collect advances, track split payments, control project expenses,
            monitor cash and bank balances, and verify final settlements — all from one powerful SaaS platform.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              flexWrap: 'wrap',
              marginBottom: 36,
            }}
          >
            <button
              onClick={() => setDemoModalOpen(true)}
              className="btn-trendy-primary"
              style={{ padding: '14px 28px', fontSize: 15 }}
            >
              <span>Request a Free Demo</span>
              <ArrowRight size={16} />
            </button>

            <Link
              to="/product-tour"
              className="btn-trendy-secondary"
              style={{ padding: '14px 24px', fontSize: 15 }}
            >
              <Play size={15} style={{ fill: '#2563eb', color: '#2563eb' }} />
              <span>Interactive 10-Screen Tour</span>
            </Link>

            <Link
              to="/login"
              style={{
                padding: '14px 20px',
                borderRadius: 999,
                color: '#475569',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Launch Live App →</span>
            </Link>
          </div>

          {/* DASA TECH Ownership Chip */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#71717a' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>
              Developed and Owned by{' '}
              <a href="https://dasatech.in" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>
                DASA TECH
              </a>{' '}
              • WhatsApp: <strong>+91 76399 30148</strong>
            </span>
          </div>

          {/* 2. TRENDY PRODUCT DASHBOARD PREVIEW CONTAINER */}
          <div
            style={{
              marginTop: 54,
              position: 'relative',
              maxWidth: 1100,
              margin: '54px auto 0',
            }}
          >
            {/* Floating Live Badges over Preview */}
            <div
              className="animate-float"
              style={{
                position: 'absolute',
                top: -18,
                left: 20,
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                fontWeight: 800,
                color: '#065f46',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>Advance Split Receipt: Cash ₹9k + GPay ₹1k + Bank ₹1.2k</span>
            </div>

            <div
              className="animate-float"
              style={{
                position: 'absolute',
                top: 40,
                right: -10,
                zIndex: 10,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(16px)',
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                fontWeight: 800,
                color: '#38bdf8',
              }}
            >
              <Lock size={12} color="#38bdf8" />
              <span>Handover Gate: Strict Settlement Required</span>
            </div>

            {/* Dark Titanium Frame */}
            <div
              style={{
                background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
                borderRadius: 24,
                padding: '20px 24px',
                boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                textAlign: 'left',
                color: '#ffffff',
                overflow: 'hidden',
              }}
            >
              {/* Mock Browser Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 14,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: 20,
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ marginLeft: 10, color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    app.dasaexpences.com/dashboard/executive
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ background: 'rgba(37, 99, 235, 0.25)', color: '#60a5fa', border: '1px solid rgba(37, 99, 235, 0.4)', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800 }}>
                    MULTI-TENANT SAAS
                  </span>
                  <span style={{ color: '#34d399', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399' }} />
                    Live Ledger Balanced
                  </span>
                </div>
              </div>

              {/* KPI Chips Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>TOTAL CONTRACT PIPELINE</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>₹37,80,000</div>
                  <div style={{ fontSize: 11, color: '#38bdf8', marginTop: 4 }}>5 active client contracts</div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>ADVANCE & PROGRESS RECEIVED</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#34d399', marginTop: 4 }}>₹21,45,200</div>
                  <div style={{ fontSize: 11, color: '#a7f3d0', marginTop: 4 }}>56.7% collected into accounts</div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>PROJECT EXPENSES INCURRED</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#f87171', marginTop: 4 }}>₹8,92,400</div>
                  <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 4 }}>Deducts pool, NOT client dues</div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>LIQUID CASH & BANK BALANCES</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#818cf8', marginTop: 4 }}>₹12,52,800</div>
                  <div style={{ fontSize: 11, color: '#c7d2fe', marginTop: 4 }}>HDFC + ICICI + GPay + Cash</div>
                </div>
              </div>

              {/* Live Project Card row */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: 14,
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ backgroundColor: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                      PROJECT #PRJ-2026-0101
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>Enterprise Cloud Migration (TechNova)</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    Contract: ₹14,50,000 • Milestone 1: <strong>Paid</strong> • Milestone 2: <strong>In Progress</strong> • Handover: <strong>Protected</strong>
                  </div>
                </div>

                <Link
                  to="/product-tour"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>Explore in 10-Screen Tour</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION BAR */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e4e4e7', padding: '28px 24px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#2563eb', letterSpacing: '-0.03em' }}>100% Tracking</div>
            <div style={{ fontSize: 13, color: '#09090b', fontWeight: 700 }}>Advance Receipts Verified</div>
            <div style={{ fontSize: 12, color: '#71717a' }}>No unrecorded initial tokens</div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#10b981', letterSpacing: '-0.03em' }}>0% Leakage</div>
            <div style={{ fontSize: 13, color: '#09090b', fontWeight: 700 }}>Multi-Method Split Integrity</div>
            <div style={{ fontSize: 12, color: '#71717a' }}>Cash, GPay, Bank mapped accurately</div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#7c3aed', letterSpacing: '-0.03em' }}>Strict Gate</div>
            <div style={{ fontSize: 13, color: '#09090b', fontWeight: 700 }}>Handover Verification</div>
            <div style={{ fontSize: 12, color: '#71717a' }}>Deliverables blocked till payments clear</div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#0891b2', letterSpacing: '-0.03em' }}>Multi-Tenant</div>
            <div style={{ fontSize: 13, color: '#09090b', fontWeight: 700 }}>Isolated SaaS Architecture</div>
            <div style={{ fontSize: 12, color: '#71717a' }}>PostgreSQL & Role-Based Security</div>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID ARCHITECTURE (2026 MODERN UI STANDARD) */}
      <section style={{ padding: '90px 24px', backgroundColor: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span className="pill-badge" style={{ marginBottom: 12 }}>
              <Layers size={13} />
              <span>Core FinOps Modules</span>
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#09090b' }}>
              Engineered to Protect Every Single Rupee
            </h2>
            <p style={{ fontSize: 16, color: '#71717a', maxWidth: 640, margin: '12px auto 0' }}>
              Discover the interconnected fintech tools designed specifically for project-based businesses.
            </p>
          </div>

          {/* Bento Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 20,
            }}
          >
            {/* Bento 1: Split Payment Engine (Span 7 cols) */}
            <div
              className="bento-card"
              style={{
                gridColumn: 'span 7',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Receipt size={20} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      FINTECH BREAKTHROUGH
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: 999 }}>
                    Auto-Balanced
                  </span>
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#09090b', letterSpacing: '-0.02em', marginBottom: 8 }}>
                  Multi-Method Split Advance Receipts
                </h3>
                <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.6, marginBottom: 20 }}>
                  A client pays via Cash, scans a GPay QR code for part of the sum, and wires the rest via bank transfer.
                  DASA EXPENCES validates the total and routes each slice to its respective account ledger.
                </p>

                {/* Interactive Sliders */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: 14, border: '1px solid #e4e4e7', padding: '18px 20px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    <span>Cash in Hand (Office Vault)</span>
                    <span style={{ color: '#2563eb' }}>₹{splitAmounts.cash.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="500"
                    value={splitAmounts.cash}
                    onChange={(e) => setSplitAmounts({ ...splitAmounts, cash: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#2563eb', marginBottom: 12 }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    <span>Google Pay / UPI Business</span>
                    <span style={{ color: '#059669' }}>₹{splitAmounts.gpay.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="500"
                    value={splitAmounts.gpay}
                    onChange={(e) => setSplitAmounts({ ...splitAmounts, gpay: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#059669', marginBottom: 12 }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    <span>Bank Transfer (HDFC Current A/C)</span>
                    <span style={{ color: '#7c3aed' }}>₹{splitAmounts.bank.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="200"
                    value={splitAmounts.bank}
                    onChange={(e) => setSplitAmounts({ ...splitAmounts, bank: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#7c3aed' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e4e4e7', paddingTop: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#71717a' }}>TOTAL CALCULATED RECEIPT:</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#2563eb' }}>₹{totalSplit.toLocaleString()}</div>
                </div>
                <Link to="/product-tour" className="btn-trendy-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                  <span>Test in Tour</span>
                </Link>
              </div>
            </div>

            {/* Bento 2: Handover Verification Gatekeeper (Span 5 cols) */}
            <div
              className="bento-card"
              style={{
                gridColumn: 'span 5',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={20} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    SETTLEMENT DEFENSE
                  </span>
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#09090b', letterSpacing: '-0.02em', marginBottom: 8 }}>
                  Handover Verification Gate
                </h3>
                <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6, marginBottom: 20 }}>
                  Blocks code repository transfer, asset keys, or completion certificates until every single invoice is settled.
                </p>

                {/* Interactive Mini Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {[
                    { key: 'scopeReconciled', label: 'Quotation & Change Orders Reconciled' },
                    { key: 'milestonesSettled', label: 'All Phase Milestones Invoiced' },
                    { key: 'bankCleared', label: 'All Cheques & UTRs Cleared in Bank' },
                    { key: 'expensesDocumented', label: 'Subcontractor Expenses Settled' },
                    { key: 'clientBalanceZero', label: 'Customer Balance is Exactly ₹0' },
                    { key: 'managerSignoff', label: 'Finance Manager PIN Authorized' },
                  ].map((chk) => (
                    <label
                      key={chk.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        color: gateChecks[chk.key] ? '#065f46' : '#52525b',
                        backgroundColor: gateChecks[chk.key] ? '#ecfdf5' : '#ffffff',
                        padding: '7px 10px',
                        borderRadius: 8,
                        border: `1px solid ${gateChecks[chk.key] ? '#a7f3d0' : '#e4e4e7'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={gateChecks[chk.key]}
                        onChange={(e) => setGateChecks({ ...gateChecks, [chk.key]: e.target.checked })}
                        style={{ accentColor: '#059669' }}
                      />
                      <span>{chk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  backgroundColor: gateReady ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${gateReady ? '#a7f3d0' : '#fecaca'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 800, color: gateReady ? '#065f46' : '#991b1b' }}>
                  {gateReady ? '✔ READY TO HAND OVER' : '🔒 RELEASE LOCKED'}
                </span>
                <span style={{ fontSize: 11, color: gateReady ? '#047857' : '#b91c1c' }}>
                  {gateReady ? 'Certificate Unlocked' : 'Pending Verification'}
                </span>
              </div>
            </div>

            {/* Bento 3: Quotations & Revisions (Span 4 cols) */}
            <div className="bento-card" style={{ gridColumn: 'span 4', padding: '30px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <FileSpreadsheet size={18} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#09090b', marginBottom: 6 }}>
                Quotation Builder & Versioning
              </h3>
              <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, marginBottom: 14 }}>
                Itemized estimates with GST, line-item discounts, and terms. Preserve complete negotiation history across Rev 0, 1, 2. Convert approved quotes into active projects with 1 click.
              </p>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>
                Change Orders • Digital Seals • PDF Engine
              </div>
            </div>

            {/* Bento 4: Project Expense Ledger (Span 4 cols) */}
            <div className="bento-card" style={{ gridColumn: 'span 4', padding: '30px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Wallet size={18} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#09090b', marginBottom: 6 }}>
                Project Expense Ledger
              </h3>
              <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, marginBottom: 14 }}>
                Track cloud hosting, material bills, and team reimbursements per project. Expenses deduct from available project cash pool, NOT client contract receivables.
              </p>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#db2777' }}>
                Bill Receipts • Approval Hierarchy • Margin Tracking
              </div>
            </div>

            {/* Bento 5: Cash, Bank & UPI Balancing (Span 4 cols) */}
            <div className="bento-card" style={{ gridColumn: 'span 4', padding: '30px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Landmark size={18} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#09090b', marginBottom: 6 }}>
                Cash, Bank & UPI Management
              </h3>
              <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, marginBottom: 14 }}>
                Separate accounts for Cash in Hand, Google Pay, and Bank Current Accounts. Every UPI entry maps to its underlying bank account, completely eliminating double counting.
              </p>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed' }}>
                Internal Fund Transfers • Zero Double Count
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HIGH-CONVERTING BOTTOM CALL TO ACTION */}
      <section
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #1e3a8a 50%, #0369a1 100%)',
          color: '#ffffff',
          padding: '90px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.18, marginBottom: 20 }}>
            Never Release a Project Deliverable Unpaid Again.
          </h2>
          <p style={{ fontSize: 17, color: '#e0f2fe', lineHeight: 1.65, maxWidth: 640, margin: '0 auto 36px' }}>
            Transform how your agency, software house, or engineering firm accounts for project finances.
            Start with a personalized walkthrough with DASA TECH.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => setDemoModalOpen(true)}
              style={{
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                padding: '14px 32px',
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
              }}
            >
              Request a Free Live Demo
            </button>

            <a
              href="https://wa.me/917639930148?text=Hello%20DASA%20TECH%2C%20I%20am%20interested%20in%20DASA%20EXPENCES%20and%20would%20like%20to%20request%20a%20demo."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#25D366',
                color: '#ffffff',
                padding: '14px 24px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <MessageSquare size={16} />
              <span>WhatsApp: +91 76399 30148</span>
            </a>
          </div>

          <div style={{ marginTop: 32, fontSize: 12, color: '#93c5fd' }}>
            Developed & Owned by DASA TECH (https://dasatech.in) • Erode, Tamil Nadu, India
          </div>
        </div>
      </section>

      {/* Global Demo Request Modal */}
      <DemoRequestModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </MarketingLayout>
  );
}
