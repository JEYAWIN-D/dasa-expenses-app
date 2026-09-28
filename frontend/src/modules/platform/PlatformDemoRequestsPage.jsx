import React, { useState, useEffect } from 'react';
import { platformApi } from '../../services/platform.service';
import { 
  Users, Mail, Phone, Building2, Calendar, CheckCircle2, 
  ArrowRight, Sparkles, Filter, Search, RefreshCw, AlertTriangle
} from 'lucide-react';

export default function PlatformDemoRequestsPage() {
  const [leads, setLeads] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [convertModalLead, setConvertModalLead] = useState(null);
  const [converting, setConverting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('Welcome@2026');
  const [actionMsg, setActionMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeads();
    fetchPlans();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await platformApi.getDemoRequests({ search, status: statusFilter });
      if (res.data?.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch demo requests: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await platformApi.getPlans();
      if (res.data?.success) {
        setPlans(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedPlanId(res.data.data[0].id);
        }
      }
    } catch {
      // silently fail
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await platformApi.updateDemoRequest(id, { status: newStatus });
      if (res.data?.success) {
        setActionMsg(`Lead status updated to ${newStatus}`);
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      setError('Failed to update lead: ' + (err.response?.data?.message || err.message));
    }
  };

  const openConvertModal = (lead) => {
    setConvertModalLead(lead);
    const suggestedSlug = (lead.company || lead.name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setOrgSlug(suggestedSlug);
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!convertModalLead || !selectedPlanId || !orgSlug) return;

    try {
      setConverting(true);
      setError(null);
      const res = await platformApi.convertDemoToOrg(convertModalLead.id, {
        planId: selectedPlanId,
        slug: orgSlug,
        ownerPassword: ownerPassword || 'Welcome@2026'
      });

      if (res.data?.success) {
        setActionMsg(`Successfully converted "${convertModalLead.company}" to tenant workspace "${orgSlug}"!`);
        setConvertModalLead(null);
        fetchLeads();
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (err) {
      setError('Conversion failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setConverting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONVERTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DEMO_SCHEDULED':
      case 'DEMO_COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONTACTED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'NEW':
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-blue-600" />
            Demo Requests & Sales Pipeline
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Qualify incoming prospective enterprise customers and convert them into live SaaS tenant workspaces with 1 click.
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Pipeline
        </button>
      </div>

      {actionMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by prospect name, company, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLeads()}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setTimeout(fetchLeads, 10);
            }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Lead Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="DEMO_SCHEDULED">Demo Scheduled</option>
            <option value="DEMO_COMPLETED">Demo Completed</option>
            <option value="CONVERTED">Converted to SaaS Tenant</option>
            <option value="CLOSED">Closed / Disqualified</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading demo requests pipeline...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-base text-slate-700">No demo requests found</p>
            <p className="text-xs text-slate-400 mt-1">
              Public inquiries submitted via the marketing site will appear here for sales qualification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Prospect & Company</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Interest & Requirements</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                      <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {lead.company || 'Not Specified'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {lead.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-blue-700">
                        Tier: {lead.interestedPlan || 'Business'}
                      </div>
                      {lead.notes && (
                        <div className="text-slate-500 text-[11px] mt-0.5 max-w-xs truncate" title={lead.notes}>
                          {lead.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-full border ${getStatusBadge(lead.status)} focus:outline-none`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="DEMO_SCHEDULED">DEMO SCHEDULED</option>
                        <option value="DEMO_COMPLETED">DEMO COMPLETED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {lead.status === 'CONVERTED' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Converted
                        </span>
                      ) : (
                        <button
                          onClick={() => openConvertModal(lead)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                        >
                          Convert to SaaS Org
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Convert to Organization Modal */}
      {convertModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Convert Lead to SaaS Tenant
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Create an isolated organization workspace, assign initial subscription plan, and provision tenant owner credentials.
            </p>

            <form onSubmit={handleConvert} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  disabled
                  value={convertModalLead.company || convertModalLead.name}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tenant Workspace Slug</label>
                <div className="flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono">
                    app/
                  </span>
                  <input
                    type="text"
                    required
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-r-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="acme-corp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Owner Email</label>
                <input
                  type="text"
                  disabled
                  value={convertModalLead.email}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subscription Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.monthlyPrice.toLocaleString()}/mo ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Initial Owner Password</label>
                <input
                  type="text"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Tenant owner will be prompted to reset upon first login.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConvertModalLead(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={converting}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  {converting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Provisioning Workspace...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Provision & Activate Organization
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
