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
          backgroundColor: '#090d16',
          color: '#ffffff',
          gap: 12,
        }}
      >
        <RefreshCw size={24} className="animate-spin" color="var(--primary)" />
        <span style={{ fontSize: 14 }}>Connecting to system...</span>
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
        backgroundColor: '#090d16',
        padding: 20,
        backgroundImage: 'radial-gradient(circle at 50% 10%, #1e293b 0%, #090d16 100%)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: isSetupRequired ? 520 : 440,
          backgroundColor: '#0f172a',
          borderColor: '#1e293b',
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <DasaLogo size="lg" lightMode={true} />
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
            Enterprise Project Finance & Handover Management
          </p>
        </div>

        {/* Demo Quick Fill Box */}
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 20,
            fontSize: 12,
            color: '#cbd5e1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 800, color: '#38bdf8' }}>DEMO CREDENTIALS:</span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@dasatech.in');
                setPassword('Admin@123');
              }}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              1-Click Fill
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
            <span>Email: <strong>admin@dasatech.in</strong></span>
            <span>Pass: <strong>Admin@123</strong></span>
          </div>
        </div>


        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#f87171',
              fontSize: 13,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
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
                padding: '12px 16px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid #3b82f6',
                borderRadius: 8,
                marginBottom: 20,
                color: '#93c5fd',
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4, color: '#60a5fa' }}>
                <Sparkles size={16} />
                <span>System Initialization & Admin Setup</span>
              </div>
              All demo data has been purged. Create your Master <strong>Super Admin</strong> account to activate and access your system.
            </div>

            <form onSubmit={handleInitialSetupSubmit}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                  Super Admin Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                    <User size={16} />
                  </div>
                  <input
                    required
                    className="form-input"
                    value={setupForm.name}
                    onChange={(e) => setSetupForm({ ...setupForm, name: e.target.value })}
                    placeholder="e.g. Vikram Aditya / Jeyaraman"
                    style={{ paddingLeft: 38, backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                  Super Admin Work Email *
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={setupForm.email}
                    onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })}
                    placeholder="dasatechmu@gmail.com"
                    style={{ paddingLeft: 38, backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Admin Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      className="form-input"
                      value={setupForm.password}
                      onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })}
                      placeholder="Min. 6 chars"
                      style={{ paddingLeft: 38, backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Confirm Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      className="form-input"
                      value={setupForm.confirmPassword}
                      onChange={(e) => setSetupForm({ ...setupForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter"
                      style={{ paddingLeft: 38, backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                      <Phone size={16} />
                    </div>
                    <input
                      className="form-input"
                      value={setupForm.phone}
                      onChange={(e) => setSetupForm({ ...setupForm, phone: e.target.value })}
                      placeholder="7639930148"
                      style={{ paddingLeft: 38, backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Digital PIN (4 digits)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      className="form-input"
                      value={setupForm.signaturePin}
                      onChange={(e) => setSetupForm({ ...setupForm, signaturePin: e.target.value.replace(/\D/g, '') })}
                      placeholder="1234"
                      style={{ paddingLeft: 38, backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff', letterSpacing: 2 }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={setupSubmitting}
                style={{ width: '100%', padding: '12px 16px', fontSize: 14, fontWeight: 700 }}
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
          /* MODE B: STANDARD LOGIN SCREEN (WHEN USERS EXIST)               */
          /* ============================================================== */
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: 13 }}>
                User Name or Email
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                >
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter User Name or Email"
                  style={{
                    paddingLeft: 38,
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#ffffff',
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ color: '#cbd5e1', fontSize: 13 }}>
                  Password (or Date of Birth: DD-MM-YYYY)
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                >
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password or DOB (e.g. 15-08-1995)"
                  style={{
                    paddingLeft: 38,
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#ffffff',
                  }}
                />
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                Staff members can sign in with their User Name and Date of Birth in (d-m-y) format.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                Remember me on this browser
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px 16px', fontSize: 14 }}
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>Developed & Owned by <strong>DASA TECH</strong> • 256-bit Secure</div>
          <Link to="/" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>
            ← Back to DASA EXPENCES Website
          </Link>
        </div>
      </div>
    </div>
  );
}

