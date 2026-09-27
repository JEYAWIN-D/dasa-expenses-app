import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCompany } from '../../contexts/CompanyContext.jsx';
import { DasaLogo } from './DasaLogo.jsx';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  FileCheck2,
  Receipt,
  Wallet,
  Building2,
  TrendingUp,
  BarChart3,
  Settings,
  ShieldCheck,
  Hash,
  ScrollText,
  UserCheck,
  Stamp,
  FolderKanban,
  Landmark,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export function Sidebar() {
  const { company } = useCompany();
  const location = useLocation();
  const currentFullPath = location.pathname + location.search;

  const isItemActive = (to) => {
    if (to.includes('?')) {
      return currentFullPath === to;
    }
    if (location.pathname === to) {
      if (to === '/settings' && location.search && location.search !== '') {
        return false;
      }
      return true;
    }
    return false;
  };

  const navGroups = [
    {
      label: null,
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      ],
    },
    {
      label: 'PROJECTS & BUSINESS',
      items: [
        { to: '/projects', label: 'Projects & Handover', icon: <FolderKanban size={18} /> },
        { to: '/quotations', label: 'Quotations', icon: <FileSpreadsheet size={18} /> },
        { to: '/clients', label: 'Clients', icon: <Users size={18} /> },
        { to: '/invoices', label: 'Invoices & Bills', icon: <FileCheck2 size={18} /> },
        { to: '/payments', label: 'Payments Received', icon: <Receipt size={18} /> },
        { to: '/leads', label: 'Demo Leads & Pipeline', icon: <UserCheck size={18} /> },
      ],
    },

    {
      label: 'FINANCE & CASHFLOW',
      items: [
        { to: '/cash-bank', label: 'Cash & Bank Accounts', icon: <Landmark size={18} /> },
        { to: '/expenses', label: 'Expenses / Outgoing', icon: <Wallet size={18} /> },
        { to: '/vendors', label: 'Vendors & Payables', icon: <Building2 size={18} /> },
        { to: '/cashflow', label: 'Business Cash Flow', icon: <TrendingUp size={18} /> },
      ],
    },
    {
      label: 'ANALYTICS & REPORTS',
      items: [
        { to: '/reports', label: 'Financial Reports', icon: <BarChart3 size={18} /> },
      ],
    },
    {
      label: 'SYSTEM & SETTINGS',
      items: [
        { to: '/settings', label: 'Company Settings', icon: <Settings size={18} /> },
        { to: '/settings?tab=assets', label: 'Logos & Seals', icon: <Stamp size={18} /> },
        { to: '/settings?tab=templates', label: 'Document Templates', icon: <ScrollText size={18} /> },
        { to: '/settings?tab=numbering', label: 'Numbering Formats', icon: <Hash size={18} /> },
        { to: '/settings?tab=audit', label: 'Audit Logs', icon: <ShieldCheck size={18} /> },
        { to: '/settings?tab=users', label: 'Team & RBAC', icon: <UserCheck size={18} /> },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: 260,
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand header */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--sidebar-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <DasaLogo size="sm" lightMode={true} showTagline={true} />
      </div>


      {/* Navigation items */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {group.label && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#475569',
                  letterSpacing: 1,
                  padding: '4px 12px 8px',
                }}
              >
                {group.label}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item, iIdx) => {
                const active = isItemActive(item.to);
                return (
                  <Link
                    key={iIdx}
                    to={item.to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '9px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                      backgroundColor: active ? 'var(--sidebar-active)' : 'transparent',
                      transition: 'all 0.15s ease',
                      textDecoration: 'none',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: '12px 18px',
          borderTop: '1px solid var(--sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: 11,
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          <ExternalLink size={12} />
          <span>Marketing Website</span>
        </Link>
        <div
          style={{
            fontSize: 11,
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>v1.0.0 Enterprise</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#10b981' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
            Online
          </span>
        </div>
      </div>
    </aside>

  );
}
