import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  FileCheck2,
  GitBranch,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  FolderKanban,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { DocumentPreviewModal } from '../../components/common/DocumentPreviewModal.jsx';
import { PinSignatureModal } from '../../components/common/PinSignatureModal.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { AmcComparisonView } from '../../components/common/AmcComparisonView.jsx';
import { projectsService } from '../../services/projects.service.js';

export default function QuotationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPreview, setShowPreview] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  // Revision modal
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [revisedDiscountType, setRevisedDiscountType] = useState('PERCENTAGE');
  const [revisedDiscountValue, setRevisedDiscountValue] = useState(0);

  // Direct Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Negotiation modal
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [negotiationForm, setNegotiationForm] = useState({
    proposedBy: 'CLIENT',
    personName: '',
    offeredAmount: 0,
    reason: '',
    notes: '',
    status: 'PENDING',
  });
  const [submittingNegotiation, setSubmittingNegotiation] = useState(false);

  const handleDeleteQuotation = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete quotation ${quotation.quotationNumber}?`)) return;
    try {
      await api.delete(`/quotations/${id}`);
      notify.success('Quotation deleted successfully');
      navigate('/quotations');
    } catch (err) {
      notify.error(err.message || 'Failed to delete quotation');
    }
  };

  const handleOpenEdit = () => {
    if (!quotation) return;
    setEditForm({
      notes: quotation.notes || '',
      terms: quotation.terms || '',
      paymentTerms: quotation.paymentTerms || '',
      paymentMode: quotation.paymentMode || '',
      discountRate: quotation.discountRate || 0,
      taxRate: quotation.taxRate || 18,
      expiryDate: quotation.expiryDate ? new Date(quotation.expiryDate).toISOString().split('T')[0] : '',
      items: (quotation.items || []).map((it) => ({
        id: it.id,
        title: it.title || '',
        description: it.description || '',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        discountPercent: Number(it.discountPercent) || 0,
        taxPercent: Number(it.taxPercent) || 0,
      })),
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      await api.put(`/quotations/${id}`, {
        notes: editForm.notes,
        terms: editForm.terms,
        paymentTerms: editForm.paymentTerms,
        paymentMode: editForm.paymentMode,
        expiryDate: editForm.expiryDate,
        discountRate: Number(editForm.discountRate || 0),
        taxRate: Number(editForm.taxRate || 0),
        items: editForm.items.map((it) => ({
          title: it.title?.trim() || '',
          description: it.description?.trim() || it.title?.trim() || '',
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          discountPercent: Number(it.discountPercent) || 0,
          taxPercent: Number(it.taxPercent) || 0,
        })),
      });
      notify.success('Quotation updated successfully!');
      setShowEditModal(false);
      fetchQuotation();
    } catch (err) {
      notify.error(err.message || 'Failed to update quotation');
    } finally {
      setSavingEdit(false);
    }
  };

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/quotations/${id}`);
      const data = res?.data?.id ? res.data : (res?.data?.data || res?.data || res);
      setQuotation(data);
      setRevisedDiscountValue(data?.discountRate || 0);
    } catch (err) {
      notify.error(err.message || 'Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleSignConfirm = async (pin) => {
    await api.post(`/quotations/${id}/sign`, { pin });
    notify.success('Quotation digitally signed successfully!');
    fetchQuotation();
  };

  const handleConvertToInvoice = async () => {
    if (!window.confirm('Convert this quotation directly into an official Invoice?')) return;
    try {
      const res = await api.post(`/quotations/${id}/convert-to-invoice`);
      notify.success(`Created Invoice ${res.data.invoiceNumber}!`);
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      notify.error(err.message || 'Conversion failed');
    }
  };

  const handleConvertToProject = async () => {
    if (!window.confirm('Convert this quotation into a full Project with milestone schedules and financial tracking?')) return;
    try {
      const res = await projectsService.convertQuotation(id, {
        name: `${quotation.client?.companyName} - Project Implementation`,
      });
      notify.success(`Project ${res.data.projectCode} initiated!`);
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      notify.error(err.message || 'Conversion to project failed');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/quotations/${id}/status`, { status });
      notify.success(`Status updated to ${status}`);
      fetchQuotation();
    } catch (err) {
      notify.error(err.message || 'Failed to update status');
    }
  };

  const handleCreateRevision = async (e) => {
    e.preventDefault();
    if (!revisionReason.trim()) {
      notify.error('Please enter a reason for revision');
      return;
    }

    try {
      await api.post(`/quotations/${id}/revise`, {
        reason: revisionReason,
        discountRate: revisedDiscountType === 'PERCENTAGE' ? Number(revisedDiscountValue) : 0,
        discountAmount: revisedDiscountType === 'FIXED' ? Number(revisedDiscountValue) : 0,
        discountType: revisedDiscountType,
        items: quotation.items.map((it) => ({
          title: it.title,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discountPercent: it.discountPercent,
          taxPercent: it.taxPercent,
        })),
      });

      notify.success('Created new quotation revision successfully!');
      setShowReviseModal(false);
      setRevisionReason('');
      fetchQuotation();
    } catch (err) {
      notify.error(err.message || 'Revision failed');
    }
  };

  const handleAddNegotiationRound = async (e) => {
    e.preventDefault();
    if (negotiationForm.offeredAmount <= 0) {
      notify.error('Offered amount must be greater than zero');
      return;
    }

    try {
      setSubmittingNegotiation(true);
      await api.post('/negotiations', {
        quotationId: id,
        ...negotiationForm,
        offeredAmount: Number(negotiationForm.offeredAmount),
      });

      notify.success('Negotiation round recorded!');
      setShowNegotiateModal(false);
      setNegotiationForm({
        proposedBy: 'CLIENT',
        personName: '',
        offeredAmount: 0,
        reason: '',
        notes: '',
        status: 'PENDING',
      });
      fetchQuotation();
    } catch (err) {
      notify.error(err.message || 'Failed to record negotiation');
    } finally {
      setSubmittingNegotiation(false);
    }
  };

  if (loading && !quotation) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <RefreshCw size={20} className="animate-spin" />
      </div>
    );
  }

  if (!quotation) {
    return <div className="card">Quotation not found.</div>;
  }

  const client = quotation.client || {};

  return (
    <div>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/quotations" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {quotation.quotationNumber}
          </span>
          {quotation.revisionNumber > 0 && (
            <span style={{ fontSize: 11, backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
              Rev #{quotation.revisionNumber}
            </span>
          )}
          <Badge status={quotation.status} />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShowPreview(true)} className="btn btn-secondary">
            <Printer size={15} />
            <span>Print / PDF</span>
          </button>

          {!quotation.isDigitallySigned && (
            <button onClick={() => setShowSignModal(true)} className="btn btn-secondary" style={{ color: '#16a34a' }}>
              <ShieldCheck size={15} />
              <span>Apply Digital Signature</span>
            </button>
          )}

          <button onClick={() => setShowNegotiateModal(true)} className="btn btn-secondary">
            <MessageSquare size={15} />
            <span>Log Negotiation</span>
          </button>

          <button onClick={() => setShowReviseModal(true)} className="btn btn-secondary">
            <GitBranch size={15} />
            <span>Create Revision</span>
          </button>

          <button onClick={handleOpenEdit} className="btn btn-secondary">
            <Edit3 size={15} />
            <span>Edit Quotation</span>
          </button>

          {quotation.status !== 'CONVERTED' ? (
            <>
              <button onClick={handleConvertToProject} className="btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
                <FolderKanban size={15} />
                <span>Convert to Project</span>
              </button>
              <button onClick={handleConvertToInvoice} className="btn btn-secondary">
                <FileCheck2 size={15} />
                <span>Convert to Invoice</span>
              </button>
            </>
          ) : (
            <Link to={`/invoices/${quotation.convertedInvoiceId}`} className="btn btn-secondary" style={{ color: 'var(--primary)' }}>
              <span>View Converted Invoice</span>
            </Link>
          )}

          <button onClick={handleDeleteQuotation} className="btn btn-secondary" style={{ color: 'var(--danger)' }} title="Delete Quotation">
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Left Column: Scope & Line Items */}
        <div>
          {/* Linked Project Banner */}
          {quotation.project && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '10px',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <FolderKanban size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                    Linked Project Scope
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1d4ed8' }}>
                    {quotation.project.name} ({quotation.project.projectCode})
                  </div>
                </div>
              </div>
              <Link to={`/projects/${quotation.project.id}`} className="btn btn-secondary btn-sm" style={{ color: '#1d4ed8', fontWeight: 600 }}>
                Open Project Workspace
              </Link>
            </div>
          )}

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Quoted To Client
                </span>
                <div style={{ fontSize: 17, fontWeight: 800 }}>
                  <Link to={`/clients/${client.id}`}>{client.companyName}</Link>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Attn: {client.contactPerson} ({client.email})
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Issue & Expiry
                </span>
                <div style={{ fontSize: 13 }}>Date: {new Date(quotation.quotationDate).toLocaleDateString()}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Expires: {new Date(quotation.expiryDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Scope of Work & Deliverables</th>
                    <th style={{ textAlign: 'right', width: 80 }}>Qty</th>
                    <th style={{ textAlign: 'right', width: 120 }}>Unit Price</th>
                    <th style={{ textAlign: 'right', width: 80 }}>Tax %</th>
                    <th style={{ textAlign: 'right', width: 120 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items?.map((item, idx) => (
                    <tr key={item.id} style={{ verticalAlign: 'top' }}>
                      <td style={{ color: 'var(--text-muted)', paddingTop: 14 }}>{idx + 1}</td>
                      <td style={{ padding: '12px 10px' }}>
                        {item.title && (
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)', marginBottom: item.description ? 4 : 0 }}>
                            {item.title}
                          </div>
                        )}
                        {item.description && (
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', paddingTop: 14 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', paddingTop: 14 }}>₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', paddingTop: 14 }}>{item.taxPercent}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, paddingTop: 14 }}>
                        ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal & Totals Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <div style={{ width: 260, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal:</span>
                  <span>₹{Number(quotation.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {quotation.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                    <span>Discount ({quotation.discountRate}%):</span>
                    <span>-₹{Number(quotation.discountAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {quotation.taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Tax / GST ({quotation.taxRate}%):</span>
                    <span>+₹{Number(quotation.taxAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 18,
                    fontWeight: 800,
                    borderTop: '2px solid var(--border-subtle)',
                    paddingTop: 8,
                    color: 'var(--primary)',
                  }}
                >
                  <span>Grand Total:</span>
                  <span>₹{Number(quotation.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Optional AMC / Maintenance Terms */}
          <AmcComparisonView amcPackages={quotation.amcPackages} isPrint={false} />

          {/* Payment Mode, Schedule & Notes */}
          {(quotation.paymentMode || quotation.paymentTerms || quotation.notes) && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700 }}>Payment Terms & Commercial Remarks</h4>
              {quotation.paymentMode && (
                <div style={{ fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Payment Mode: </span>
                  <strong>{quotation.paymentMode}</strong>
                </div>
              )}
              {quotation.paymentTerms && (
                <div style={{ fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Payment Schedule: </span>
                  <span>{quotation.paymentTerms}</span>
                </div>
              )}
              {quotation.notes && (
                <div style={{ fontSize: 12, backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)', whiteSpace: 'pre-line' }}>
                  <strong>Notes: </strong>{quotation.notes}
                </div>
              )}
            </div>
          )}

          {/* Terms & Notes */}
          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Commercial Terms & Conditions</h4>
            <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {quotation.terms || 'Standard commercial terms apply.'}
            </div>
          </div>
        </div>

        {/* Right Column: Negotiation History & Status Workflow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status Changer Card */}
          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Workflow Status</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`btn btn-sm ${quotation.status === st ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Signature badge */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              {quotation.isDigitallySigned ? (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#f0fdf4',
                    border: '1.5px dashed #22c55e',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: 12, fontWeight: 800 }}>
                    <ShieldCheck size={16} />
                    <span>{quotation.approvalText || 'DASA TECH ADMIN APPROVED'}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#15803d', marginTop: 3, fontWeight: 700 }}>
                    {quotation.signedBy || `${quotation.authorizedPerson || 'DASA TECH Admin'} (${quotation.authorizedDesignation || 'Authorized Signatory'})`}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                    {new Date(quotation.signedAt).toLocaleString('en-IN')} • Verified & Stamped
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  This proposal is currently unsigned. Click "Apply Digital Signature" to sign with PIN.
                </div>
              )}
            </div>
          </div>

          {/* Negotiation History Tracker */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700 }}>Negotiation History</h4>
              <button onClick={() => setShowNegotiateModal(true)} className="btn btn-secondary btn-sm">
                <Plus size={12} />
                <span>Round</span>
              </button>
            </div>

            {(!quotation.negotiations || quotation.negotiations.length === 0) ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '10px 0' }}>
                No negotiation rounds recorded. Proposal offered at initial price.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {quotation.negotiations.map((neg) => (
                  <div
                    key={neg.id}
                    style={{
                      padding: 10,
                      backgroundColor: '#f8fafc',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700 }}>
                        Round {neg.round}: {neg.proposedBy}
                      </span>
                      <Badge status={neg.status} />
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>Person: {neg.personName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span>Offered: <strong>₹{Number(neg.offeredAmount).toLocaleString('en-IN')}</strong></span>
                      <span style={{ color: neg.changeAmount < 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                        {neg.changeAmount < 0 ? '-' : '+'}₹{Math.abs(neg.changeAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {neg.reason && (
                      <div style={{ marginTop: 4, color: '#475569', fontStyle: 'italic' }}>
                        "{neg.reason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revision Snapshots */}
          {quotation.revisions && quotation.revisions.length > 0 && (
            <div className="card">
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Past Revisions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                {quotation.revisions.map((rev) => (
                  <div key={rev.id} style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6 }}>
                    <div style={{ fontWeight: 700 }}>Revision #{rev.revisionNumber}</div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      Revised on {new Date(rev.revisedAt).toLocaleDateString()} by {rev.revisedBy}
                    </div>
                    {rev.reason && <div style={{ marginTop: 2, color: '#475569' }}>{rev.reason}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Print/PDF Modal */}
      {showPreview && (
        <DocumentPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          document={quotation}
          type="QUOTATION"
        />
      )}

      {/* Digital Signature PIN Modal */}
      <PinSignatureModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onConfirm={handleSignConfirm}
        documentName={quotation.quotationNumber}
      />

      {/* Revision Creation Modal */}
      <Modal
        isOpen={showReviseModal}
        onClose={() => setShowReviseModal(false)}
        title={`Create Revision for ${quotation.quotationNumber}`}
        maxWidth={500}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowReviseModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateRevision}>
              Save & Increment Revision
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateRevision}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
            Creating a revision archives current quotation #{quotation.quotationNumber} to Rev #{quotation.revisionNumber} and creates Rev #{quotation.revisionNumber + 1}.
          </p>
          <div className="form-group">
            <label className="form-label">Revision Reason *</label>
            <input
              required
              className="form-input"
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="e.g. Scope refined, agreed discount applied..."
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>Revised Discount</label>
              <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 2, borderRadius: 6, border: '1px solid #cbd5e1' }}>
                <button
                  type="button"
                  onClick={() => setRevisedDiscountType('PERCENTAGE')}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    background: revisedDiscountType === 'PERCENTAGE' ? '#2563eb' : 'transparent',
                    color: revisedDiscountType === 'PERCENTAGE' ? '#ffffff' : '#64748b',
                  }}
                >
                  % Percent
                </button>
                <button
                  type="button"
                  onClick={() => setRevisedDiscountType('FIXED')}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    background: revisedDiscountType === 'FIXED' ? '#2563eb' : 'transparent',
                    color: revisedDiscountType === 'FIXED' ? '#ffffff' : '#64748b',
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
                max={revisedDiscountType === 'PERCENTAGE' ? 100 : undefined}
                step="any"
                className="form-input"
                value={revisedDiscountValue}
                onChange={(e) => setRevisedDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={revisedDiscountType === 'PERCENTAGE' ? 'Discount %' : 'Discount in numbers / ₹'}
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
                {revisedDiscountType === 'PERCENTAGE' ? '%' : '₹'}
              </span>
            </div>
          </div>
        </form>
      </Modal>

      {/* Negotiation Round Modal */}
      <Modal
        isOpen={showNegotiateModal}
        onClose={() => setShowNegotiateModal(false)}
        title="Record Negotiation Round"
        maxWidth={500}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowNegotiateModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddNegotiationRound} disabled={submittingNegotiation}>
              {submittingNegotiation ? 'Saving...' : 'Record Round'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddNegotiationRound}>
          <div className="form-group">
            <label className="form-label">Proposal Origin</label>
            <select
              className="form-select"
              value={negotiationForm.proposedBy}
              onChange={(e) => setNegotiationForm({ ...negotiationForm, proposedBy: e.target.value })}
            >
              <option value="CLIENT">Customer Request</option>
              <option value="COMPANY">Company Counter-Offer</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Person Involved *</label>
            <input
              required
              className="form-input"
              value={negotiationForm.personName}
              onChange={(e) => setNegotiationForm({ ...negotiationForm, personName: e.target.value })}
              placeholder="e.g. Arun Prakash (CTO)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Offered Amount (₹) *</label>
            <input
              type="number"
              required
              className="form-input"
              value={negotiationForm.offeredAmount}
              onChange={(e) => setNegotiationForm({ ...negotiationForm, offeredAmount: e.target.value })}
              placeholder="e.g. 240000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status of this round</label>
            <select
              className="form-select"
              value={negotiationForm.status}
              onChange={(e) => setNegotiationForm({ ...negotiationForm, status: e.target.value })}
            >
              <option value="PENDING">Pending Review</option>
              <option value="COUNTER_OFFERED">Counter-Offered</option>
              <option value="ACCEPTED">Accepted Agreement</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Feedback</label>
            <input
              className="form-input"
              value={negotiationForm.reason}
              onChange={(e) => setNegotiationForm({ ...negotiationForm, reason: e.target.value })}
              placeholder="e.g. Requested 10% volume discount for annual project"
            />
          </div>
        </form>
      </Modal>

      {/* Direct Edit Quotation Modal */}
      {showEditModal && editForm && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit Quotation ${quotation.quotationNumber}`}
          footer={
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleSaveEdit} className="btn btn-primary" disabled={savingEdit}>
                {savingEdit ? 'Saving...' : 'Save Quotation Changes'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveEdit} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editForm.expiryDate}
                  onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Overall Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  value={editForm.discountRate}
                  onChange={(e) => setEditForm({ ...editForm, discountRate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GST Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  value={editForm.taxRate}
                  onChange={(e) => setEditForm({ ...editForm, taxRate: e.target.value })}
                />
              </div>
            </div>

            {/* Items Editor */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                  Quotation Line Items ({editForm.items?.length || 0})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setEditForm({
                      ...editForm,
                      items: [
                        ...editForm.items,
                        {
                          title: '',
                          description: '',
                          quantity: 1,
                          unitPrice: 0,
                          discountPercent: 0,
                          taxPercent: editForm.taxRate || 18,
                        },
                      ],
                    });
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>

              {editForm.items?.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 6 }}>
                    <input
                      className="form-input"
                      value={it.title}
                      onChange={(e) => {
                        const items = [...editForm.items];
                        items[idx].title = e.target.value;
                        setEditForm({ ...editForm, items });
                      }}
                      placeholder="Item Heading / Title"
                    />
                    <input
                      type="number"
                      className="form-input"
                      value={it.quantity}
                      onChange={(e) => {
                        const items = [...editForm.items];
                        items[idx].quantity = e.target.value;
                        setEditForm({ ...editForm, items });
                      }}
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      className="form-input"
                      value={it.unitPrice}
                      onChange={(e) => {
                        const items = [...editForm.items];
                        items[idx].unitPrice = e.target.value;
                        setEditForm({ ...editForm, items });
                      }}
                      placeholder="Unit Price (₹)"
                    />
                    {editForm.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const items = editForm.items.filter((_, i) => i !== idx);
                          setEditForm({ ...editForm, items });
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    value={it.description}
                    onChange={(e) => {
                      const items = [...editForm.items];
                      items[idx].description = e.target.value;
                      setEditForm({ ...editForm, items });
                    }}
                    placeholder="Item scope & deliverable description..."
                    style={{ fontSize: 12 }}
                  />
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Payment Terms</label>
              <input
                className="form-input"
                value={editForm.paymentTerms}
                onChange={(e) => setEditForm({ ...editForm, paymentTerms: e.target.value })}
                placeholder="e.g. 50% Advance, 50% On Handover"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Commercial Notes</label>
              <textarea
                rows={2}
                className="form-textarea"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Notes for client..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Terms & Conditions</label>
              <textarea
                rows={3}
                className="form-textarea"
                value={editForm.terms}
                onChange={(e) => setEditForm({ ...editForm, terms: e.target.value })}
                placeholder="Terms and conditions..."
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
