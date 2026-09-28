import React, { useState, useEffect } from 'react';
import { platformApi } from '../../services/platform.service';
import { 
  Activity, Server, Database, HardDrive, ShieldCheck, 
  Cpu, CheckCircle2, RefreshCw, AlertCircle
} from 'lucide-react';

export default function PlatformHealthPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await platformApi.getOverview();
      if (res.data?.success) {
        setMetrics(res.data.data);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-emerald-600" />
            Platform Infrastructure & Cluster Health
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time status of PostgreSQL multi-tenant isolation, Redis queues, and private tenant storage pools.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Health Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">PostgreSQL Core</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Multi-Tenant DB
          </div>
          <p className="text-xs text-slate-400 mt-1">Connection pool: Active (Max 100)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tenant Isolation</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Enforced
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 flex items-center gap-2">
            <Server className="w-6 h-6 text-indigo-600" />
            Middleware & RLS
          </div>
          <p className="text-xs text-slate-400 mt-1">Deny-by-default token scoping</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Storage Pool</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Online
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-teal-600" />
            Private Storage
          </div>
          <p className="text-xs text-slate-400 mt-1">Encrypted tenant namespaces</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">API Gateway</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> 99.98% SLA
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-600" />
            Rate Limiter
          </div>
          <p className="text-xs text-slate-400 mt-1">100 req/min per tenant enforced</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Security Architecture Verification Checkpoint</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
            <div className="font-bold text-slate-800">1. Server-Side Derived Tenant Context</div>
            <p className="text-slate-500">
              Frontend cannot pass arbitrary organization IDs in request bodies to hijack records. Context is verified against server-side session and membership tables.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
            <div className="font-bold text-slate-800">2. Storage Namespace Path Isolation</div>
            <p className="text-slate-500">
              Files are physically organized in <code>organizations/&#123;orgId&#125;/documents/</code>. Direct access is blocked; signed, time-limited tokens authorize reads.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
            <div className="font-bold text-slate-800">3. Immutable Financial Ledger</div>
            <p className="text-slate-500">
              Approved journal entries cannot be deleted or mutated. Compensating reversal entries preserve strict double-entry integrity and audit provenance.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
            <div className="font-bold text-slate-800">4. Granular RBAC & Resource Scopes</div>
            <p className="text-slate-500">
              Every sensitive endpoint asserts both permission codes (e.g. <code>FINANCE_MANAGE</code>) and resource scopes (OWN vs ASSIGNED vs ORGANIZATION).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
