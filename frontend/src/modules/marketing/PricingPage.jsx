import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import { DemoRequestModal } from '../../components/marketing/DemoRequestModal.jsx';
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  Building2,
  Lock,
  FileCheck2,
  CreditCard,
  Headphones,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
  Receipt,
  Wallet,
  Landmark,
  BadgeCheck,
} from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [showFullComparison, setShowFullComparison] = useState(false);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      badge: 'AFFORDABLE ENTRY',
      tagline: 'For boutique agencies, solo contractors & emerging freelancers',
      pricing: billingCycle === 'annual' ? '₹249' : '₹299',
      period: '/ month',
      billedText: billingCycle === 'annual' ? 'Billed annually (₹2,988/yr) • Save 17%' : 'Billed monthly • Cancel anytime',
      savingsPill: 'BUDGET FRIENDLY',
      isPopular: false,
      color: '#059669',
      features: [
        'Up to 5 Active Client Projects',
        '3 Team Members & Role Permissions',
        'Quotation Builder & Revision Tracking',
        'Advance Split Payment Receipts (Cash + UPI)',
        'Project Expense Ledger & Cost Deduction',
        '1 Main Bank Account + Physical Cash Vault',
        'Standard Email & WhatsApp Support',
        'PDF Invoices & Receipt Exports',
      ],
      ctaText: 'Start Free 14-Day Trial',
      ctaLink: '/start-trial',
    },
    {
      id: 'growth',
      name: 'Growth',
      badge: 'BEST VALUE • MOST POPULAR',
      tagline: 'For expanding software houses, digital agencies & consultancies',
      pricing: billingCycle === 'annual' ? '₹599' : '₹799',
      period: '/ month',
      billedText: billingCycle === 'annual' ? 'Billed annually (₹7,188/yr) • Save 25%' : 'Billed monthly • Flexible cancellation',
      savingsPill: 'SAVE 25% + 2 MONTHS FREE',
      isPopular: true,
      color: '#c2410c',
      features: [
        'Up to 25 Active Client Projects',
        '10 Team Members (Finance, PM, Staff RBAC)',
        'Unlimited Quotations & Scope Change Orders',
        'Custom Milestone Schedules (% & Fixed Amount)',
        'Multi-Method Split Receipts (Cash + GPay + Bank)',
        'Document Studio (Official Letters, Receipts & Certs)',
        'Up to 5 Bank & UPI Financial Accounts',
        'Handover Verification Gatekeeper & PIN Signoff',
        'Priority WhatsApp & Phone Support from DASA TECH',
      ],
      ctaText: 'Start Free 14-Day Trial',
      ctaLink: '/start-trial',
    },
    {
      id: 'business',
      name: 'Business Pro',
      badge: 'ADVANCED GOVERNANCE',
      tagline: 'For established multi-team engineering firms & contractors',
      pricing: billingCycle === 'annual' ? '₹1,299' : '₹1,599',
      period: '/ month',
      billedText: billingCycle === 'annual' ? 'Billed annually (₹15,588/yr) • Full SLA' : 'Billed monthly • Standard terms',
      savingsPill: 'HIGH PERFORMANCE',
      isPopular: false,
      color: '#7c1228',
      features: [
        'Up to 100 Active Client Projects',
        '30 Team Members & Custom Role Definitions',
        'Multi-Level Expense Approval Workflows',
        'Unlimited Bank, UPI & Cash Vault Accounts',
        'Audit-Grade Double-Entry Journal Reversals',
        'Customer Portal for Invoices & Receipts',
        'Company-Wide Profitability & Cashflow Aging',
        'Custom Letterhead & Authorized Digital Seals',
        'Dedicated Technical Account Manager',
      ],
      ctaText: 'Choose Business Pro',
      ctaLink: '/start-trial',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      badge: 'DEDICATED DEPLOYMENT',
      tagline: 'Custom SaaS, private VPC cloud or dedicated on-premise installation',
      pricing: 'Custom',
      period: '',
      billedText: 'Tailored commercial terms, custom SLAs & dedicated setup',
      savingsPill: 'MAXIMUM ISOLATION',
      isPopular: false,
      color: '#1e293b',
      features: [
        'Unlimited Projects & Custom User Tiers',
        'Dedicated On-Premise or Private Cloud VPC',
        'Custom Accounting / Tally Prime / ERP Integrations',
        'Single Sign-On (SSO) & Advanced Security Policies',
        '24/7 Hotline Support & Guaranteed Response SLA',
        'Dedicated Database Isolation & Assisted Migration',
        'Full Training for Executive & Finance Teams',
      ],
      ctaText: 'Contact DASA TECH',
      isCustom: true,
    },
  ];

  const comparisonCategories = [
    {
      title: 'Quotation & Scope Governance',
      features: [
        { name: 'Active Client Projects', starter: 'Up to 5', growth: 'Up to 25', business: 'Up to 100', enterprise: 'Unlimited' },
        { name: 'Quotation Builder with Revisions', starter: true, growth: true, business: true, enterprise: true },
        { name: 'Scope Change Orders & Addendums', starter: 'Basic', growth: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'GST & SAC Automated Computation', starter: true, growth: true, business: true, enterprise: true },
        { name: 'Branded PDF Proposals & Expiry Lock', starter: true, growth: true, business: true, enterprise: true },
      ],
    },
    {
      title: 'Advance Split Payments & Multi-Account Banking',
      features: [
        { name: 'Multi-Method Advance Split Receipts', starter: 'Cash + UPI', growth: 'Cash + UPI + Bank Wire', business: 'All Payment Modes', enterprise: 'All + Custom Gateways' },
        { name: 'Physical Cash Vault Register', starter: '1 Vault', growth: 'Up to 2 Vaults', business: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Bank & UPI Virtual Accounts', starter: '1 Bank Account', growth: 'Up to 5 Accounts', business: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Zero Double-Counting Atomic Allocation', starter: true, growth: true, business: true, enterprise: true },
        { name: 'Direct RTGS / NEFT Reconciliation', starter: false, growth: true, business: true, enterprise: true },
      ],
    },
    {
      title: 'Milestones & Project Expense Control',
      features: [
        { name: 'Phased Milestone Schedule Builder', starter: 'Standard (3 Phases)', growth: 'Custom (% or Fixed)', business: 'Custom Multi-Stage', enterprise: 'Custom Enterprise' },
        { name: 'Internal Project Expense Ledger', starter: true, growth: true, business: true, enterprise: true },
        { name: 'Ledger Isolation (Deducts Pool, Not Dues)', starter: true, growth: true, business: true, enterprise: true },
        { name: 'Manager Expense Approval Workflow', starter: false, growth: '1-Step', business: 'Multi-Level', enterprise: 'Custom Matrix' },
        { name: 'Vendor Bill & Receipt Attachments', starter: 'Up to 50MB', growth: 'Up to 5GB', business: 'Up to 50GB', enterprise: 'Unlimited' },
      ],
    },
    {
      title: 'Handover Verification Gate & Security',
      features: [
        { name: 'Handover Verification Gatekeeper', starter: 'Basic Checklist', growth: 'Strict 6-Point Gate', business: 'Custom Gate Policies', enterprise: 'Compliance Gated' },
        { name: 'Two-Factor PIN Digital Signatures', starter: false, growth: true, business: true, enterprise: true },
        { name: 'Cryptographic Handover Certificate', starter: false, growth: true, business: true, enterprise: true },
        { name: 'Multi-Tenant Data Isolation', starter: true, growth: true, business: true, enterprise: 'Dedicated Database' },
        { name: 'Audit-Grade Double-Entry Reversals', starter: false, growth: true, business: true, enterprise: true },
      ],
    },
    {
      title: 'Support & SLAs',
      features: [
        { name: 'Support Channels', starter: 'Email & WhatsApp', growth: 'Priority WhatsApp & Phone', business: 'Dedicated Account Lead', enterprise: '24/7 Dedicated Hotline' },
        { name: 'Response Time Guarantee', starter: '24 Hours', growth: '4 Hours', business: '1 Hour', enterprise: '15 Minutes SLA' },
        { name: 'Data Migration Assistance', starter: false, growth: 'Self-Serve Import', business: 'Assisted by Engineer', enterprise: 'Dedicated White-Glove' },
      ],
    },
  ];

  const faqs = [
    {
      q: 'Why are DASA EXPENCES plans so affordable compared to other ERPs?',
      a: 'We built DASA EXPENCES specifically for Indian software houses, digital agencies, and engineering contractors who do not want to spend lakhs on bloated enterprise ERPs. Our modern multi-tenant cloud architecture keeps hosting costs low, allowing us to pass the savings directly to you starting at just ₹249/month.',
    },
    {
      q: 'Is there a free trial? Do I need a credit card?',
      a: 'Yes! Every plan includes a 14-day fully featured free trial with complete access to Quotations, Split Payments, Milestone Tracking, and Handover Gates. No credit card or upfront deposit is required to start.',
    },
    {
      q: 'Are there any hidden setup fees or per-invoice transaction charges?',
      a: 'Zero hidden fees. You only pay the flat transparent monthly or annual subscription fee. There are no surprise per-quotation fees, no transaction commissions on advance collections, and no user onboarding penalties.',
    },
    {
      q: 'Do you issue valid GST invoices with Input Tax Credit (ITC)?',
      a: 'Yes, 100%. All subscription plans are billed with valid GST invoices showing our GSTIN (29ABCDE1234F1Z5) and your company GSTIN, allowing you to claim full 18% Input Tax Credit on your business expenses.',
    },
    {
      q: 'Can I upgrade or downgrade my plan as my team grows?',
      a: 'Absolutely. You can start on the Starter tier (₹249/mo) and upgrade to Growth or Business anytime with a single click. Unused days are prorated automatically toward your upgraded plan.',
    },
    {
      q: 'How does DASA TECH handle dedicated enterprise setups and on-premise hosting?',
      a: 'For multi-crore enterprises, government contractors, and security-conscious firms requiring isolated infrastructure, DASA TECH provides private AWS/GCP VPC deployments or dedicated on-premise installations with custom Tally/SAP ERP integrations.',
    },
  ];

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} color="#ea580c" />
                <span>Affordable, Transparent Indian MSME Pricing</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 50px)',
                fontWeight: 900,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#09090b',
                maxWidth: 820,
                margin: '0 auto 16px',
              }}
            >
              Enterprise-Grade Project Accounting.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #d97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Built for Every Budget.
              </span>
            </h1>

            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 640, margin: '0 auto 30px', lineHeight: 1.6 }}>
              Scale smoothly from solo engineering contractors to multi-crore software houses.
              Plans start at just <strong>₹249 / month</strong> with zero setup fees.
            </p>

            {/* Billing Toggle (Pill) */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                padding: '5px',
                borderRadius: 999,
                boxShadow: '0 4px 14px -2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '9px 22px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  backgroundColor: billingCycle === 'monthly' ? '#0f172a' : 'transparent',
                  color: billingCycle === 'monthly' ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: billingCycle === 'monthly' ? '0 4px 12px rgba(15, 23, 42, 0.2)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '9px 22px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  backgroundColor: billingCycle === 'annual' ? 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)' : 'transparent',
                  background: billingCycle === 'annual' ? 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)' : 'transparent',
                  color: billingCycle === 'annual' ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: billingCycle === 'annual' ? '0 4px 14px rgba(194, 65, 12, 0.35)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                <span>Annual Commitment</span>
                <span
                  style={{
                    backgroundColor: billingCycle === 'annual' ? 'rgba(255, 255, 255, 0.25)' : '#ecfdf5',
                    color: billingCycle === 'annual' ? '#ffffff' : '#059669',
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                  }}
                >
                  SAVE 25% + 2 MOS FREE
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid (Executive 4-Card Architecture) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: 22,
              alignItems: 'stretch',
              marginBottom: 44,
            }}
          >
            {plans.map((p) => (
              <div
                key={p.id}
                style={{
                  borderRadius: 18,
                  backgroundColor: '#ffffff',
                  padding: '34px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: p.isPopular ? '2px solid #ea580c' : '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: p.isPopular
                    ? '0 25px 50px -12px rgba(234, 88, 12, 0.22), 0 0 0 1px rgba(234, 88, 12, 0.2)'
                    : '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                  transform: p.isPopular ? 'translateY(-6px)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Popular Floating Badge */}
                {p.isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #d97706 100%)',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 900,
                      padding: '4px 16px',
                      borderRadius: 999,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      boxShadow: '0 4px 14px rgba(194, 65, 12, 0.4)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ★ MOST POPULAR • BEST VALUE
                  </div>
                )}

                {/* Top Badge */}
                <div style={{ marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      backgroundColor: p.isPopular ? '#fff7ed' : '#f8fafc',
                      color: p.isPopular ? '#c2410c' : '#475569',
                      border: `1px solid ${p.isPopular ? '#fed7aa' : '#e2e8f0'}`,
                      padding: '3px 10px',
                      borderRadius: 999,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {p.badge}
                  </span>
                </div>

                {/* Plan Title & Tagline */}
                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#09090b', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.5, minHeight: 40, margin: '0 0 20px' }}>
                  {p.tagline}
                </p>

                {/* Price Display */}
                <div style={{ paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em', color: p.isPopular ? '#c2410c' : '#09090b' }}>
                      {p.pricing}
                    </span>
                    <span style={{ fontSize: 14, color: '#71717a', fontWeight: 600 }}>
                      {p.period}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 4, fontWeight: 500 }}>
                    {p.billedText}
                  </div>
                </div>

                {/* CTA Action */}
                {p.isCustom ? (
                  <button
                    onClick={() => {
                      setSelectedPlan(p.name);
                      setDemoModalOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginBottom: 26,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <span>{p.ctaText}</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <Link
                    to={p.ctaLink}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 10,
                      border: p.isPopular ? 'none' : '1px solid #cbd5e1',
                      background: p.isPopular
                        ? 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)'
                        : '#ffffff',
                      color: p.isPopular ? '#ffffff' : '#0f172a',
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginBottom: 26,
                      boxShadow: p.isPopular ? '0 4px 14px rgba(194, 65, 12, 0.35)' : '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <span>{p.ctaText}</span>
                    <ArrowRight size={14} />
                  </Link>
                )}

                {/* Feature List Header */}
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 14 }}>
                  INCLUDED CAPABILITIES:
                </div>

                {/* Feature Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          backgroundColor: p.isPopular ? '#fff7ed' : '#f0fdf4',
                          border: `1px solid ${p.isPopular ? '#fed7aa' : '#bbf7d0'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <Check size={11} color={p.isPopular ? '#c2410c' : '#059669'} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Toggle Full Comparison Matrix */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <button
              onClick={() => setShowFullComparison(!showFullComparison)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 999,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: 13,
                fontWeight: 800,
                color: '#0f172a',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <span>{showFullComparison ? 'Hide Detailed Feature Matrix' : 'Compare All Plan Features Side-by-Side'}</span>
              {showFullComparison ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>

          {/* Detailed Side-by-Side Comparison Matrix */}
          {showFullComparison && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                marginBottom: 50,
              }}
            >
              <div style={{ padding: '24px 28px', backgroundColor: '#fafafa', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Detailed Capabilities & Plan Limits
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Complete transparent breakdown of quotas, multi-ledger features, and compliance governance.
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                      <th style={{ padding: '16px 24px', width: '36%', color: '#64748b', fontWeight: 800, fontSize: 12, textTransform: 'uppercase' }}>
                        Feature / Capability
                      </th>
                      <th style={{ padding: '16px 16px', textAlign: 'center', width: '16%', color: '#059669', fontWeight: 800 }}>
                        Starter<br /><span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>₹249/mo</span>
                      </th>
                      <th style={{ padding: '16px 16px', textAlign: 'center', width: '16%', color: '#c2410c', fontWeight: 800, backgroundColor: '#fffaf5' }}>
                        Growth<br /><span style={{ fontSize: 11, fontWeight: 500, color: '#c2410c' }}>₹599/mo (Popular)</span>
                      </th>
                      <th style={{ padding: '16px 16px', textAlign: 'center', width: '16%', color: '#7c1228', fontWeight: 800 }}>
                        Business Pro<br /><span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>₹1,299/mo</span>
                      </th>
                      <th style={{ padding: '16px 16px', textAlign: 'center', width: '16%', color: '#0f172a', fontWeight: 800 }}>
                        Enterprise<br /><span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>Custom</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonCategories.map((cat, catIdx) => (
                      <React.Fragment key={catIdx}>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <td colSpan={5} style={{ padding: '10px 24px', fontWeight: 900, fontSize: 12, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            {cat.title}
                          </td>
                        </tr>
                        {cat.features.map((feat, fIdx) => (
                          <tr key={fIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 24px', fontWeight: 600, color: '#334155' }}>
                              {feat.name}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: '#0f172a' }}>
                              {typeof feat.starter === 'boolean' ? (
                                feat.starter ? <Check size={16} color="#059669" style={{ margin: '0 auto' }} /> : <span style={{ color: '#cbd5e1' }}>—</span>
                              ) : feat.starter}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#c2410c', backgroundColor: '#fffaf5' }}>
                              {typeof feat.growth === 'boolean' ? (
                                feat.growth ? <Check size={16} color="#c2410c" style={{ margin: '0 auto' }} /> : <span style={{ color: '#cbd5e1' }}>—</span>
                              ) : feat.growth}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: '#0f172a' }}>
                              {typeof feat.business === 'boolean' ? (
                                feat.business ? <Check size={16} color="#059669" style={{ margin: '0 auto' }} /> : <span style={{ color: '#cbd5e1' }}>—</span>
                              ) : feat.business}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: '#0f172a', fontWeight: 700 }}>
                              {typeof feat.enterprise === 'boolean' ? (
                                feat.enterprise ? <Check size={16} color="#059669" style={{ margin: '0 auto' }} /> : <span style={{ color: '#cbd5e1' }}>—</span>
                              ) : feat.enterprise}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DASA TECH Direct Ownership & GST Assurance */}
          <div
            style={{
              padding: '24px 30px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #170e0a 0%, #22140e 50%, #150d09 100%)',
              border: '1px solid rgba(234, 88, 12, 0.35)',
              color: '#ffffff',
              marginBottom: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
              boxShadow: '0 15px 35px -10px rgba(0,0,0,0.25)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <ShieldCheck size={18} color="#fbbf24" />
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fdba74', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  DIRECT OWNERSHIP & 100% GST TAX COMPLIANCE
                </span>
              </div>
              <div style={{ fontSize: 14, color: '#e2e8f0', maxWidth: 700, lineHeight: 1.6 }}>
                Developed, hosted, and maintained by <strong>DASA TECH Software Solutions</strong> (Erode, Tamil Nadu).
                Every plan includes a valid 18% GST B2B invoice with Input Tax Credit (ITC) for your company books.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a
                href="https://wa.me/917639930148?text=Hello%20DASA%20TECH,%20I%20have%20a%20question%20about%20DASA%20EXPENCES%20pricing"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                }}
              >
                <span>Chat on WhatsApp</span>
              </a>
              <button
                onClick={() => setDemoModalOpen(true)}
                className="btn-trendy-primary"
                style={{ padding: '10px 20px', fontSize: 13 }}
              >
                <span>Request Custom Quote</span>
              </button>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div style={{ maxWidth: 840, margin: '0 auto 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: '#09090b', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                Frequently Asked Pricing Questions
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                Everything you need to know about our affordable billing, free trial, and upgrade terms.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      style={{
                        width: '100%',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                        {faq.q}
                      </span>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          backgroundColor: isOpen ? '#fff7ed' : '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: isOpen ? '#c2410c' : '#64748b',
                        }}
                      >
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: '0 22px 18px',
                          fontSize: 13.5,
                          color: '#475569',
                          lineHeight: 1.65,
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: 14,
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <DemoRequestModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialFeature={`Pricing Plan Interest: ${selectedPlan || 'Affordable MSME Tiers'}`}
      />
    </MarketingLayout>
  );
}
