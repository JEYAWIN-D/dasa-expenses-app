import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useCompany } from '../../contexts/CompanyContext.jsx';
import { LogOut, UserCircle2, Building, Shield, Search, Keyboard } from 'lucide-react';

export function Navbar({ onOpenShortcuts, onOpenCommandPalette }) {
  const { user, logout } = useAuth();
  const { company } = useCompany();

  return (
    <header
      style={{
        height: 64,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left side: Company / System indication */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {company?.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={company.companyName || 'Company Logo'}
            style={{ height: 32, maxWidth: 120, objectFit: 'contain' }}
          />
        ) : (
          <div style={{ color: 'var(--primary)' }}>
            <Building size={18} />
          </div>
        )}
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
          {company?.companyName || 'DASA TECH'}
        </span>
        <span
          style={{
            fontSize: 11,
            backgroundColor: '#eff6ff',
            color: 'var(--primary)',
            padding: '2px 8px',
            borderRadius: 99,
            fontWeight: 700,
            border: '1px solid #bfdbfe',
          }}
        >
          FY 2026-27
        </span>
      </div>

      {/* Middle: Command Palette Quick Search Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={onOpenCommandPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '6px 14px',
            borderRadius: 20,
            color: '#64748b',
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
          title="Global Quick Action (Ctrl+K)"
        >
          <Search size={15} color="var(--primary)" />
          <span>Search or jump to...</span>
          <kbd
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              padding: '1px 5px',
              fontSize: 10,
              fontWeight: 800,
              color: '#475569',
            }}
          >
            Ctrl+K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenShortcuts}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: 8,
          }}
          title="View All Keyboard Shortcuts (?)"
        >
          <Keyboard size={14} color="var(--primary)" />
          <span>Shortcuts</span>
          <kbd
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 3,
              padding: '0 4px',
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            ?
          </kbd>
        </button>
      </div>

      {/* Right side: User Profile, Role Badge, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              border: '1.5px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {user?.name ? user.name[0] : <UserCircle2 size={18} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
              {user?.name || 'Administrator'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Shield size={10} color="#3b82f6" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {user?.role || 'SUPER_ADMIN'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-subtle)' }} />

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444' }}
          title="Sign out of system"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
