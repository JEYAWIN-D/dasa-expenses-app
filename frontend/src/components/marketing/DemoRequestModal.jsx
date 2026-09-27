import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, Phone, Mail, Building, Sparkles, ArrowRight, MessageSquare } from 'lucide-react';
import { DasaLogo } from '../common/DasaLogo.jsx';

export function DemoRequestModal({ isOpen, onClose, initialFeature = '' }) {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    industry: 'Software Development & IT',
    companySize: '11-50 employees',
    monthlyProjects: '5-15 projects',
    currentProcess: 'Spreadsheets + Disconnected Invoicing',
    featuresInterest: initialFeature ? [initialFeature] : ['Advance Split Payments', 'Handover Verification Gate'],
    preferredDate: '',
    preferredTime: '11:00 AM IST',
    additionalReqs: '',
    consentContact: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const featureOptions = [
    'Quotation Builder & Versioning',
    'Advance Split Payments (Cash, GPay, Bank)',
    'Custom Milestone Schedules (% & Fixed)',
    'Project Expense Ledger',
    'Cash & Bank Account Balancing (No Double Count)',
    'Handover Verification Gatekeeper',
    'Document Studio (Receipts, Invoices, Letters)',
    'Company-wide Profitability Analytics',
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
      setErrorMsg('Please fill in your name, company name, email, and phone number.');
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
      setErrorMsg(err.message || 'Something went wrong. You can also contact us directly via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello DASA TECH, I am interested in DASA EXPENCES and would like to request a demo for ${formData.companyName || 'my company'}. Name: ${formData.fullName || ''}, Phone: ${formData.phone || ''}`
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <DasaLogo size="sm" showTagline={false} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Request a Personalized Live Demo
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                See how DASA EXPENCES stops revenue leakage across all your client projects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '36px 12px' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Demo Request Submitted!
              </h3>
              <p style={{ fontSize: 14, color: '#475569', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.6 }}>
                Thank you, <strong>{formData.fullName}</strong>. A fintech specialist from <strong>DASA TECH</strong> will
                review your project requirements and confirm the appointment.
              </p>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                  maxWidth: 500,
                  margin: '0 auto 24px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                  REQUEST SUMMARY
                </div>
                <div style={{ fontSize: 13, color: '#1e293b', marginBottom: 4 }}>
                  <strong>Company:</strong> {formData.companyName} ({formData.industry})
                </div>
                <div style={{ fontSize: 13, color: '#1e293b', marginBottom: 4 }}>
                  <strong>Contact:</strong> {formData.phone} | {formData.email}
                </div>
                {formData.preferredDate && (
                  <div style={{ fontSize: 13, color: '#1e293b' }}>
                    <strong>Requested Window:</strong> {formData.preferredDate} at {formData.preferredTime}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/917639930148?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <MessageSquare size={16} />
                  Connect Instantly on WhatsApp (+91 76399 30148)
                </a>
                <button
                  onClick={onClose}
                  className="btn"
                  style={{
                    backgroundColor: '#e2e8f0',
                    color: '#334155',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                >
                  Close Window
                </button>
              </div>
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
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Grid 1: Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Your Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arun Kumar"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Company / Agency Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BlueStar Technologies Pvt Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* Grid 2: Contacts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Work Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="arun@bluestar.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Phone Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    WhatsApp Number (if different)
                  </label>
                  <input
                    type="tel"
                    placeholder="Same as phone"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* Grid 3: Business Context */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="Software Development & IT">Software Development & IT</option>
                    <option value="Creative & Digital Agency">Creative & Digital Agency</option>
                    <option value="Civil Contracting & Engineering">Civil Contracting & Engineering</option>
                    <option value="Consulting & Professional Services">Consulting & Professional Services</option>
                    <option value="Startup / Tech Venture">Startup / Tech Venture</option>
                    <option value="General Service Provider">General Service Provider</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Company Size
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="51-200 employees">51-200 employees</option>
                    <option value="200+ employees">200+ employees</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Monthly Projects
                  </label>
                  <select
                    value={formData.monthlyProjects}
                    onChange={(e) => setFormData({ ...formData, monthlyProjects: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="1-5 projects">1-5 projects</option>
                    <option value="5-15 projects">5-15 projects</option>
                    <option value="15-30 projects">15-30 projects</option>
                    <option value="30+ projects">30+ projects</option>
                  </select>
                </div>
              </div>

              {/* Current Process */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Current Software or Accounting Process
                </label>
                <input
                  type="text"
                  placeholder="e.g. Excel spreadsheets + manual bank statement checks"
                  value={formData.currentProcess}
                  onChange={(e) => setFormData({ ...formData, currentProcess: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                  }}
                />
              </div>

              {/* Features of interest */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Features of Primary Interest (Select all that apply)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 6 }}>
                  {featureOptions.map((feat) => {
                    const checked = formData.featuresInterest.includes(feat);
                    return (
                      <label
                        key={feat}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 12,
                          color: '#334155',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: 6,
                          backgroundColor: checked ? '#eff6ff' : '#f8fafc',
                          border: `1px solid ${checked ? '#bfdbfe' : '#e2e8f0'}`,
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

              {/* Preferred Slot */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Preferred Demo Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Preferred Time Slot
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="10:00 AM IST">10:00 AM IST</option>
                    <option value="11:30 AM IST">11:30 AM IST</option>
                    <option value="02:30 PM IST">02:30 PM IST</option>
                    <option value="04:00 PM IST">04:00 PM IST</option>
                    <option value="05:30 PM IST">05:30 PM IST</option>
                  </select>
                </div>
              </div>

              {/* Additional Requirements */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Additional Requirements / Migration Questions
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your specific workflow, team roles, or integrations..."
                  value={formData.additionalReqs}
                  onChange={(e) => setFormData({ ...formData, additionalReqs: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Consent */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: 12,
                  color: '#64748b',
                  marginBottom: 20,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.consentContact}
                  onChange={(e) => setFormData({ ...formData, consentContact: e.target.checked })}
                  style={{ marginTop: 2, accentColor: '#2563eb' }}
                />
                <span>
                  I agree to receive a personalized demonstration and follow-up from DASA TECH (+91 76399 30148).
                  We respect your privacy and never spam.
                </span>
              </label>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                  <span>Need instant answers?</span>
                  <a
                    href="https://wa.me/917639930148?text=Hello%20DASA%20TECH%2C%20I%20am%20interested%20in%20DASA%20EXPENCES%20and%20would%20like%20to%20request%20a%20demo."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <MessageSquare size={13} />
                    WhatsApp Us
                  </a>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn"
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '10px 18px',
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      padding: '10px 24px',
                      borderRadius: 8,
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                    }}
                  >
                    {loading ? 'Submitting...' : 'Confirm Demo Request'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
