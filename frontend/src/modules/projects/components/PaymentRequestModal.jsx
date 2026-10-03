import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Mail,
  Printer,
  Copy,
  CheckCircle2,
  FileText,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext.jsx';

export function PaymentRequestModal({
  isOpen,
  onClose,
  project,
  initialMilestone,
  onOpenDocumentPreview,
  onOpenCreateInvoice,
  bankAccounts = [],
  company,
}) {
  const notify = useNotification();
  if (!isOpen || !project) return null;

  const milestones = project.waterfallMilestones || project.milestones || [];
  const selectedMilestoneId = initialMilestone?.id || milestones.find((m) => (m.netPayableNow > 0 || m.status !== 'PAID'))?.id || milestones[0]?.id;

  const [targetType, setTargetType] = useState(initialMilestone ? 'milestone' : 'milestone');
  const [targetMilestoneId, setTargetMilestoneId] = useState(selectedMilestoneId);
  const [customAmount, setCustomAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [customNote, setCustomNote] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(
    bankAccounts.find((a) => a.isDefault)?.id || bankAccounts[0]?.id || ''
  );
  const [copiedType, setCopiedType] = useState(null);

  // Find target milestone
  const activeMilestone = milestones.find((m) => m.id === targetMilestoneId) || milestones[0];
  
  // Calculate amounts
  const milestoneAmount = Number(activeMilestone?.amount || 0);
  const creditApplied = Number(activeMilestone?.creditApplied || 0);
  const milestoneNetDue = Number(activeMilestone?.netPayableNow !== undefined ? activeMilestone.netPayableNow : Math.max(0, milestoneAmount - Number(activeMilestone?.paidAmount || 0)));
  const totalProjectOutstanding = Number(project.financials?.outstandingBalance || 0);

  const finalPayableAmount = targetType === 'milestone'
    ? (customAmount !== '' ? Number(customAmount) : milestoneNetDue)
    : (customAmount !== '' ? Number(customAmount) : totalProjectOutstanding);

  const selectedBank = bankAccounts.find((a) => a.id === selectedAccountId) || bankAccounts[0];
  const companyName = company?.companyName || 'DASA TECH';
  const clientContact = project.client?.contactPerson || project.client?.companyName || 'Client';
  const clientPhone = (project.client?.phone || '').replace(/[^0-9]/g, '');

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // WhatsApp Message Generator
  const generateWhatsAppMessage = () => {
    const bankDetails = selectedBank
      ? `\n🏦 *Bank Remittance Details:*\n• Bank: ${selectedBank.accountName || selectedBank.bankName || 'Direct Transfer'}\n• A/C No: ${selectedBank.accountNumber || '-'}\n• IFSC: ${selectedBank.ifscCode || '-'}${selectedBank.upiId ? `\n• UPI ID: ${selectedBank.upiId}` : ''}`
      : company?.bankAccountNumber
      ? `\n🏦 *Bank Details:*\n• Bank: ${company.bankName}\n• A/C No: ${company.bankAccountNumber}\n• IFSC: ${company.bankIfsc}`
      : '';

    return `*PAYMENT REQUEST - ${companyName}*
----------------------------------------
Dear *${clientContact}*,

This is a friendly payment request for project *${project.name}* (${project.projectCode}).

📌 *Phase / Deliverable:* ${targetType === 'milestone' ? (activeMilestone?.title || 'Milestone Deliverable') : 'Overall Project Settlement'}
${targetType === 'milestone' && creditApplied > 0 ? `• Milestone Value: ${formatCurrency(milestoneAmount)}\n• Advance Credit Deducted: -${formatCurrency(creditApplied)}\n` : ''}💰 *Present Amount to Pay: ${formatCurrency(finalPayableAmount)}*
📅 *Due Date:* ${dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : 'Immediate on Receipt'}
${customNote ? `\n📝 *Note:* ${customNote}` : ''}${bankDetails}

Please acknowledge receipt once transfer is initiated. Thank you!

Best regards,
*${company?.authorizedPerson || companyName}*`;
  };

  const handleCopyWhatsApp = () => {
    const msg = generateWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setCopiedType('whatsapp');
    notify.success('WhatsApp payment request text copied to clipboard!');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleOpenWhatsApp = () => {
    const msg = encodeURIComponent(generateWhatsAppMessage());
    const phone = clientPhone.length >= 10 ? (clientPhone.startsWith('91') ? clientPhone : `91${clientPhone}`) : '';
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  const handleCopyEmail = () => {
    const msg = `Subject: Payment Request: ${targetType === 'milestone' ? activeMilestone?.title : 'Outstanding Balance'} - Project ${project.projectCode}\n\n` + generateWhatsAppMessage().replace(/\*/g, '');
    navigator.clipboard.writeText(msg);
    setCopiedType('email');
    notify.success('Email payment request copied to clipboard!');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleGenerateOfficialPDF = () => {
    if (onOpenDocumentPreview) {
      onOpenDocumentPreview('milestone-request', {
        milestoneId: targetType === 'milestone' ? targetMilestoneId : null,
        requestedAmount: finalPayableAmount,
        dueDate,
        customNote,
      });
      onClose();
    }
  };

  const handleCreateTaxInvoice = () => {
    if (onOpenCreateInvoice) {
      onOpenCreateInvoice(targetType === 'milestone' ? activeMilestone : null, finalPayableAmount);
      onClose();
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
        zIndex: 1100,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
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
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Request Payment from Client</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {project.name} &bull; <span style={{ fontFamily: 'var(--font-mono)' }}>{project.projectCode}</span>
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
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Target Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8, display: 'block' }}>
              Select Payment Scope / Target
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setTargetType('milestone');
                  setCustomAmount('');
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: `2px solid ${targetType === 'milestone' ? '#2563eb' : '#e2e8f0'}`,
                  backgroundColor: targetType === 'milestone' ? '#eff6ff' : '#ffffff',
                  color: targetType === 'milestone' ? '#1d4ed8' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <Layers size={18} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>Specific Milestone Phase</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>Request for deliverable phase with excess advance deduction</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetType('full_balance');
                  setCustomAmount('');
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: `2px solid ${targetType === 'full_balance' ? '#2563eb' : '#e2e8f0'}`,
                  backgroundColor: targetType === 'full_balance' ? '#eff6ff' : '#ffffff',
                  color: targetType === 'full_balance' ? '#1d4ed8' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <CheckCircle2 size={18} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>Total Outstanding Balance</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>Request entire remaining project balance ({formatCurrency(totalProjectOutstanding)})</div>
                </div>
              </button>
            </div>
          </div>

          {/* If Milestone selected, choose which milestone */}
          {targetType === 'milestone' && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
                Select Milestone Phase:
              </label>
              <select
                value={targetMilestoneId}
                onChange={(e) => {
                  setTargetMilestoneId(e.target.value);
                  setCustomAmount('');
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                {milestones.map((m) => {
                  const mDue = m.netPayableNow !== undefined ? m.netPayableNow : Math.max(0, m.amount - m.paidAmount);
                  return (
                    <option key={m.id} value={m.id}>
                      Phase {m.milestoneOrder}: {m.title} &mdash; Value: {formatCurrency(m.amount)} &bull; Net Payable: {formatCurrency(mDue)} ({m.status})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Amount Calculation & Breakdown Box */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Financial Calculation & Excess Advance Credit Breakdown
              </span>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                Auto Reconciled
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px' }}>
              {targetType === 'milestone' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Milestone Agreed Value:</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(milestoneAmount)}</span>
                  </div>
                  {Number(activeMilestone?.paidAmount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                      <span>Direct Payment Received on this Phase:</span>
                      <span style={{ fontWeight: 700 }}>-{formatCurrency(activeMilestone.paidAmount)}</span>
                    </div>
                  )}
                  {creditApplied > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TrendingDown size={14} />
                        <span>Advance Overpayment Credit Applied from Phase 1:</span>
                      </span>
                      <span style={{ fontWeight: 800 }}>-{formatCurrency(creditApplied)}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Total Project Value:</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(project.financials?.totalProjectValue)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                    <span>Total Received to Date:</span>
                    <span style={{ fontWeight: 700 }}>-{formatCurrency(project.financials?.totalPaid)}</span>
                  </div>
                </>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  marginTop: '6px',
                  borderTop: '2px solid #e2e8f0',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    Present Amount Needed to Pay:
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Amount requested from client
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(finalPayableAmount)}
                </div>
              </div>
            </div>

            {/* Custom Amount override option */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Custom Amount (Optional Override):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>₹</span>
                <input
                  type="number"
                  placeholder={String(targetType === 'milestone' ? milestoneNetDue : totalProjectOutstanding)}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  style={{
                    width: '120px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Payment Details & Bank Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={13} color="#64748b" />
                <span>Payment Due Date:</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Building2 size={13} color="#64748b" />
                <span>Remittance Bank Account:</span>
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                }}
              >
                {bankAccounts.length > 0 ? (
                  bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} &bull; {acc.accountNumber ? `A/C ${acc.accountNumber}` : acc.accountType}
                    </option>
                  ))
                ) : (
                  <option value="">{company?.bankName || 'Default Company Bank'}</option>
                )}
              </select>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: 5, display: 'block' }}>
              Custom Request Note (Included in WhatsApp & Letter):
            </label>
            <input
              type="text"
              placeholder="e.g. As discussed, Phase 2 milestone deliverables have been successfully deployed to staging."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Action Dispatcher Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Choose Instant Dispatch Channel
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              
              {/* WhatsApp Request */}
              <div
                style={{
                  border: '1.5px solid #86efac',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontWeight: 700, fontSize: '13px' }}>
                  <MessageSquare size={16} />
                  <span>WhatsApp Message</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '7px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Send size={13} />
                    <span>Send Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyWhatsApp}
                    title="Copy WhatsApp Text"
                    style={{
                      padding: '7px 10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #86efac',
                      borderRadius: '7px',
                      color: '#166534',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {copiedType === 'whatsapp' ? <CheckCircle2 size={14} color="#16a34a" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Official PDF Letter */}
              <div
                style={{
                  border: '1.5px solid #bfdbfe',
                  backgroundColor: '#eff6ff',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e40af', fontWeight: 700, fontSize: '13px' }}>
                  <Printer size={16} />
                  <span>Official Letter PDF</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateOfficialPDF}
                  style={{
                    padding: '7px 10px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <FileText size={13} />
                  <span>Generate Letter</span>
                </button>
              </div>

              {/* Email Request */}
              <div
                style={{
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontWeight: 700, fontSize: '13px' }}>
                  <Mail size={16} />
                  <span>Email Notice</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  style={{
                    padding: '7px 10px',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  {copiedType === 'email' ? <CheckCircle2 size={13} color="#16a34a" /> : <Copy size={13} />}
                  <span>Copy Formatted Email</span>
                </button>
              </div>

              {/* Bill with GST */}
              <div
                style={{
                  border: '1.5px solid #fde68a',
                  backgroundColor: '#fffbeb',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400e', fontWeight: 700, fontSize: '13px' }}>
                  <Sparkles size={16} color="#d97706" />
                  <span>Tax Invoice</span>
                </div>
                <button
                  type="button"
                  onClick={handleCreateTaxInvoice}
                  style={{
                    padding: '7px 10px',
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <FileText size={13} />
                  <span>Bill with GST ({formatCurrency(finalPayableAmount)})</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentRequestModal;
