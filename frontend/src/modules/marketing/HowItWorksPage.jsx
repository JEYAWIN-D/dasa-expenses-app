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
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  FileCheck,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';

export default function HowItWorksPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Quotation Drafting & Client Approval',
      desc: 'Create an itemized quote with custom milestones, GST, and terms. Track revisions and negotiations. Once the client approves, convert it into an active project with one click.',
      icon: <FileSpreadsheet size={22} color="#2563eb" />,
      detail: 'Includes digital signature authorization PIN and branded PDF generation.',
      category: 'Sales Initiation',
      tag: 'Rev 0 → Rev 1 Audit Trail',
      metrics: '1-Click Project Conversion',
    },
    {
      num: '02',
      title: 'Project Initialization & Milestone Setup',
      desc: 'The project receives a unique enterprise code (e.g. PRJ-2026-0101). Milestones are configured with percentage triggers (e.g. 50% advance, 30% development, 20% handover).',
      icon: <FolderKanban size={22} color="#059669" />,
      detail: 'Assign managers, staff engineers, set deadlines, and configure budgets.',
      category: 'Project Governance',
      tag: '100% Math Verification',
      metrics: 'PRJ Code Auto-Generated',
    },
    {
      num: '03',
      title: 'Advance Split Payment Collection',
      desc: 'Record the client’s advance payment using split methods (e.g. Cash ₹9,000 + GPay ₹1,000 + Bank ₹1,200). Generates an official Advance Receipt Acknowledgement letter.',
      icon: <Receipt size={22} color="#0891b2" />,
      detail: 'Funds are credited to respective accounts without double counting.',
      category: 'Fintech Engine',
      tag: 'Multi-Method Balancing',
      metrics: 'Zero Discrepancy Receipts',
    },
    {
      num: '04',
      title: 'Project Expense Tracking vs Budget',
      desc: 'Log expenses incurred during development (cloud servers, materials, vendor contracts, travel). Expenses deduct from available project cash, never from client receivables.',
      icon: <Wallet size={22} color="#db2777" />,
      detail: 'Staff submit bills, managers approve, and profitability recalculates live.',
      category: 'Cost Control',
      tag: 'Direct P&L Impact',
      metrics: 'Live Margin Recalculation',
    },
    {
      num: '05',
      title: 'Milestone Completion & Invoicing',
      desc: 'As each delivery milestone is satisfied, trigger milestone invoices, send payment reminders, and record progress payments until the final phase is reached.',
      icon: <Milestone size={22} color="#d97706" />,
      detail: 'Clients receive itemized phase invoices matching original quote terms.',
      category: 'Revenue Milestones',
      tag: 'Phased Billing Engine',
      metrics: 'Automated Reminders',
    },
    {
      num: '06',
      title: 'Reconciliation & Handover Verification Gate',
      desc: 'Before code repositories, keys, or final deliverables are handed over, the Handover Gate checks: Are all change orders billed? Are all payments cleared? Is client balance zero?',
      icon: <ShieldAlert size={22} color="#dc2626" />,
      detail: 'Blocks premature handover. Issues final Handover Certificate upon full clearance.',
      category: 'Delivery Security',
      tag: 'Zero Unpaid Deliveries',
      metrics: 'Digitally Sealed Certificate',
    },
  ];

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>The End-to-End Financial Lifecycle</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 900,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#09090b',
                maxWidth: 780,
                margin: '0 auto 16px',
              }}
            >
              How DASA EXPENCES Protects{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Every Rupee
              </span>
            </h1>

            <p style={{ fontSize: 16, color: '#71717a', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
              From initial quotation estimate through advance split receipts, milestone billing, and final handover signoff —
              experience end-to-end financial discipline.
            </p>
          </div>

          {/* Connected Step Cards Flow */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
            {steps.map((st, i) => (
              <div
                key={st.num}
                className="bento-card"
                style={{
                  padding: '28px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  flexWrap: 'wrap',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Step Pill & Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 200 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 18,
                      color: '#2563eb',
                      flexShrink: 0,
                    }}
                  >
                    {st.num}
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#64748b',
                      }}
                    >
                      {st.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      {st.icon}
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#09090b' }}>Step {i + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: '1 1 340px' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#09090b', marginBottom: 6, letterSpacing: '-0.01em' }}>
                    {st.title}
                  </h2>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 10 }}>
                    {st.desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#059669',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        padding: '4px 10px',
                        borderRadius: 999,
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>{st.detail}</span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        padding: '3px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {st.metrics}
                    </span>
                  </div>
                </div>

                {/* Micro Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 100 }}>
                  <Link
                    to="/product-tour"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#2563eb',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Tour Screen</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Box */}
          <div
            style={{
              marginTop: 50,
              backgroundColor: '#090d16',
              borderRadius: 24,
              padding: '44px 36px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.35)',
              color: '#ffffff',
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
              Experience the Full FinOps Lifecycle Live
            </h3>
            <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 520, margin: '0 auto 24px' }}>
              Book an interactive walkthrough with our fintech architects at DASA TECH.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setDemoModalOpen(true)}
                className="btn-trendy-primary"
                style={{ padding: '11px 26px', fontSize: 13 }}
              >
                <span>Request a Free Demo</span>
                <ArrowRight size={14} />
              </button>
              <Link
                to="/product-tour"
                className="btn-trendy-secondary"
                style={{
                  padding: '11px 22px',
                  fontSize: 13,
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.18)',
                }}
              >
                <span>Interactive 10-Screen Tour</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      <DemoRequestModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </MarketingLayout>
  );
}
