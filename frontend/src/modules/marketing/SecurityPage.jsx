import React from 'react';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import {
  ShieldCheck,
  Lock,
  Database,
  UserCheck,
  Key,
  FileCode,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SecurityPage() {
  const securityPillars = [
    {
      title: 'Tenant-Aware Database Isolation',
      desc: 'Each customer company operates within strictly isolated multi-tenant contexts. Organization IDs and query filters are enforced on the server for every SQL query, preventing cross-tenant leakage.',
      icon: <Database size={22} color="#2563eb" />,
      tag: 'Multi-Tenant Architecture',
    },
    {
      title: 'Role-Based Access Control (RBAC)',
      desc: 'Granular roles include Super Admin, Admin, Finance Manager, Project Manager, Staff Engineer, Auditor, and Client. Team members only see the projects and financial accounts they are authorized to manage.',
      icon: <UserCheck size={22} color="#059669" />,
      tag: '7 Granular Roles',
    },
    {
      title: 'Encrypted Digital Signatures & PINs',
      desc: 'Official document authorizations require a 4-digit cryptographic PIN hash. Quotation, invoice, and handover certificate signatures are digitally stamped with timestamped audit entries.',
      icon: <Key size={22} color="#7c3aed" />,
      tag: 'SHA-256 Auth PINs',
    },
    {
      title: 'Immutable Audit Logging',
      desc: 'Every login, quotation revision, payment receipt, and expense approval writes an immutable audit record with user ID, IP address, timestamp, and modification payload.',
      icon: <ShieldCheck size={22} color="#d97706" />,
      tag: 'Tamper-Proof Trails',
    },
    {
      title: 'No Raw Card Storage & Secure Webhooks',
      desc: 'Payment gateway integrations use direct tokenized redirects and HMAC-SHA256 signature verification. We never store credit or debit card numbers on our servers.',
      icon: <Lock size={22} color="#dc2626" />,
      tag: 'Zero Card Storage',
    },
    {
      title: 'Double-Entry Financial Reversals',
      desc: 'Transactions cannot be deleted silently. Corrections require explicit adjustment or reversal vouchers, ensuring an unbroken financial trail for external auditors.',
      icon: <FileCode size={22} color="#0891b2" />,
      tag: 'Audit-Grade Compliance',
    },
  ];

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>Enterprise Defense & Compliance</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 46px)',
                fontWeight: 900,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#09090b',
                maxWidth: 780,
                margin: '0 auto 16px',
              }}
            >
              Bank-Grade Security for{' '}
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

            <p style={{ fontSize: 16, color: '#71717a', maxWidth: 660, margin: '0 auto', lineHeight: 1.6 }}>
              Financial records are the lifeblood of your company. We protect tenant data with zero-compromise encryption,
              server-enforced multi-tenant isolation, and double-entry ledger balancing.
            </p>
          </div>

          {/* Pillars Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 22,
              marginBottom: 44,
            }}
          >
            {securityPillars.map((p, idx) => (
              <div
                key={idx}
                className="bento-card"
                style={{
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(37, 99, 235, 0.15)',
                    }}
                  >
                    {p.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 999,
                      backgroundColor: 'rgba(15, 23, 42, 0.05)',
                      color: '#475569',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {p.tag}
                  </span>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#09090b', marginBottom: 8, letterSpacing: '-0.01em' }}>
                  {p.title}
                </h3>

                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, margin: 0 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Callout */}
          <div
            style={{
              backgroundColor: '#090d16',
              borderRadius: 20,
              padding: '36px 32px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
              Need an Enterprise Security Assessment or On-Premise VPC?
            </h3>
            <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 540, margin: '0 auto 20px' }}>
              We provide custom single-tenant isolation, SOC 2 compliance reports, and on-premise private cloud setups.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/request-demo" className="btn-trendy-primary">
                <span>Request Enterprise Assessment</span>
                <ArrowRight size={14} />
              </Link>
              <a
                href="https://wa.me/917639930148?text=Hello%20DASA%20TECH%2C%20we%20have%20an%20enterprise%20security%20inquiry%20regarding%20DASA%20EXPENCES."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-trendy-secondary"
                style={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.18)',
                }}
              >
                <span>Talk with Security Team</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </MarketingLayout>
  );
}
