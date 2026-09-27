import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import { DemoRequestModal } from '../../components/marketing/DemoRequestModal.jsx';
import { Check, ArrowRight, ShieldCheck, Sparkles, HelpCircle, Zap } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'For boutique agencies, contractors & solo engineering teams',
      pricing: billingCycle === 'annual' ? '₹1,999' : '₹2,499',
      period: '/ month',
      billedText: billingCycle === 'annual' ? 'Billed annually • Commercial rates set by DASA TECH' : 'Billed monthly • Commercial rates set by DASA TECH',
      isPopular: false,
      features: [
        'Up to 5 Active Client Projects',
        '3 Team Members & Role Permissions',
        'Quotation Builder & Revision History',
        'Advance Split Payment Receipts',
        'Project Expense Ledger (Cash & Bank)',
        '1 Main Bank Account + Cash Drawer',
        'Standard Email & WhatsApp Support',
      ],
      ctaText: 'Start Free Trial',
    },
    {
      id: 'growth',
      name: 'Growth',
      tagline: 'For expanding software houses, agencies & service consultancies',
      pricing: billingCycle === 'annual' ? '₹4,999' : '₹5,999',
      period: '/ month',
      billedText: billingCycle === 'annual' ? 'Billed annually • Save 20% commitment' : 'Billed monthly • Flexible cancellation',
      isPopular: true,
      features: [
        'Up to 25 Active Client Projects',
        '10 Team Members (Finance, PM, Staff RBAC)',
        'Unlimited Quotations & Scope Change Orders',
        'Custom Milestone Schedules (% & Fixed Amount)',
        'Advance Split Receipts (Cash + GPay + Bank)',
        'Document Studio (Letters, Receipts & Certs)',
        'Up to 5 Bank & UPI Financial Accounts',
        'Handover Verification Gatekeeper',
        'Priority Technical Support from DASA TECH',
      ],
      ctaText: 'Request a Demo',
    },
    {
      id: 'business',
      name: 'Business',
      tagline: 'For established multi-team engineering firms & contractors',
      pricing: billingCycle === 'annual' ? '₹9,999' : '₹11,999',
      period: '/ month',
      billedText: billingCycle === 'annual' ? 'Billed annually • Enterprise SLAs available' : 'Billed monthly • Standard enterprise terms',
      isPopular: false,
      features: [
        'Up to 75 Active Client Projects',
        '25 Team Members & Custom Roles',
        'Multi-Level Expense Approval Workflows',
        'Unlimited Bank, UPI & Cash Vault Accounts',
        'Audit-Grade Double-Entry Journal Reversals',
        'Customer Portal for Invoices & Receipts',
        'Company-Wide Profitability & Aging Analytics',
        'Custom Document Templates & Authorized Digital Seals',
        'Dedicated Technical Account Manager',
      ],
      ctaText: 'Request a Demo',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tagline: 'Custom SaaS or dedicated private on-premise cloud deployment',
      pricing: 'Custom',
      period: '',
      billedText: 'Dedicated deployment, custom SLAs & integrations',
      isPopular: false,
      features: [
        'Unlimited Projects & Custom User Tiers',
        'Dedicated On-Premise or Private VPC Deployment',
        'Custom Accounting / Tally / ERP Integrations',
        'Single Sign-On (SSO) & Advanced Security Policies',
        '24/7 Hotline Support & Custom SLA Guarantees',
        'Dedicated Database Isolation & Migration Assistance',
        'Comprehensive Training for Finance & Project Teams',
      ],
      ctaText: 'Contact Sales / Owner',
    },
  ];

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>Simple, Transparent SaaS Investment</span>
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
              Predictable Plans Built for{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Project Profitability
              </span>
            </h1>

            <p style={{ fontSize: 16, color: '#71717a', maxWidth: 620, margin: '0 auto 28px' }}>
              Scale from a boutique studio to a multi-crore enterprise. Commercial rates and custom setups are configured by DASA TECH.
            </p>

            {/* Billing Toggle (Pill) */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(226, 232, 240, 0.7)',
                padding: 4,
                borderRadius: 999,
                backdropFilter: 'blur(10px)',
              }}
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '8px 20px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  backgroundColor: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
                  color: billingCycle === 'monthly' ? '#09090b' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: billingCycle === 'monthly' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '8px 20px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  backgroundColor: billingCycle === 'annual' ? '#ffffff' : 'transparent',
                  color: billingCycle === 'annual' ? '#09090b' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: billingCycle === 'annual' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <span>Annual Commitment</span>
                <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 800 }}>
                  20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Bento Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
              alignItems: 'stretch',
            }}
          >
            {plans.map((p) => (
              <div
                key={p.id}
                className={p.isPopular ? 'bento-card' : 'bento-card'}
                style={{
                  padding: '36px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: p.isPopular ? '2px solid #2563eb' : '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: p.isPopular ? '0 20px 40px -10px rgba(37, 99, 235, 0.2)' : 'var(--shadow-sm)',
                }}
              >
                {p.isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 14px',
                      borderRadius: 999,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                <div style={{ fontSize: 18, fontWeight: 900, color: '#09090b', letterSpacing: '-0.02em', marginBottom: 6 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: '#71717a', lineHeight: 1.5, minHeight: 36, marginBottom: 20 }}>
                  {p.tagline}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', color: '#09090b' }}>
                      {p.pricing}
                    </span>
                    <span style={{ fontSize: 13, color: '#71717a', fontWeight: 600 }}>
                      {p.period}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>
                    {p.billedText}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPlan(p.name);
                    setDemoModalOpen(true);
                  }}
                  className={p.isPopular ? 'btn-trendy-primary' : 'btn-trendy-secondary'}
                  style={{ width: '100%', marginBottom: 28, padding: '11px', fontSize: 13 }}
                >
                  <span>{p.ctaText}</span>
                  <ArrowRight size={14} />
                </button>

                <div style={{ fontSize: 11, fontWeight: 800, color: '#09090b', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 14 }}>
                  INCLUDED CAPABILITIES:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <Check size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 3 }} />
                      <span style={{ fontSize: 12, color: '#3f3f46', fontWeight: 500, lineHeight: 1.5 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Disclaimer Note */}
          <div
            style={{
              marginTop: 44,
              padding: '16px 24px',
              borderRadius: 14,
              backgroundColor: 'rgba(239, 246, 255, 0.7)',
              border: '1px solid #bfdbfe',
              fontSize: 12,
              color: '#1e40af',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            * Displayed rates are indicative representative plans. Actual commercial subscription rates, custom invoicing terms,
            and enterprise deployments are configured directly by the platform owner <strong>DASA TECH</strong> (https://dasatech.in • +91 76399 30148).
          </div>
        </div>
      </div>

      <DemoRequestModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialFeature={`Pricing Plan Interest: ${selectedPlan || 'General'}`}
      />
    </MarketingLayout>
  );
}
