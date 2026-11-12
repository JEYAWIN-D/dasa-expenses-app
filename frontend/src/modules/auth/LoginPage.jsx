import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useCompany } from '../../contexts/CompanyContext.jsx';
import { DasaLogo } from '../../components/common/DasaLogo.jsx';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  User,
  Phone,
  KeyRound,
  RefreshCw,
  Building2,
  Receipt,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function LoginPage() {
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [isSetupRequired, setIsSetupRequired] = useState(false);

  // Standard Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial Setup State
  const [setupForm, setSetupForm] = useState({
    name: 'Dasa Administrator',
    email: 'dasatechmu@gmail.com',
    password: '',
    confirmPassword: '',
    phone: '7639930148',
    signaturePin: '1234',
  });
  const [setupSubmitting, setSetupSubmitting] = useState(false);

  const { login, setAuthSession } = useAuth();
  const { company } = useCompany();
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Check whether first-time setup is needed on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await api.get('/auth/setup-status');
        if (res && res.data) {
          setIsSetupRequired(res.data.isSetupRequired);
        }
      } catch (err) {
        console.warn('Could not check setup status:', err.message);
      } finally {
        setCheckingSetup(false);
      }
    }
    checkStatus();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, rememberMe);
      notify.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      notify.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSetupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (setupForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (setupForm.password !== setupForm.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (setupForm.signaturePin && setupForm.signaturePin.length !== 4) {
      setError('Digital Signature PIN must be exactly 4 digits');
      return;
    }

    setSetupSubmitting(true);
    try {
      const res = await api.post('/auth/initial-setup', {
        name: setupForm.name,
        email: setupForm.email,
        password: setupForm.password,
        phone: setupForm.phone,
        signaturePin: setupForm.signaturePin || '1234',
      });

      const { token, user, message } = res.data;
      if (setAuthSession && token && user) {
        setAuthSession(token, user);
      }
      notify.success(message || 'Master Super Admin created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'System initialization failed');
      notify.error(err.message || 'Setup error');
    } finally {
      setSetupSubmitting(false);
    }
  };

  if (checkingSetup) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0a09',
          color: '#ffffff',
          gap: 12,
        }}
      >
        <RefreshCw size={24} className="animate-spin" color="#ea580c" />
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.02em', color: '#a8a29e' }}>
          Loading DASA EXPENCES Security Gateway...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0c0a09',
        padding: '32px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(194, 65, 12, 0.15) 0%, rgba(124, 18, 40, 0.08) 50%, transparent 75%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '10%',
          width: 550,
          height: 550,
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, rgba(194, 65, 12, 0.06) 50%, transparent 75%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Dual-Pane Luxury Enterprise Authentication Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 1040,
          backgroundColor: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'grid',
          gridTemplateColumns: isSetupRequired ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ============================================================== */}
        {/* LEFT COLUMN: EXECUTIVE BRAND & GOVERNANCE SHOWCASE             */}
        {/* ============================================================== */}
        {!isSetupRequired && (
          <div
            style={{
              background: 'linear-gradient(160deg, #170e0a 0%, #22140e 55%, #140d0a 100%)',
              color: '#ffffff',
              padding: '48px 44px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle internal watermark light */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 320,
                height: 320,
                background: 'radial-gradient(circle at top right, rgba(234, 88, 12, 0.22) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div>
              {/* Official Dasa Brand Header */}
              <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 28 }}>
                <DasaLogo size="md" lightMode={true} showTagline={true} />
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(234, 88, 12, 0.15)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  color: '#fdba74',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                <Sparkles size={12} color="#fbbf24" />
                <span>Fintech Project Accounting Platform</span>
              </div>

              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  lineHeight: 1.25,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  marginBottom: 14,
                }}
              >
                From Quotation to Project Handover.{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 50%, #f97316 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Every Rupee Accounted For.
                </span>
              </h1>

              <p style={{ fontSize: 14, lineHeight: 1.65, color: '#a8a29e', marginBottom: 32 }}>
                The premier operating system for software houses, creative agencies, contractors, and consultancies.
              </p>

              {/* 3 Executive Pillars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: 'rgba(234, 88, 12, 0.15)',
                      border: '1px solid rgba(234, 88, 12, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fdba74',
                      flexShrink: 0,
                    }}
                  >
                    <Receipt size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                      Multi-Method Split Advance Receipts
                    </div>
                    <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 2, lineHeight: 1.5 }}>
                      Partition payments across Cash, Bank, and UPI accounts with zero double counting.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: 'rgba(217, 119, 6, 0.15)',
                      border: '1px solid rgba(217, 119, 6, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fbbf24',
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                      Strict Handover Verification Gate
                    </div>
                    <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 2, lineHeight: 1.5 }}>
                      Blocks source code, keys, and final handovers until client dues are fully cleared.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: 'rgba(234, 88, 12, 0.15)',
                      border: '1px solid rgba(234, 88, 12, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fdba74',
                      flexShrink: 0,
                    }}
                  >
                    <Layers size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                      Audit-Grade Double-Entry Security
                    </div>
                    <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 2, lineHeight: 1.5 }}>
                      Tenant-isolated PostgreSQL database with cryptographic PIN signatures.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Ownership Signoff */}
            <div
              style={{
                marginTop: 36,
                paddingTop: 20,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#78716c',
              }}
            >
              <span>Developed & Owned by <strong style={{ color: '#fdba74' }}>DASA TECH</strong></span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#34d399' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399' }} />
                256-bit Secure
              </span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* RIGHT COLUMN: REFINED EXECUTIVE LOGIN FORM                     */}
        {/* ============================================================== */}
        <div
          style={{
            padding: '48px 44px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.025em',
                marginBottom: 6,
              }}
            >
              {isSetupRequired ? 'Initialize System & Super Admin' : 'Sign in to Dashboard'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              {isSetupRequired
                ? 'Create the primary enterprise Super Admin account to activate the system.'
                : 'Enter your verified username or email and authorized password.'}
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#b91c1c',
                fontSize: 13,
                marginBottom: 22,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE A: FIRST-TIME SETUP WIZARD (NO USERS IN SYSTEM)           */}
          {/* ============================================================== */}
          {isSetupRequired ? (
            <div>
              <div
                style={{
                  padding: '14px 18px',
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 12,
                  marginBottom: 24,
                  color: '#9a3412',
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, marginBottom: 4, color: '#c2410c' }}>
                  <Sparkles size={16} />
                  <span>First-Time Setup Required</span>
                </div>
                All demo data has been purged. Create your Master <strong>Super Admin</strong> credentials to initialize the workspace.
              </div>

              <form onSubmit={handleInitialSetupSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    Super Admin Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <User size={16} />
                    </div>
                    <input
                      required
                      value={setupForm.name}
                      onChange={(e) => setSetupForm({ ...setupForm, name: e.target.value })}
                      placeholder="e.g. Vikram Aditya / Jeyaraman"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        outline: 'none',
                        color: '#0f172a',
                        backgroundColor: '#f8fafc',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    Super Admin Work Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={setupForm.email}
                      onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })}
                      placeholder="dasatechmu@gmail.com"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        outline: 'none',
                        color: '#0f172a',
                        backgroundColor: '#f8fafc',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      Password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        required
                        value={setupForm.password}
                        onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })}
                        placeholder="Min. 6 chars"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          outline: 'none',
                          color: '#0f172a',
                          backgroundColor: '#f8fafc',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        required
                        value={setupForm.confirmPassword}
                        onChange={(e) => setSetupForm({ ...setupForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter password"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          outline: 'none',
                          color: '#0f172a',
                          backgroundColor: '#f8fafc',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <Phone size={16} />
                      </div>
                      <input
                        value={setupForm.phone}
                        onChange={(e) => setSetupForm({ ...setupForm, phone: e.target.value })}
                        placeholder="7639930148"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          outline: 'none',
                          color: '#0f172a',
                          backgroundColor: '#f8fafc',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      Digital PIN (4 digits)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <KeyRound size={16} />
                      </div>
                      <input
                        type="password"
                        maxLength={4}
                        value={setupForm.signaturePin}
                        onChange={(e) => setSetupForm({ ...setupForm, signaturePin: e.target.value.replace(/\D/g, '') })}
                        placeholder="1234"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          outline: 'none',
                          color: '#0f172a',
                          backgroundColor: '#f8fafc',
                          letterSpacing: 3,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={setupSubmitting}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #9a3412 100%)',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(194, 65, 12, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {setupSubmitting ? (
                    'Initializing System...'
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Initialize System & Create Super Admin</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* ============================================================== */
            /* MODE B: STANDARD EXECUTIVE LOGIN SCREEN                        */
            /* ============================================================== */
            <form onSubmit={handleLoginSubmit}>
              {/* User Name / Email Input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#334155', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  Username or Work Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  >
                    <User size={17} />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your username or email"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: 12,
                      border: '1.5px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: 14,
                      fontWeight: 500,
                      outline: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.borderColor = '#ea580c';
                      e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ color: '#334155', fontSize: 13, fontWeight: 700 }}>
                    Password <span style={{ fontWeight: 500, color: '#94a3b8', fontSize: 12 }}>(or DOB: DD-MM-YYYY)</span>
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  >
                    <Lock size={17} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: 12,
                      border: '1.5px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: 14,
                      fontWeight: 500,
                      outline: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.borderColor = '#ea580c';
                      e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, display: 'block' }}>
                  Staff members can authenticate using their registered username and date of birth (d-m-y).
                </span>
              </div>

              {/* Remember Me */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#c2410c', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span>Keep me signed in on this computer</span>
                </label>
              </div>

              {/* Sign In CTA */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #9a3412 100%)',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 800,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px -4px rgba(194, 65, 12, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying Session...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Return Link */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link
              to="/"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#64748b',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#c2410c')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              <span>← Back to DASA EXPENCES Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
