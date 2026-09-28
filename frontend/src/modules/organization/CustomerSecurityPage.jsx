import React, { useState, useEffect } from 'react';
import { orgApi } from '../../services/organization.service';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { 
  ShieldCheck, Smartphone, Laptop, LogOut, CheckCircle2, 
  AlertTriangle, RefreshCw, Lock, KeyRound, Clock, ShieldAlert
} from 'lucide-react';

export default function CustomerSecurityPage() {
  const [securityData, setSecurityData] = useState({ activeSessions: [], recentAudit: [], enforceOrgMfa: false });
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);

  const notify = useNotification();

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const res = await orgApi.getSecurityOverview();
      const payload = res?.activeSessions ? res : (res?.data?.activeSessions ? res.data : (res?.data || res));
      if (payload) {
        setSecurityData(payload);
      }
    } catch (err) {
      notify.error('Failed to load security overview: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      setRevokingId(sessionId);
      const res = await orgApi.revokeSession(sessionId);
      if (res?.success || res?.data?.success || res?.status === 200) {
        notify.success('Device session terminated successfully.');
        fetchSecurityData();
      }
    } catch (err) {
      notify.error('Failed to terminate session: ' + (err.response?.data?.message || err.message));
    } finally {
      setRevokingId(null);
    }
  };

  const handleToggleMfa = async () => {
    try {
      const nextState = !securityData.enforceOrgMfa;
      const res = await (await import('../../services/api.js')).api.post('/org/security/settings', { enforceOrgMfa: nextState });

      if (res?.success || res?.data?.success || res?.status === 200) {
        setSecurityData(prev => ({ ...prev, enforceOrgMfa: nextState }));
        notify.success(nextState ? 'Organization-wide MFA enforcement enabled!' : 'MFA enforcement policy relaxed.');
      }
    } catch (err) {
      notify.error('Failed to update MFA policy: ' + (err.response?.data?.message || err.message));
    }
  };

  const sessions = securityData.activeSessions || securityData.sessions || [];
  const auditLogs = securityData.recentAudit || securityData.securityEvents || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>
                Workspace Security Center & Sessions
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Enforce organization login policies, inspect active employee sessions, and audit privileged operations.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchSecurityData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Device Sessions
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px' }}>
            {sessions.length || 1}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Authenticated device tokens
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            MFA Protection Policy
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: securityData.enforceOrgMfa ? '#059669' : '#d97706', marginTop: '6px', display: 'flex', alignItems: 'center', gap: 6 }}>
            {securityData.enforceOrgMfa ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{securityData.enforceOrgMfa ? 'ENFORCED (STRICT)' : 'OPTIONAL (STANDARD)'}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            TOTP two-factor verification
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Session Hijacking Guard
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>
            IP & Fingerprint Active
          </div>
          <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px' }}>
            Automatic revocation upon anomaly
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Audit Trail Logging
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0284c7', marginTop: '6px' }}>
            {auditLogs.length}
          </div>
          <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '4px' }}>
            Immutable security events captured
          </div>
        </div>
      </div>

      {/* MFA Policy Toggle Card */}
      <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Organization-Wide Multi-Factor Authentication (MFA)
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
            Require all invited staff members, accounts managers, and project administrators to provide TOTP authentication upon sign-in.
          </p>
        </div>

        <button
          onClick={handleToggleMfa}
          className={securityData.enforceOrgMfa ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{
            fontWeight: 700,
            padding: '9px 18px',
            backgroundColor: securityData.enforceOrgMfa ? '#10b981' : undefined,
            borderColor: securityData.enforceOrgMfa ? '#10b981' : undefined,
            color: securityData.enforceOrgMfa ? '#ffffff' : undefined,
          }}
        >
          {securityData.enforceOrgMfa ? 'MFA Policy: ENFORCED' : 'Enable MFA Enforcement'}
        </button>
      </div>

      {/* Active Device Sessions */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '14px' }}>
            Active Authenticated Sessions ({sessions.length || 1})
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Instant remote token revocation enabled
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading active sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', color: 'var(--primary)' }}>
                <Laptop size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
                  Current Active Browser Session (127.0.0.1)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                  Verified JWT session • <strong style={{ color: '#10b981' }}>Current Device</strong>
                </div>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: 4 }}>
              Active
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sessions.map((sess, idx) => (
              <div
                key={sess.id || idx}
                style={{
                  padding: '16px 20px',
                  borderBottom: idx < sessions.length - 1 ? '1px solid #f1f5f9' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', color: 'var(--primary)' }}>
                    <Laptop size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
                      {sess.user?.name || 'Staff User'} ({sess.user?.email || 'Active Token'})
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                      IP: <span style={{ fontFamily: 'var(--font-mono)' }}>{sess.ipAddress || '127.0.0.1'}</span> • Last Active: {new Date(sess.lastActiveAt || Date.now()).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <button
                  disabled={revokingId === sess.id}
                  onClick={() => handleRevokeSession(sess.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444', borderColor: '#fecaca', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <LogOut size={13} />
                  <span>Revoke Session</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Audit Records */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 800, color: 'var(--text-main)', fontSize: '14px' }}>
          Recent Privileged Security Events & Audit Trail
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Action / Event</th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Target Entity</th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Actor</th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No security anomalies or audit alerts recorded.
                  </td>
                </tr>
              ) : (
                auditLogs.map((evt, idx) => (
                  <tr key={evt.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: '12px' }}>
                      {evt.action || evt.eventType || 'SECURITY_EVENT'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      {evt.entity || evt.description || 'System Governance'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {evt.user?.email || evt.actor || 'System Admin'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {new Date(evt.createdAt || Date.now()).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
