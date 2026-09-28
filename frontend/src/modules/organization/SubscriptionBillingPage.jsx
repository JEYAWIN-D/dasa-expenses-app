import React, { useState, useEffect } from 'react';
import { orgApi } from '../../services/organization.service';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import {
  CreditCard, CheckCircle2, AlertTriangle, RefreshCw,
  Sparkles, Users, FolderGit2, HardDrive, Shield, Calendar, ArrowUpRight, Check, Zap
} from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';

const DEFAULT_PLANS = [
  {
    id: 'starter',
    code: 'STARTER',
    name: 'Starter Tier',
    description: 'Perfect for small teams and boutique agencies starting out.',
    monthlyPrice: 2999,
    annualPrice: 29990,
    maxUsers: 5,
    maxProjects: 25,
    maxStorageGB: 10,
    features: ['5 Team Members', '25 Active Projects', '10 GB Encrypted Storage', 'Quotation Studio & PDF Generator', 'Milestone Invoicing']
  },
  {
    id: 'growth',
    code: 'GROWTH',
    name: 'Growth Scale',
    description: 'Growing firms requiring team collaboration and milestone invoicing.',
    monthlyPrice: 6999,
    annualPrice: 69990,
    maxUsers: 15,
    maxProjects: 100,
    maxStorageGB: 30,
    features: ['15 Team Members', '100 Active Projects', '30 GB Encrypted Storage', 'Progressive Milestone Invoicing', 'Multi-Mode Payment Splits & Receipts']
  },
  {
    id: '7208c2ac-6695-48be-89e3-de67f0ad37ac',
    code: 'BUSINESS',
    name: 'Business Pro',
    description: 'Complete project financial governance, handover gates & treasury control.',
    monthlyPrice: 12999,
    annualPrice: 129990,
    maxUsers: 50,
    maxProjects: 250,
    maxStorageGB: 100,
    features: ['50 Team Members', '250 Active Projects', '100 GB Encrypted Storage', 'Strict Handover Protocol & Certificates', 'Multi-Bank & Cash Double-Entry Ledgers', 'Custom RBAC Role Creation']
  },
  {
    id: 'enterprise',
    code: 'ENTERPRISE',
    name: 'Enterprise Elite',
    description: 'Full statutory compliance, dedicated tenant DB, unlimited scale and SLA.',
    monthlyPrice: 24999,
    annualPrice: 249990,
    maxUsers: 999999,
    maxProjects: 999999,
    maxStorageGB: 500,
    features: ['Unlimited Team Members', 'Unlimited Active Projects', '500 GB Encrypted Storage', 'Dedicated PostgreSQL Database', '24/7 Priority SLA & Dedicated Account Manager']
  }
];

export default function SubscriptionBillingPage() {
  const [billingData, setBillingData] = useState(null);
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('ANNUAL');
  const [upgradingPlan, setUpgradingPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const notify = useNotification();

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      setLoading(true);
      const res = await orgApi.getSubscriptionBilling();
      if (res.data?.success) {
        setBillingData(res.data.data);
        setPlans(res.data.data.availablePlans || []);
      }
    } catch (err) {
      notify.error('Failed to load subscription: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = async (plan) => {
    try {
      setSubmitting(true);
      const res = await orgApi.updateSecuritySettings ?
        await orgApi.getCurrentOrg() : null; // fallback check

      const upgradeRes = await (await import('../../services/api.js')).api.post('/org/subscription/upgrade', {
        planId: plan.id,
        billingCycle,
      });

      if (upgradeRes.data?.success) {
        notify.success(`Successfully switched to ${plan.name}!`);
        setUpgradingPlan(null);
        fetchBillingInfo();
      }
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to switch subscription plan');
    } finally {
      setSubmitting(false);
    }
  };

  const getPercentage = (used, max) => {
    if (!max || max === 0) return 0;
    return Math.min(Math.round((used / max) * 100), 100);
  };

  const defaultBilling = {
    subscription: {
      status: 'ACTIVE',
      billingCycle: 'ANNUAL',
      plan: {
        name: 'Business Pro',
        code: 'BUSINESS',
        description: 'Complete project financial governance, handover gates & treasury control.'
      }
    },
    usage: {
      usersCount: 3,
      projectsCount: 3,
      storageBytes: 0
    },
    entitlements: {
      MAX_USERS: 50,
      MAX_PROJECTS: 250,
      MAX_STORAGE_GB: '100 GB'
    }
  };

  const activeData = billingData || defaultBilling;
  const sub = activeData?.subscription;
  const currentPlan = sub?.plan;
  const usage = activeData?.usage || {};
  const entitlements = activeData?.entitlements || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>
                Subscription & Resource Entitlements
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Manage your organization's SaaS subscription tier, seat capacity, cloud storage quotas, and billing.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchBillingInfo}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <div>Loading subscription entitlements & metrics...</div>
        </div>
      ) : (
        <>
          {/* Active Plan Hero Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #172554 100%)',
              color: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
              <div style={{ maxWidth: '600px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(147, 197, 253, 0.3)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#93c5fd',
                    letterSpacing: '0.5px',
                    marginBottom: '12px',
                  }}
                >
                  <Sparkles size={13} />
                  <span>Active SaaS Workspace Plan</span>
                </div>

                <h2 style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>
                  {currentPlan?.name || 'Business Pro'}
                </h2>
                <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '8px', lineHeight: 1.6 }}>
                  {currentPlan?.description || 'Full-featured enterprise plan with unlimited quotations, automated expense approvals, and advanced analytics.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '18px', fontSize: '13px', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="#60a5fa" />
                    <span>Period: <strong>{sub?.billingCycle || 'Annual'} Continuous</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span style={{ color: '#34d399', fontWeight: 700 }}>STATUS: {sub?.status || 'ACTIVE'}</span>
                  </div>
                </div>
              </div>

              {/* Price Tag */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '24px 28px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  minWidth: '220px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#93c5fd', letterSpacing: '0.5px' }}>
                  Tier Investment
                </div>
                <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>
                  ₹{Number(currentPlan?.monthlyPriceINR || 12999).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  per month / billed {sub?.billingCycle?.toLowerCase() || 'annually'}
                </div>
              </div>
            </div>
          </div>

          {/* Quota Usage Meters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Team Seats */}
            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} color="#2563eb" />
                  <span>Team Seats Capacity</span>
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {usage.usersCount || 1} / {entitlements.MAX_USERS || 50}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#2563eb',
                    borderRadius: '999px',
                    width: `${getPercentage(usage.usersCount || 1, entitlements.MAX_USERS || 50)}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                {Math.max(0, (entitlements.MAX_USERS || 50) - (usage.usersCount || 1))} verified staff seats available on current tier.
              </p>
            </div>

            {/* Projects Capacity */}
            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FolderGit2 size={16} color="#7c3aed" />
                  <span>Active Projects Capacity</span>
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {usage.projectsCount || 0} / {entitlements.MAX_PROJECTS || 250}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#7c3aed',
                    borderRadius: '999px',
                    width: `${getPercentage(usage.projectsCount || 0, entitlements.MAX_PROJECTS || 250)}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Active project workspaces with milestone governance and handovers.
              </p>
            </div>

            {/* Cloud Storage */}
            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HardDrive size={16} color="#059669" />
                  <span>Isolated Cloud Storage</span>
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {((usage.storageBytes || 0) / (1024 * 1024)).toFixed(1)} MB / {entitlements.MAX_STORAGE_GB || '100 GB'}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#059669',
                    borderRadius: '999px',
                    width: `${Math.max(2, getPercentage(usage.storageBytes || 0, 1024 * 1024 * 1024 * 100))}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Private tenant object storage for contracts, receipts and blueprints.
              </p>
            </div>
          </div>

          {/* Subscription Tiers Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Available SaaS Subscription Tiers
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Upgrade or adjust your workspace capacity as your enterprise expands.
                </p>
              </div>

              {/* Billing Cycle Selector */}
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setBillingCycle('MONTHLY')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: billingCycle === 'MONTHLY' ? '#ffffff' : 'transparent',
                    color: billingCycle === 'MONTHLY' ? 'var(--text-main)' : 'var(--text-muted)',
                    boxShadow: billingCycle === 'MONTHLY' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('ANNUAL')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: billingCycle === 'ANNUAL' ? '#ffffff' : 'transparent',
                    color: billingCycle === 'ANNUAL' ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: billingCycle === 'ANNUAL' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  Annual Billing (Save 20%)
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              {plans.map(p => {
                const isCurrent = p.id === sub?.planId || p.code === currentPlan?.code;
                const price = billingCycle === 'ANNUAL' ? p.annualPrice : p.monthlyPrice;

                return (
                  <div
                    key={p.id}
                    className="card"
                    style={{
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      position: 'relative',
                      boxShadow: isCurrent ? '0 10px 25px -5px rgba(37, 99, 235, 0.15)' : 'var(--shadow-sm)',
                    }}
                  >
                    <div>
                      {isCurrent && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -11,
                            left: 20,
                            backgroundColor: 'var(--primary)',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 10px',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          Current Active Plan
                        </div>
                      )}

                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                        {p.code}
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {p.name}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4, minHeight: '34px' }}>
                        {p.description}
                      </p>

                      <div style={{ margin: '18px 0', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>
                          ₹{Number(price).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {billingCycle === 'ANNUAL' ? 'per year (tax incl.)' : 'per month'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        {(p.features || []).map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                            <Check size={14} color="#10b981" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className="btn btn-secondary"
                          style={{ width: '100%', fontWeight: 700, backgroundColor: '#f1f5f9', cursor: 'default' }}
                        >
                          Current Subscription
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setUpgradingPlan(p)}
                          className="btn btn-primary"
                          style={{ width: '100%', fontWeight: 700 }}
                        >
                          Switch to {p.name}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Upgrade Confirmation Modal */}
      {upgradingPlan && (
        <Modal
          isOpen={Boolean(upgradingPlan)}
          onClose={() => setUpgradingPlan(null)}
          title={`Switch Subscription to ${upgradingPlan.name}`}
          maxWidth={460}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              You are about to switch your organization's subscription tier to <strong>{upgradingPlan.name}</strong> on the <strong>{billingCycle.toLowerCase()}</strong> billing cycle.
            </p>

            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>New Plan:</span>
                <span style={{ fontWeight: 700 }}>{upgradingPlan.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cycle:</span>
                <span style={{ fontWeight: 700 }}>{billingCycle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0 0', marginTop: '8px', borderTop: '1px dashed var(--border-subtle)', fontSize: '15px' }}>
                <span style={{ fontWeight: 700 }}>Amount Payable:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{(billingCycle === 'ANNUAL' ? upgradingPlan.annualPrice : upgradingPlan.monthlyPrice).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setUpgradingPlan(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpgradePlan(upgradingPlan)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {submitting ? 'Updating Tier...' : 'Confirm Tier Switch'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
