import React from 'react';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div style={{ backgroundColor: '#f8fafc', padding: '60px 24px 80px' }}>
        <div style={{ maxWidth: 840, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 40, boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
            Privacy Policy
          </h1>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
            Last Updated: September 2026 • Product: DASA EXPENCES • Developed & Owned by DASA TECH
          </div>

          <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p>
              Welcome to <strong>DASA EXPENCES</strong>, a SaaS platform developed and owned by <strong>DASA TECH</strong>,
              headquartered in Erode, Tamil Nadu, India (https://dasatech.in). This Privacy Policy explains our practices regarding
              the collection, usage, and safeguarding of information obtained through our application and website.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>1. Information We Collect</h3>
            <p>
              When you use DASA EXPENCES or request a product demonstration, we collect information you provide directly to us:
              organization names, contact person names, email addresses, phone and WhatsApp numbers, billing details, and project data.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>2. Multi-Tenant Data Isolation</h3>
            <p>
              All customer organization data, financial accounts, quotation revisions, project expenses, and customer records are
              isolated through multi-tenant database partitioning. We never share or commingle one tenant’s financial entries with another.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>3. Financial Transactions & Cards</h3>
            <p>
              DASA EXPENCES does not collect or store raw payment card data (PAN or CVV). All online transactions are processed through
              certified, PCI-DSS compliant payment gateways with encrypted webhooks.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>4. Contact & Support</h3>
            <p>
              For privacy inquiries, data deletion requests, or compliance reviews, contact DASA TECH at:
              <br />
              <strong>Email:</strong> dasatechmu@gmail.com
              <br />
              <strong>Phone / WhatsApp:</strong> +91 76399 30148
              <br />
              <strong>Address:</strong> EB Colony, Erode, Tamil Nadu 638002, India
            </p>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
