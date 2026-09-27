import React from 'react';
import { Link } from 'react-router-dom';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import { DasaLogo } from '../../components/common/DasaLogo.jsx';
import {
  Building,
  ShieldCheck,
  Award,
  Users,
  Phone,
  Mail,
  Globe,
  MapPin,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>The Story Behind the Product</span>
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
              About{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                DASA EXPENCES & DASA TECH
              </span>
            </h1>

            <p style={{ fontSize: 16, color: '#71717a', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
              Built from real engineering discipline to solve the hardest problem in project businesses:
              tracking money accurately across fragmented payment channels and milestone gates.
            </p>
          </div>

          {/* DASA TECH Ownership & Vision (Bento Card) */}
          <div className="bento-card" style={{ padding: 40, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <DasaLogo size="lg" />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#09090b', marginBottom: 14, letterSpacing: '-0.02em' }}>
              Developed and Owned by DASA TECH
            </h2>

            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 16 }}>
              <strong>DASA TECH</strong> is an Indian enterprise software engineering and cloud consulting firm based in Erode, Tamil Nadu.
              Over years of delivering custom software, cloud migrations, and digital platforms for clients, we experienced firsthand how traditional
              accounting software (like Tally, QuickBooks, or Zoho) fails project managers.
            </p>

            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 28 }}>
              Clients would transfer advance tokens via GPay, settle larger milestone installments through RTGS, and hand over cash for site supervisor expenses.
              Meanwhile, developers would release production deliverables before finance confirmed payment clearance. Revenue was leaking at every phase.
              <strong> DASA EXPENCES</strong> was conceived and engineered to eliminate this gap completely.
            </p>

            {/* Core Values */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: 26 }}>
              <div style={{ padding: '16px', borderRadius: 12, backgroundColor: 'rgba(37, 99, 235, 0.03)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb', marginBottom: 4 }}>
                  Precision Double-Entry Ledger
                </div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                  No loose floating-point math or unverified tokens. Every entry maps directly to a journal voucher and financial account.
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#059669', marginBottom: 4 }}>
                  Strict Handover Protection
                </div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                  We believe delivery without verified settlement is an avoidable risk. Our system enforces completion gatekeeping.
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: 12, backgroundColor: 'rgba(8, 145, 178, 0.03)', border: '1px solid rgba(8, 145, 178, 0.1)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0891b2', marginBottom: 4 }}>
                  Indian & Global Fintech Design
                </div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                  Full native support for UPI splits, GPay reconciliation, GST/TDS, and multi-currency international billing.
                </div>
              </div>
            </div>
          </div>

          {/* Official Company Information Card (Titanium Bento) */}
          <div
            style={{
              backgroundColor: '#090d16',
              borderRadius: 20,
              padding: 36,
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
              CORPORATE CREDENTIALS
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 18 }}>
              DASA TECH Official Entity Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Legal Organization</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>DASA TECH</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>Software Engineering & Cloud Fintech Solutions</div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Official Website</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                  <a href="https://dasatech.in" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                    https://dasatech.in
                  </a>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Support & Sales Hotline</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                  <a href="tel:+917639930148" style={{ color: '#34d399', textDecoration: 'none' }}>
                    +91 76399 30148
                  </a>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>WhatsApp Direct</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                  <a
                    href="https://wa.me/917639930148?text=Hello%20DASA%20TECH%2C%20I%20would%20like%20to%20connect%20with%20your%20team."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#34d399', textDecoration: 'none' }}
                  >
                    +91 76399 30148 (Chat)
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MarketingLayout>
  );
}
