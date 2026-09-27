import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext.jsx';

export default function LeadsListPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [countsByStatus, setCountsByStatus] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const { showNotification } = useNotification();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.set('status', statusFilter);
      if (searchTerm) query.set('search', searchTerm);

      const res = await fetch(`/api/leads?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setLeads(json.data || []);
        if (json.meta?.countsByStatus) {
          setCountsByStatus(json.meta.countsByStatus);
        }
      }
    } catch (err) {
      console.error('Failed to load demo leads:', err);
      showNotification('Failed to load demo leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, searchTerm]);

  const handleUpdateStatus = async () => {
    if (!selectedLead) return;
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: leadNotes,
          assignedTo: assignedTo,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Lead status updated successfully', 'success');
        setStatusModalOpen(false);
        fetchLeads();
      } else {
        showNotification(json.message || 'Update failed', 'error');
      }
    } catch (err) {
      showNotification('Error updating lead status', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      NEW: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'New Inquiry' },
      CONTACTED: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'Contacted' },
      DEMO_SCHEDULED: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', label: 'Demo Scheduled' },
      DEMO_COMPLETED: { bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe', label: 'Demo Completed' },
      FOLLOW_UP: { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa', label: 'Follow Up' },
      CONVERTED: { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc', label: 'Converted to Paid' },
      CLOSED: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: 'Closed / Inactive' },
    }[status] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: status };

    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`,
          padding: '2px 8px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
            Demo Requests & SaaS Leads
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Inquiries submitted via DASA EXPENCES marketing website and demo booking modals.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Status Filter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        {[
          { key: '', label: 'All Inquiries', count: leads.length },
          { key: 'NEW', label: 'New', count: countsByStatus.NEW || 0 },
          { key: 'CONTACTED', label: 'Contacted', count: countsByStatus.CONTACTED || 0 },
          { key: 'DEMO_SCHEDULED', label: 'Scheduled', count: countsByStatus.DEMO_SCHEDULED || 0 },
          { key: 'DEMO_COMPLETED', label: 'Completed', count: countsByStatus.DEMO_COMPLETED || 0 },
          { key: 'CONVERTED', label: 'Converted', count: countsByStatus.CONVERTED || 0 },
        ].map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                backgroundColor: active ? 'var(--primary)' : 'var(--bg-surface)',
                color: active ? '#ffffff' : 'var(--text-main)',
                border: `1px solid ${active ? 'var(--primary)' : 'var(--border-subtle)'}`,
                borderRadius: 8,
                padding: '10px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span style={{ fontSize: 11, opacity: active ? 0.9 : 0.6, fontWeight: 600 }}>{tab.label}</span>
              <span style={{ fontSize: 16, fontWeight: 800 }}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: 'var(--bg-surface)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="Search by company name, prospect name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
              fontSize: 13,
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
            }}
          />
        </div>
      </div>

      {/* Leads Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 200 }}>Prospect / Company</th>
                <th style={{ minWidth: 180 }}>Contact</th>
                <th style={{ minWidth: 170 }}>Industry & Scale</th>
                <th style={{ minWidth: 150 }}>Requested Window</th>
                <th style={{ minWidth: 130 }}>Status</th>
                <th style={{ minWidth: 140, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading demo inquiries...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                      No demo requests found
                    </div>
                    <div style={{ fontSize: 13 }}>
                      Visitors requesting demos on the marketing website will appear here in real time.
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const whatsappUrl = `https://wa.me/${(lead.whatsappNumber || lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${lead.fullName}, thank you for requesting a demo of DASA EXPENCES for ${lead.companyName}. This is DASA TECH following up on your requested time slot.`
                  )}`;

                  return (
                    <tr
                      key={lead.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{lead.fullName}</div>
                        <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{lead.companyName}</div>
                        {lead.currentProcess && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            Current: {lead.currentProcess}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)' }}>
                          <Phone size={13} color="var(--text-subtle)" />
                          <span>{lead.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                          <Mail size={13} color="var(--text-subtle)" />
                          <span>{lead.email}</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{lead.industry || 'General'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {lead.companySize || 'Team'} • {lead.monthlyProjects || 'Active Projects'}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {lead.preferredDate ? (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} />
                              <span>{lead.preferredDate}</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.preferredTime}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Any available slot</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(lead.status)}
                        {lead.assignedTo && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                            Rep: {lead.assignedTo}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* WhatsApp Direct Chat */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              padding: '5px 8px',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                            title="Chat with Prospect on WhatsApp"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </a>

                          {/* Update Status Button */}
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setNewStatus(lead.status);
                              setLeadNotes(lead.notes || '');
                              setAssignedTo(lead.assignedTo || '');
                              setStatusModalOpen(true);
                            }}
                            style={{
                              backgroundColor: 'var(--bg-app)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--border-subtle)',
                              padding: '5px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Edit3 size={13} />
                            <span>Update</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status & Notes Modal */}
      {statusModalOpen && selectedLead && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 14,
              padding: 24,
              maxWidth: 480,
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
              Update Lead Status: {selectedLead.companyName}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Prospect: {selectedLead.fullName} ({selectedLead.phone})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  Lead Pipeline Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: 13 }}
                >
                  <option value="NEW">New Inquiry</option>
                  <option value="CONTACTED">Contacted via Phone/WhatsApp</option>
                  <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                  <option value="DEMO_COMPLETED">Demo Completed</option>
                  <option value="FOLLOW_UP">Follow Up Required</option>
                  <option value="CONVERTED">Converted to Paid Customer</option>
                  <option value="CLOSED">Closed / Unqualified</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  Assigned Team Member / Specialist
                </label>
                <input
                  type="text"
                  placeholder="e.g. DASA TECH Sales Architect"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  Follow-up Notes & Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes from call, quotation sent, demo impressions..."
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
