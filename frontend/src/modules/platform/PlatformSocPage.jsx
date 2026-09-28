import React, { useState, useEffect } from 'react';
import { platformApi } from '../../services/platform.service';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, 
  Terminal, Search, Filter, RefreshCw, Lock, Eye, Check
} from 'lucide-react';

export default function PlatformSocPage() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalAlerts: 0, criticalAlerts: 0, resolvedAlerts: 0 });
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [activeModalEvent, setActiveModalEvent] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSocEvents();
  }, [severityFilter]);

  const fetchSocEvents = async () => {
    try {
      setLoading(true);
      const res = await platformApi.getSocEvents({ severity: severityFilter });
      if (res.data?.success) {
        setEvents(res.data.data);
        const evs = res.data.data;
        setStats({
          totalAlerts: evs.length,
          criticalAlerts: evs.filter(e => e.severity === 'CRITICAL' && !e.resolvedAt).length,
          resolvedAlerts: evs.filter(e => e.resolvedAt).length,
        });
      }
    } catch (err) {
      setError('Failed to fetch SOC events: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!activeModalEvent) return;

    try {
      setResolvingId(activeModalEvent.id);
      const res = await platformApi.resolveSocEvent(activeModalEvent.id, { notes: resolutionNotes });
      if (res.data?.success) {
        setSuccess('Security incident marked as resolved.');
        setActiveModalEvent(null);
        setResolutionNotes('');
        fetchSocEvents();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to resolve event: ' + (err.response?.data?.message || err.message));
    } finally {
      setResolvingId(null);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-rose-600" />
            Platform Security Operations Center (SOC)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time telemetry on cross-tenant access violations, credential stuffing, rate-limit trips, and platform privilege anomalies.
          </p>
        </div>
        <button
          onClick={fetchSocEvents}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Threat Telemetry
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Recorded Events</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.totalAlerts}</div>
          <div className="text-xs text-slate-400 mt-1">Security logs across all tenants</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/20">
          <div className="text-rose-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Active Critical Threats
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">{stats.criticalAlerts}</div>
          <div className="text-xs text-rose-500 mt-1">Require immediate administrative intervention</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Resolved Incidents
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{stats.resolvedAlerts}</div>
          <div className="text-xs text-emerald-500 mt-1">Investigated & documented by Security Admins</div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 uppercase">Filter Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          Tamper-evident append-only telemetry
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading security events...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="font-semibold text-base text-slate-700">No active security threats detected</p>
            <p className="text-xs text-slate-400 mt-1">
              All multi-tenant isolation, JWT sessions, and authorization checks are operating normally.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Details & Description</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {ev.eventType}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(ev.severity)}`}>
                        {ev.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="text-slate-800 font-medium">{ev.description}</div>
                      {ev.metadata && (
                        <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                          {typeof ev.metadata === 'object' ? JSON.stringify(ev.metadata) : ev.metadata}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {ev.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(ev.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ev.resolvedAt ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5" /> Resolved
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveModalEvent(ev);
                            setResolutionNotes('');
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold transition-all shadow-sm"
                        >
                          Resolve Incident
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

      {/* Incident Resolution Modal */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Resolve Security Incident
            </h2>
            <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
              <div className="font-bold text-slate-800">{activeModalEvent.eventType}</div>
              <div className="text-slate-600">{activeModalEvent.description}</div>
              <div className="text-slate-400 font-mono text-[10px]">Source IP: {activeModalEvent.ipAddress || '127.0.0.1'}</div>
            </div>

            <form onSubmit={handleResolve} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Investigation & Resolution Notes
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe root cause, actions taken (e.g. revoked token, blocked IP), and verification steps..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModalEvent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolvingId === activeModalEvent.id}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  {resolvingId === activeModalEvent.id ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
