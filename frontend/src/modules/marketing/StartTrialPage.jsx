import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MarketingLayout } from '../../components/marketing/MarketingLayout.jsx';
import { DasaLogo } from '../../components/common/DasaLogo.jsx';
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function StartTrialPage() {
  const [formData, setFormData] = useState({
    orgName: '',
    adminName: '',
    email: '',
    password: '',
    phone: '',
    industry: 'Software Development',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <MarketingLayout>
      <div className="mesh-bg grid-bg-subtle" style={{ padding: '60px 24px 100px', minHeight: '85vh' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <span className="pill-badge">
                <Sparkles size={13} />
                <span>14-Day Full-Featured Trial</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 38px)',
                fontWeight: 900,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#09090b',
                marginTop: 6,
              }}
            >
              Start Your Free{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                DASA EXPENCES
              </span>{' '}
              Trial
            </h1>
            <p style={{ fontSize: 14, color: '#71717a', marginTop: 10 }}>
              No credit card required. Experience complete project finance management.
            </p>
          </div>

          <div className="bento-card" style={{ padding: 36 }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
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
                  Organization Setup Initialized!
                </h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
                  Your trial workspace for <strong>{formData.orgName}</strong> is ready. You can now log in using the demo credentials or proceed directly into the dashboard.
                </p>
                <Link
                  to="/login"
                  className="btn-trendy-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 24px',
                    width: '100%',
                  }}
                >
                  <span>Go to Login / Dashboard</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Engineering Ltd"
                    value={formData.orgName}
                    onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
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
                    Admin Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@apex.com"
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
                      Phone *
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

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Industry Sector
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
                      outline: 'none',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <option value="Software Development">Software Development & Cloud</option>
                    <option value="Creative Agency">Digital & Creative Agency</option>
                    <option value="Civil Contracting">Civil Contracting & Engineering</option>
                    <option value="Consulting">Management Consulting</option>
                    <option value="Other">Other Project-Based Business</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Create secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', marginTop: 4 }}>
                  <ShieldCheck size={14} />
                  <span>Instant sandbox deployment • ISO & SOC2 standards</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-trendy-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 800,
                    justifyContent: 'center',
                    marginTop: 6,
                  }}
                >
                  <span>{loading ? 'Setting Up Workspace...' : 'Launch Free Trial Workspace'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: 16 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>Already have an account? </span>
              <Link to="/login" style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                Sign In here
              </Link>
            </div>
          </div>

        </div>
      </div>
    </MarketingLayout>
  );
}
