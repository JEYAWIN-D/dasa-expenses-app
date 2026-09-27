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
  Percent,
  RefreshCw,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { projectsService } from '../../services/projects.service.js';
import { accountsService } from '../../services/accounts.service.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { RecordPaymentModal } from './components/RecordPaymentModal.jsx';
import { AddProjectExpenseModal } from './components/AddProjectExpenseModal.jsx';
import { DocumentPreviewModal } from './components/DocumentPreviewModal.jsx';
import { CreateProjectInvoiceModal } from './components/CreateProjectInvoiceModal.jsx';
import { DocumentPreviewModal as CommonDocumentPreviewModal } from '../../components/common/DocumentPreviewModal.jsx';

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
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [documentModalData, setDocumentModalData] = useState(null);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [selectedMilestoneForInvoice, setSelectedMilestoneForInvoice] = useState(null);
  const [preselectedInvoiceForPayment, setPreselectedInvoiceForPayment] = useState(null);
  const [previewInvoiceDoc, setPreviewInvoiceDoc] = useState(null);

  // Handover Action State
  const [handoverNotes, setHandoverNotes] = useState('');
  const [handoverAuthorizedBy, setHandoverAuthorizedBy] = useState('');
  const [handoverSubmitting, setHandoverSubmitting] = useState(false);

  // Milestone edit/add state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestonePercent, setNewMilestonePercent] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

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

  const handleGenerateDoc = async (docType) => {
    try {
      const res = await projectsService.getDocumentData(id, docType);
      setDocumentModalData(res.data);
    } catch (err) {
      notify.error(err.message || 'Failed to generate document');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setRecordPaymentOpen(true)}
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
          borderBottom: '2px solid var(--border-subtle)',
          gap: 24,
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        <button
          onClick={() => setActiveTab('milestones')}
          style={{
            padding: '10px 4px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'milestones' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'milestones' ? '#2563eb' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Layers size={16} />
          <span>Payment Milestones ({project.milestones?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '10px 4px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'invoices' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'invoices' ? '#2563eb' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <FileText size={16} />
          <span>Invoices & GST Bills ({project.invoices?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          style={{
            padding: '10px 4px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'payments' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'payments' ? '#2563eb' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Receipt size={16} />
          <span>Payment Received ({project.payments?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '10px 4px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'expenses' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'expenses' ? '#2563eb' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Wallet size={16} />
          <span>Expense Ledger & Fund Utilization ({project.expenses?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          style={{
            padding: '10px 4px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'documents' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'documents' ? '#2563eb' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <FileText size={16} />
          <span>Official Letters & Document Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('handover')}
          style={{
            padding: '10px 4px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'handover' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'handover' ? '#2563eb' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ShieldCheck size={16} />
          <span>Final Payment Verification & Handover</span>
        </button>
      </div>

      {/* TAB CONTENT 1: MILESTONES */}
      {activeTab === 'milestones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                Customizable Payment Milestones & Schedule
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Configure flexible phases based on percentages or fixed amounts (e.g. 50% advance, 30% development, 20% handover).
              </p>
            </div>

            <button
              onClick={() => setAddingMilestone(!addingMilestone)}
              style={{
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={15} />
              <span>Add Custom Phase</span>
            </button>
          </div>

          {/* Add Milestone Inline Form */}
          {addingMilestone && (
            <form
              onSubmit={handleAddMilestoneSubmit}
              style={{
                backgroundColor: '#f8fafc',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
                display: 'grid',
                gridTemplateColumns: '1fr 120px 160px 100px',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Milestone Title (e.g. Phase 2: Staging Demo Approval)"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required
              />
              <input
                type="number"
                placeholder="Percentage %"
                value={newMilestonePercent}
                onChange={(e) => setNewMilestonePercent(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <input
                type="date"
                value={newMilestoneDueDate}
                onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <button
                type="submit"
                style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Save
              </button>
            </form>
          )}

          {/* Milestones Table */}
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px' }}>#</th>
                  <th style={{ padding: '12px 18px' }}>Milestone Phase Title</th>
                  <th style={{ padding: '12px 18px' }}>Target Due Date</th>
                  <th style={{ padding: '12px 18px' }}>Share (%)</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Amount (₹)</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Paid Amount</th>
                  <th style={{ padding: '12px 18px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {project.milestones?.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>Phase {m.milestoneOrder}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-main)' }}>
                      <div>{m.title}</div>
                      {m.notes && <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>{m.notes}</div>}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>
                      {m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-IN') : 'Flexible'}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>{m.percentage}%</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      ₹{m.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: m.paidAmount > 0 ? '#16a34a' : '#94a3b8' }}>
                      ₹{m.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: m.status === 'PAID' ? '#dcfce7' : (m.status === 'PARTIALLY_PAID' ? '#fef3c7' : '#f1f5f9'),
                          color: m.status === 'PAID' ? '#166534' : (m.status === 'PARTIALLY_PAID' ? '#854d0e' : '#475569'),
                        }}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedMilestoneForInvoice(m);
                            setCreateInvoiceOpen(true);
                          }}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#2563eb',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <FileText size={12} />
                          <span>Bill with GST</span>
                        </button>

                        <button
                          onClick={() => handleGenerateDoc('milestone-request')}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#475569',
                          }}
                        >
                          Request Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                              <div key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>• {s.paymentMode}:</span>
                                <strong style={{ color: '#059669' }}>₹{s.amount.toLocaleString('en-IN')}</strong>
                                {s.accountName && <span style={{ color: '#64748b', fontSize: '11px' }}>({s.accountName})</span>}
                                {s.referenceNumber && <span style={{ color: '#94a3b8', fontSize: '11px' }}>Ref: {s.referenceNumber}</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>{p.paymentMode} {p.referenceNumber ? `(Ref: ${p.referenceNumber})` : ''}</span>
                        )}
                        {p.notes && <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4 }}>{p.notes}</div>}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleGenerateDoc('acknowledgment')}
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
                          <span>Letter / Receipt</span>
                        </button>
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
                  Formal letter requesting agreed advance payment ({fin.advanceRequiredPercent}% = ₹{fin.advanceRequiredAmount.toLocaleString('en-IN')}) with company bank details.
                </p>
              </div>
              <button
                onClick={() => handleGenerateDoc('advance-request')}
                style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Printer size={14} />
                <span>Generate & Preview Letter</span>
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
                  Official formal thank you note detailing receipt of funds, multi-channel payment split breakdown, and updated account balance.
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
                  Deliverable completion letter detailing milestone progress and requesting phase release as per agreed contract schedule.
                </p>
              </div>
              <button
                onClick={() => handleGenerateDoc('milestone-request')}
                style={{ padding: '8px 14px', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Printer size={14} />
                <span>Generate Milestone Request</span>
              </button>
            </div>

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
          onClose={() => {
            setRecordPaymentOpen(false);
            setPreselectedInvoiceForPayment(null);
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
    </div>
  );
}
