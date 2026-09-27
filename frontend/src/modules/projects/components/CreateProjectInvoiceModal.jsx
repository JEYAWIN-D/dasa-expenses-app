import React, { useState, useEffect } from 'react';
import { X, FileText, Plus, Trash2, Calculator, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api.js';
import { useNotification } from '../../../contexts/NotificationContext.jsx';
import { useCompany } from '../../../contexts/CompanyContext.jsx';

export function CreateProjectInvoiceModal({ project, preselectedMilestone, isOpen, onClose, onSuccess }) {
  const notify = useNotification();
  const { company } = useCompany();

  const [billingMode, setBillingMode] = useState('milestone'); // 'milestone' or 'custom'
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [taxRate, setTaxRate] = useState(18); // Default 18% GST
  const [notes, setNotes] = useState('Thank you for your business. Please process payment before the due date.');
  const [terms, setTerms] = useState(company?.termsAndConditions || 'Payment is strictly due within 15 days of invoice date.');
  const [loading, setLoading] = useState(false);

  // Custom items list
  const [items, setItems] = useState([
    {
      title: 'Project Service / Deliverable',
      description: project?.name || 'Software engineering and implementation services',
      quantity: 1,
      unitPrice: project?.financials?.outstandingBalance || project?.totalProjectValue || 0,
      taxPercent: 18,
    },
  ]);

  // Sync when preselectedMilestone changes
  useEffect(() => {
    if (preselectedMilestone) {
      setBillingMode('milestone');
      setSelectedMilestoneId(preselectedMilestone.id);
      setItems([
        {
          title: preselectedMilestone.title,
          description: preselectedMilestone.notes || `${preselectedMilestone.title} (${preselectedMilestone.percentage}% milestone for ${project?.name})`,
          quantity: 1,
          unitPrice: preselectedMilestone.amount || 0,
          taxPercent: taxRate,
        },
      ]);
    } else if (project?.milestones && project.milestones.length > 0) {
      // Pick first unpaid/partially paid milestone if available
      const unpaid = project.milestones.find((m) => m.status !== 'PAID') || project.milestones[0];
      setSelectedMilestoneId(unpaid.id);
      setItems([
        {
          title: unpaid.title,
          description: unpaid.notes || `${unpaid.title} (${unpaid.percentage}% milestone for ${project?.name})`,
          quantity: 1,
          unitPrice: unpaid.amount || 0,
          taxPercent: taxRate,
        },
      ]);
    }
  }, [preselectedMilestone, project]);

  if (!isOpen || !project) return null;

  const handleMilestoneSelect = (milestoneId) => {
    setSelectedMilestoneId(milestoneId);
    const m = project.milestones?.find((ms) => ms.id === milestoneId);
    if (m) {
      setItems([
        {
          title: m.title,
          description: m.notes || `${m.title} (${m.percentage}% milestone for ${project?.name})`,
          quantity: 1,
          unitPrice: m.amount || 0,
          taxPercent: taxRate,
        },
      ]);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        title: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxPercent: taxRate,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      notify.error('At least one line item is required on a GST bill');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.unitPrice || 0)), 0);
  const taxAmount = Math.round(((subtotal * Number(taxRate || 0)) / 100) * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  // Intra-state vs Inter-state check
  const isInterstate =
    project.client?.state &&
    company?.state &&
    project.client.state.toLowerCase().trim() !== company.state.toLowerCase().trim();

  const cgst = !isInterstate ? Math.round((taxAmount / 2) * 100) / 100 : 0;
  const sgst = !isInterstate ? Math.round((taxAmount - cgst) * 100) / 100 : 0;
  const igst = isInterstate ? taxAmount : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0 || subtotal <= 0) {
      notify.error('Please enter valid invoice items with amounts greater than ₹0');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        clientId: project.clientId || project.client?.id,
        projectId: project.id,
        milestoneId: billingMode === 'milestone' ? selectedMilestoneId || null : null,
        invoiceDate,
        dueDate,
        status: 'ISSUED',
        taxRate: Number(taxRate || 0),
        discountAmount: 0,
        discountType: 'FIXED',
        notes,
        terms,
        items: items.map((it, idx) => ({
          title: it.title || `Item ${idx + 1}`,
          description: it.description || it.title || 'Service deliverable',
          quantity: Number(it.quantity || 1),
          unitPrice: Number(it.unitPrice || 0),
          taxPercent: Number(taxRate || 0),
        })),
      };

      const res = await api.post('/invoices', payload);
      notify.success(`GST Invoice ${res.data?.invoiceNumber || ''} created successfully!`);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      notify.error(err.message || 'Failed to create GST Invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
          maxWidth: '850px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                Generate GST Tax Invoice / Bill
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                {project.projectCode} — {project.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer & GST Info Banner */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                Billed To Customer
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                {project.client?.companyName || 'Valued Customer'}
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                GSTIN: <strong>{project.client?.gstNumber || 'Unregistered / Consumer'}</strong> | State: <strong>{project.client?.state || 'Local'}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                Supplier (Seller)
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                {company?.companyName || 'DASA TECH'}
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                GSTIN: <strong>{company?.gstNumber || '29ABCDE1234F1Z5'}</strong>
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
              Billing Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setBillingMode('milestone');
                  if (project.milestones && project.milestones.length > 0) {
                    handleMilestoneSelect(project.milestones[0].id);
                  }
                }}
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  border: billingMode === 'milestone' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: billingMode === 'milestone' ? '#eff6ff' : '#ffffff',
                  color: billingMode === 'milestone' ? '#1d4ed8' : '#334155',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <CheckCircle2 size={16} />
                  <span>Bill Against Project Milestone</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4 }}>
                  Auto-populate invoice from configured milestone percentage & amount
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBillingMode('custom')}
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  border: billingMode === 'custom' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: billingMode === 'custom' ? '#eff6ff' : '#ffffff',
                  color: billingMode === 'custom' ? '#1d4ed8' : '#334155',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <Calculator size={16} />
                  <span>Custom Itemized GST Bill</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4 }}>
                  Specify line items, quantities, custom rates & SAC/HSN descriptions
                </div>
              </button>
            </div>
          </div>

          {/* If Milestone billing, select milestone */}
          {billingMode === 'milestone' && (
            <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                Select Milestone to Invoice:
              </label>
              <select
                value={selectedMilestoneId}
                onChange={(e) => handleMilestoneSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  fontWeight: 600,
                }}
              >
                {project.milestones && project.milestones.length > 0 ? (
                  project.milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      Phase {m.milestoneOrder}: {m.title} — {m.percentage}% (₹{m.amount?.toLocaleString('en-IN')}) [{m.status}]
                    </option>
                  ))
                ) : (
                  <option value="">No milestones found in project</option>
                )}
              </select>
            </div>
          )}

          {/* Dates & Tax Rate Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                Invoice / Bill Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                Payment Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                GST Tax Rate (%)
              </label>
              <select
                value={taxRate}
                onChange={(e) => {
                  const rate = Number(e.target.value);
                  setTaxRate(rate);
                  setItems(items.map((it) => ({ ...it, taxPercent: rate })));
                }}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value={18}>18% (Standard Software / Consulting GST)</option>
                <option value={12}>12% (Goods / Services)</option>
                <option value={5}>5% (Concessional)</option>
                <option value={28}>28% (Luxury)</option>
                <option value={0}>0% (Exempted / Zero Rated)</option>
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                Invoice Line Items
              </label>
              {billingMode === 'custom' && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#2563eb',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Plus size={14} />
                  <span>Add Item</span>
                </button>
              )}
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Title & Description</th>
                    <th style={{ padding: '8px 12px', width: 80, textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 12px', width: 130, textAlign: 'right' }}>Taxable Rate (₹)</th>
                    <th style={{ padding: '8px 12px', width: 120, textAlign: 'right' }}>Amount (₹)</th>
                    {billingMode === 'custom' && <th style={{ padding: '8px 12px', width: 40 }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                          placeholder="Item or Milestone Title"
                          required
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        />
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Description / Scope of Work..."
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            fontSize: '11px',
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            textAlign: 'center',
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            textAlign: 'right',
                            fontWeight: 600,
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, verticalAlign: 'top', paddingTop: 14 }}>
                        ₹{(Number(item.quantity || 1) * Number(item.unitPrice || 0)).toLocaleString('en-IN')}
                      </td>
                      {billingMode === 'custom' && (
                        <td style={{ padding: '8px 12px', verticalAlign: 'top', paddingTop: 12 }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax Calculation Box */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxWidth: 380,
              alignSelf: 'flex-end',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#64748b' }}>Taxable Subtotal:</span>
              <strong style={{ color: '#0f172a' }}>₹{subtotal.toLocaleString('en-IN')}</strong>
            </div>

            {!isInterstate ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
                  <span>CGST ({taxRate / 2}%):</span>
                  <span>₹{cgst.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
                  <span>SGST ({taxRate / 2}%):</span>
                  <span>₹{sgst.toLocaleString('en-IN')}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
                <span>IGST ({taxRate}%):</span>
                <span>₹{igst.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div
              style={{
                borderTop: '1px solid #cbd5e1',
                paddingTop: 8,
                marginTop: 4,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 800,
                color: '#1e40af',
              }}
            >
              <span>Total GST Invoice (₹):</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Notes & Terms */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Customer Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Terms & Conditions
              </label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: 16,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || subtotal <= 0}
              style={{
                padding: '9px 22px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontSize: '13px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: loading || subtotal <= 0 ? 0.6 : 1,
              }}
            >
              <FileText size={16} />
              <span>{loading ? 'Creating GST Invoice...' : 'Generate & Issue GST Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
