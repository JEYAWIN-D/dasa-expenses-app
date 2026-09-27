import React from 'react';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';

export default function TermsPage() {
  return (
    <MarketingLayout>
      <div style={{ backgroundColor: '#f8fafc', padding: '60px 24px 80px' }}>
        <div style={{ maxWidth: 840, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 40, boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
            Terms of Service
          </h1>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
            Last Updated: September 2026 • Product: DASA EXPENCES • Developed & Owned by DASA TECH
          </div>

          <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p>
              These Terms of Service govern your access to and use of <strong>DASA EXPENCES</strong>, a SaaS platform
              developed and owned by <strong>DASA TECH</strong> (https://dasatech.in). By subscribing, registering an organization,
              or accessing the platform, you agree to be bound by these terms.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>1. SaaS Subscription & License</h3>
            <p>
              DASA TECH grants your organization a non-exclusive, non-transferable subscription license to use DASA EXPENCES
              for internal financial tracking, quotation management, split receipting, and project handover verification according to your selected plan.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>2. Data Ownership & Financial Accuracy</h3>
            <p>
              You retain full ownership of all customer data, quotation details, receipts, and expense vouchers entered into the platform.
              You are responsible for ensuring the factual accuracy of financial transactions recorded by your authorized team members.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>3. Enterprise Ownership & Intellectual Property</h3>
            <p>
              The DASA EXPENCES software, branding, UI components, algorithms, and double-entry reconciliation mechanisms are the exclusive intellectual
              property of DASA TECH. Reverse engineering, unauthorized reproduction, or resale is strictly prohibited.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>4. Governing Law & Jurisdiction</h3>
            <p>
              These terms are governed by the laws of India. Any disputes arising out of or related to DASA EXPENCES shall be subject to
              the exclusive jurisdiction of the competent courts in Tamil Nadu, India.
            </p>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
