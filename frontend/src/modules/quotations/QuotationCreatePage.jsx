import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useCompany } from '../../contexts/CompanyContext.jsx';
import { Plus, Trash2, ArrowLeft, Save, Search, Calculator, ShieldCheck, Copy, Layers } from 'lucide-react';
import { calculateAmcTotals } from '../../components/common/AmcComparisonView.jsx';

export default function QuotationCreatePage() {
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('clientId') || '';
  const preselectedProjectId = searchParams.get('projectId') || '';

  const navigate = useNavigate();
  const notify = useNotification();

  // Project state
  const [selectedProject, setSelectedProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);

  // Client search state
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  // Load projects list for selection
  useEffect(() => {
    api.get('/projects', { limit: 100 }).then((res) => {
      const list = res?.data?.projects || res?.data || [];
      setAllProjects(list);
    }).catch(() => {});
  }, []);

  // Handle preselected project from URL query
  useEffect(() => {
    if (preselectedProjectId) {
      api.get(`/projects/${preselectedProjectId}`).then((res) => {
        const p = res?.data?.id ? res.data : (res?.data?.data || res?.data || res);
        if (p) {
          setSelectedProject(p);
          if (p.client) setSelectedClient(p.client);
          if (p.name) {
            setNotes(`Project Scope: ${p.name}\nProject Code: ${p.projectCode}\n${p.description || ''}`);
          }
          if (p.milestones && p.milestones.length > 0) {
            setItems(p.milestones.map((m) => ({
              title: m.title,
              description: `Project milestone deliverable (${m.percentage}% of project scope)`,
              quantity: 1,
              unitPrice: p.budgetAmount ? Math.round((p.budgetAmount * m.percentage) / 100) : '',
              discountType: '%',
              discountValue: 0,
              discountPercent: 0,
              taxPercent: 18,
            })));
          } else if (p.budgetAmount) {
            setItems([{
              title: p.name,
              description: p.description || 'Turnkey technical deliverables and project execution',
              quantity: 1,
              unitPrice: p.budgetAmount,
              discountType: '%',
              discountValue: 0,
              discountPercent: 0,
              taxPercent: 18,
            }]);
          }
        }
      }).catch(() => {});
    }
  }, [preselectedProjectId]);

  const handleSelectProject = (projectId) => {
    if (!projectId) {
      setSelectedProject(null);
      return;
    }
    const found = allProjects.find((p) => p.id === projectId);
    if (found) {
      setSelectedProject(found);
      if (found.client) {
        setSelectedClient(found.client);
      }
      if (found.name && !notes) {
        setNotes(`Project: ${found.name} (${found.projectCode})\n${found.description || ''}`);
      }
    }
  };

  const handleImportProjectScope = () => {
    if (!selectedProject) return;
    if (selectedProject.milestones && selectedProject.milestones.length > 0) {
      setItems(selectedProject.milestones.map((m) => ({
        title: m.title,
        description: `Project deliverable milestone (${m.percentage || 0}%)`,
        quantity: 1,
        unitPrice: selectedProject.budgetAmount ? Math.round((selectedProject.budgetAmount * (m.percentage || 0)) / 100) : '',
        discountType: '%',
        discountValue: 0,
        discountPercent: 0,
        taxPercent: 18,
      })));
      notify.success(`Imported ${selectedProject.milestones.length} milestones from project ${selectedProject.name}!`);
    } else {
      setItems([{
        title: selectedProject.name,
        description: selectedProject.description || 'Full turnkey software & technical deliverables',
        quantity: 1,
        unitPrice: selectedProject.budgetAmount || 0,
        discountType: '%',
        discountValue: 0,
        discountPercent: 0,
        taxPercent: 18,
      }]);
      notify.success(`Imported scope for ${selectedProject.name}`);
    }
  };

  // Form state
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState('DRAFT');
  const [discountType, setDiscountType] = useState('PERCENTAGE'); // 'PERCENTAGE' or 'FIXED'
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(18); // Default 18% GST in India
  const { company } = useCompany();
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [approvalText, setApprovalText] = useState('DASA TECH ADMIN APPROVED');
  const [authorizedPerson, setAuthorizedPerson] = useState('');
  const [authorizedDesignation, setAuthorizedDesignation] = useState('Authorized Signatory');

  // Auto-fill terms and commercial defaults from company settings when loaded
  useEffect(() => {
    if (company) {
      if (company.termsAndConditions && !terms) {
        setTerms(company.termsAndConditions);
      }
      if (company.defaultNotes && !notes) {
        setNotes(company.defaultNotes);
      }
      if (company.defaultPaymentMode && !paymentMode) {
        setPaymentMode(company.defaultPaymentMode);
      }
      if (company.defaultPaymentTerms && !paymentTerms) {
        setPaymentTerms(company.defaultPaymentTerms);
      }
      if (company.signatureApprovalText && (!approvalText || approvalText === 'DASA TECH ADMIN APPROVED')) {
        setApprovalText(company.signatureApprovalText);
      }
      if (company.authorizedPerson && !authorizedPerson) {
        setAuthorizedPerson(company.authorizedPerson);
      }
      if (company.authorizedDesignation && (!authorizedDesignation || authorizedDesignation === 'Authorized Signatory')) {
        setAuthorizedDesignation(company.authorizedDesignation);
      }
    }
  }, [company]);

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

  // Optional AMC packages with multi-item scope, heading, discount, and GST
  const [hasAmc, setHasAmc] = useState(false);
  const [amcPackages, setAmcPackages] = useState([
    {
      id: 'amc-1',
      heading: 'Enterprise Software & Cloud Maintenance',
      title: 'Platinum 24/7 SLA Support Plan',
      period: 'Annual',
      contractDuration: '12 Months',
      slaResponseTime: '4 Hours Critical / Next Business Day',
      preventiveVisits: '4 Scheduled Preventive Audits / Year',
      sparesCoverage: 'Labor Only (Spare parts charged at actuals)',
      items: [
        {
          id: 'item-1',
          title: '24/7 System Health Monitoring & Automated Backups',
          description: 'Continuous monitoring of application clusters, error logging, and nightly backups.',
          quantity: 12,
          unit: 'Months',
          unitPrice: 2000,
        },
        {
          id: 'item-2',
          title: 'Quarterly OS & Security Patch Updates',
          description: 'Scheduled vulnerability remediation and system health tune-ups.',
          quantity: 4,
          unit: 'Audits',
          unitPrice: 2500,
        },
      ],
      discountType: '%', // '%' or '₹'
      discountValue: 0,
      taxRate: 18,
      terms: 'Includes remote diagnostics and business-hours email/phone ticketing.',
    },
  ]);

  const handleAddAmcPackage = () => {
    const nextIdx = amcPackages.length + 1;
    setAmcPackages([
      ...amcPackages,
      {
        id: `amc-${Date.now()}`,
        heading: nextIdx === 2 ? 'Standard Hardware & Network AMC' : `AMC Category #${nextIdx}`,
        title: nextIdx === 2 ? 'Gold Business Hours Support Plan' : `AMC Option #${nextIdx}`,
        period: 'Annual',
        contractDuration: '12 Months',
        slaResponseTime: '8 Business Hours Response SLA',
        preventiveVisits: '4 Quarterly Scheduled Visits',
        sparesCoverage: 'Labor Only (Parts at actuals)',
        items: [
          {
            id: `item-${Date.now()}-1`,
            title: 'Preventive Maintenance & Inspection Services',
            description: 'Routine inspection and diagnostic checks across deployed infrastructure.',
            quantity: 4,
            unit: 'Visits',
            unitPrice: 3000,
          },
        ],
        discountType: '%',
        discountValue: 0,
        taxRate: 18,
        terms: 'Standard terms apply. Working hours 9:00 AM - 6:00 PM Mon-Fri.',
      },
    ]);
  };

  const handleDuplicateAmcPackage = (pIdx) => {
    const source = amcPackages[pIdx];
    const clone = {
      ...source,
      id: `amc-${Date.now()}`,
      title: `${source.title} (Alternative)`,
      items: (source.items || []).map((it) => ({
        ...it,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      })),
    };
    const updated = [...amcPackages];
    updated.splice(pIdx + 1, 0, clone);
    setAmcPackages(updated);
    notify.success(`Duplicated "${source.title}" as a new AMC Option!`);
  };

  const handleRemoveAmcPackage = (pIdx) => {
    if (amcPackages.length === 1) {
      setHasAmc(false);
      return;
    }
    setAmcPackages(amcPackages.filter((_, i) => i !== pIdx));
  };

  const handleAmcFieldChange = (pIdx, field, val) => {
    const updated = [...amcPackages];
    updated[pIdx][field] = val;
    setAmcPackages(updated);
  };

  const handleAddAmcItem = (pIdx) => {
    const updated = [...amcPackages];
    const items = updated[pIdx].items || [];
    updated[pIdx].items = [
      ...items,
      {
        id: `item-${Date.now()}`,
        title: '',
        description: '',
        quantity: 1,
        unit: 'Months',
        unitPrice: 0,
      },
    ];
    setAmcPackages(updated);
  };

  const handleRemoveAmcItem = (pIdx, itemIdx) => {
    const updated = [...amcPackages];
    const items = updated[pIdx].items || [];
    if (items.length <= 1) {
      notify.info('Each AMC package must have at least one line item.');
      return;
    }
    updated[pIdx].items = items.filter((_, i) => i !== itemIdx);
    setAmcPackages(updated);
  };

  const handleAmcItemChange = (pIdx, itemIdx, field, val) => {
    const updated = [...amcPackages];
    const item = { ...updated[pIdx].items[itemIdx], [field]: val };
    updated[pIdx].items[itemIdx] = item;
    setAmcPackages(updated);
  };

  const [saving, setSaving] = useState(false);

  // Search clients on demand
  useEffect(() => {
    let active = true;
    async function search() {
      try {
        const res = await api.get('/clients/search', { q: clientSearchQuery });
        if (active) {
          setClientSearchResults(res.data);
          // Auto select if preselectedClientId matches
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
      notify.error('Please select a client for this quotation');
      return;
    }

    if (items.some((it) => !(it.title?.trim() || it.description?.trim()))) {
      notify.error('Each line item must have either a Heading or Description');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/quotations', {
        clientId: selectedClient.id,
        projectId: selectedProject?.id || null,
        quotationDate,
        expiryDate,
        status,
        discountRate: effectiveDiscountRate,
        discountAmount: overallDiscountAmt,
        discountType: discountType,
        taxRate: Number(taxRate),
        notes: notes.trim() || null,
        terms: terms.trim() || null,
        paymentMode: paymentMode?.trim() || null,
        paymentTerms: paymentTerms?.trim() || null,
        approvalText: approvalText?.trim() || null,
        authorizedPerson: authorizedPerson?.trim() || null,
        authorizedDesignation: authorizedDesignation?.trim() || null,
        amcPackages: hasAmc
          ? amcPackages.map((pkg) => {
              const totals = calculateAmcTotals(pkg);
              return {
                ...pkg,
                subtotal: totals.subtotal,
                discountAmount: totals.discountAmount,
                discountPercent: totals.discountPercent,
                taxableAmount: totals.taxableAmount,
                taxAmount: totals.taxAmount,
                grandTotal: totals.grandTotal,
              };
            })
          : null,
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

      notify.success(`Quotation ${res.data.quotationNumber} created successfully!`);
      navigate(`/quotations/${res.data.id}`);
    } catch (err) {
      notify.error(err.message || 'Failed to create quotation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/quotations" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} />
            <span>Cancel</span>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Create New Quotation</h1>
        </div>

        <button onClick={handleSubmit} className="btn btn-primary" disabled={saving}>
          <Save size={16} />
          <span>{saving ? 'Generating...' : 'Save & Issue Quotation'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Left Column: Client & Details */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Client & Project Information</h3>

            {/* Project Selector */}
            <div className="form-group" style={{ marginBottom: 16, padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                  Link to Project (Optional)
                </label>
                {selectedProject && (
                  <button
                    type="button"
                    onClick={handleImportProjectScope}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '2px 8px', color: 'var(--primary)' }}
                  >
                    Fetch / Import Project Scope & Milestones
                  </button>
                )}
              </div>

              <select
                className="form-select"
                value={selectedProject?.id || ''}
                onChange={(e) => handleSelectProject(e.target.value)}
              >
                <option value="">-- Standalone Quotation (No Project) --</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.projectCode}) - {p.client?.companyName}
                  </option>
                ))}
              </select>

              {selectedProject && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#3b82f6', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span>Linked Project: <strong>{selectedProject.name}</strong></span>
                  {selectedProject.milestones?.length > 0 && (
                    <span>• {selectedProject.milestones.length} milestones available</span>
                  )}
                </div>
              )}
            </div>

            {/* Client selector with on-demand search */}
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
                    placeholder="Type client or company name to search..."
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
                <label className="form-label">Quotation Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={quotationDate}
                  onChange={(e) => setQuotationDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Status */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Proposal Status & Taxes</h3>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="APPROVED">Approved</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default Tax / GST (%)</label>
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

        {/* Line Items Table */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Line Items & Scope of Work</h3>
            <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>Add Item</span>
            </button>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '44%' }}>Scope of Work & Deliverables (Heading & Description) *</th>
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
                          placeholder="Heading / Service Title (e.g. Full-Stack Web Application Architecture)"
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
                  <span>Tax / GST ({taxRate}%):</span>
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
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: 'var(--primary)' }}>
                  ₹{Number(grandTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Multiple AMC / Support Section */}
        <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasAmc ? 16 : 0, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="enableAmcToggle"
                checked={hasAmc}
                onChange={(e) => setHasAmc(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <div>
                <label htmlFor="enableAmcToggle" style={{ fontWeight: 800, fontSize: 16, cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} color="var(--primary)" />
                  <span>Annual Maintenance Contract (AMC) & SLA Support Packages (Optional)</span>
                </label>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Offer one or multiple AMC tiers (e.g. Platinum 24/7, Gold Business Hours) with itemized scopes, discounts, and GST for comparison.
                </div>
              </div>
            </div>

            {hasAmc && (
              <button type="button" onClick={handleAddAmcPackage} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={15} />
                <span>Add AMC Option / Plan</span>
              </button>
            )}
          </div>

          {hasAmc && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
              {amcPackages.map((pkg, pIdx) => {
                const pkgTotals = calculateAmcTotals(pkg);
                const itemsList = pkg.items || [];

                return (
                  <div
                    key={pkg.id || pIdx}
                    style={{
                      padding: 20,
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      border: '1.5px solid #cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    }}
                  >
                    {/* Top Bar: AMC Header, Plan Title & Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: 6,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          AMC Option #{pIdx + 1}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                          {pkg.title || `Plan Option #${pIdx + 1}`}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleDuplicateAmcPackage(pIdx)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                          title="Duplicate this AMC package as an alternative option"
                        >
                          <Copy size={13} />
                          <span>Duplicate Plan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAmcPackage(pIdx)}
                          className="btn btn-outline-danger btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                          title="Remove AMC Option"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* AMC Heading & Plan Title row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 14 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 700 }}>
                          AMC Heading / Service Category *
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Enterprise Software & Cloud SLA"
                          value={pkg.heading || ''}
                          onChange={(e) => handleAmcFieldChange(pIdx, 'heading', e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 700 }}>
                          AMC Plan Name / Level Title *
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Platinum 24/7 Mission-Critical SLA"
                          value={pkg.title || ''}
                          onChange={(e) => handleAmcFieldChange(pIdx, 'title', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Operational Parameters & SLA Settings */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Billing Cycle</label>
                        <select
                          className="form-select"
                          value={pkg.period || 'Annual'}
                          onChange={(e) => handleAmcFieldChange(pIdx, 'period', e.target.value)}
                        >
                          <option value="Annual">Annual (Yearly)</option>
                          <option value="Half-Yearly">Half-Yearly (6 Months)</option>
                          <option value="Quarterly">Quarterly (3 Months)</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Contract Term</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 12 Months"
                          value={pkg.contractDuration || ''}
                          onChange={(e) => handleAmcFieldChange(pIdx, 'contractDuration', e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Response Time / SLA</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 4 Hours Critical"
                          value={pkg.slaResponseTime || ''}
                          onChange={(e) => handleAmcFieldChange(pIdx, 'slaResponseTime', e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Preventive Visits</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 4 Scheduled Visits/Year"
                          value={pkg.preventiveVisits || ''}
                          onChange={(e) => handleAmcFieldChange(pIdx, 'preventiveVisits', e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Parts & Materials</label>
                        <select
                          className="form-select"
                          value={pkg.sparesCoverage || 'Labor Only (Spare parts charged at actuals)'}
                          onChange={(e) => handleAmcFieldChange(pIdx, 'sparesCoverage', e.target.value)}
                        >
                          <option value="Labor Only (Spare parts charged at actuals)">Labor Only (Parts at actuals)</option>
                          <option value="Spares & Consumables Included">Spares & Consumables Included</option>
                          <option value="Limited Hardware Warranty">Limited Hardware Warranty</option>
                          <option value="Cloud Hotfix Patches Included">Cloud Hotfix Patches Included</option>
                        </select>
                      </div>
                    </div>

                    {/* Multiple Itemized Scope Deliverables Table */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          Included Scope & Service Items ({itemsList.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddAmcItem(pIdx)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '4px 10px' }}
                        >
                          <Plus size={13} color="var(--primary)" />
                          <span>Add Item to this AMC</span>
                        </button>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                            <th style={{ padding: '8px 10px', textAlign: 'left', width: 28 }}>#</th>
                            <th style={{ padding: '8px 10px', textAlign: 'left', width: '32%' }}>Deliverable / Service Item *</th>
                            <th style={{ padding: '8px 10px', textAlign: 'left' }}>Detailed Scope Description</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', width: 70 }}>Qty</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', width: 90 }}>Unit</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right', width: 100 }}>Rate (₹)</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right', width: 110 }}>Total (₹)</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', width: 40 }}>Del</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemsList.map((it, itemIdx) => {
                            const lineTotal = (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);

                            return (
                              <tr key={it.id || itemIdx} style={{ borderBottom: itemIdx < itemsList.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                <td style={{ padding: '8px 10px', color: '#64748b', verticalAlign: 'top', paddingTop: 14 }}>
                                  {itemIdx + 1}
                                </td>
                                <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                                  <input
                                    type="text"
                                    required
                                    className="form-input"
                                    placeholder="e.g. 24/7 Monitoring & Backups"
                                    value={it.title || ''}
                                    onChange={(e) => handleAmcItemChange(pIdx, itemIdx, 'title', e.target.value)}
                                  />
                                </td>
                                <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                                  <textarea
                                    rows={2}
                                    className="form-input"
                                    placeholder="e.g. Continuous monitoring of DB, daily backups, automated alerts..."
                                    value={it.description || ''}
                                    onChange={(e) => handleAmcItemChange(pIdx, itemIdx, 'description', e.target.value)}
                                    style={{ fontSize: 12, resize: 'vertical' }}
                                  />
                                </td>
                                <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                                  <input
                                    type="number"
                                    min="1"
                                    className="form-input"
                                    style={{ textAlign: 'center' }}
                                    value={it.quantity}
                                    onChange={(e) => handleAmcItemChange(pIdx, itemIdx, 'quantity', Number(e.target.value))}
                                  />
                                </td>
                                <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                                  <select
                                    className="form-select"
                                    value={it.unit || 'Months'}
                                    onChange={(e) => handleAmcItemChange(pIdx, itemIdx, 'unit', e.target.value)}
                                    style={{ fontSize: 12 }}
                                  >
                                    <option value="Months">Months</option>
                                    <option value="Visits">Visits</option>
                                    <option value="Audits">Audits</option>
                                    <option value="Systems">Systems</option>
                                    <option value="Hours">Hours</option>
                                    <option value="Lump Sum">Lump Sum</option>
                                  </select>
                                </td>
                                <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    className="form-input"
                                    style={{ textAlign: 'right' }}
                                    value={it.unitPrice}
                                    onChange={(e) => handleAmcItemChange(pIdx, itemIdx, 'unitPrice', Number(e.target.value))}
                                  />
                                </td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, verticalAlign: 'top', paddingTop: 14 }}>
                                  ₹{Number(lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '8px 10px', textAlign: 'center', verticalAlign: 'top', paddingTop: 12 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAmcItem(pIdx, itemIdx)}
                                    disabled={itemsList.length <= 1}
                                    style={{
                                      border: 'none',
                                      background: 'transparent',
                                      color: itemsList.length <= 1 ? '#cbd5e1' : 'var(--danger)',
                                      cursor: itemsList.length <= 1 ? 'not-allowed' : 'pointer',
                                    }}
                                    title="Remove item"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Financial Calculations Box (Subtotal, Discount, GST, Total) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
                      <div>
                        <label className="form-label" style={{ fontWeight: 600 }}>SLA Terms & Inclusions/Exclusions</label>
                        <textarea
                          rows={3}
                          className="form-input"
                          placeholder="e.g. Standard terms apply. Response within 2 hours for critical outages. Working hours 9 AM - 6 PM..."
                          value={pkg.terms || ''}
                          onChange={(e) => handleAmcFieldChange(pIdx, 'terms', e.target.value)}
                          style={{ fontSize: 12, resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ backgroundColor: '#ffffff', padding: 14, borderRadius: 8, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                          <span>AMC Subtotal:</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>
                            ₹{Number(pkgTotals.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Discount with % and ₹ toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#dc2626', fontWeight: 600 }}>Discount:</span>
                            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 2, borderRadius: 4, border: '1px solid #cbd5e1' }}>
                              <button
                                type="button"
                                onClick={() => handleAmcFieldChange(pIdx, 'discountType', '%')}
                                style={{
                                  padding: '2px 6px',
                                  fontSize: 10,
                                  fontWeight: 800,
                                  borderRadius: 3,
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: (pkg.discountType || '%') === '%' ? '#2563eb' : 'transparent',
                                  color: (pkg.discountType || '%') === '%' ? '#ffffff' : '#64748b',
                                }}
                              >
                                %
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAmcFieldChange(pIdx, 'discountType', '₹')}
                                style={{
                                  padding: '2px 6px',
                                  fontSize: 10,
                                  fontWeight: 800,
                                  borderRadius: 3,
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: pkg.discountType === '₹' ? '#10b981' : 'transparent',
                                  color: pkg.discountType === '₹' ? '#ffffff' : '#64748b',
                                }}
                              >
                                ₹
                              </button>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              className="form-input"
                              style={{ width: 80, padding: '3px 6px', textAlign: 'right', fontSize: 12 }}
                              value={pkg.discountValue || 0}
                              onChange={(e) => handleAmcFieldChange(pIdx, 'discountValue', Number(e.target.value))}
                            />
                            {pkgTotals.discountAmount > 0 && (
                              <span style={{ color: '#dc2626', fontWeight: 700 }}>
                                -₹{Number(pkgTotals.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* GST / Tax Rate */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>GST / Tax:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <select
                              className="form-select"
                              style={{ width: 120, padding: '3px 6px', fontSize: 12 }}
                              value={pkg.taxRate !== undefined ? pkg.taxRate : 18}
                              onChange={(e) => handleAmcFieldChange(pIdx, 'taxRate', Number(e.target.value))}
                            >
                              <option value="18">18% GST</option>
                              <option value="12">12% GST</option>
                              <option value="5">5% GST</option>
                              <option value="0">0% (Exempt)</option>
                            </select>
                            <span style={{ fontWeight: 600, color: '#475569' }}>
                              +₹{Number(pkgTotals.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {/* Grand Total */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 16,
                            fontWeight: 800,
                            borderTop: '2px solid #e2e8f0',
                            paddingTop: 8,
                            marginTop: 4,
                          }}
                        >
                          <span style={{ color: '#1e3a8a' }}>Total AMC Value:</span>
                          <span style={{ color: '#1d4ed8' }}>
                            ₹{Number(pkgTotals.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginLeft: 4 }}>
                              / {pkg.period || 'Year'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Commercial Terms & Payment Modes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24, marginBottom: 24 }}>
          {/* Terms & Conditions with 1-click Preset Loaders */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Commercial Terms & Conditions</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Statutory validity, milestone schedules, and legal jurisdiction
                </p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '3px 8px', borderRadius: 6 }}>
                Auto-Synced
              </span>
            </div>

            {/* Quick 1-click presets */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {[
                {
                  label: 'Software / IT',
                  icon: '💻',
                  text: `1. Validity: This commercial proposal is valid for 30 calendar days from issuance.\n2. Payment Milestones: 50% advance on agreement, 40% on UAT delivery, 10% on final handover.\n3. Scope Changes: Any additions beyond specifications will be scoped under a revision addendum.\n4. Taxes: Statutory GST @ 18% is applicable as per Govt of India regulations.\n5. Warranty: 90 days complimentary bug-fixing and warranty support post deployment.\n6. Jurisdiction: Disputes subject to Erode, Tamil Nadu jurisdiction.`,
                },
                {
                  label: 'AMC Support',
                  icon: '🛡️',
                  text: `1. SLA Coverage: 24/7 critical system monitoring with 4-hour response time.\n2. Payment Terms: 100% advance at commencement of each billing cycle.\n3. Preventive Visits: 4 scheduled system health audits per annum.\n4. Spares / Hardware: Labor included; replacement spares charged at actuals.\n5. Renewal / Termination: 30 days prior written notice required for termination.`,
                },
                {
                  label: 'Hardware Supply',
                  icon: '📦',
                  text: `1. Payment Terms: 100% advance against Proforma Invoice prior to dispatch.\n2. Delivery Timeline: Estimated 7-10 business days from purchase order confirmation.\n3. OEM Warranty: Standard manufacturer warranty applies to all delivered items.\n4. Freight & Transit: Inclusive of doorstep freight and transit insurance.\n5. Returns: Non-defective goods cannot be returned once unboxed.`,
                },
                {
                  label: 'Consulting',
                  icon: '💼',
                  text: `1. Engagement Basis: Professional fees invoiced monthly upon milestone sign-off.\n2. Payment Window: Strictly net 15 days from date of monthly invoice issuance.\n3. IP Ownership: Full intellectual property transfers upon 100% settlement of dues.\n4. Non-Disclosure: Confidentiality and NDA terms strictly observed throughout.`,
                },
              ].map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => setTerms(tpl.text)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '5px 10px',
                    borderRadius: 6,
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#1e293b',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <span>{tpl.icon}</span>
                  <span>{tpl.label} Terms</span>
                </button>
              ))}
            </div>

            <textarea
              rows={8}
              className="form-textarea"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="1. Validity: 30 days...&#10;2. Payment terms: 50% advance..."
              style={{
                width: '100%',
                fontSize: 12.5,
                lineHeight: 1.6,
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Payment Mode & Schedule */}
          <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Payment Mode & Schedule</h4>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Remittance method and stage-wise disbursement terms
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12 }}>Accepted Payment Method / Mode</label>
              <input
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                placeholder="e.g. Bank Transfer (NEFT/RTGS/IMPS), UPI, Cheque"
              />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {[
                  'Bank Transfer (NEFT/RTGS/IMPS), UPI',
                  'UPI QR / Online Gateway',
                  'Corporate Cheque / DD',
                  '100% Advance via Bank Wire',
                ].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMode(m)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 5,
                      border: '1px solid #cbd5e1',
                      backgroundColor: paymentMode === m ? '#eff6ff' : '#f8fafc',
                      color: paymentMode === m ? '#1d4ed8' : '#475569',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12 }}>Payment Schedule / Milestones</label>
              <input
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. 50% Advance with PO, 40% on UAT Delivery, 10% on Go-Live"
              />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {[
                  '50% Adv, 40% UAT, 10% Live',
                  '50% Adv, 50% on Delivery',
                  '100% Advance',
                  'Net 15 Days',
                  'Net 30 Days',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (s === '50% Adv, 40% UAT, 10% Live') setPaymentTerms('50% Advance with PO, 40% on UAT Delivery, 10% on Go-Live');
                      else if (s === '50% Adv, 50% on Delivery') setPaymentTerms('50% Advance with PO, 50% on Delivery/Completion');
                      else if (s === '100% Advance') setPaymentTerms('100% Advance before Project Commencement');
                      else if (s === 'Net 15 Days') setPaymentTerms('Payment strictly due within 15 days of invoice date');
                      else if (s === 'Net 30 Days') setPaymentTerms('Payment strictly due within 30 days of invoice date');
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 5,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Proposal Notes & Signatory Approval Configuration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24, marginBottom: 28 }}>
          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Proposal Notes & Scope Remarks
            </h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Customer-facing preamble, architectural notes, or scope assumptions
            </p>
            <textarea
              rows={5}
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Scope clarifications, hardware requirements, client prerequisites..."
              style={{
                width: '100%',
                fontSize: 12.5,
                lineHeight: 1.6,
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <ShieldCheck size={18} color="#16a34a" />
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  Digital Approval & Signatory Configuration
                </h4>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Customized authorization seal stamped upon PIN verification
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Signatory Name</label>
                  <input
                    className="form-input"
                    style={{ fontSize: 12, width: '100%', boxSizing: 'border-box' }}
                    value={authorizedPerson}
                    onChange={(e) => setAuthorizedPerson(e.target.value)}
                    placeholder="e.g. DASA TECH Admin"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Signatory Designation</label>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                    {[
                      'CEO',
                      'CFO',
                      'CTO',
                      'MD',
                      'Director',
                      'Auth Signatory',
                    ].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          if (d === 'CEO') setAuthorizedDesignation('Chief Executive Officer (CEO)');
                          else if (d === 'CFO') setAuthorizedDesignation('Chief Financial Officer (CFO)');
                          else if (d === 'CTO') setAuthorizedDesignation('Chief Technology Officer (CTO)');
                          else if (d === 'MD') setAuthorizedDesignation('Managing Director (MD)');
                          else if (d === 'Director') setAuthorizedDesignation('Director');
                          else if (d === 'Auth Signatory') setAuthorizedDesignation('Authorized Signatory');
                        }}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <input
                    className="form-input"
                    style={{ fontSize: 12, width: '100%', boxSizing: 'border-box' }}
                    value={authorizedDesignation}
                    onChange={(e) => setAuthorizedDesignation(e.target.value)}
                    placeholder="e.g. Chief Executive Officer (CEO)"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Approval Stamp Text</label>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                  {[
                    'DASA TECH ADMIN APPROVED',
                    'CEO APPROVED & SIGNED',
                    'CFO APPROVED & CERTIFIED',
                    'CTO APPROVED & VERIFIED',
                    'DIRECTOR APPROVED & AUTHORIZED',
                    'DIGITALLY SIGNED & VERIFIED',
                    'OFFICIALLY CERTIFIED',
                  ].map((txt) => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => setApprovalText(txt)}
                      style={{
                        padding: '3px 7px',
                        borderRadius: 5,
                        border: approvalText === txt ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                        backgroundColor: approvalText === txt ? '#f0fdf4' : '#f8fafc',
                        color: approvalText === txt ? '#15803d' : '#475569',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {txt}
                    </button>
                  ))}
                </div>
                <input
                  className="form-input"
                  style={{ fontSize: 12, width: '100%', boxSizing: 'border-box' }}
                  value={approvalText}
                  onChange={(e) => setApprovalText(e.target.value)}
                  placeholder="e.g. CEO APPROVED & SIGNED"
                />
              </div>
            </div>

            {/* Live Mini Preview */}
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#f0fdf4',
                border: '1.5px dashed #22c55e',
                borderRadius: 8,
                marginTop: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 800, fontSize: 11.5 }}>
                <ShieldCheck size={14} />
                <span>{approvalText || 'DASA TECH ADMIN APPROVED'}</span>
              </div>
              <div style={{ fontSize: 11, color: '#15803d', marginTop: 2, fontWeight: 700 }}>
                {authorizedPerson || company?.authorizedPerson || 'DASA TECH Admin'} ({authorizedDesignation || 'Authorized Signatory'})
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
