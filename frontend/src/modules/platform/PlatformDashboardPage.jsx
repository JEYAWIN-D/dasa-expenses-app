import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Building2,
  Users,
  HardDrive,
  ShieldAlert,
  ArrowUpRight,
  UserCheck,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { platformService } from '../../services/platform.service.js';

export default function PlatformDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await platformService.getOverview();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch platform metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const { metrics, planDistribution, recentOrganizations } = data || {};

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
            DASA TECH Platform Command Center
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Live SaaS Business Metrics, Subscription Revenue & Multi-Tenant Infrastructure
          </p>
        </div>
        <button
          onClick={fetchOverview}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '8px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: '#e2e8f0',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* MRR */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>Monthly Recurring (MRR)</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#4ade80" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff' }}>
            ₹{(metrics?.monthlyRecurringRevenueINR || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Annual Run Rate: ₹{(metrics?.annualRecurringRevenueINR || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Organizations */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>Active Organizations</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={16} color="#60a5fa" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff' }}>
            {metrics?.activeSubscriptions || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Total Registered: {metrics?.totalOrganizations || 0} ({metrics?.trialAccounts || 0} in trial)
          </div>
        </div>

        {/* Global Storage */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>Platform Storage Allocated</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={16} color="#c084fc" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff' }}>
            {metrics?.totalStorageAllocatedGB || 0} <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>GB</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Actual Consumption: {metrics?.totalStorageUsedGB || '0.00'} GB
          </div>
        </div>

        {/* Demo Leads Pipeline */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>Pending Demo Inquiries</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(234,179,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={16} color="#facc15" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff' }}>
            {metrics?.pendingDemoRequests || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            <Link to="/platform-admin/demo-requests" style={{ color: '#60a5fa', textDecoration: 'none' }}>
              Convert prospects to tenants →
            </Link>
          </div>
        </div>
      </div>

      {/* Subscription Plans Distribution */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              SaaS Subscription Plans & Active Tenant Distribution
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Configured commercial tiers and subscriber density
            </p>
          </div>
          <Link
            to="/platform-admin/plans"
            style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Configure Pricing & Limits <ArrowUpRight size={15} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {planDistribution?.map((p) => (
            <div
              key={p.code}
              style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#161f38',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#93c5fd', textTransform: 'uppercase' }}>{p.code}</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>{p.subscribersCount}</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                ₹{p.monthlyPriceINR.toLocaleString('en-IN')}/mo
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Customer Organizations Table */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              Recently Provisioned Organizations
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Customer workspaces active on DASA EXPENCES platform
            </p>
          </div>
          <Link
            to="/platform-admin/organizations"
            style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '600', textDecoration: 'none' }}
          >
            View All Organizations →
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#131c31', color: '#94a3b8' }}>
                <th style={{ padding: '12px 24px', fontWeight: '600' }}>Organization / Tenant</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Plan Tier</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Team / Projects</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Storage Quota</th>
                <th style={{ padding: '12px 24px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrganizations?.map((org) => (
                <tr key={org.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '700', color: '#ffffff' }}>{org.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>slug: {org.slug} • {org.email}</div>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#93c5fd', fontSize: '11px', fontWeight: '700' }}>
                      {org.subscription?.plan?.code || 'TRIAL'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: org.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                        color: org.status === 'ACTIVE' ? '#4ade80' : '#facc15',
                      }}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 16px', color: '#cbd5e1' }}>
                    {org._count?.memberships || 1} staff • {org._count?.projects || 0} projects
                  </td>
                  <td style={{ padding: '16px 16px', color: '#cbd5e1' }}>
                    {(org.storageQuotaMB / 1024).toFixed(0)} GB
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link
                      to={`/platform-admin/organizations`}
                      style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}
                    >
                      Manage Tenant
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
