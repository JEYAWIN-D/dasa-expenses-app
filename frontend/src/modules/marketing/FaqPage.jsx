import React, { useState } from 'react';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import { DemoRequestModal } from '../../components/marketing/DemoRequestModal.jsx';
import { ChevronDown, ChevronUp, HelpCircle, Sparkles, ArrowRight, MessageSquare } from 'lucide-react';

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState(0);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const faqs = [
    {
      q: 'How does DASA EXPENCES handle split advance payments (e.g. ₹9,000 Cash + ₹1,000 GPay + ₹1,200 Bank)?',
      a: 'When you record a payment, you can add multiple payment method rows within a single official receipt. Each method is linked to its exact financial account (e.g. Cash in Hand, Google Pay, HDFC Current Account). The system validates that the split rows sum to the total receipt amount (₹11,200), issues one clean customer receipt, and credits the respective ledgers without creating duplicate entries.',
    },
    {
      q: 'Why do project expenses not reduce the client’s contract balance?',
      a: 'This is a foundational accounting principle: what you spend to execute a project (servers, subcontractor wages, materials) reduces your internal project cash pool and net profit margin. It does NOT reduce what the client owes you on their contract. DASA EXPENCES keeps client accounts receivable strictly separate from project expense ledgers.',
    },
    {
      q: 'How does the Project Handover Verification Gate prevent revenue leakage?',
      a: 'In many service businesses, project teams release final deliverables (source code, media assets, possession) before finance confirms payment clearance. The Handover Gate provides a strict verification checklist ensuring that all change orders are invoiced, advances are cleared in the bank, and customer balance is zero before a final Handover Certificate can be generated.',
    },
    {
      q: 'Can we generate official branded letters and PDF certificates?',
      a: 'Yes. The built-in Document Studio creates Advance Payment Request Letters, Receipt Acknowledgements, Milestone Payment Notices, Invoices, and Handover Certificates. All documents auto-populate project data, company logo, bank details, and an authorized digital signature stamp secured with a 4-digit PIN.',
    },
    {
      q: 'How does UPI / GPay management avoid double-counting transfers to bank accounts?',
      a: 'Each UPI account is explicitly mapped to its destination settlement bank. When funds auto-settle or are swept from your UPI merchant account into your primary current account, the system records it as an internal balance transfer rather than new client revenue.',
    },
    {
      q: 'Is DASA EXPENCES available as a self-hosted or dedicated on-premise installation?',
      a: 'Yes. In addition to our multi-tenant SaaS cloud platform, DASA TECH provides dedicated on-premise and private VPC deployments for enterprise clients with custom data sovereignty or audit requirements.',
    },
    {
      q: 'Who owns and supports DASA EXPENCES?',
      a: 'DASA EXPENCES is entirely developed, maintained, and owned by DASA TECH (https://dasatech.in), based in Erode, Tamil Nadu, India. Our engineering hotline is +91 76399 30148.',
    },
  ];

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>Frequently Asked Questions</span>
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
              Everything You Need to{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Know
              </span>
            </h1>

            <p style={{ fontSize: 16, color: '#71717a', margin: '0 auto', maxWidth: 580, lineHeight: 1.6 }}>
              Clear answers on accounting integrity, multi-method split receipts, and project handover protection.
            </p>
          </div>

          {/* FAQ Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((faq, i) => {
              const isOpen = openIdx === i;
              return (
                <div
                  key={i}
                  className="bento-card"
                  style={{
                    overflow: 'hidden',
                    padding: 0,
                    border: isOpen ? '1px solid #2563eb' : '1px solid rgba(226, 232, 240, 0.8)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? -1 : i)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      background: isOpen ? 'rgba(37, 99, 235, 0.03)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 15,
                      fontWeight: 800,
                      color: isOpen ? '#2563eb' : '#09090b',
                      gap: 16,
                    }}
                  >
                    <span>{faq.q}</span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        backgroundColor: isOpen ? 'rgba(37, 99, 235, 0.1)' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isOpen ? <ChevronUp size={16} color="#2563eb" /> : <ChevronDown size={16} color="#64748b" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 24px 22px',
                        fontSize: 14,
                        color: '#475569',
                        lineHeight: 1.7,
                        borderTop: '1px solid rgba(226, 232, 240, 0.6)',
                        paddingTop: 16,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Card */}
          <div
            style={{
              marginTop: 48,
              backgroundColor: '#090d16',
              borderRadius: 20,
              padding: '36px 32px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
              Still have questions about DASA EXPENCES?
            </h3>
            <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 480, margin: '0 auto 20px' }}>
              Speak directly with our engineering architects at DASA TECH on WhatsApp or book a tailored demo.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => setDemoModalOpen(true)} className="btn-trendy-primary">
                <span>Request a Free Demo</span>
                <ArrowRight size={14} />
              </button>
              <a
                href="https://wa.me/917639930148?text=Hello%20DASA%20TECH%2C%20I%20have%20a%20question%20about%20DASA%20EXPENCES."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-trendy-secondary"
                style={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.18)',
                }}
              >
                <MessageSquare size={14} />
                <span>Chat on WhatsApp (+91 76399 30148)</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      <DemoRequestModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </MarketingLayout>
  );
}
