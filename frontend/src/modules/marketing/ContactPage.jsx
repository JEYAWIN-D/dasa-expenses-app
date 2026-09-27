import React, { useState } from 'react';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Globe,
  ExternalLink,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Enterprise Demo Request',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>Get in Touch with DASA TECH</span>
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
              We are Here to Help Your{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Business Scale
              </span>
            </h1>

            <p style={{ fontSize: 16, color: '#71717a', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
              Connect directly with our engineering and fintech specialists for demonstrations, technical onboarding,
              or enterprise cloud deployments.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 32,
            }}
          >
            {/* Contact Details Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* WhatsApp Card */}
              <a
                href="https://wa.me/917639930148?text=Hello%20DASA%20TECH%2C%20I%20am%20interested%20in%20DASA%20EXPENCES."
                target="_blank"
                rel="noopener noreferrer"
                className="bento-card"
                style={{
                  padding: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  textDecoration: 'none',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <MessageSquare size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Instant Response
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#09090b', marginTop: 2 }}>
                    WhatsApp: +91 76399 30148
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    Fastest channel for live product discussions
                  </div>
                </div>
              </a>

              {/* Phone Hotline Card */}
              <a
                href="tel:+917639930148"
                className="bento-card"
                style={{
                  padding: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  <Phone size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Direct Support & Sales
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#09090b', marginTop: 2 }}>
                    +91 76399 30148
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    Mon - Sat, 9:00 AM - 7:00 PM IST
                  </div>
                </div>
              </a>

              {/* Corporate Info Bento */}
              <div className="bento-card" style={{ padding: 26 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#09090b', marginBottom: 14 }}>
                  Company & Headquarters
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <MapPin size={18} color="#2563eb" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>DASA TECH Office</div>
                      <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                        Erode, Tamil Nadu, India — PIN 638001
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Globe size={18} color="#0891b2" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>Official Corporate Site</div>
                      <a
                        href="https://dasatech.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                      >
                        https://dasatech.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Message Form */}
            <div className="bento-card" style={{ padding: 36 }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 999,
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: '#09090b', marginBottom: 8 }}>
                    Message Sent Successfully!
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
                    Thank you, <strong>{formData.name}</strong>. Our team has received your message and will respond
                    promptly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: 'Enterprise Demo Request', message: '' });
                    }}
                    className="btn-trendy-secondary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#09090b', marginBottom: 18 }}>
                    Send an Inquiry
                  </h3>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="priya@company.com"
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
                        Phone Number
                      </label>
                      <input
                        type="tel"
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

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                      <option value="Enterprise Demo Request">Enterprise Demo Request</option>
                      <option value="Pricing & Commercial Terms">Pricing & Commercial Terms</option>
                      <option value="Data Migration from Tally/Excel">Data Migration from Tally/Excel</option>
                      <option value="Dedicated Private VPC Hosting">Dedicated Private VPC Hosting</option>
                      <option value="Partnership / Reseller Inquiry">Partnership / Reseller Inquiry</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Message Details
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your team size, number of active projects, and requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        fontSize: 13,
                        outline: 'none',
                        backgroundColor: '#fafafa',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-trendy-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: 14,
                      fontWeight: 800,
                      justifyContent: 'center',
                    }}
                  >
                    <span>Send Message to DASA TECH</span>
                    <Send size={15} />
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
