import React, { useState, useEffect } from 'react';
import { platformApi } from '../../services/platform.service';
import { 
  CreditCard, CheckCircle2, Shield, Users, HardDrive, 
  FolderGit2, Sparkles, RefreshCw, AlertTriangle, Save
} from 'lucide-react';

export default function PlatformPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await platformApi.getPlans();
      if (res.data?.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      setError('Failed to load subscription plans: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (planId, field, value) => {
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return { ...p, [field]: parseFloat(value) || 0 };
      }
      return p;
    }));
  };

  const handleEntitlementChange = (planId, key, value) => {
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const updatedEntitlements = (p.entitlements || []).map(ent => {
          if (ent.key === key) {
            return { ...ent, value: String(value) };
          }
          return ent;
        });
        return { ...p, entitlements: updatedEntitlements };
      }
      return p;
    }));
  };

  const savePlanChanges = async (plan) => {
    try {
      setSavingPlanId(plan.id);
      setError(null);
      setSuccess(null);

      const payload = {
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        isActive: plan.isActive,
        entitlements: (plan.entitlements || []).map(e => ({
          key: e.key,
          value: e.value,
          description: e.description
        }))
      };

      const res = await platformApi.updatePlan(plan.id, payload);
      if (res.data?.success) {
        setSuccess(`Plan ${plan.name} updated successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(`Failed to update ${plan.name}: ` + (err.response?.data?.message || err.message));
    } finally {
      setSavingPlanId(null);
    }
  };

  const getEntitlementVal = (plan, key, fallback = '') => {
    const found = plan.entitlements?.find(e => e.key === key);
    return found ? found.value : fallback;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-blue-600" />
            SaaS Subscription Plans & Entitlements
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure tier pricing, resource quotas, seat limits, and platform feature gates.
          </p>
        </div>
        <button
          onClick={fetchPlans}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Plans
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map(plan => {
            const isSaving = savingPlanId === plan.id;
            const isBusiness = plan.code === 'BUSINESS';
            return (
              <div 
                key={plan.id}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden ${
                  isBusiness ? 'border-blue-300 ring-2 ring-blue-500/20 shadow-blue-500/5' : 'border-slate-200'
                }`}
              >
                {isBusiness && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 text-center">
                    Most Popular Enterprise Tier
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Plan Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                        {plan.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">{plan.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {plan.description || 'Standard multi-tenant subscription package'}
                    </p>
                  </div>

                  {/* Pricing Inputs */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        Monthly Price (₹)
                      </label>
                      <input 
                        type="number"
                        value={plan.monthlyPrice}
                        onChange={(e) => handlePriceChange(plan.id, 'monthlyPrice', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        Annual Price (₹)
                      </label>
                      <input 
                        type="number"
                        value={plan.annualPrice}
                        onChange={(e) => handlePriceChange(plan.id, 'annualPrice', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Quotas & Entitlements */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Plan Quotas & Limits
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex items-center justify-between text-slate-600 font-medium mb-1">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> Max Users / Seats:
                          </span>
                        </div>
                        <input
                          type="text"
                          value={getEntitlementVal(plan, 'MAX_USERS', '5')}
                          onChange={(e) => handleEntitlementChange(plan.id, 'MAX_USERS', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-slate-600 font-medium mb-1">
                          <span className="flex items-center gap-1.5">
                            <FolderGit2 className="w-3.5 h-3.5 text-slate-400" /> Max Projects:
                          </span>
                        </div>
                        <input
                          type="text"
                          value={getEntitlementVal(plan, 'MAX_PROJECTS', '20')}
                          onChange={(e) => handleEntitlementChange(plan.id, 'MAX_PROJECTS', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-slate-600 font-medium mb-1">
                          <span className="flex items-center gap-1.5">
                            <HardDrive className="w-3.5 h-3.5 text-slate-400" /> Storage Limit:
                          </span>
                        </div>
                        <input
                          type="text"
                          value={getEntitlementVal(plan, 'MAX_STORAGE_GB', '10GB')}
                          onChange={(e) => handleEntitlementChange(plan.id, 'MAX_STORAGE_GB', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-slate-600 font-medium mb-1">
                          <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-slate-400" /> Custom Roles:
                          </span>
                        </div>
                        <input
                          type="text"
                          value={getEntitlementVal(plan, 'MAX_CUSTOM_ROLES', '2')}
                          onChange={(e) => handleEntitlementChange(plan.id, 'MAX_CUSTOM_ROLES', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Save Button */}
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <button
                    disabled={isSaving}
                    onClick={() => savePlanChanges(plan)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow transition-all"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
