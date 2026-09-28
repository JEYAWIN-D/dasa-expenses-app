import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle, FileText, Building2, ShieldCheck } from 'lucide-react';

export function DocumentPreviewModal({ docData, onClose }) {
  const printRef = useRef(null);

  if (!docData) return null;

  const { docType, date, project, client, quotation, financials, milestones, payments, company, bankAccounts } = docData;

  const handlePrint = () => {
    window.print();
  };

  const getDocTitle = () => {
    switch (docType) {
      case 'advance-request':
        return 'ADVANCE PAYMENT REQUEST LETTER';
      case 'acknowledgment':
        return 'PAYMENT ACKNOWLEDGMENT LETTER';
      case 'milestone-request':
        return 'MILESTONE PAYMENT REQUEST LETTER';
      case 'receipt':
        return 'OFFICIAL PAYMENT RECEIPT';
      case 'final-reminder':
        return 'FINAL PAYMENT REMINDER & HANDOVER NOTICE';
      case 'handover-certificate':
        return 'PROJECT HANDOVER & SETTLEMENT CLEARANCE CERTIFICATE';
      default:
        return 'OFFICIAL BUSINESS DOCUMENT';
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
        {/* Modal Controls Bar */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="#38bdf8" />
            <span style={{ fontWeight: 600, fontSize: '15px' }}>{getDocTitle()}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Printer size={15} />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 6,
                borderRadius: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          ref={printRef}
          className="printable-document"
          style={{
            padding: '40px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          {/* Letterhead Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid #0f172a',
              paddingBottom: '20px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <img
                src={company?.logoUrl || '/dasa-tech-logo.png'}
                alt={company?.companyName || 'DASA TECH'}
                onError={(e) => {
                  e.currentTarget.src = '/dasa-tech-logo.png';
                }}
                style={{ height: '54px', width: '54px', objectFit: 'contain', borderRadius: '8px' }}
              />
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', margin: 0 }}>
                  {company?.companyName || 'DASA TECH'}
                </h1>
                <p style={{ color: '#2563eb', fontWeight: 600, fontSize: '13px', marginTop: 2, marginBottom: 4 }}>
                  {company?.tagline || 'Enterprise Cloud & Software Engineering'}
                </p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0' }}>
                  {company?.address}, {(company?.city || 'Erode').replace(/BanERODEgalore/gi, 'Erode')}, {company?.state || 'Tamil Nadu'} - {company?.postalCode || '638002'}
                </p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0' }}>
                  Phone: {company?.phone || '+91 76399 30148'} | Email: {company?.email || 'dasatechmu@gmail.com'}
                </p>
                <p style={{ color: '#475569', fontSize: '12px', fontWeight: 500, marginTop: 4 }}>
                  GSTIN: <strong>{company?.gstNumber || '33ABCDE1234F1Z5'}</strong> | PAN: <strong>{company?.panNumber || 'ABCDE1234F'}</strong>
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#f1f5f9',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0f172a',
                  marginBottom: 6,
                }}
              >
                Date: {date}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Ref: <strong>{project.code}</strong>
              </div>
              {quotation && (
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Quotation: <strong>{quotation.number}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Document Banner */}
          <div
            style={{
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '28px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {getDocTitle()}
            </h2>
          </div>

          {/* To: Client Details */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>
              To:
            </p>
            <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>{client.name}</p>
            {client.contactPerson && (
              <p style={{ color: '#334155', fontWeight: 500 }}>Attn: {client.contactPerson}</p>
            )}
            {client.address && <p style={{ color: '#64748b', fontSize: '13px' }}>{client.address}, {client.city}, {client.state}</p>}
            {client.phone && <p style={{ color: '#64748b', fontSize: '13px' }}>Phone: {client.phone}</p>}
            {client.email && <p style={{ color: '#64748b', fontSize: '13px' }}>Email: {client.email}</p>}
          </div>

          {/* Project Reference Subject */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#eff6ff',
              borderLeft: '4px solid #2563eb',
              borderRadius: '4px',
              marginBottom: '24px',
            }}
          >
            <p style={{ fontWeight: 600, color: '#1e40af' }}>
              Subject: {getDocTitle()} — Project: {project.name} ({project.code})
            </p>
          </div>

          {/* DOCUMENT SPECIFIC BODY CONTENT */}
          {docType === 'advance-request' && (
            <div>
              <p style={{ marginBottom: '14px' }}>Dear {client.contactPerson || 'Sir / Madam'},</p>
              <p style={{ marginBottom: '16px' }}>
                We are pleased to partner with <strong>{client.name}</strong> for the execution of{' '}
                <strong>{project.name}</strong>. In accordance with our approved quotation{' '}
                <strong>{quotation?.number || project.code}</strong>, project commencement requires the agreed advance deposit.
              </p>

              {/* Financial Box */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '24px',
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', padding: '10px 16px', fontWeight: 600, fontSize: '13px', color: '#475569' }}>
                  PAYMENT SUMMARY & ADVANCE REQUIREMENT
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Total Approved Project Value:</span>
                    <span style={{ fontWeight: 700 }}>₹{financials.totalProjectValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Agreed Advance Percentage:</span>
                    <span style={{ fontWeight: 600 }}>{financials.advanceRequiredPercent}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '16px', color: '#2563eb' }}>
                    <span style={{ fontWeight: 700 }}>Advance Amount Payable Now:</span>
                    <span style={{ fontWeight: 800 }}>₹{financials.advanceRequiredAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <p style={{ marginBottom: '16px' }}>
                Kindly remit the advance payment using any of our accepted payment options listed below:
              </p>
            </div>
          )}

          {docType === 'acknowledgment' && (
            <div>
              <p style={{ marginBottom: '14px' }}>Dear {client.contactPerson || 'Sir / Madam'},</p>
              <p style={{ marginBottom: '16px' }}>
                We gratefully acknowledge receipt of payment towards <strong>{project.name}</strong>. The payment has been
                credited to your project account as detailed below:
              </p>

              {/* Payments & Splits Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px' }}>Receipt #</th>
                      <th style={{ padding: '10px 14px' }}>Date</th>
                      <th style={{ padding: '10px 14px' }}>Type</th>
                      <th style={{ padding: '10px 14px' }}>Payment Mode & Breakdown</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.receiptNumber}</td>
                        <td style={{ padding: '10px 14px' }}>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                        <td style={{ padding: '10px 14px' }}>{p.paymentType}</td>
                        <td style={{ padding: '10px 14px' }}>
                          {p.splits && p.splits.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {p.splits.map((s, idx) => (
                                <div key={idx} style={{ fontSize: '12px', color: '#334155' }}>
                                  • <strong style={{ color: '#0f172a' }}>{s.paymentMode}:</strong>{' '}
                                  <strong style={{ color: '#059669' }}>₹{Number(s.amount).toLocaleString('en-IN')}</strong>{' '}
                                  {s.accountName && <span style={{ color: '#64748b', fontSize: '11px' }}>({s.accountName})</span>}{' '}
                                  {s.referenceNumber && <span style={{ fontFamily: 'monospace', color: '#475569', fontSize: '11px', backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: 3 }}>Ref: {s.referenceNumber}</span>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <span style={{ fontWeight: 600 }}>{p.paymentMode}</span>{' '}
                              {p.referenceNumber && <span style={{ fontFamily: 'monospace', color: '#64748b' }}>Ref: {p.referenceNumber}</span>}
                            </div>
                          )}
                          {p.notes && !p.notes.includes('Cash (₹9,000)') && !p.notes.startsWith('Advance payment received in multiple channels:') && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>
                              Note: {p.notes}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>
                          ₹{p.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Updated Balance Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: '24px' }}>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Total Project Value</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: 4 }}>₹{financials.totalProjectValue.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '12px', color: '#065f46' }}>Total Received to Date</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#047857', marginTop: 4 }}>₹{financials.totalPaid.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: financials.outstandingBalance === 0 ? '#ecfdf5' : '#fffbeb', borderRadius: '8px', border: `1px solid ${financials.outstandingBalance === 0 ? '#a7f3d0' : '#fde68a'}` }}>
                  <div style={{ fontSize: '12px', color: financials.outstandingBalance === 0 ? '#065f46' : '#92400e' }}>Outstanding Balance</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: financials.outstandingBalance === 0 ? '#047857' : '#b45309', marginTop: 4 }}>
                    ₹{financials.outstandingBalance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {docType === 'milestone-request' && (
            <div>
              <p style={{ marginBottom: '14px' }}>Dear {client.contactPerson || 'Sir / Madam'},</p>
              <p style={{ marginBottom: '16px' }}>
                We are writing to provide a milestone deliverable status update for <strong>{project.name}</strong>.
                The project schedule and milestones are detailed below:
              </p>

              {/* Milestones Schedule Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px' }}>#</th>
                      <th style={{ padding: '10px 14px' }}>Milestone Title</th>
                      <th style={{ padding: '10px 14px' }}>Due Date</th>
                      <th style={{ padding: '10px 14px' }}>Share (%)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount (₹)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.milestoneOrder}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 500 }}>{m.title}</td>
                        <td style={{ padding: '10px 14px' }}>
                          {m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-IN') : 'TBD'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>{m.percentage}%</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>
                          ₹{m.amount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: m.status === 'PAID' ? '#dcfce7' : (m.status === 'PARTIALLY_PAID' ? '#fef3c7' : '#f1f5f9'),
                              color: m.status === 'PAID' ? '#166534' : (m.status === 'PARTIALLY_PAID' ? '#854d0e' : '#475569'),
                            }}
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {docType === 'final-reminder' && (
            <div>
              <p style={{ marginBottom: '14px' }}>Dear {client.contactPerson || 'Sir / Madam'},</p>
              <p style={{ marginBottom: '16px' }}>
                We are pleased to inform you that development and deployment for <strong>{project.name}</strong> has reached completion.
                In accordance with company financial governance and project handover protocols, final handover authorization is permitted only after outstanding settlements are fully reconciled.
              </p>

              {/* Settlement Summary */}
              <div
                style={{
                  border: '1px solid #fecaca',
                  backgroundColor: '#fef2f2',
                  borderRadius: '10px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#991b1b', marginBottom: '10px' }}>
                  FINAL SETTLEMENT VERIFICATION
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #fca5a5' }}>
                  <span>Total Project Contract Value:</span>
                  <span style={{ fontWeight: 700 }}>₹{financials.totalProjectValue.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #fca5a5' }}>
                  <span>Total Payments Cleared:</span>
                  <span style={{ fontWeight: 700, color: '#047857' }}>₹{financials.totalPaid.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '17px', color: '#b91c1c' }}>
                  <span style={{ fontWeight: 800 }}>Final Balance Required for Handover:</span>
                  <span style={{ fontWeight: 900 }}>₹{financials.outstandingBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p style={{ marginBottom: '16px' }}>
                Please settle the pending balance to facilitate seamless issuance of the <strong>Project Handover & Settlement Clearance Certificate</strong> and transfer of production credentials and source deliverables.
              </p>
            </div>
          )}

          {docType === 'handover-certificate' && (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  marginBottom: '28px',
                }}
              >
                <CheckCircle size={44} color="#16a34a" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#14532d', textTransform: 'uppercase' }}>
                  OFFICIAL HANDOVER & FINANCIAL SETTLEMENT CLEARANCE
                </h3>
                <p style={{ fontSize: '13px', color: '#166534', marginTop: 4 }}>
                  This document certifies that all deliverables have been verified, and all contractual payments have been settled in full.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: '24px' }}>
                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Project Code & Name:</p>
                  <p style={{ fontWeight: 700, color: '#0f172a' }}>{project.code} — {project.name}</p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: 8 }}>Customer Company:</p>
                  <p style={{ fontWeight: 700, color: '#0f172a' }}>{client.name}</p>
                </div>
                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Total Contract Value Settled:</p>
                  <p style={{ fontWeight: 700, color: '#047857', fontSize: '16px' }}>₹{financials.totalProjectValue.toLocaleString('en-IN')}</p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: 8 }}>Outstanding Balance:</p>
                  <p style={{ fontWeight: 800, color: '#16a34a' }}>₹0 (ZERO DUES — VERIFIED)</p>
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>HANDOVER & CLEARANCE AUDIT NOTES:</p>
                <p style={{ fontSize: '13px', color: '#334155', marginTop: 4 }}>
                  {project.handoverNotes || 'All contractual specifications, deliverables, and financial balances have been audited and verified. Formal custody and admin rights of the project are hereby handed over to the client.'}
                </p>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: 8 }}>
                  Authorized by: <strong>{project.handoverApprovedBy || company?.authorizedPerson || 'DASA TECH Management'}</strong> on {project.handoverDate ? new Date(project.handoverDate).toLocaleDateString('en-IN') : date}
                </p>
              </div>
            </div>
          )}

          {/* Bank & Payment Remittance Details (For request letters) */}
          {(docType === 'advance-request' || docType === 'milestone-request' || docType === 'final-reminder') && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '28px',
              }}
            >
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={16} color="#2563eb" />
                <span>BANK & UPI REMITTANCE DETAILS</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {bankAccounts && bankAccounts.length > 0 ? (
                  bankAccounts.map((acc) => (
                    <div key={acc.id} style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e40af' }}>{acc.accountName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>Type: {acc.accountType}</div>
                      {acc.accountNumber && <div style={{ fontSize: '11px', color: '#334155' }}>A/C: <strong>{acc.accountNumber}</strong></div>}
                      {acc.ifscCode && <div style={{ fontSize: '11px', color: '#334155' }}>IFSC: <strong>{acc.ifscCode}</strong></div>}
                    </div>
                  ))
                ) : (
                  <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e40af' }}>{company?.bankName || 'Direct Bank NEFT / IMPS / UPI'}</div>
                    {company?.bankAccountNumber && <div style={{ fontSize: '11px', color: '#334155' }}>A/C: <strong>{company.bankAccountNumber}</strong></div>}
                    {company?.bankIfsc && <div style={{ fontSize: '11px', color: '#334155' }}>IFSC: <strong>{company.bankIfsc}</strong></div>}
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Beneficiary: {company?.companyName || 'DASA TECH'}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signatures & Seal Area */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803d', fontSize: '12px', fontWeight: 600 }}>
                <ShieldCheck size={16} />
                <span>Digitally Authenticated Document</span>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: 2 }}>
                Generated via DASA TECH Quotation, Billing & Financial Tracking System
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: '18px', color: '#1e3a8a', fontFamily: 'serif' }}>
                  {company?.authorizedPerson || 'DASA'}
                </span>
              </div>
              <div style={{ borderTop: '1px solid #94a3b8', width: '180px', margin: '4px 0 2px auto' }} />
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                {company?.authorizedPerson || 'Authorized Signatory'}
              </p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>For {company?.companyName || 'DASA TECH'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
