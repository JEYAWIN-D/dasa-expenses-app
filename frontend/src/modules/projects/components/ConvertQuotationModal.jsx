import React, { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api.js';
import { projectsService } from '../../../services/projects.service.js';
import { useNotification } from '../../../contexts/NotificationContext.jsx';

export function ConvertQuotationModal({ onClose, onSuccess }) {
  const notify = useNotification();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [advancePercent, setAdvancePercent] = useState(50);
  const [projectName, setProjectName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadQuotations() {
      try {
        const res = await api.get('/quotations', { limit: 50 });
        const list = res.data || [];
        // Filter approved or eligible quotations
        setQuotations(list);
        if (list.length > 0) {
          const firstApproved = list.find((q) => q.status === 'APPROVED') || list[0];
          setSelectedQuoteId(firstApproved.id);
          setProjectName(`${firstApproved.client?.companyName} - Implementation`);
        }
      } catch (err) {
        setError('Failed to fetch quotations');
      } finally {
        setLoading(false);
      }
    }
    loadQuotations();
  }, []);

  const selectedQuote = quotations.find((q) => q.id === selectedQuoteId);

  const handleQuoteChange = (quoteId) => {
    setSelectedQuoteId(quoteId);
    const q = quotations.find((item) => item.id === quoteId);
    if (q) {
      setProjectName(`${q.client?.companyName} - Project Implementation`);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!selectedQuoteId) {
      setError('Please select a quotation to convert');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        name: projectName || `${selectedQuote?.client?.companyName} - Project`,
        advanceRequiredPercent: Number(advancePercent),
        deadline: deadline || null,
      };

      const res = await projectsService.convertQuotation(selectedQuoteId, payload);
      notify.success('Quotation converted to Project with customizable milestones!');
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Conversion failed');
      notify.error(err.message || 'Quotation conversion failed');
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
          maxWidth: '560px',
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
              Convert Quotation to Project
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
              Automatically sets up project financials and customizable payment phases
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--text-subtle)" />
          </button>
        </div>

        <form onSubmit={handleConvert} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Select Approved Quotation *
            </label>
            {loading ? (
              <div style={{ fontSize: '13px', color: '#64748b' }}>Loading quotations...</div>
            ) : (
              <select
                value={selectedQuoteId}
                onChange={(e) => handleQuoteChange(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px', backgroundColor: '#ffffff' }}
                required
              >
                {quotations.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} — {q.client?.companyName} (₹{q.totalAmount?.toLocaleString('en-IN')}) [{q.status}]
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedQuote && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#166534' }}>Client: <strong>{selectedQuote.client?.companyName}</strong></div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#14532d', marginTop: 2 }}>
                  Quotation Value: ₹{selectedQuote.totalAmount?.toLocaleString('en-IN')}
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#166534' }}>
                {selectedQuote.status}
              </span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Acme Corp - E-Commerce Portal"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Required Advance (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={advancePercent}
                onChange={(e) => setAdvancePercent(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Target Completion Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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
              style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <CheckCircle2 size={16} />
              <span>{submitting ? 'Converting...' : 'Convert to Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
