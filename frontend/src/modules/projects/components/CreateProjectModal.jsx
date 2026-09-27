import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FolderPlus, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api.js';
import { projectsService } from '../../../services/projects.service.js';
import { useNotification } from '../../../contexts/NotificationContext.jsx';

export function CreateProjectModal({ onClose, onSuccess }) {
  const notify = useNotification();
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [quotationValue, setQuotationValue] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState('0');
  const [advancePercent, setAdvancePercent] = useState('50');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('');
  const [teamLead, setTeamLead] = useState('');

  // Customizable Milestones state
  const [milestones, setMilestones] = useState([
    { title: 'Phase 1: Project Kickoff & Advance', percentage: 50, amount: 0, status: 'PENDING' },
    { title: 'Phase 2: Core Development Milestone', percentage: 30, amount: 0, status: 'PENDING' },
    { title: 'Phase 3: Final Delivery & Handover', percentage: 20, amount: 0, status: 'PENDING' },
  ]);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await api.get('/clients', { limit: 100 });
        setClients(res.data || []);
        if (res.data && res.data.length > 0) {
          setClientId(res.data[0].id);
        }
      } catch (err) {
        setError('Failed to load clients list');
      } finally {
        setLoadingClients(false);
      }
    }
    loadClients();
  }, []);

  // Update milestone amounts when quotationValue or additionalCharges changes
  const totalVal = (parseFloat(quotationValue) || 0) + (parseFloat(additionalCharges) || 0);

  useEffect(() => {
    if (totalVal > 0) {
      setMilestones((prev) =>
        prev.map((m) => ({
          ...m,
          amount: Math.round(totalVal * (m.percentage / 100) * 100) / 100,
        }))
      );
    }
  }, [totalVal]);

  const handleMilestoneChange = (index, field, value) => {
    const next = [...milestones];
    next[index][field] = value;
    if (field === 'percentage' && totalVal > 0) {
      next[index].amount = Math.round(totalVal * (parseFloat(value || 0) / 100) * 100) / 100;
    }
    setMilestones(next);
  };

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Phase ${milestones.length + 1}: Custom Milestone`,
        percentage: 0,
        amount: 0,
        status: 'PENDING',
      },
    ]);
  };

  const handleRemoveMilestone = (idx) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!clientId) {
      setError('Please select a customer');
      return;
    }
    if (totalVal <= 0) {
      setError('Total project value must be greater than 0');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        name,
        description,
        clientId,
        quotationValue: parseFloat(quotationValue) || 0,
        additionalCharges: parseFloat(additionalCharges) || 0,
        advanceRequiredPercent: parseFloat(advancePercent) || 50,
        startDate,
        deadline: deadline || null,
        assignedTeam: teamLead ? [{ name: teamLead, role: 'Project Lead' }] : null,
        milestones: milestones.map((m, idx) => ({
          title: m.title,
          milestoneOrder: idx + 1,
          percentage: parseFloat(m.percentage) || 0,
          amount: parseFloat(m.amount) || 0,
          status: 'PENDING',
        })),
      };

      const res = await projectsService.createProject(payload);
      notify.success('Project created with customizable payment phases!');
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
      notify.error(err.message || 'Project creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
              Create New Project
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
              Define project scope, customer quotation value, and customizable payment phases
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--text-subtle)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Omnichannel POS System"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Client / Customer *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px', backgroundColor: '#ffffff' }}
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactPerson})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Quotation / Base Value (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={quotationValue}
                  onChange={(e) => setQuotationValue(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Additional Approved Charges (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Total Project Value
                </label>
                <div style={{ padding: '9px 12px', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '14px', fontWeight: 800, color: '#2563eb' }}>
                  ₹{totalVal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Completion Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Assigned Project Lead
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Aditya"
                  value={teamLead}
                  onChange={(e) => setTeamLead(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Customizable Milestones Area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Customizable Payment Milestones / Phases
                  </label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Configure flexible percentages or fixed amounts (e.g. 50% advance, 30% dev, 20% completion)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Plus size={14} />
                  <span>Add Phase</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {milestones.map((m, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 140px 36px', gap: '8px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                      placeholder="Milestone Title"
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        value={m.percentage}
                        onChange={(e) => handleMilestoneChange(idx, 'percentage', e.target.value)}
                        placeholder="%"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>%</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                      ₹{m.amount.toLocaleString('en-IN')}
                    </div>
                    <button
                      type="button"
                      disabled={milestones.length <= 1}
                      onClick={() => handleRemoveMilestone(idx)}
                      style={{ background: 'transparent', border: 'none', color: milestones.length <= 1 ? '#cbd5e1' : '#ef4444', cursor: milestones.length <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Project Description / Scope Notes
              </label>
              <textarea
                rows={2}
                placeholder="High-level project scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '8px 22px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <FolderPlus size={16} />
              <span>{submitting ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
