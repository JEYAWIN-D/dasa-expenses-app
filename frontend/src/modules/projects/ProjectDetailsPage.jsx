import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Building,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Receipt,
  Wallet,
  FileText,
  Printer,
  Plus,
  TrendingUp,
  TrendingDown,
  Percent,
  RefreshCw,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit3,
  AlertCircle,
  X,
  ArrowRight,
  Send,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { projectsService } from '../../services/projects.service.js';
import { accountsService } from '../../services/accounts.service.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { RecordPaymentModal } from './components/RecordPaymentModal.jsx';
import { AddProjectExpenseModal } from './components/AddProjectExpenseModal.jsx';
import { DocumentPreviewModal } from './components/DocumentPreviewModal.jsx';
import { CreateProjectInvoiceModal } from './components/CreateProjectInvoiceModal.jsx';
import { PaymentRequestModal } from './components/PaymentRequestModal.jsx';
import { DocumentPreviewModal as CommonDocumentPreviewModal } from '../../components/common/DocumentPreviewModal.jsx';
import { PinSignatureModal } from '../../components/common/PinSignatureModal.jsx';

// Compute waterfall across milestones
export function computeMilestoneWaterfall(milestones = []) {
  let accumulatedExcessCredit = 0;

  return (milestones || []).map((m) => {
    const amount = Number(m.amount || 0);
    const paid = Number(m.paidAmount || 0);
    const directDue = Math.max(0, Math.round((amount - paid) * 100) / 100);
    const directExcess = Math.max(0, Math.round((paid - amount) * 100) / 100);

    const creditApplied = Math.min(directDue, accumulatedExcessCredit);
    const netPayableNow = Math.max(0, Math.round((directDue - creditApplied) * 100) / 100);

    accumulatedExcessCredit = Math.max(0, Math.round((accumulatedExcessCredit - creditApplied + directExcess) * 100) / 100);

    let status = m.status;
    if (paid >= amount && amount > 0) {
      status = 'PAID';
    } else if (netPayableNow === 0 && (creditApplied > 0 || paid > 0)) {
      status = 'PAID';
    } else if (paid > 0 || creditApplied > 0) {
      status = 'PARTIALLY_PAID';
    } else {
      status = 'PENDING';
    }

    return {
      ...m,
      amount,
      paidAmount: paid,
      directDue,
      directExcess,
      creditApplied,
      netPayableNow,
      accumulatedExcessCreditRemaining: accumulatedExcessCredit,
      computedStatus: status,
    };
  });
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();

  const [project, setProject] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('milestones'); // milestones, invoices, payments, expenses, documents, handover

  // Modals state
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [selectedMilestoneForPayment, setSelectedMilestoneForPayment] = useState(null);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [documentModalData, setDocumentModalData] = useState(null);
  const [paymentRequestModalOpen, setPaymentRequestModalOpen] = useState(false);
  const [selectedMilestoneForRequest, setSelectedMilestoneForRequest] = useState(null);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [selectedMilestoneForInvoice, setSelectedMilestoneForInvoice] = useState(null);
  const [preselectedInvoiceForPayment, setPreselectedInvoiceForPayment] = useState(null);
  const [previewInvoiceDoc, setPreviewInvoiceDoc] = useState(null);
  const [previewPaymentDoc, setPreviewPaymentDoc] = useState(null);
  const [previewQuotationDoc, setPreviewQuotationDoc] = useState(null);
  const [signTargetQuotationId, setSignTargetQuotationId] = useState(null);

  const handleOpenQuotationPreview = async (qId) => {
    try {
      const res = await api.get(`/quotations/${qId}`);
      const doc = res?.data?.id ? res.data : (res?.data?.data || res?.data || res);
      setPreviewQuotationDoc(doc);
    } catch (err) {
      notify.error(err.message || 'Failed to load quotation');
    }
  };

  const handleSignQuotationConfirm = async (pin) => {
    if (!signTargetQuotationId) return;
    try {
      await api.post(`/quotations/${signTargetQuotationId}/sign`, { pin });
      notify.success('Quotation digitally signed successfully!');
      fetchProjectData();
    } catch (err) {
      throw err;
    }
  };

  const handleConvertQuotationToInvoice = async (qId, qNum) => {
    if (!window.confirm(`Convert quotation ${qNum} directly into an Issued Invoice?`)) return;
    try {
      const res = await api.post(`/quotations/${qId}/convert-to-invoice`);
      notify.success(`Created invoice ${res.data?.invoiceNumber || ''}!`);
      fetchProjectData();
    } catch (err) {
      notify.error(err.message || 'Conversion failed');
    }
  };

  const handleDeleteQuotation = async (qId, qNum) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${qNum}?`)) return;
    try {
      await api.delete(`/quotations/${qId}`);
      notify.success(`Quotation ${qNum} deleted successfully`);
      fetchProjectData();
    } catch (err) {
      notify.error(err.message || 'Failed to delete quotation');
    }
  };

  // Handover Action State
  const [handoverNotes, setHandoverNotes] = useState('');
  const [handoverAuthorizedBy, setHandoverAuthorizedBy] = useState('');
  const [handoverSubmitting, setHandoverSubmitting] = useState(false);

  // Milestone edit/add/delete state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestonePercent, setNewMilestonePercent] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  const [editingMilestone, setEditingMilestone] = useState(null);
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState(null);
  const [deletingMilestone, setDeletingMilestone] = useState(false);

  // Project Deletion State
  const [projectDeleteModalOpen, setProjectDeleteModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const fetchProjectData = async () => {
    try {
      const [projRes, accRes] = await Promise.all([
        projectsService.getProjectById(id),
        accountsService.getAccounts().catch(() => ({ data: { accounts: [] } })),
      ]);
      setProject(projRes.data);
      setAccounts(accRes.data?.accounts || []);
      setHandoverAuthorizedBy(projRes.data?.companyProfile?.authorizedPerson || 'DASA');
    } catch (err) {
      notify.error(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleDeleteProject = async () => {
    setDeletingProject(true);
    try {
      await projectsService.deleteProject(id);
      notify.success(`Project ${project.projectCode} deleted successfully`);
      navigate('/projects');
    } catch (err) {
      notify.error(err.message || 'Failed to delete project');
      setDeletingProject(false);
    }
  };

  const handleUpdateMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!editingMilestone) return;

    setSavingMilestone(true);
    try {
      await projectsService.updateMilestone(id, editingMilestone.id, {
        title: editingMilestone.title,
        percentage: Number(editingMilestone.percentage || 0),
        amount: Number(editingMilestone.amount || 0),
        paidAmount: Number(editingMilestone.paidAmount || 0),
        excessAllocationNotes: editingMilestone.excessAllocationNotes || '',
        dueDate: editingMilestone.dueDate || null,
        status: editingMilestone.status,
      });

      notify.success(`Milestone "${editingMilestone.title}" updated successfully!`);
      setEditingMilestone(null);
      fetchProjectData();
    } catch (err) {
      notify.error(err.message || 'Failed to update milestone');
    } finally {
      setSavingMilestone(false);
    }
  };

  const handleDeleteMilestoneSubmit = async () => {
    if (!milestoneToDelete) return;

    setDeletingMilestone(true);
    try {
      await projectsService.deleteMilestone(id, milestoneToDelete.id);
      notify.success(`Milestone "${milestoneToDelete.title}" deleted successfully`);
      setMilestoneToDelete(null);
      fetchProjectData();
    } catch (err) {
      notify.error(err.message || 'Failed to delete milestone');
    } finally {
      setDeletingMilestone(false);
    }
  };

  const handleGenerateDoc = async (docType, options = {}) => {
    try {
      const res = await projectsService.getDocumentData(id, docType, options);
      setDocumentModalData(res.data);
    } catch (err) {
      notify.error(err.message || 'Failed to generate document');
    }
  };

  const handleOpenPaymentReceipt = async (paymentId) => {
    try {
      const res = await api.get(`/payments/${paymentId}`);
      setPreviewPaymentDoc(res.data);
    } catch (err) {
      notify.error('Failed to load payment receipt');
    }
  };

  const handleAddMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    try {
      const totalVal = project.financials.totalProjectValue || 0;
      const pct = parseFloat(newMilestonePercent) || 0;
      const amount = Math.round(totalVal * (pct / 100) * 100) / 100;

      await projectsService.addMilestone(id, {
        title: newMilestoneTitle,
        percentage: pct,
        amount,
        dueDate: newMilestoneDueDate || null,
        milestoneOrder: (project.milestones?.length || 0) + 1,
      });

      notify.success('Custom milestone phase added!');
      setNewMilestoneTitle('');
      setNewMilestonePercent('');
      setNewMilestoneDueDate('');
      setAddingMilestone(false);
      fetchProjectData();
    } catch (err) {
      notify.error(err.message || 'Failed to add milestone');
    }
  };

  const handleHandoverSubmit = async () => {
    if (project.financials.outstandingBalance > 0) {
      notify.error(`Cannot handover project with pending balance of ₹${project.financials.outstandingBalance.toLocaleString('en-IN')}`);
      return;
    }

    setHandoverSubmitting(true);
    try {
      const res = await projectsService.verifyAndHandover(id, {
        handoverNotes,
        authorizedBy: handoverAuthorizedBy,
      });
      notify.success('Final payment verified & project handover officially approved!');
      fetchProjectData();
      handleGenerateDoc('handover-certificate');
    } catch (err) {
      notify.error(err.message || 'Handover authorization failed');
    } finally {
      setHandoverSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <div>Loading project financial dashboard...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <h2>Project Not Found</h2>
        <Link to="/projects" style={{ color: 'var(--primary)', marginTop: '12px', display: 'inline-block' }}>
          Back to Projects
        </Link>
      </div>
    );
  }

  const fin = project.financials;
  const isHandoverEligible = fin.outstandingBalance <= 0;
  const isHandedOver = project.status === 'HANDED_OVER';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Navigation & Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/projects')}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>All Projects</span>
          </button>

          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>
            {project.projectCode}
          </span>

          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: project.status === 'IN_PROGRESS' ? '#eff6ff' : (isHandedOver ? '#ede9fe' : '#f0fdf4'),
              color: project.status === 'IN_PROGRESS' ? '#1d4ed8' : (isHandedOver ? '#6d28d9' : '#15803d'),
            }}
          >
            {project.status.replace('_', ' ')}
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link
            to={`/quotations/new?projectId=${project.id}&clientId=${project.clientId}`}
            style={{
              padding: '9px 16px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Plus size={16} />
            <span>Create Quotation</span>
          </Link>

          <button
            onClick={() => {
              setSelectedMilestoneForPayment(null);
              setRecordPaymentOpen(true);
            }}
            style={{
              padding: '9px 16px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Receipt size={16} />
            <span>Record Advance / Payment</span>
          </button>

          <button
            onClick={() => setAddExpenseOpen(true)}
            style={{
              padding: '9px 16px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Wallet size={16} />
            <span>Log Expense</span>
          </button>

          <button
            onClick={() => setActiveTab('handover')}
            style={{
              padding: '9px 16px',
              backgroundColor: isHandedOver ? '#8b5cf6' : (isHandoverEligible ? '#2563eb' : '#f59e0b'),
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isHandedOver ? <Award size={16} /> : (isHandoverEligible ? <CheckCircle2 size={16} /> : <Lock size={16} />)}
            <span>{isHandedOver ? 'Handover Cleared' : (isHandoverEligible ? 'Approve Handover' : 'Verify Settlement')}</span>
          </button>

          <button
            onClick={() => setProjectDeleteModalOpen(true)}
            title="Delete Project (Audit Logged)"
            style={{
              padding: '9px 14px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Trash2 size={15} />
            <span>Delete Project</span>
          </button>
        </div>
      </div>

      {/* Project Banner & Customer Info */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {project.name}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
            {project.description || 'No description provided.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: 'var(--text-main)' }}>
              <Building size={16} color="#2563eb" />
              <span>Client: <strong>{project.client?.companyName}</strong></span>
            </div>

            {project.client?.contactPerson && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: 'var(--text-muted)' }}>
                <Users size={16} />
                <span>Contact: {project.client.contactPerson}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: 'var(--text-muted)' }}>
              <Calendar size={16} />
              <span>
                {project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN') : 'N/A'} →{' '}
                {project.deadline ? new Date(project.deadline).toLocaleDateString('en-IN') : 'Ongoing'}
              </span>
            </div>
          </div>
        </div>

        {/* Handover Status Indicator Card */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: isHandedOver ? '#f5f3ff' : (isHandoverEligible ? '#ecfdf5' : '#fffbeb'),
            border: `1px solid ${isHandedOver ? '#ddd6fe' : (isHandoverEligible ? '#a7f3d0' : '#fde68a')}`,
            minWidth: '260px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isHandedOver ? (
              <Award size={18} color="#7c3aed" />
            ) : isHandoverEligible ? (
              <CheckCircle2 size={18} color="#059669" />
            ) : (
              <Lock size={18} color="#d97706" />
            )}
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: isHandedOver ? '#6d28d9' : (isHandoverEligible ? '#065f46' : '#92400e'),
                textTransform: 'uppercase',
              }}
            >
              {isHandedOver ? 'PROJECT HANDED OVER' : (isHandoverEligible ? 'HANDOVER READY' : 'HANDOVER LOCKED')}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: isHandedOver ? '#5b21b6' : (isHandoverEligible ? '#047857' : '#b45309'), marginTop: 4 }}>
            {isHandedOver
              ? `Formally certified by ${project.handoverApprovedBy || 'DASA TECH'} on ${new Date(project.handoverDate).toLocaleDateString('en-IN')}`
              : isHandoverEligible
              ? 'Zero outstanding balance verified. Authorized sign-off permitted.'
              : `Pending dues of ₹${fin.outstandingBalance.toLocaleString('en-IN')} must be cleared before handover.`}
          </p>
        </div>
      </div>

      {/* 6-Card Project Financial KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {/* Total Project Value */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Project Value</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
            ₹{fin.totalProjectValue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
            Base ₹{fin.quotationValue.toLocaleString('en-IN')} + Extras ₹{fin.additionalCharges.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Advance Received */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase' }}>Advance Received</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
            ₹{fin.advanceReceived.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
            Required: ₹{fin.advanceRequiredAmount.toLocaleString('en-IN')} ({fin.advanceRequiredPercent}%)
            {fin.totalMilestonesExcess > 0 && (
              <span style={{ color: '#16a34a', fontWeight: 700, marginLeft: 4 }}>
                (+₹{fin.totalMilestonesExcess.toLocaleString('en-IN')} Excess)
              </span>
            )}
          </div>
        </div>

        {/* Total Payments Received */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#059669', textTransform: 'uppercase' }}>Total Collections</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: 2 }}>
            ₹{fin.totalPaid.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: 2 }}>
            {fin.totalProjectValue > 0 ? Math.round((fin.totalPaid / fin.totalProjectValue) * 100) : 0}% of Total Value
          </div>
        </div>

        {/* Outstanding Balance */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: fin.outstandingBalance > 0 ? '#b45309' : '#059669', textTransform: 'uppercase' }}>
            Outstanding Balance
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: fin.outstandingBalance > 0 ? '#b45309' : '#059669', marginTop: 2 }}>
            ₹{fin.outstandingBalance.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: fin.outstandingBalance === 0 ? '#059669' : '#b45309', fontWeight: 600, marginTop: 2 }}>
            {fin.outstandingBalance === 0 ? '✔ Fully Cleared & Settled' : 'Payment Pending'}
          </div>
        </div>

        {/* Project Expenses & Utilization */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Project Expenses</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#475569', marginTop: 2 }}>
            ₹{fin.totalExpenses.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
            Available Cash: <strong>₹{fin.remainingFunds.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Estimated Profit & Margin */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6d28d9', textTransform: 'uppercase' }}>Est. Net Profit</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#6d28d9', marginTop: 2 }}>
            ₹{fin.estimatedProfit.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 600, marginTop: 2 }}>
            Profit Margin: {fin.profitMarginPercent}%
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: '6px',
          borderRadius: '12px',
          gap: '6px',
          overflowX: 'auto',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <button
          onClick={() => setActiveTab('milestones')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'milestones' ? '#ffffff' : 'transparent',
            color: activeTab === 'milestones' ? '#2563eb' : '#64748b',
            boxShadow: activeTab === 'milestones' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '13px',
            fontWeight: activeTab === 'milestones' ? 700 : 600,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={16} />
          <span>Payment Milestones</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: activeTab === 'milestones' ? '#eff6ff' : '#e2e8f0',
              color: activeTab === 'milestones' ? '#2563eb' : '#64748b',
              fontWeight: 700,
            }}
          >
            {project.milestones?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'quotations' ? '#ffffff' : 'transparent',
            color: activeTab === 'quotations' ? '#2563eb' : '#64748b',
            boxShadow: activeTab === 'quotations' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '13px',
            fontWeight: activeTab === 'quotations' ? 700 : 600,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={16} />
          <span>Quotations</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: activeTab === 'quotations' ? '#eff6ff' : '#e2e8f0',
              color: activeTab === 'quotations' ? '#2563eb' : '#64748b',
              fontWeight: 700,
            }}
          >
            {(project.projectQuotations?.length || (project.quotation ? 1 : 0))}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'invoices' ? '#ffffff' : 'transparent',
            color: activeTab === 'invoices' ? '#2563eb' : '#64748b',
            boxShadow: activeTab === 'invoices' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '13px',
            fontWeight: activeTab === 'invoices' ? 700 : 600,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={16} />
          <span>Invoices & GST Bills</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: activeTab === 'invoices' ? '#eff6ff' : '#e2e8f0',
              color: activeTab === 'invoices' ? '#2563eb' : '#64748b',
              fontWeight: 700,
            }}
          >
            {project.invoices?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'payments' ? '#ffffff' : 'transparent',
            color: activeTab === 'payments' ? '#2563eb' : '#64748b',
            boxShadow: activeTab === 'payments' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '13px',
            fontWeight: activeTab === 'payments' ? 700 : 600,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <Receipt size={16} />
          <span>Payment Received</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: activeTab === 'payments' ? '#eff6ff' : '#e2e8f0',
              color: activeTab === 'payments' ? '#2563eb' : '#64748b',
              fontWeight: 700,
            }}
          >
            {project.payments?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'expenses' ? '#ffffff' : 'transparent',
            color: activeTab === 'expenses' ? '#2563eb' : '#64748b',
            boxShadow: activeTab === 'expenses' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '13px',
            fontWeight: activeTab === 'expenses' ? 700 : 600,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <Wallet size={16} />
          <span>Expense Ledger & Funds</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: activeTab === 'expenses' ? '#eff6ff' : '#e2e8f0',
              color: activeTab === 'expenses' ? '#2563eb' : '#64748b',
              fontWeight: 700,
            }}
          >
            {project.expenses?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'documents' ? '#ffffff' : 'transparent',
            color: activeTab === 'documents' ? '#2563eb' : '#64748b',
            boxShadow: activeTab === 'documents' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '13px',
            fontWeight: activeTab === 'documents' ? 700 : 600,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={16} />
          <span>Document Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('handover')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'handover' ? '#ffffff' : 'transparent',
            color: activeTab === 'handover' ? '#2563eb' : '#64748b',
            boxShadow: activeTab === 'handover' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '13px',
            fontWeight: activeTab === 'handover' ? 700 : 600,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <ShieldCheck size={16} />
          <span>Handover & Settlement</span>
        </button>
      </div>

      {/* TAB CONTENT 1: MILESTONES */}
      {activeTab === 'milestones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header & Add Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              backgroundColor: '#ffffff',
              padding: '18px 22px',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>
                  Payment Milestones, Advance & Collections Schedule
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {project.milestones?.length || 0} Phases
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                Track contract phases with exact breakdown of planned milestone targets, actual payments received, remaining balances, and excess advances.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => {
                  setSelectedMilestoneForRequest(null);
                  setPaymentRequestModalOpen(true);
                }}
                style={{
                  padding: '9px 16px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 1px 2px rgba(22, 163, 74, 0.2)',
                  whiteSpace: 'nowrap',
                }}
              >
                <FileText size={15} />
                <span>Request Payment</span>
              </button>

              <button
                onClick={() => setAddingMilestone(!addingMilestone)}
                style={{
                  padding: '9px 16px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: 'var(--shadow-sm)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={16} />
                <span>Add Custom Phase</span>
              </button>
            </div>
          </div>

          {/* Add Milestone Inline Form */}
          {addingMilestone && (
            <form
              onSubmit={handleAddMilestoneSubmit}
              style={{
                backgroundColor: '#f8fafc',
                padding: '18px 20px',
                borderRadius: '14px',
                border: '1px dashed #93c5fd',
                display: 'grid',
                gridTemplateColumns: '1.4fr 140px 160px 100px',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Milestone Title (e.g. Phase 2: Core Development & Staging Review)"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required
              />
              <input
                type="number"
                placeholder="Share %"
                value={newMilestonePercent}
                onChange={(e) => setNewMilestonePercent(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <input
                type="date"
                value={newMilestoneDueDate}
                onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <button
                type="submit"
                style={{ padding: '9px 16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Save Phase
              </button>
            </form>
          )}

          {/* Milestones Modern Table */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              overflowX: 'auto',
              overflowY: 'hidden',
            }}
          >
            <table style={{ width: '100%', minWidth: '1240px', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '13px' }}>
              <colgroup>
                <col style={{ width: '90px' }} />
                <col style={{ width: '330px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '115px' }} />
                <col style={{ width: '115px' }} />
                <col style={{ width: '155px' }} />
                <col style={{ width: '165px' }} />
                <col style={{ width: '125px' }} />
                <col style={{ width: '175px' }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}># Phase</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Milestone Phase Title</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Target Date</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'right' }}>Planned (₹)</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'right' }}>Paid Amount (₹)</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: '#b45309', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'right' }}>Remaining Due (₹)</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'center' }}>Variance / Credit</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {computeMilestoneWaterfall(project.milestones || []).map((m) => {
                  const amt = Number(m.amount || 0);
                  const paid = Number(m.paidAmount || 0);
                  const remainingDue = m.directDue;
                  const variance = Math.round((paid - amt) * 100) / 100;
                  const hasPaid = paid > 0;

                  return (
                    <tr
                      key={m.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fbfcfe')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            color: '#1e293b',
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.2px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Phase {m.milestoneOrder}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', lineHeight: 1.35 }}>
                              {m.title}
                            </span>
                            {m.percentage && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  padding: '1px 7px',
                                  borderRadius: '999px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {m.percentage}% Share
                              </span>
                            )}
                          </div>
                          {m.notes && (
                            <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.45, marginTop: 1 }}>
                              {m.notes}
                            </div>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', color: '#475569', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                        {m.dueDate ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <Calendar size={13} color="#64748b" />
                            <span>{new Date(m.dueDate).toLocaleDateString('en-IN')}</span>
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Flexible</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap' }}>
                        ₹{amt.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right', fontWeight: 800, fontSize: '14px', color: hasPaid ? '#15803d' : '#94a3b8', whiteSpace: 'nowrap' }}>
                        ₹{paid.toLocaleString('en-IN')}
                      </td>

                      {/* Remaining Due Column */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        {paid >= amt && amt > 0 ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#15803d',
                              backgroundColor: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>₹0 (Cleared)</span>
                          </span>
                        ) : m.netPayableNow === 0 && m.creditApplied > 0 ? (
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#15803d',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <CheckCircle2 size={13} />
                              <span>₹0 (Covered)</span>
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              ₹{m.creditApplied.toLocaleString('en-IN')} advance credit
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '14px',
                                fontWeight: 800,
                                color: '#b45309',
                                backgroundColor: '#fffbeb',
                                border: '1px solid #fde68a',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span>₹{(m.creditApplied > 0 ? m.netPayableNow : remainingDue).toLocaleString('en-IN')}</span>
                            </span>
                            {m.creditApplied > 0 && (
                              <>
                                <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                  -₹{m.creditApplied.toLocaleString('en-IN')} advance credit
                                </span>
                                <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '10px', whiteSpace: 'nowrap' }}>
                                  Gross: ₹{remainingDue.toLocaleString('en-IN')}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Variance / Excess Column */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                        {!hasPaid && m.creditApplied > 0 ? (
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span
                              style={{
                                padding: '4px 9px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: '#f0fdf4',
                                color: '#166534',
                                border: '1px solid #bbf7d0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <CheckCircle2 size={12} color="#16a34a" />
                              <span>-₹{m.creditApplied.toLocaleString('en-IN')} Credit Applied</span>
                            </span>
                            <span style={{ fontSize: '10px', color: '#16a34a', whiteSpace: 'nowrap' }}>
                              Absorbed from Phase 1 advance
                            </span>
                          </div>
                        ) : !hasPaid ? (
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            ₹0 (Pending)
                          </span>
                        ) : variance > 0 ? (
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span
                              style={{
                                padding: '4px 9px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 800,
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                border: '1px solid #86efac',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <TrendingUp size={13} color="#16a34a" />
                              <span>+₹{variance.toLocaleString('en-IN')} Advance Excess</span>
                            </span>
                            {m.excessAllocationNotes && (
                              <span style={{ fontSize: '10px', color: '#15803d', whiteSpace: 'nowrap' }}>{m.excessAllocationNotes}</span>
                            )}
                          </div>
                        ) : variance < 0 ? (
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span
                              style={{
                                padding: '4px 9px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 800,
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid #fde68a',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <TrendingDown size={13} color="#b45309" />
                              <span>-₹{Math.abs(variance).toLocaleString('en-IN')} Shortfall</span>
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>₹0 Match</span>
                          </span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.3px',
                            whiteSpace: 'nowrap',
                            backgroundColor:
                              (m.computedStatus || m.status) === 'PAID'
                                ? '#dcfce7'
                                : m.creditApplied > 0 && paid === 0
                                ? '#eff6ff'
                                : (m.computedStatus || m.status) === 'PARTIALLY_PAID'
                                ? '#fef3c7'
                                : '#f1f5f9',
                            color:
                              (m.computedStatus || m.status) === 'PAID'
                                ? '#166534'
                                : m.creditApplied > 0 && paid === 0
                                ? '#1d4ed8'
                                : (m.computedStatus || m.status) === 'PARTIALLY_PAID'
                                ? '#854d0e'
                                : '#475569',
                            border: `1px solid ${
                              (m.computedStatus || m.status) === 'PAID'
                                ? '#bbf7d0'
                                : m.creditApplied > 0 && paid === 0
                                ? '#bfdbfe'
                                : (m.computedStatus || m.status) === 'PARTIALLY_PAID'
                                ? '#fde68a'
                                : '#e2e8f0'
                            }`,
                          }}
                        >
                          {m.computedStatus === 'PARTIALLY_PAID' && m.creditApplied > 0 && paid === 0
                            ? 'CREDIT APPLIED'
                            : (m.computedStatus || m.status)}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 5, alignItems: 'center', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => {
                              setSelectedMilestoneForPayment(m);
                              setRecordPaymentOpen(true);
                            }}
                            title="Record Payment for this Milestone Phase"
                            style={{
                              padding: '5px 9px',
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: '#065f46',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Receipt size={12} />
                            <span>Pay</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMilestoneForInvoice(m);
                              setCreateInvoiceOpen(true);
                            }}
                            title="Generate GST Tax Invoice for this Phase"
                            style={{
                              padding: '5px 9px',
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: '#2563eb',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <FileText size={12} />
                            <span>Bill</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMilestoneForRequest(m);
                              setPaymentRequestModalOpen(true);
                            }}
                            title="Send Payment Request"
                            style={{
                              padding: '5px 7px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#166534',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <Send size={12} />
                          </button>

                          <button
                            onClick={() => setEditingMilestone({
                              ...m,
                              dueDate: m.dueDate ? new Date(m.dueDate).toISOString().split('T')[0] : '',
                            })}
                            title="Edit Milestone Phase"
                            style={{
                              padding: '5px 7px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#0f172a',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <Edit3 size={12} />
                          </button>

                          <button
                            onClick={() => setMilestoneToDelete(m)}
                            title="Delete Milestone Phase"
                            style={{
                              padding: '5px 7px',
                              backgroundColor: '#fee2e2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#dc2626',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {(() => {
                  const totalPlanned = (project.milestones || []).reduce((sum, m) => sum + Number(m.amount || 0), 0);
                  const totalPaid = (project.milestones || []).reduce((sum, m) => sum + Number(m.paidAmount || 0), 0);
                  const totalExcess = (project.milestones || []).reduce((sum, m) => sum + Math.max(0, Number(m.paidAmount || 0) - Number(m.amount || 0)), 0);
                  const exactNetRemaining = fin.outstandingBalance;

                  return (
                    <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #cbd5e1', fontWeight: 800 }}>
                      <td style={{ padding: '14px 16px', color: '#0f172a', whiteSpace: 'nowrap' }}>
                        TOTALS
                      </td>
                      <td style={{ padding: '14px 16px', color: '#0f172a' }}>
                        <span>All {project.milestones?.length || 0} Project Phases</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        100% Contract
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '15px', color: '#0f172a', whiteSpace: 'nowrap' }}>
                        ₹{totalPlanned.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '15px', color: '#15803d', whiteSpace: 'nowrap' }}>
                        ₹{totalPaid.toLocaleString('en-IN')}
                      </td>
                      {/* Exact Net Remaining Due */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: 900,
                              color: exactNetRemaining > 0 ? '#b45309' : '#15803d',
                              backgroundColor: exactNetRemaining > 0 ? '#fffbeb' : '#f0fdf4',
                              border: `1px solid ${exactNetRemaining > 0 ? '#fde68a' : '#bbf7d0'}`,
                              padding: '3px 9px',
                              borderRadius: '6px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ₹{exactNetRemaining.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b', marginTop: 2, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            Exact Net Remaining Due
                          </span>
                        </div>
                      </td>
                      {/* Total Excess Received */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {totalExcess > 0 ? (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              border: '1px solid #86efac',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <TrendingUp size={13} color="#16a34a" />
                            <span>+₹{totalExcess.toLocaleString('en-IN')} Excess</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>₹0 Balanced</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            backgroundColor: exactNetRemaining === 0 ? '#dcfce7' : '#eff6ff',
                            color: exactNetRemaining === 0 ? '#166534' : '#1d4ed8',
                            border: `1px solid ${exactNetRemaining === 0 ? '#bbf7d0' : '#bfdbfe'}`,
                          }}
                        >
                          {fin.totalProjectValue > 0 ? Math.round((fin.totalPaid / fin.totalProjectValue) * 100) : 0}% Collected
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}></td>
                    </tr>
                  );
                })()}
              </tfoot>
            </table>
          </div>

          {/* Reconciliation & Advance Settlement Note Card */}
          {(() => {
            const totalExcess = (project.milestones || []).reduce((sum, m) => sum + Math.max(0, Number(m.paidAmount || 0) - Number(m.amount || 0)), 0);
            if (totalExcess <= 0) return null;

            return (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  boxShadow: '0 2px 6px rgba(22, 101, 52, 0.04)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#16a34a',
                    flexShrink: 0,
                  }}
                >
                  <TrendingUp size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>
                    Exact Balance Reconciliation — Excess Advance Credit of ₹{totalExcess.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '13px', color: '#15803d', marginTop: 4, lineHeight: 1.5 }}>
                    Client paid <strong>₹{fin.totalPaid.toLocaleString('en-IN')}</strong> against the Phase 1 target of <strong>₹{project.milestones?.[0]?.amount?.toLocaleString('en-IN')}</strong>, creating a <strong>+₹{totalExcess.toLocaleString('en-IN')}</strong> surplus credit.
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 12,
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: '1px dashed #86efac',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Total Project Contract</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>₹{fin.totalProjectValue.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Total Collections Received</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#15803d' }}>₹{fin.totalPaid.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Surplus Advance Credit</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>+₹{totalExcess.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 700 }}>Exact Net Remaining Balance</div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: '#b45309' }}>₹{fin.outstandingBalance.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB CONTENT: QUOTATIONS & COMMERCIAL PROPOSALS */}
      {activeTab === 'quotations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                Project Quotations & Commercial Proposals
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Commercial quotations, proposal revisions, and scope estimates specifically associated with {project.name}.
              </p>
            </div>

            <Link
              to={`/quotations/new?projectId=${project.id}&clientId=${project.clientId}`}
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
                gap: 6,
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Plus size={16} />
              <span>Create Quotation for Project</span>
            </Link>
          </div>

          {/* Quotations Table */}
          {(() => {
            const quotations = project.projectQuotations?.length > 0
              ? project.projectQuotations
              : (project.quotation ? [project.quotation] : []);

            if (quotations.length === 0) {
              return (
                <div
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: '1px dashed var(--border-subtle)',
                  }}
                >
                  <FileText size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>No Quotations Created for this Project</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', maxWidth: 450, margin: '6px auto 16px' }}>
                    Create a formal commercial quotation with items, milestone breakdown, GST tax calculations, and digital signature for this project.
                  </p>
                  <Link
                    to={`/quotations/new?projectId=${project.id}&clientId=${project.clientId}`}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={16} />
                    <span>Create First Quotation</span>
                  </Link>
                </div>
              );
            }

            return (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Quote # / Rev</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Client</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Issue Date</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Expiry Date</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', textAlign: 'right' }}>Total Amount (₹)</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Signature</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((q) => (
                      <tr
                        key={q.id}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fbfcfe')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '16px 18px' }}>
                          <Link
                            to={`/quotations/${q.id}`}
                            style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)', textDecoration: 'none' }}
                          >
                            {q.quotationNumber}
                          </Link>
                          {q.revisionNumber > 0 && (
                            <span style={{ fontSize: 10, backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4, fontWeight: 800, marginLeft: 6 }}>
                              Rev #{q.revisionNumber}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 18px', color: '#0f172a', fontWeight: 600 }}>
                          {q.client?.companyName || project.client?.companyName}
                        </td>
                        <td style={{ padding: '16px 18px', color: '#475569' }}>
                          {q.quotationDate ? new Date(q.quotationDate).toLocaleDateString('en-IN') : '-'}
                        </td>
                        <td style={{ padding: '16px 18px', color: '#475569' }}>
                          {q.expiryDate ? new Date(q.expiryDate).toLocaleDateString('en-IN') : '-'}
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                          ₹{Number(q.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                          {q.isDigitallySigned ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                              <ShieldCheck size={12} />
                              Signed
                            </span>
                          ) : (
                            <button
                              onClick={() => setSignTargetQuotationId(q.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999 }}
                            >
                              Sign (PIN)
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                          <Badge status={q.status} />
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <Link to={`/quotations/${q.id}`} className="btn btn-secondary btn-sm" title="View & Edit">
                              <Eye size={13} />
                            </Link>
                            <button
                              onClick={() => handleOpenQuotationPreview(q.id)}
                              className="btn btn-secondary btn-sm"
                              title="Print / PDF Preview"
                            >
                              <Printer size={13} />
                            </button>
                            {q.status !== 'CONVERTED' && (
                              <button
                                onClick={() => handleConvertQuotationToInvoice(q.id, q.quotationNumber)}
                                className="btn btn-secondary btn-sm"
                                title="Convert to Invoice"
                                style={{ color: '#059669' }}
                              >
                                <ArrowRight size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteQuotation(q.id, q.quotationNumber)}
                              className="btn btn-secondary btn-sm"
                              title="Delete Quotation"
                              style={{ color: 'var(--danger)' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB CONTENT: INVOICES & GST BILLS */}
      {activeTab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                Project Invoices & GST Tax Bills
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Official GST-compliant tax invoices, milestone bills, and SAC/HSN tax breakdowns for {project.client?.companyName}.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedMilestoneForInvoice(null);
                setCreateInvoiceOpen(true);
              }}
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
                gap: 6,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Plus size={16} />
              <span>Create GST Invoice / Bill</span>
            </button>
          </div>

          {/* Invoices KPI Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Invoiced</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                ₹{Number(project.financials?.totalInvoiced || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                {project.invoices?.length || 0} Tax Bills Generated
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#7c3aed' }}>GST Tax Amount</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
                ₹{Number(project.financials?.totalInvoicedTax || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                CGST + SGST / IGST billed
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>Invoices Paid</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: 4 }}>
                ₹{Number(project.financials?.totalInvoicePaid || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                Collected against invoices
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#b45309' }}>Pending Due On Bills</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#b45309', marginTop: 4 }}>
                ₹{Number(project.financials?.totalInvoiceBalanceDue || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                Outstanding invoice balance
              </div>
            </div>
          </div>

          {/* Invoices List / Table */}
          {!project.invoices || project.invoices.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '48px 24px',
                borderRadius: '16px',
                border: '2px dashed var(--border-subtle)',
                textAlign: 'center',
              }}
            >
              <FileText size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                No GST Invoices Created Yet
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Generate official GST tax bills for this project. You can bill against payment milestones with 1-click or create itemized tax invoices.
              </p>
              <button
                onClick={() => {
                  setSelectedMilestoneForInvoice(null);
                  setCreateInvoiceOpen(true);
                }}
                style={{
                  padding: '10px 22px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Plus size={16} />
                <span>Create First GST Invoice</span>
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>Invoice #</th>
                    <th style={{ padding: '12px 16px' }}>Date / Due Date</th>
                    <th style={{ padding: '12px 16px' }}>Billed Purpose</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Taxable Subtotal</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>GST Tax</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Bill (₹)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Balance Due</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {project.invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{inv.invoiceNumber}</span>
                          {inv.isDigitallySigned && <ShieldCheck size={14} color="#059669" title="Digitally Signed" />}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{new Date(inv.invoiceDate).toLocaleDateString('en-GB')}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Due: {new Date(inv.dueDate).toLocaleDateString('en-GB')}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {inv.milestoneId ? (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: 4 }}>
                            Milestone Bill
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#475569' }}>
                            Itemized GST Service
                          </span>
                        )}
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                          {inv.items?.length || 1} line item(s)
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>
                        ₹{Number(inv.subtotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#7c3aed', fontWeight: 600 }}>
                        ₹{Number(inv.taxAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                        ₹{Number(inv.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: inv.balanceDue > 0 ? '#b45309' : '#059669' }}>
                        ₹{Number(inv.balanceDue || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor:
                              inv.status === 'PAID'
                                ? '#ecfdf5'
                                : inv.status === 'PARTIALLY_PAID'
                                ? '#fffbeb'
                                : inv.status === 'OVERDUE'
                                ? '#fef2f2'
                                : '#eff6ff',
                            color:
                              inv.status === 'PAID'
                                ? '#047857'
                                : inv.status === 'PARTIALLY_PAID'
                                ? '#b45309'
                                : inv.status === 'OVERDUE'
                                ? '#dc2626'
                                : '#1d4ed8',
                          }}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => {
                              setPreviewInvoiceDoc({
                                ...inv,
                                client: project.client,
                                companyProfile: project.companyProfile,
                              });
                            }}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Printer size={13} />
                            <span>View / Print</span>
                          </button>

                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => {
                                setPreselectedInvoiceForPayment(inv);
                                setRecordPaymentOpen(true);
                              }}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Record Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: ADVANCE & MULTI-METHOD PAYMENTS */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                Advance & Multi-Method Payment Receipts Ledger
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Multi-channel payments (e.g. ₹9,000 cash, ₹1,000 GPay, ₹1,200 bank transfer) itemized with individual treasury routing.
              </p>
            </div>

            <button
              onClick={() => setRecordPaymentOpen(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={16} />
              <span>Record New Payment</span>
            </button>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px' }}>Receipt #</th>
                  <th style={{ padding: '12px 18px' }}>Date</th>
                  <th style={{ padding: '12px 18px' }}>Type</th>
                  <th style={{ padding: '12px 18px' }}>Payment Channels & Multi-Method Split Breakdown</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {project.payments?.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      No payments recorded yet for this project.
                    </td>
                  </tr>
                ) : (
                  project.payments?.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {p.receiptNumber}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1e40af' }}>
                          {p.paymentType}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {p.splits && p.splits.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {p.splits.map((s, idx) => (
                              <div key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>• {s.paymentMode}:</span>
                                <strong style={{ color: '#059669' }}>₹{Number(s.amount).toLocaleString('en-IN')}</strong>
                                {s.accountName && <span style={{ color: '#64748b', fontSize: '11px' }}>({s.accountName})</span>}
                                {s.referenceNumber && <span style={{ color: '#64748b', fontSize: '11px', fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: 3 }}>Ref: {s.referenceNumber}</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>{p.paymentMode} {p.referenceNumber ? `(Ref: ${p.referenceNumber})` : ''}</span>
                        )}
                        {p.notes && !p.notes.includes('Cash (₹9,000)') && !p.notes.startsWith('Advance payment received in multiple channels:') && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>{p.notes}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => handleOpenPaymentReceipt(p.id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Print official payment receipt with full multi-channel split breakdown"
                          >
                            <Printer size={13} />
                            <span>Receipt</span>
                          </button>
                          <button
                            onClick={() => handleGenerateDoc('acknowledgment')}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#475569',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                            title="Project Payment Acknowledgment Letter"
                          >
                            <FileText size={12} />
                            <span>Letter</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: EXPENSE LEDGER & FUND UTILIZATION */}
      {activeTab === 'expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Treasury Fund Utilization Meter */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px 24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  Project Fund Utilization Meter
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  Total Received: <strong>₹{fin.totalPaid.toLocaleString('en-IN')}</strong> | Expenses Deducted: <strong>₹{fin.totalExpenses.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Remaining Available Funds</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: fin.remainingFunds >= 0 ? '#15803d' : '#b91c1c' }}>
                  ₹{fin.remainingFunds.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div style={{ height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${fin.advanceUtilizationPercent}%`,
                  backgroundColor: fin.advanceUtilizationPercent > 90 ? '#ef4444' : (fin.advanceUtilizationPercent > 60 ? '#f59e0b' : '#3b82f6'),
                  borderRadius: '999px',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: 6 }}>
              <span>0% Utilized</span>
              <span>{fin.advanceUtilizationPercent}% Advance Utilized</span>
              <span>100% Limit</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
              Project Expense Ledger
            </h2>

            <button
              onClick={() => setAddExpenseOpen(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={16} />
              <span>Log Project Expense</span>
            </button>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px' }}>Code</th>
                  <th style={{ padding: '12px 18px' }}>Date</th>
                  <th style={{ padding: '12px 18px' }}>Category & Description</th>
                  <th style={{ padding: '12px 18px' }}>Payment Account</th>
                  <th style={{ padding: '12px 18px', textAlign: 'center' }}>Reimbursable?</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {project.expenses?.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      No expenses logged yet against this project.
                    </td>
                  </tr>
                ) : (
                  project.expenses?.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {e.expenseCode}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        {new Date(e.expenseDate).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{e.description}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Category: {e.category}</div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        {e.paymentMode} {e.referenceNumber ? `(${e.referenceNumber})` : ''}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        {e.isReimbursable ? (
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e' }}>
                            {e.employeeName} ({e.reimbursementStatus})
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Direct</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: '#b91c1c' }}>
                        ₹{e.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: OFFICIAL LETTERS & DOCUMENT GENERATOR */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
              Official Documents & Letters Generator
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Generate customizable, printable letters and receipts with company letterhead, client details, payment breakdown, and bank accounts.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Document Card 1: Advance Request */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 700, fontSize: '14px' }}>
                  <FileText size={18} />
                  <span>Advance Payment Request Letter</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                  {fin.totalPaid >= fin.advanceRequiredAmount ? (
                    <>
                      Agreed advance payment ({fin.advanceRequiredPercent}% = ₹{fin.advanceRequiredAmount.toLocaleString('en-IN')}) is <strong>fully received</strong> (₹{fin.totalPaid.toLocaleString('en-IN')} paid, with +₹{(fin.totalPaid - fin.advanceRequiredAmount).toLocaleString('en-IN')} excess advance credited to Phase 2). Status: <span style={{ color: '#16a34a', fontWeight: 700 }}>Cleared</span>.
                    </>
                  ) : (
                    <>
                      Formal letter requesting agreed advance payment ({fin.advanceRequiredPercent}% = ₹{fin.advanceRequiredAmount.toLocaleString('en-IN')}) with company bank details.
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleGenerateDoc('advance-request')}
                style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Printer size={14} />
                <span>{fin.totalPaid >= fin.advanceRequiredAmount ? 'Preview Advance Letter' : 'Generate & Preview Letter'}</span>
              </button>
            </div>

            {/* Document Card 2: Payment Acknowledgment */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 700, fontSize: '14px' }}>
                  <Receipt size={18} />
                  <span>Payment Acknowledgment Letter</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                  Official formal thank you note detailing receipt of funds (₹{fin.totalPaid.toLocaleString('en-IN')}), multi-channel payment split breakdown, and updated account balance with excess credit absorption.
                </p>
              </div>
              <button
                onClick={() => handleGenerateDoc('acknowledgment')}
                style={{ padding: '8px 14px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Printer size={14} />
                <span>Generate Acknowledgment</span>
              </button>
            </div>

            {/* Document Card 3: Milestone Payment Request */}
            {(() => {
              const wfList = computeMilestoneWaterfall(project.milestones || []);
              const currentPendingM = wfList.find((m) => m.netPayableNow > 0) || wfList.find((m) => m.computedStatus !== 'PAID') || wfList[0];
              return (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    padding: '20px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 14,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6366f1', fontWeight: 700, fontSize: '14px' }}>
                      <Layers size={18} />
                      <span>Milestone Payment Request</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                      Requesting payment release for <strong>Phase {currentPendingM?.milestoneOrder}: {currentPendingM?.title}</strong>. Present Net Due: <strong style={{ color: '#0f172a' }}>₹{(currentPendingM?.netPayableNow || 0).toLocaleString('en-IN')}</strong>{currentPendingM?.creditApplied > 0 ? ` (Milestone Value: ₹${(currentPendingM?.amount || 0).toLocaleString('en-IN')} less ₹${currentPendingM.creditApplied.toLocaleString('en-IN')} advance credit deduction)` : ''}.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerateDoc('milestone-request', {
                      milestoneId: currentPendingM?.id,
                      requestedAmount: currentPendingM?.netPayableNow,
                      dueDate: currentPendingM?.dueDate,
                    })}
                    style={{ padding: '8px 14px', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Printer size={14} />
                    <span>Generate Milestone Request</span>
                  </button>
                </div>
              );
            })()}

            {/* Document Card 4: Final Payment Reminder */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontWeight: 700, fontSize: '14px' }}>
                  <AlertTriangle size={18} />
                  <span>Final Payment Reminder & Notice</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                  Reminding customer of completion and pending settlement of ₹{fin.outstandingBalance.toLocaleString('en-IN')} prior to handover clearance.
                </p>
              </div>
              <button
                onClick={() => handleGenerateDoc('final-reminder')}
                style={{ padding: '8px 14px', backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Printer size={14} />
                <span>Generate Final Reminder</span>
              </button>
            </div>

            {/* Document Card 5: Handover Certificate */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8b5cf6', fontWeight: 700, fontSize: '14px' }}>
                  <Award size={18} />
                  <span>Handover & Settlement Certificate</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                  Official legal certificate issued upon full payment clearance certifying zero outstanding balance and formal delivery sign-off.
                </p>
              </div>
              <button
                onClick={() => handleGenerateDoc('handover-certificate')}
                style={{ padding: '8px 14px', backgroundColor: '#8b5cf6', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Printer size={14} />
                <span>Generate Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: FINAL PAYMENT VERIFICATION & HANDOVER MODULE */}
      {activeTab === 'handover' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
              Final Payment Verification & Project Handover
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              In accordance with Key Requirement #9, handover is strictly locked until all payments are verified against quotation + approved charges with zero outstanding balance.
            </p>
          </div>

          {/* Verification Checklist Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Final Handover Governance Checklist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '13px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>
                  Quotation and approved additional charges reconciled: <strong>₹{fin.totalProjectValue.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '13px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>
                  Project expenses and treasury fund utilization recorded: <strong>₹{fin.totalExpenses.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '13px' }}>
                {fin.outstandingBalance === 0 ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <Lock size={18} color="#ef4444" />
                )}
                <span>
                  Customer Account Balance Cleared: <strong>₹{fin.outstandingBalance.toLocaleString('en-IN')}</strong>{' '}
                  {fin.outstandingBalance === 0 ? (
                    <strong style={{ color: '#16a34a' }}>(ZERO DUES — VERIFIED)</strong>
                  ) : (
                    <strong style={{ color: '#dc2626' }}>(HANDOVER BLOCKED — DUES PENDING)</strong>
                  )}
                </span>
              </div>
            </div>

            {/* Strict Enforcement Notice */}
            {fin.outstandingBalance > 0 ? (
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
              >
                <AlertTriangle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b' }}>
                    Handover Prohibited: Outstanding Payment Required
                  </h4>
                  <p style={{ fontSize: '13px', color: '#b91c1c', marginTop: 2, lineHeight: 1.5 }}>
                    The system will not allow project handover until the outstanding customer balance of{' '}
                    <strong>₹{fin.outstandingBalance.toLocaleString('en-IN')}</strong> has been paid and verified.
                    Please record customer settlement payment first.
                  </p>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setRecordPaymentOpen(true)}
                      style={{ padding: '6px 14px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Record Final Payment
                    </button>
                    <button
                      onClick={() => handleGenerateDoc('final-reminder')}
                      style={{ padding: '6px 14px', backgroundColor: '#ffffff', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Send Final Payment Reminder
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
              >
                <CheckCircle2 size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>
                    Zero Balance Verified — Eligible for Official Handover
                  </h4>
                  <p style={{ fontSize: '13px', color: '#15803d', marginTop: 2 }}>
                    All customer payments have been fully cleared and verified against the approved quotation. Authorized management personnel may now approve formal project handover and generate the official Handover Certificate.
                  </p>
                </div>
              </div>
            )}

            {/* Handover Approval Form */}
            {isHandedOver ? (
              <div style={{ padding: '16px', backgroundColor: '#f5f3ff', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#6d28d9' }}>
                  Project Formally Handed Over & Completed
                </div>
                <div style={{ fontSize: '13px', color: '#5b21b6', marginTop: 4 }}>
                  Authorized by: <strong>{project.handoverApprovedBy || 'DASA TECH Management'}</strong> on{' '}
                  {project.handoverDate ? new Date(project.handoverDate).toLocaleDateString('en-IN') : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: '#7c3aed', marginTop: 4 }}>
                  Notes: {project.handoverNotes}
                </div>
                <button
                  onClick={() => handleGenerateDoc('handover-certificate')}
                  style={{ marginTop: 12, padding: '7px 14px', backgroundColor: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Award size={14} />
                  <span>View Handover Clearance Certificate</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Authorized Personnel Name *
                  </label>
                  <input
                    type="text"
                    value={handoverAuthorizedBy}
                    onChange={(e) => setHandoverAuthorizedBy(e.target.value)}
                    placeholder="e.g. DASA (Managing Director)"
                    style={{ width: '100%', maxWidth: '400px', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Handover Audit & Settlement Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="Confirming that all deliverables, documentation, credentials, and client sign-offs have been completed..."
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <button
                    disabled={!isHandoverEligible || handoverSubmitting}
                    onClick={handleHandoverSubmit}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: isHandoverEligible ? '#2563eb' : '#94a3b8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: isHandoverEligible && !handoverSubmitting ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <ShieldCheck size={18} />
                    <span>{handoverSubmitting ? 'Authorizing Handover...' : 'Authorize Project Handover & Clear Settlement'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {recordPaymentOpen && (
        <RecordPaymentModal
          project={project}
          accounts={accounts}
          preselectedInvoice={preselectedInvoiceForPayment}
          preselectedMilestone={selectedMilestoneForPayment}
          onClose={() => {
            setRecordPaymentOpen(false);
            setPreselectedInvoiceForPayment(null);
            setSelectedMilestoneForPayment(null);
          }}
          onSuccess={() => fetchProjectData()}
        />
      )}

      {addExpenseOpen && (
        <AddProjectExpenseModal
          project={project}
          accounts={accounts}
          onClose={() => setAddExpenseOpen(false)}
          onSuccess={() => fetchProjectData()}
        />
      )}

      {documentModalData && (
        <DocumentPreviewModal
          docData={documentModalData}
          onClose={() => setDocumentModalData(null)}
        />
      )}

      {paymentRequestModalOpen && (
        <PaymentRequestModal
          isOpen={paymentRequestModalOpen}
          onClose={() => {
            setPaymentRequestModalOpen(false);
            setSelectedMilestoneForRequest(null);
          }}
          project={{
            ...project,
            waterfallMilestones: computeMilestoneWaterfall(project.milestones || []),
          }}
          initialMilestone={selectedMilestoneForRequest}
          bankAccounts={accounts}
          company={project.company}
          onOpenDocumentPreview={(docType, options) => handleGenerateDoc(docType, options)}
          onOpenCreateInvoice={(milestone, customAmount) => {
            setSelectedMilestoneForInvoice(milestone);
            setCreateInvoiceOpen(true);
          }}
        />
      )}

      {createInvoiceOpen && (
        <CreateProjectInvoiceModal
          project={project}
          preselectedMilestone={selectedMilestoneForInvoice}
          isOpen={createInvoiceOpen}
          onClose={() => {
            setCreateInvoiceOpen(false);
            setSelectedMilestoneForInvoice(null);
          }}
          onSuccess={() => fetchProjectData()}
        />
      )}

      {previewInvoiceDoc && (
        <CommonDocumentPreviewModal
          isOpen={Boolean(previewInvoiceDoc)}
          document={previewInvoiceDoc}
          type="INVOICE"
          onClose={() => setPreviewInvoiceDoc(null)}
        />
      )}

      {previewPaymentDoc && (
        <CommonDocumentPreviewModal
          isOpen={Boolean(previewPaymentDoc)}
          document={previewPaymentDoc}
          type="PAYMENT"
          onClose={() => setPreviewPaymentDoc(null)}
        />
      )}

      {/* Edit Milestone Modal */}
      {editingMilestone && (
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
          onClick={() => !savingMilestone && setEditingMilestone(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Edit Milestone Phase & Advance Allocation
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
                  Phase {editingMilestone.milestoneOrder} — {project.projectCode}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMilestone(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateMilestoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Milestone Phase Title
                </label>
                <input
                  type="text"
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Planned Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingMilestone.percentage}
                    onChange={(e) => {
                      const pct = parseFloat(e.target.value) || 0;
                      const totalVal = project.financials.totalProjectValue || 0;
                      const calculatedAmt = Math.round(totalVal * (pct / 100) * 100) / 100;
                      setEditingMilestone({
                        ...editingMilestone,
                        percentage: e.target.value,
                        amount: calculatedAmt,
                      });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Planned Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingMilestone.amount}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, amount: parseFloat(e.target.value) || 0 })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Actual Paid / Received Amount (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editingMilestone.paidAmount}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, paidAmount: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                />
              </div>

              {/* Live Variance Calculation Preview */}
              {(() => {
                const planned = Number(editingMilestone.amount || 0);
                const paid = Number(editingMilestone.paidAmount || 0);
                const diff = Math.round((paid - planned) * 100) / 100;

                if (paid <= 0) {
                  return (
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#64748b' }}>
                      Status: Unpaid. Full planned amount of ₹{planned.toLocaleString('en-IN')} pending.
                    </div>
                  );
                }

                if (diff > 0) {
                  return (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#166534' }}>
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TrendingUp size={15} color="#16a34a" />
                        <span>Excess Payment Received: +₹{diff.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ fontSize: '11px', marginTop: 3, color: '#15803d' }}>
                        Client paid more than the planned {editingMilestone.percentage}% milestone amount. This surplus will be saved in DB and tracked as excess advance.
                      </div>
                    </div>
                  );
                }

                if (diff < 0) {
                  return (
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#92400e' }}>
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TrendingDown size={15} color="#b45309" />
                        <span>Shortfall / Partial Payment: -₹{Math.abs(diff).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ fontSize: '11px', marginTop: 3, color: '#b45309' }}>
                        Remaining balance of ₹{Math.abs(diff).toLocaleString('en-IN')} is still pending for this milestone phase.
                      </div>
                    </div>
                  );
                }

                return (
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#1e40af' }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={15} color="#2563eb" />
                      <span>Exact Match: ₹0 Variance (100% Phase Settled)</span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Surplus / Variance Allocation Notes (Saved in DB)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Client paid additional advance for early hardware procurement..."
                  value={editingMilestone.excessAllocationNotes || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, excessAllocationNotes: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={editingMilestone.dueDate || ''}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Milestone Status
                  </label>
                  <select
                    value={editingMilestone.status}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="INVOICED">INVOICED</option>
                    <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  disabled={savingMilestone}
                  onClick={() => setEditingMilestone(null)}
                  style={{
                    padding: '9px 18px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: savingMilestone ? 'not-allowed' : 'pointer',
                    color: '#475569',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMilestone}
                  style={{
                    padding: '9px 18px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: savingMilestone ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {savingMilestone ? (
                    <>
                      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save & Update Milestone</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Milestone Confirmation Modal */}
      {milestoneToDelete && (
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
          onClick={() => !deletingMilestone && setMilestoneToDelete(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
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
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Delete Milestone Phase</h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>Phase {milestoneToDelete.milestoneOrder}</div>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5, margin: '0 0 16px' }}>
              Are you sure you want to delete milestone <strong>"{milestoneToDelete.title}"</strong> (₹{milestoneToDelete.amount?.toLocaleString('en-IN')})?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                disabled={deletingMilestone}
                onClick={() => setMilestoneToDelete(null)}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: deletingMilestone ? 'not-allowed' : 'pointer',
                  color: '#475569',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingMilestone}
                onClick={handleDeleteMilestoneSubmit}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: deletingMilestone ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {deletingMilestone ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {projectDeleteModalOpen && (
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
          onClick={() => !deletingProject && setProjectDeleteModalOpen(false)}
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
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: 2 }}>{project.projectCode}</div>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5, margin: '0 0 16px' }}>
              Are you sure you want to delete project <strong>"{project.name}"</strong>?
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
                This action is audited. The project will be removed from your active list while financial records remain logged in the audit ledger.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                disabled={deletingProject}
                onClick={() => setProjectDeleteModalOpen(false)}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: deletingProject ? 'not-allowed' : 'pointer',
                  color: '#475569',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingProject}
                onClick={handleDeleteProject}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: deletingProject ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {deletingProject ? (
                  <>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Deleting Project...</span>
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

      {/* Quotation Document Preview Modal */}
      {previewQuotationDoc && (
        <CommonDocumentPreviewModal
          isOpen={!!previewQuotationDoc}
          onClose={() => setPreviewQuotationDoc(null)}
          document={previewQuotationDoc}
          type="QUOTATION"
        />
      )}

      {/* Digital Signature PIN Modal */}
      <PinSignatureModal
        isOpen={!!signTargetQuotationId}
        onClose={() => setSignTargetQuotationId(null)}
        onConfirm={handleSignQuotationConfirm}
        documentName="Quotation"
      />
    </div>
  );
}
