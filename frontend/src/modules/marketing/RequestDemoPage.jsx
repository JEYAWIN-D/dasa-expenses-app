import React, { useState } from 'react';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import {
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  Clock,
  Calendar,
  Building,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Zap,
} from 'lucide-react';

export default function RequestDemoPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    industry: 'Software Development & IT',
    companySize: '11-50 employees',
    monthlyProjects: '5-15 projects',
    currentProcess: 'Spreadsheets & Manual Bank Check',
    featuresInterest: ['Advance Split Payments', 'Handover Verification Gate'],
    preferredDate: '',
    preferredTime: '11:00 AM IST',
    additionalReqs: '',
    consentContact: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const featureOptions = [
    'Quotation Builder & Versioning',
    'Advance Split Payments (Cash, GPay, Bank)',
    'Custom Milestone Schedules (% & Fixed)',
    'Project Expense Ledger & Deductions',
    'Cash & Bank Account Balancing (No Double Count)',
    'Handover Verification Gatekeeper',
    'Document Studio (Official Letters, Invoices, Certs)',
    'Company-Wide Profitability & Aging Analytics',
  ];

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => {
      const exists = prev.featuresInterest.includes(feature);
      return {
        ...prev,
        featuresInterest: exists
          ? prev.featuresInterest.filter((f) => f !== feature)
          : [...prev.featuresInterest, feature],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName || !formData.companyName || !formData.email || !formData.phone) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/leads/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit demo request');
      }
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Error submitting form. You can also contact us directly via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello DASA TECH, I am interested in DASA EXPENCES and would like to request a demo for ${formData.companyName || 'my company'}. Name: ${formData.fullName || ''}, Phone: ${formData.phone || ''}`
  );

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>Tailored Product Walkthrough</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(30px, 4.5vw, 46px)',
                fontWeight: 900,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#09090b',
                maxWidth: 780,
                margin: '0 auto 16px',
              }}
            >
              Request a Live Demonstration of{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                DASA EXPENCES
              </span>
            </h1>

            <p style={{ fontSize: 16, color: '#71717a', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
              See firsthand how DASA EXPENCES tracks split advances, balances cash and bank ledgers,
              and protects final project handovers.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 32,
              alignItems: 'start',
            }}
          >
            {/* Left: Benefits & DASA TECH Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="bento-card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#09090b', marginBottom: 18, letterSpacing: '-0.01em' }}>
                  What You Will Experience:
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontWeight: 900,
                        fontSize: 13,
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                      }}
                    >
                      1
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#09090b' }}>Live Advance Split Walkthrough</div>
                      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginTop: 2 }}>
                        See how ₹9k Cash + ₹1k GPay + ₹1.2k Bank routes to each balance card without math errors.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 14 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontWeight: 900,
                        fontSize: 13,
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      2
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#09090b' }}>Handover Gatekeeper Defense</div>
                      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginTop: 2 }}>
                        Observe how the system prevents deliverable release until client payments clear.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 14 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: 'rgba(217, 119, 6, 0.1)',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontWeight: 900,
                        fontSize: 13,
                        border: '1px solid rgba(217, 119, 6, 0.2)',
                      }}
                    >
                      3
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#09090b' }}>Workflow Fit & Migration</div>
                      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginTop: 2 }}>
                        Discuss your existing spreadsheets or accounting tools with our software architects.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout Card (Titanium Bento) */}
              <div
                style={{
                  backgroundColor: '#090d16',
                  borderRadius: 20,
                  padding: 26,
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
                  PREFER IMMEDIATE CONTACT?
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>
                  Talk to the Engineering Team at DASA TECH
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
                  Have specific enterprise requirements or need a walkthrough today? Message or call our architects directly.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a
                    href="https://wa.me/917639930148?text=Hello%20DASA%20TECH%2C%20I%20am%20interested%20in%20DASA%20EXPENCES%20and%20would%20like%20to%20request%20a%20demo."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      padding: '11px 18px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <MessageSquare size={16} />
                    <span>WhatsApp: +91 76399 30148</span>
                  </a>

                  <a
                    href="tel:+917639930148"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      padding: '10px 18px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <Phone size={15} />
                    <span>Hotline: +91 76399 30148</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Full Interactive Request Form (Bento Card) */}
            <div className="bento-card" style={{ padding: 36 }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 999,
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 18px',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#09090b', marginBottom: 8 }}>
                    Demo Request Received!
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
                    Thank you, <strong>{formData.fullName}</strong>. Your request for <strong>{formData.companyName}</strong> has been logged in our demo queue.
                    A representative from <strong>DASA TECH</strong> will review and confirm your session.
                  </p>
                  <a
                    href={`https://wa.me/917639930148?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-trendy-primary"
                    style={{ display: 'inline-flex', padding: '12px 24px' }}
                  >
                    <span>Confirm via WhatsApp Immediately</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 13,
                        marginBottom: 16,
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arun Kumar"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          fontSize: 13,
                          outline: 'none',
                          backgroundColor: '#fafafa',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Company / Agency *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nexus Software"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          fontSize: 13,
                          outline: 'none',
                          backgroundColor: '#fafafa',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="arun@nexus.in"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          fontSize: 13,
                          outline: 'none',
                          backgroundColor: '#fafafa',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          fontSize: 13,
                          outline: 'none',
                          backgroundColor: '#fafafa',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Industry
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          fontSize: 13,
                          backgroundColor: '#fafafa',
                          outline: 'none',
                        }}
                      >
                        <option value="Software Development & IT">Software Development & IT</option>
                        <option value="Creative & Digital Agency">Creative & Digital Agency</option>
                        <option value="Civil Contracting & Engineering">Civil Contracting & Engineering</option>
                        <option value="Consulting & Advisory">Consulting & Advisory</option>
                        <option value="Startup Venture">Startup Venture</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Monthly Projects
                      </label>
                      <select
                        value={formData.monthlyProjects}
                        onChange={(e) => setFormData({ ...formData, monthlyProjects: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          fontSize: 13,
                          backgroundColor: '#fafafa',
                          outline: 'none',
                        }}
                      >
                        <option value="1-5 projects">1-5 projects</option>
                        <option value="5-15 projects">5-15 projects</option>
                        <option value="15-30 projects">15-30 projects</option>
                        <option value="30+ projects">30+ projects</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                      Primary Features Needed
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {featureOptions.slice(0, 6).map((feat) => {
                        const checked = formData.featuresInterest.includes(feat);
                        return (
                          <label
                            key={feat}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: 11,
                              fontWeight: 600,
                              color: checked ? '#1e40af' : '#475569',
                              padding: '8px 10px',
                              borderRadius: 8,
                              backgroundColor: checked ? 'rgba(37, 99, 235, 0.08)' : '#fafafa',
                              border: `1px solid ${checked ? 'rgba(37, 99, 235, 0.3)' : 'rgba(226, 232, 240, 0.8)'}`,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleFeatureToggle(feat)}
                              style={{ accentColor: '#2563eb' }}
                            />
                            <span>{feat}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          fontSize: 13,
                          outline: 'none',
                          backgroundColor: '#fafafa',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Preferred Time
                      </label>
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          fontSize: 13,
                          backgroundColor: '#fafafa',
                          outline: 'none',
                        }}
                      >
                        <option value="10:00 AM IST">10:00 AM IST</option>
                        <option value="11:30 AM IST">11:30 AM IST</option>
                        <option value="02:30 PM IST">02:30 PM IST</option>
                        <option value="04:30 PM IST">04:30 PM IST</option>
                      </select>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#64748b', marginBottom: 22, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.consentContact}
                      onChange={(e) => setFormData({ ...formData, consentContact: e.target.checked })}
                      style={{ marginTop: 2, accentColor: '#2563eb' }}
                    />
                    <span>
                      I authorize DASA TECH to contact me regarding DASA EXPENCES. No spam, only product demo scheduling.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-trendy-primary"
                    style={{
                      width: '100%',
                      padding: '13px',
                      fontSize: 14,
                      fontWeight: 800,
                      justifyContent: 'center',
                    }}
                  >
                    <span>{loading ? 'Submitting...' : 'Schedule My Live Demonstration'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
