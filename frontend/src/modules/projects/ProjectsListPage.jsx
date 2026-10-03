import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  Calendar,
  Building,
  RefreshCw,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { projectsService } from '../../services/projects.service.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { CreateProjectModal } from './components/CreateProjectModal.jsx';
import { ConvertQuotationModal } from './components/ConvertQuotationModal.jsx';

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const notify = useNotification();
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [handoverFilter, setHandoverFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectsService.getProjects({
        search,
        status: statusFilter,
        handoverStatus: handoverFilter,
      });
      setProjects(res.data || []);
      if (res.meta?.portfolioSummary) {
        setSummary(res.meta.portfolioSummary);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await projectsService.deleteProject(projectToDelete.id);
      notify.success(`Project ${projectToDelete.projectCode} deleted successfully`);
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      notify.error(err.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, handoverFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return { label: 'In Progress', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'COMPLETED':
        return { label: 'Completed', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      case 'HANDED_OVER':
        return { label: 'Handed Over', bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' };
      case 'PLANNING':
        return { label: 'Planning', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
      case 'ON_HOLD':
        return { label: 'On Hold', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      default:
        return { label: status, bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Project Management & Financial Governance
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>
            Centralized control from quotation & advance tracking to expense utilization, final payment verification & handover.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setConvertModalOpen(true)}
            style={{
              padding: '9px 16px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <FileCheck size={16} color="#2563eb" />
            <span>Convert Approved Quotation</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              padding: '9px 18px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Portfolio Financial KPI Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Projects</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {summary.activeProjectsCount} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>of {projects.length} Total</span>
            </div>
            <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
              {summary.completedProjectsCount} Completed / Handed Over
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Portfolio Value</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
              ₹{summary.totalProjectValue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4 }}>Approved contract value</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', textTransform: 'uppercase' }}>Payments Received</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: 4 }}>
              ₹{summary.totalReceived.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: 4 }}>
              {summary.totalProjectValue > 0 ? Math.round((summary.totalReceived / summary.totalProjectValue) * 100) : 0}% Collected
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>Pending Receivables</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: summary.totalOutstanding > 0 ? '#b45309' : '#16a34a', marginTop: 4 }}>
              ₹{summary.totalOutstanding.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: '#b45309', marginTop: 4 }}>Outstanding customer balance</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Project Expenses</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#475569', marginTop: 4 }}>
              ₹{summary.totalExpenses.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4 }}>Utilized project expenditure</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6d28d9', textTransform: 'uppercase' }}>Est. Net Profit</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#6d28d9', marginTop: 4 }}>
              ₹{summary.totalEstimatedProfit.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 600, marginTop: 4 }}>
              {summary.totalProjectValue > 0 ? Math.round((summary.totalEstimatedProfit / summary.totalProjectValue) * 100) : 0}% Margin
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          backgroundColor: 'var(--bg-surface)',
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by project name, code, or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '8px 14px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="">All Project Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="HANDED_OVER">Handed Over</option>
          </select>

          <select
            value={handoverFilter}
            onChange={(e) => setHandoverFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="">All Handover States</option>
            <option value="HANDED_OVER">Handed Over</option>
            <option value="NOT_READY">Not Handed Over</option>
          </select>

          <button
            onClick={fetchProjects}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '12px',
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Projects Grid / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
          <div>Loading projects and financial positions...</div>
        </div>
      ) : projects.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <FolderKanban size={48} color="var(--text-subtle)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>No Projects Found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '8px auto 20px' }}>
            Create your first project manually or convert an existing approved quotation to initiate tracking.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button
              onClick={() => setConvertModalOpen(true)}
              style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Convert Quotation
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{ padding: '8px 18px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Create Project
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {projects.map((p) => {
            const statusBadge = getStatusBadge(p.status);
            const fin = p.financials;
            const collectionPercent = fin.totalProjectValue > 0 ? Math.min(100, Math.round((fin.totalPaid / fin.totalProjectValue) * 100)) : 0;
            const isHandoverCleared = p.status === 'HANDED_OVER' || fin.outstandingBalance === 0;

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Card Top: Code & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        color: '#0f172a',
                      }}
                    >
                      {p.projectCode}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.color,
                        border: `1px solid ${statusBadge.border}`,
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Handover Eligibility Badge */}
                  {p.status === 'HANDED_OVER' ? (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', backgroundColor: '#f5f3ff', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} />
                      <span>Handed Over</span>
                    </span>
                  ) : isHandoverCleared ? (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', backgroundColor: '#f0fdf4', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} />
                      <span>Handover Ready</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#b45309', backgroundColor: '#fffbeb', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={12} />
                      <span>Handover Locked</span>
                    </span>
                  )}
                </div>

                {/* Title & Customer */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                    {p.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>
                    <Building size={14} color="#64748b" />
                    <span>{p.client?.companyName}</span>
                  </div>
                </div>

                {/* Financial Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Collections Progress</span>
                    <strong style={{ color: '#2563eb' }}>{collectionPercent}% Paid</strong>
                  </div>
                  <div style={{ height: '7px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${collectionPercent}%`,
                        backgroundColor: collectionPercent === 100 ? '#10b981' : '#2563eb',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Financial Grid Mini */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Total Project Value</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      ₹{fin.totalProjectValue.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Outstanding Balance</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: fin.outstandingBalance > 0 ? '#b45309' : '#16a34a' }}>
                      ₹{fin.outstandingBalance.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Project Expenses</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                      ₹{fin.totalExpenses.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Available Funds</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: fin.remainingFunds >= 0 ? '#16a34a' : '#ef4444' }}>
                      ₹{fin.remainingFunds.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13} />
                    <span>{p.deadline ? `Due ${new Date(p.deadline).toLocaleDateString('en-IN')}` : 'No deadline'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      title="Delete Project"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(p);
                      }}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#dc2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>

                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>Dashboard</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
          onClick={() => !deleting && setProjectToDelete(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Delete Project</h3>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: 2 }}>{projectToDelete.projectCode}</div>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5, margin: '0 0 16px' }}>
              Are you sure you want to delete project <strong>"{projectToDelete.name}"</strong>?
            </p>

            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                color: '#92400e',
                display: 'flex',
                gap: 8,
                marginBottom: 20,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                This action is protected by system audit logging. The project will be removed from active dashboards while preserving historical accounting records.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setProjectToDelete(null)}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  color: '#475569',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteProject}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {deleting ? (
                  <>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {createModalOpen && (
        <CreateProjectModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => fetchProjects()}
        />
      )}

      {convertModalOpen && (
        <ConvertQuotationModal
          onClose={() => setConvertModalOpen(false)}
          onSuccess={() => fetchProjects()}
        />
      )}
    </div>
  );
}
