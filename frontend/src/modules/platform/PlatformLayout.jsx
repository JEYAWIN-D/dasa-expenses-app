import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  UserCheck,
  ShieldAlert,
  FileClock,
  Activity,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export default function PlatformLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [platformUser, setPlatformUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('dasa_platform_token');
    const userStr = localStorage.getItem('dasa_platform_user');

    if (!token || !userStr) {
      navigate('/platform-admin/login', { replace: true });
      return;
    }

    try {
      setPlatformUser(JSON.parse(userStr));
    } catch {
      navigate('/platform-admin/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('dasa_platform_token');
    localStorage.removeItem('dasa_platform_user');
    navigate('/platform-admin/login');
  };

  const navItems = [
    { label: 'Platform Command', path: '/platform-admin/dashboard', icon: LayoutDashboard },
    { label: 'SaaS Organizations', path: '/platform-admin/organizations', icon: Building2 },
    { label: 'Plans & Pricing', path: '/platform-admin/plans', icon: CreditCard },
    { label: 'Demo Inquiries', path: '/platform-admin/demo-requests', icon: UserCheck },
    { label: 'Platform SOC (Security)', path: '/platform-admin/security', icon: ShieldAlert },
    { label: 'Global Audit Logs', path: '/platform-admin/audit-logs', icon: FileClock },
    { label: 'System Health', path: '/platform-admin/system-health', icon: Activity },
  ];

  if (!platformUser) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090d16', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Platform Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0c1222',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(37,99,235,0.4)' }}>
            <Layers size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>DASA TECH</div>
            <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Admin</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px' }}>
            SaaS Administration
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/platform-admin/dashboard' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(37,99,235,0.2)' : 'transparent',
                  border: isActive ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={17} color={isActive ? '#60a5fa' : '#64748b'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div style={{ marginTop: '20px', fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px' }}>
            Customer Portals
          </div>
          <a
            href="/dashboard"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#94a3b8',
              textDecoration: 'none',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="#64748b" />
              <span>Customer Workspace</span>
            </div>
            <ExternalLink size={14} color="#64748b" />
          </a>
        </nav>

        {/* User Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#090d16' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#93c5fd', fontSize: '12px' }}>
                {platformUser.name.charAt(0)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {platformUser.name}
                </div>
                <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '700' }}>
                  {platformUser.platformRole}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Platform Topbar */}
        <header
          style={{
            height: '60px',
            backgroundColor: '#0c1222',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
            <span>DASA TECH</span>
            <ChevronRight size={14} color="#64748b" />
            <span style={{ color: '#ffffff', fontWeight: '600' }}>Platform Command Center</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: '12px', fontWeight: '600' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              Platform Operational
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
              <ShieldCheck size={16} color="#3b82f6" />
              <span>Root Authorization</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
