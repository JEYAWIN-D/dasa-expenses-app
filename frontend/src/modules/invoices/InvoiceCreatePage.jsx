import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useCompany } from '../../contexts/CompanyContext.jsx';
import { Plus, Trash2, ArrowLeft, Save, Search } from 'lucide-react';

export default function InvoiceCreatePage() {
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('clientId') || '';

  const navigate = useNavigate();
  const notify = useNotification();

  // Client search state
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  // Form state
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState('ISSUED');
  const [discountType, setDiscountType] = useState('FIXED'); // 'PERCENTAGE' or 'FIXED'
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(18);
  const { company } = useCompany();
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  // Auto-fill terms from company settings when loaded
  useEffect(() => {
    if (company?.termsAndConditions && !terms) {
      setTerms(company.termsAndConditions);
    }
  }, [company?.termsAndConditions]);

  const [items, setItems] = useState([
    {
      title: '',
      description: '',
      quantity: 1,
      unitPrice: '',
      discountType: '%',
      discountValue: 0,
      discountPercent: 0,
      taxPercent: 18,
    },
  ]);

  const [saving, setSaving] = useState(false);

  // Search clients on demand
  useEffect(() => {
    let active = true;
    async function search() {
      try {
        const res = await api.get('/clients/search', { q: clientSearchQuery });
        if (active) {
          setClientSearchResults(res.data);
          if (preselectedClientId && !selectedClient) {
            const found = res.data.find((c) => c.id === preselectedClientId);
            if (found) setSelectedClient(found);
          }
        }
      } catch (e) {
        // ignore
      }
    }
    search();
    return () => {
      active = false;
    };
  }, [clientSearchQuery, preselectedClientId]);

  // Compute live totals
  let subtotal = 0;
  const processedItems = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const gross = qty * price;
    const val = Number(item.discountValue !== undefined ? item.discountValue : item.discountPercent) || 0;
    let discAmt = 0;
    let discPct = 0;

    if (item.discountType === '₹') {
      discAmt = Math.min(gross, Math.max(0, val));
      discPct = gross > 0 ? (discAmt / gross) * 100 : 0;
    } else {
      discPct = Math.min(100, Math.max(0, val));
      discAmt = (gross * discPct) / 100;
    }

    const net = gross - discAmt;
    subtotal += net;
    return {
      ...item,
      discountPercent: discPct,
      discountAmount: discAmt,
      total: net + (net * (Number(item.taxPercent) || 0)) / 100,
    };
  });

  const handleDiscountTypeChange = (newType) => {
    if (newType === discountType) return;
    const currentVal = Number(discountValue) || 0;
    if (currentVal > 0 && subtotal > 0) {
      if (newType === 'FIXED') {
        const amt = Math.round(((subtotal * currentVal) / 100) * 100) / 100;
        setDiscountValue(amt);
      } else {
        const pct = Math.round(((currentVal / subtotal) * 100) * 10) / 10;
        setDiscountValue(pct);
      }
    }
    setDiscountType(newType);
  };

  const overallDiscountAmt = discountType === 'PERCENTAGE'
    ? Math.round(((subtotal * (Number(discountValue) || 0)) / 100) * 100) / 100
    : Math.min(subtotal, Math.max(0, Number(discountValue) || 0));

  const effectiveDiscountRate = subtotal > 0
    ? (discountType === 'PERCENTAGE' ? Number(discountValue) || 0 : Math.round((overallDiscountAmt / subtotal) * 1000) / 10)
    : 0;

  const taxableAmt = Math.max(0, subtotal - overallDiscountAmt);
  const overallTaxAmt = (taxableAmt * taxRate) / 100;
  const grandTotal = taxableAmt + overallTaxAmt;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        title: '',
        description: '',
        quantity: 1,
        unitPrice: '',
        discountType: '%',
        discountValue: 0,
        discountPercent: 0,
        taxPercent: taxRate,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      notify.error('Please select a client for this invoice');
      return;
    }

    if (items.some((it) => !(it.title?.trim() || it.description?.trim()))) {
      notify.error('Each line item must have either a Heading or Description');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/invoices', {
        clientId: selectedClient.id,
        invoiceDate,
        dueDate,
        status,
        discountAmount: overallDiscountAmt,
        discountRate: effectiveDiscountRate,
        discountType: discountType,
        taxRate: Number(taxRate),
        notes: notes.trim() || null,
        terms: terms.trim() || null,
        items: items.map((it, idx) => ({
          title: it.title?.trim() || null,
          description: it.description?.trim() || it.title?.trim() || '',
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          discountType: it.discountType === '₹' ? 'FIXED' : 'PERCENTAGE',
          discountAmount: it.discountType === '₹' ? Number(it.discountValue || 0) : processedItems[idx]?.discountAmount || 0,
          discountPercent: it.discountType === '₹' ? (processedItems[idx]?.discountPercent || 0) : Number(it.discountValue !== undefined ? it.discountValue : (it.discountPercent || 0)),
          taxPercent: Number(it.taxPercent) || 0,
        })),
      });

      notify.success(`Invoice ${res.data.invoiceNumber} created successfully!`);
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      notify.error(err.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/invoices" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} />
            <span>Cancel</span>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Generate Tax Invoice</h1>
        </div>

        <button onClick={handleSubmit} className="btn btn-primary" disabled={saving}>
          <Save size={16} />
          <span>{saving ? 'Generating...' : 'Save & Issue Invoice'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Left Column: Client & Dates */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Bill-To Client</h3>

            <div className="form-group">
              <label className="form-label">Client Selection *</label>
              {selectedClient ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: '#eff6ff',
                    border: '1.5px solid #bfdbfe',
                    borderRadius: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedClient.companyName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Attn: {selectedClient.contactPerson} ({selectedClient.email})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClient(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Change Client
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}>
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    placeholder="Search client by company or contact person..."
                    style={{ paddingLeft: 38 }}
                  />
                  {clientSearchResults.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 8,
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 100,
                        maxHeight: 200,
                        overflowY: 'auto',
                        marginTop: 4,
                      }}
                    >
                      {clientSearchResults.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedClient(c);
                            setClientSearchQuery('');
                          }}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{c.companyName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.contactPerson} - {c.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Invoice Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Billing Status & Deductions */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Tax & Status</h3>

            <div className="form-group">
              <label className="form-label">Initial Invoice Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ISSUED">Issued</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">GST / Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>
                  Special Overall Discount
                </label>
                <div
                  style={{
                    display: 'inline-flex',
                    background: '#f1f5f9',
                    padding: 2,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleDiscountTypeChange('PERCENTAGE')}
                    style={{
                      padding: '3px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 4,
                      border: 'none',
                      cursor: 'pointer',
                      background: discountType === 'PERCENTAGE' ? '#2563eb' : 'transparent',
                      color: discountType === 'PERCENTAGE' ? '#ffffff' : '#64748b',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    % Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDiscountTypeChange('FIXED')}
                    style={{
                      padding: '3px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 4,
                      border: 'none',
                      cursor: 'pointer',
                      background: discountType === 'FIXED' ? '#2563eb' : 'transparent',
                      color: discountType === 'FIXED' ? '#ffffff' : '#64748b',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    ₹ Numbers
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  max={discountType === 'PERCENTAGE' ? 100 : undefined}
                  step="any"
                  className="form-input"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={discountType === 'PERCENTAGE' ? 'Discount % (e.g. 10)' : 'Discount in numbers / ₹ (e.g. 5000)'}
                  style={{ paddingRight: 36 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#64748b',
                    pointerEvents: 'none',
                  }}
                >
                  {discountType === 'PERCENTAGE' ? '%' : '₹'}
                </span>
              </div>

              {overallDiscountAmt > 0 && (
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                  {discountType === 'PERCENTAGE'
                    ? `Deduction: -₹${Number(overallDiscountAmt).toLocaleString('en-IN')} off subtotal`
                    : `Deduction: -₹${Number(overallDiscountAmt).toLocaleString('en-IN')} (${effectiveDiscountRate}% off)`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Billed Products / Deliverables</h3>
            <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>Add Item</span>
            </button>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '44%' }}>Billed Products & Services (Heading & Description) *</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Quantity</th>
                  <th style={{ width: '16%', textAlign: 'right' }}>Unit Price (₹)</th>
                  <th style={{ width: '13%', textAlign: 'center' }}>Disc (% / ₹)</th>
                  <th style={{ width: '13%', textAlign: 'right' }}>Total</th>
                  <th style={{ width: '4%' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ verticalAlign: 'top' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Item Heading / Service Title (e.g. Cloud Infrastructure Setup)"
                          value={item.title || ''}
                          onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                          style={{ fontWeight: 600, fontSize: 13 }}
                        />
                        <textarea
                          rows={2}
                          className="form-input"
                          placeholder="Detailed description, scope of deliverables, or technical specifications..."
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          style={{ fontSize: 12, resize: 'vertical', minHeight: 48, lineHeight: 1.4 }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        style={{ textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="form-input"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        style={{ textAlign: 'right' }}
                      />
                    </td>
                    <td style={{ padding: '12px 6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          type="number"
                          min="0"
                          max={item.discountType === '₹' ? undefined : 100}
                          step="any"
                          className="form-input"
                          placeholder="0"
                          value={item.discountValue !== undefined ? item.discountValue : (item.discountPercent || 0)}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            handleItemChange(idx, 'discountValue', val);
                          }}
                          style={{ textAlign: 'center', padding: '6px 4px', fontSize: 13 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextType = item.discountType === '₹' ? '%' : '₹';
                            handleItemChange(idx, 'discountType', nextType);
                          }}
                          style={{
                            padding: '5px 7px',
                            fontSize: 11,
                            fontWeight: 800,
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            background: item.discountType === '₹' ? '#10b981' : '#2563eb',
                            color: '#ffffff',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                          title={`Switch between % and ₹ amount`}
                        >
                          {item.discountType === '₹' ? '₹' : '%'}
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, paddingTop: 20 }}>
                      ₹{Number(processedItems[idx]?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center', paddingTop: 18 }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length === 1}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: items.length === 1 ? '#cbd5e1' : 'var(--danger)',
                          cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>
              {overallDiscountAmt > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                  <span>
                    Discount {discountType === 'PERCENTAGE' ? `(${discountValue}%)` : `(₹${Number(discountValue).toLocaleString('en-IN')})`}:
                  </span>
                  <span>-₹{Number(overallDiscountAmt).toLocaleString('en-IN')}</span>
                </div>
              )}
              {overallTaxAmt > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>GST / Tax ({taxRate}%):</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    +₹{Number(overallTaxAmt).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 18,
                  fontWeight: 800,
                  borderTop: '2px solid var(--border-subtle)',
                  paddingTop: 10,
                  color: '#059669',
                }}
              >
                <span>Grand Total:</span>
                <span>₹{Number(grandTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Invoice Notes</h4>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment instructions or acknowledgment..."
            />
          </div>

          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Payment Terms</h4>
            <textarea
              className="form-textarea"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Terms of payment..."
            />
          </div>
        </div>
      </form>
    </div>
  );
}
