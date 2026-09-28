import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  HardDrive,
  Users,
  CreditCard,
  X,
} from 'lucide-react';
import { platformService } from '../../services/platform.service.js';

export default function PlatformOrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgDetails, setOrgDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [planCode, setPlanCode] = useState('GROWTH');
  const [overrideKey, setOverrideKey] = useState('MAX_PROJECTS');
  const [overrideLimit, setOverrideLimit] = useState('50');
  const [actionMessage, setActionMessage] = useState('');

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await platformService.listOrganizations({ search, status: statusFilter });
      if (res && res.data) {
        setOrganizations(res.data.items || res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [search, statusFilter]);

  const handleOpenDetails = async (org) => {
    setSelectedOrg(org);
    setDetailsLoading(true);
    setActionMessage('');
    try {
      const res = await platformService.getOrganizationDetails(org.id);
      if (res && res.data) {
        setOrgDetails(res.data);
        setPlanCode(res.data.subscription?.plan?.code || 'GROWTH');
      }
    } catch (err) {
      console.error('Error fetching org details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrg) return;
    try {
      await platformService.updateOrganizationStatus(selectedOrg.id, { status: newStatus });
      setActionMessage(`Organization status changed to ${newStatus}`);
      fetchOrganizations();
      handleOpenDetails(selectedOrg);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedOrg) return;
    try {
      await platformService.updateSubscription(selectedOrg.id, { planCode });
      setActionMessage(`Subscription updated to ${planCode}`);
      fetchOrganizations();
      handleOpenDetails(selectedOrg);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleGrantOverride = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;
    try {
      await platformService.grantOverride(selectedOrg.id, {
        featureKey: overrideKey,
        overrideLimit: parseInt(overrideLimit, 10),
        reason: 'Platform Admin manual entitlement override',
      });
      setActionMessage(`Granted override for ${overrideKey}`);
      handleOpenDetails(selectedOrg);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
            SaaS Customer Organizations
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Manage customer workspaces, subscriptions, storage quotas, and security boundaries
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by company name, slug, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff', fontSize: '13px', outline: 'none' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff', fontSize: '13px', outline: 'none' }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIAL">Trial</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Organizations Table */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#131c31', color: '#94a3b8' }}>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>Organization Name</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Workspace Slug</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Subscription Tier</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Storage Quota</th>
              <th style={{ padding: '12px 20px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                  No customer organizations found matching criteria.
                </td>
              </tr>
            ) : (
              organizations.map((org) => (
                <tr key={org.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>{org.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{org.email} • {org.phone}</div>
                  </td>
                  <td style={{ padding: '16px 16px', color: '#93c5fd', fontFamily: 'monospace' }}>
                    /{org.slug}
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#93c5fd', fontSize: '11px', fontWeight: '700' }}>
                      {org.subscription?.plan?.name || org.subscription?.plan?.code || 'TRIAL'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor:
                          org.status === 'ACTIVE'
                            ? 'rgba(34,197,94,0.15)'
                            : org.status === 'SUSPENDED'
                            ? 'rgba(239,68,68,0.15)'
                            : 'rgba(234,179,8,0.15)',
                        color:
                          org.status === 'ACTIVE'
                            ? '#4ade80'
                            : org.status === 'SUSPENDED'
                            ? '#f87171'
                            : '#facc15',
                      }}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 16px', color: '#cbd5e1' }}>
                    {(org.storageQuotaMB / 1024).toFixed(0)} GB
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenDetails(org)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#1d4ed8',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Manage Tenant
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Organization Drill-down Drawer / Modal */}
      {selectedOrg && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                    {selectedOrg.name}
                  </h2>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#93c5fd', fontFamily: 'monospace' }}>
                    slug: {selectedOrg.slug}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  ID: {selectedOrg.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Action Feedback */}
            {actionMessage && (
              <div style={{ padding: '10px 24px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#4ade80', fontSize: '13px', fontWeight: '600' }}>
                ✔ {actionMessage}
              </div>
            )}

            {/* Tabs Header */}
            <div style={{ display: 'flex', gap: '8px', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#090d16' }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'subscription', label: 'Subscription & Plan' },
                { id: 'overrides', label: 'Feature Overrides' },
                { id: 'team', label: 'Users & Roles' },
                { id: 'actions', label: 'Administrative Actions' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 14px',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                    color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: activeTab === tab.id ? '700' : '500',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {detailsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading tenant details...</div>
              ) : activeTab === 'overview' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Legal Name</div>
                    <div style={{ color: '#ffffff', fontWeight: '600', marginTop: '2px' }}>{orgDetails?.legalName || selectedOrg.name}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>GST / Tax Number</div>
                    <div style={{ color: '#ffffff', fontWeight: '600', marginTop: '2px' }}>{orgDetails?.gstNumber || 'Not provided'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Contact Email</div>
                    <div style={{ color: '#ffffff', fontWeight: '600', marginTop: '2px' }}>{orgDetails?.email}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Contact Phone</div>
                    <div style={{ color: '#ffffff', fontWeight: '600', marginTop: '2px' }}>{orgDetails?.phone}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Address</div>
                    <div style={{ color: '#ffffff', fontWeight: '600', marginTop: '2px' }}>{orgDetails?.address}, {orgDetails?.city}, {orgDetails?.state}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Storage Quota</div>
                    <div style={{ color: '#ffffff', fontWeight: '600', marginTop: '2px' }}>{(orgDetails?.storageQuotaMB / 1024).toFixed(0)} GB</div>
                  </div>
                </div>
              ) : activeTab === 'subscription' ? (
                <div>
                  <h3 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '14px' }}>Modify Subscription Plan</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                    <select
                      value={planCode}
                      onChange={(e) => setPlanCode(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                    >
                      <option value="STARTER">Starter Plan (5 Users, 20 Projects, 5GB)</option>
                      <option value="GROWTH">Growth Plan (15 Users, 75 Projects, 25GB)</option>
                      <option value="BUSINESS">Business Pro (50 Users, 250 Projects, 100GB)</option>
                      <option value="ENTERPRISE">Enterprise Cloud (Unlimited, 1TB Storage)</option>
                    </select>
                    <button
                      onClick={handleUpdatePlan}
                      style={{ padding: '10px 18px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Apply Plan Change
                    </button>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#161f38', border: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: '#cbd5e1' }}>
                    Current Active Plan: <strong>{orgDetails?.subscription?.plan?.name}</strong> (Billing: {orgDetails?.subscription?.billingCycle})
                  </div>
                </div>
              ) : activeTab === 'overrides' ? (
                <div>
                  <h3 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '14px' }}>Grant Temporary Resource Override</h3>
                  <form onSubmit={handleGrantOverride} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Feature / Quota Key</label>
                      <select
                        value={overrideKey}
                        onChange={(e) => setOverrideKey(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                      >
                        <option value="MAX_PROJECTS">MAX_PROJECTS</option>
                        <option value="MAX_USERS">MAX_USERS</option>
                        <option value="EXTRA_STORAGE">EXTRA_STORAGE_MB</option>
                        <option value="CUSTOM_ROLES">CUSTOM_ROLES</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>New Limit Value</label>
                      <input
                        type="number"
                        value={overrideLimit}
                        onChange={(e) => setOverrideLimit(e.target.value)}
                        placeholder="50"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                      />
                    </div>
                    <button
                      type="submit"
                      style={{ padding: '10px 18px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Grant Override
                    </button>
                  </form>

                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Active Overrides: {orgDetails?.featureOverrides?.length || 0}
                  </div>
                </div>
              ) : activeTab === 'team' ? (
                <div>
                  <h3 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '14px' }}>Active Staff Members ({orgDetails?.memberships?.length || 0})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {orgDetails?.memberships?.map((m) => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#161f38' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '13px' }}>{m.user.name} {m.isOwner && <span style={{ color: '#facc15', fontSize: '11px' }}>(Owner)</span>}</div>
                          <div style={{ color: '#64748b', fontSize: '11px' }}>{m.user.email}</div>
                        </div>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#93c5fd', fontSize: '11px' }}>
                          {m.role?.name || m.roleTitle}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '14px' }}>Tenant Workspace Actions</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleUpdateStatus('ACTIVE')}
                      style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#15803d', color: '#ffffff', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Activate Workspace
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('SUSPENDED')}
                      style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#b91c1c', color: '#ffffff', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Suspend Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
