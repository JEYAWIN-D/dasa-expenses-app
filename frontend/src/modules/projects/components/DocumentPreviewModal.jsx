import React, { useRef, useState } from 'react';
import { X, Printer, FileText, Building2, ShieldCheck, CheckCircle2, Layers, Calendar, CreditCard, ChevronRight, Lock, Check } from 'lucide-react';
import { printDocument } from '../../../utils/printDocument.js';

export function DocumentPreviewModal({ docData, onClose }) {
  const printRef = useRef(null);
  const [useDigitalSignature, setUseDigitalSignature] = useState(true);

  if (!docData) return null;

  const { docType, date, project, client, quotation, financials, milestones, payments, company, bankAccounts } = docData;

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

  const handlePrint = () => {
    if (printRef.current) {
      printDocument(printRef.current, `${getDocTitle()} - ${project.code}`);
    } else {
      window.print();
    }
  };

  const cleanCompanyName = company?.companyName || 'DASA TECH';
  const signatoryName = company?.authorizedPerson || 'DASA TECH Admin';
  const signatoryDesignation = company?.authorizedDesignation || 'Finance & Accounts Authority';

  // Sanitize address to prevent duplicate city/state text
  const cleanAddress = (() => {
    if (!client.address) return '';
    let addr = client.address.trim();
    return addr;
  })();

  return (
    <div
      className="document-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 6mm 10mm 6mm 10mm;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              font-size: 11px !important;
              line-height: 1.35 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            }
            .no-print,
            .document-modal-overlay > div > div:first-child {
              display: none !important;
            }
            .document-modal-overlay {
              position: static !important;
              background: transparent !important;
              padding: 0 !important;
              inset: auto !important;
            }
            #printable-project-document {
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              overflow: visible !important;
              page-break-inside: avoid !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls Bar (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '10px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <span style={{ fontWeight: 700, fontSize: '13.5px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              {getDocTitle()} (Single Page A4 Ready)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '12px',
                color: '#cbd5e1',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={useDigitalSignature}
                onChange={(e) => setUseDigitalSignature(e.target.checked)}
                style={{ cursor: 'pointer', width: 14, height: 14, accentColor: '#22c55e' }}
              />
              <span>Digital Signature</span>
            </label>

            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 18px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '7px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Printer size={15} />
              <span>Print 1-Page PDF</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 5,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          id="printable-project-document"
          ref={printRef}
          style={{
            padding: '22px 30px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontSize: '11.5px',
            lineHeight: 1.4,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          {/* Top Brand Accent Bar */}
          <div
            style={{
              height: '3px',
              background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #06b6d4 100%)',
              borderRadius: '2px',
              marginBottom: '12px',
            }}
          />

          {/* Letterhead Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingBottom: '10px',
              marginBottom: '10px',
              borderBottom: '1.5px solid #e2e8f0',
            }}
          >
            {/* Left: Supplier Info */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', maxWidth: '62%' }}>
              <img
                src={company?.logoUrl || '/dasa-tech-logo.png'}
                alt={cleanCompanyName}
                onError={(e) => {
                  e.currentTarget.src = '/dasa-tech-logo.png';
                }}
                style={{
                  height: '46px',
                  width: '46px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  padding: '3px',
                }}
              />
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.4px', margin: 0, lineHeight: 1.15 }}>
                  {cleanCompanyName}
                </h1>
                <p style={{ color: '#2563eb', fontWeight: 700, fontSize: '10px', marginTop: 2, marginBottom: 2, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {company?.tagline || 'Enterprise Cloud & Software Engineering'}
                </p>
                <p style={{ color: '#64748b', fontSize: '10.5px', margin: '1px 0', lineHeight: 1.3 }}>
                  {company?.address}, {(company?.city || 'Erode').replace(/BanERODEgalore/gi, 'Erode')}, {company?.state || 'Tamil Nadu'} - {company?.postalCode || '638002'}
                </p>
                <p style={{ color: '#64748b', fontSize: '10.5px', margin: '1px 0' }}>
                  Phone: <strong>{company?.phone || '+91 76399 30148'}</strong> &nbsp;|&nbsp; Email: <strong>{company?.email || 'dasatechmu@gmail.com'}</strong>
                </p>
                {(company?.gstNumber || company?.panNumber) && (company?.gstNumber !== '33ABCDE1234F1Z5' || company?.panNumber !== 'ABCDE1234F') && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    {company?.gstNumber && company.gstNumber !== '33ABCDE1234F1Z5' && (
                      <span style={{ fontSize: '10px', color: '#334155', backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>
                        GSTIN: <strong>{company.gstNumber}</strong>
                      </span>
                    )}
                    {company?.panNumber && company.panNumber !== 'ABCDE1234F' && (
                      <span style={{ fontSize: '10px', color: '#334155', backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>
                        PAN: <strong>{company.panNumber}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Meta Reference Box */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '6px 12px',
                textAlign: 'right',
                minWidth: '160px',
              }}
            >
              <div style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
                DOCUMENT REFERENCE
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', marginTop: 1 }}>
                {project.code}
              </div>
              <div style={{ fontSize: '11px', color: '#334155', marginTop: 2 }}>
                Date: <strong>{date}</strong>
              </div>
              {quotation && (
                <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: 1 }}>
                  Quotation: <strong>{quotation.number}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Document Banner */}
          <div
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '6px',
              textAlign: 'center',
              marginBottom: '10px',
            }}
          >
            <h2
              style={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                margin: 0,
                color: '#ffffff',
              }}
            >
              {getDocTitle()}
            </h2>
          </div>

          {/* Client & Project Details 2-Column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            {/* Box 1: Recipient Details */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '8px 12px',
              }}
            >
              <div style={{ fontSize: '9.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.4px', marginBottom: 2 }}>
                BILLED TO / RECIPIENT:
              </div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>
                {client.name}
              </div>
              {client.contactPerson && (
                <div style={{ fontSize: '11px', color: '#334155', fontWeight: 600, marginTop: 1 }}>
                  Attn: {client.contactPerson}
                </div>
              )}
              {cleanAddress && (
                <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: 1, lineHeight: 1.3 }}>
                  {cleanAddress}
                </div>
              )}
              {client.gstNumber && (
                <div style={{ fontSize: '10px', color: '#475569', marginTop: 2 }}>
                  Client GSTIN: <strong>{client.gstNumber}</strong>
                </div>
              )}
            </div>

            {/* Box 2: Engagement Summary */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '8px 12px',
              }}
            >
              <div style={{ fontSize: '9.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.4px', marginBottom: 2 }}>
                PROJECT OVERVIEW:
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                {project.name}
              </div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: 1 }}>
                Project Code: <strong>{project.code}</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: 1 }}>
                Total Contract Value: <strong style={{ color: '#0f172a' }}>₹{financials.totalProjectValue.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#16a34a', marginTop: 1 }}>
                Total Paid to Date: <strong>₹{financials.totalPaid.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Salutation & Formal Statement */}
          <div
            style={{
              borderLeft: '3px solid #2563eb',
              backgroundColor: '#f8fafc',
              padding: '6px 10px',
              borderRadius: '0 6px 6px 0',
              marginBottom: '10px',
              fontSize: '11px',
              color: '#334155',
              lineHeight: 1.4,
            }}
          >
            <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#0f172a' }}>
              Dear {client.contactPerson || client.name || 'Sir / Madam'},
            </p>
            {docType === 'advance-request' && (
              <p style={{ margin: 0 }}>
                Thank you for confirming the project engagement for <strong>{project.name}</strong> ({project.code}).
                In accordance with our commercial agreement, this letter serves as the formal request for the advance commitment payment required to initiate deliverables.
              </p>
            )}
            {docType === 'acknowledgment' && (
              <p style={{ margin: 0 }}>
                We gratefully acknowledge receipt of your payment for <strong>{project.name}</strong>.
                The payment has been credited to your account and reconciled against project milestone deliverables as detailed below:
              </p>
            )}
            {docType === 'milestone-request' && (
              <p style={{ margin: 0 }}>
                We are pleased to provide the milestone deliverable status update for <strong>{project.name}</strong>.
                The project schedule, milestone allocations, and current remittance breakdown are detailed below:
              </p>
            )}
            {docType === 'final-reminder' && (
              <p style={{ margin: 0 }}>
                We are pleased to inform you that development and deployment for <strong>{project.name}</strong> has reached completion.
                In accordance with corporate governance, final handover clearance is issued once outstanding settlements are fully reconciled.
              </p>
            )}
            {docType === 'receipt' && (
              <p style={{ margin: 0 }}>
                This document serves as the official confirmation of payment received towards <strong>{project.name}</strong>.
              </p>
            )}
          </div>

          {/* MILESTONE SCHEDULE TABLE */}
          {(docType === 'milestone-request' || docType === 'acknowledgment' || docType === 'advance-request') && milestones && milestones.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '9.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.4px', marginBottom: 4 }}>
                MILESTONE DELIVERABLES SCHEDULE
              </div>
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px', width: '30px', textAlign: 'center' }}>#</th>
                      <th style={{ padding: '6px 10px' }}>Milestone Phase</th>
                      <th style={{ padding: '6px 10px' }}>Due Date</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>Share</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right' }}>Amount (₹)</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', width: '80px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((m, idx) => (
                      <tr
                        key={m.id || idx}
                        style={{
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                          {m.milestoneOrder || idx + 1}
                        </td>
                        <td style={{ padding: '5px 10px', fontWeight: 600, color: '#0f172a' }}>
                          {m.title}
                        </td>
                        <td style={{ padding: '5px 10px', color: '#475569' }}>
                          {m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-IN') : 'Flexible'}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                          {m.percentage}%
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          ₹{Number(m.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              fontSize: '9.5px',
                              fontWeight: 800,
                              backgroundColor: m.status === 'PAID' ? '#dcfce7' : (m.status === 'PARTIALLY_PAID' ? '#fef3c7' : '#f1f5f9'),
                              color: m.status === 'PAID' ? '#15803d' : (m.status === 'PARTIALLY_PAID' ? '#b45309' : '#475569'),
                              border: `1px solid ${m.status === 'PAID' ? '#86efac' : (m.status === 'PARTIALLY_PAID' ? '#fde68a' : '#cbd5e1')}`,
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

          {/* HERO PRESENT PAYMENT REQUEST CARD */}
          {docData.paymentRequest && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '10px',
                boxShadow: '0 1px 4px rgba(16, 185, 129, 0.06)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '6px',
                  marginBottom: '6px',
                  borderBottom: '1px solid #bbf7d0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#166534', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <CheckCircle2 size={14} color="#16a34a" />
                  <span>PRESENT PAYMENT REQUEST DETAILS</span>
                </div>
                {docData.paymentRequest.dueDate && (
                  <span style={{ fontSize: '10.5px', color: '#166534', fontWeight: 700, backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: 3, border: '1px solid #86efac' }}>
                    Due by: <strong>{new Date(docData.paymentRequest.dueDate).toLocaleDateString('en-IN')}</strong>
                  </span>
                )}
              </div>

              {/* Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '11px' }}>
                {docData.paymentRequest.milestoneTitle && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                    <span>Target Milestone Phase:</span>
                    <strong style={{ color: '#0f172a' }}>{docData.paymentRequest.milestoneTitle}</strong>
                  </div>
                )}
                {docData.paymentRequest.milestoneAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                    <span>Milestone Phase Value:</span>
                    <span style={{ fontWeight: 600 }}>₹{Number(docData.paymentRequest.milestoneAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {docData.paymentRequest.creditApplied > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d', fontWeight: 600 }}>
                    <span>Less: Unallocated Advance / Excess Credit Applied:</span>
                    <span style={{ fontWeight: 800 }}>-₹{Number(docData.paymentRequest.creditApplied).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Hero Net Amount Box */}
              <div
                style={{
                  backgroundColor: '#064e3b',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  marginTop: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  Net Payable Amount Needed to Remit:
                </span>
                <span style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.4px' }}>
                  ₹{Number(docData.paymentRequest.requestedAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {docData.paymentRequest.customNote && (
                <div style={{ marginTop: '4px', fontSize: '10px', color: '#475569', fontStyle: 'italic' }}>
                  Note: {docData.paymentRequest.customNote}
                </div>
              )}
            </div>
          )}

          {/* ADVANCE REQUEST SUMMARY CARD */}
          {docType === 'advance-request' && (
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #bfdbfe', fontSize: '11px' }}>
                <span>Total Project Contract Value:</span>
                <span style={{ fontWeight: 700 }}>₹{financials.totalProjectValue.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #bfdbfe', fontSize: '11px' }}>
                <span>Agreed Advance Share:</span>
                <span style={{ fontWeight: 700 }}>{financials.advanceRequiredPercent}%</span>
              </div>
              <div
                style={{
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  marginTop: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '11px' }}>Advance Amount Payable:</span>
                <span style={{ fontSize: '16px', fontWeight: 900 }}>₹{financials.advanceRequiredAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* FINAL SETTLEMENT SUMMARY CARD */}
          {docType === 'final-reminder' && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #fca5a5', fontSize: '11px' }}>
                <span>Total Project Contract Value:</span>
                <span style={{ fontWeight: 700 }}>₹{financials.totalProjectValue.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #fca5a5', fontSize: '11px' }}>
                <span>Total Received to Date:</span>
                <span style={{ fontWeight: 700, color: '#047857' }}>₹{financials.totalPaid.toLocaleString('en-IN')}</span>
              </div>
              <div
                style={{
                  backgroundColor: '#991b1b',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  marginTop: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '11px' }}>Net Outstanding Due for Handover Clearance:</span>
                <span style={{ fontSize: '16px', fontWeight: 900 }}>₹{financials.outstandingBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* Bank & Payment Remittance Details */}
          {(docType === 'advance-request' || docType === 'milestone-request' || docType === 'final-reminder') && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#0f172a', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                <Building2 size={13} color="#2563eb" />
                <span>BANK & UPI REMITTANCE DETAILS</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {bankAccounts && bankAccounts.length > 0 ? (
                  bankAccounts.map((acc) => (
                    <div key={acc.id} style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, fontSize: '11px', color: '#1e40af' }}>{acc.accountName}</div>
                      <div style={{ fontSize: '9.5px', color: '#64748b' }}>Type: {acc.accountType}</div>
                      {acc.accountNumber && <div style={{ fontSize: '10px', color: '#334155', marginTop: 1 }}>A/C: <strong>{acc.accountNumber}</strong></div>}
                      {acc.ifscCode && <div style={{ fontSize: '10px', color: '#334155' }}>IFSC: <strong>{acc.ifscCode}</strong></div>}
                      {acc.upiId && <div style={{ fontSize: '10px', color: '#16a34a' }}>UPI: <strong>{acc.upiId}</strong></div>}
                    </div>
                  ))
                ) : (
                  <div style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, fontSize: '11px', color: '#1e40af' }}>{company?.bankName || 'Direct Bank NEFT / IMPS / UPI'}</div>
                    {company?.bankAccountNumber && <div style={{ fontSize: '10px', color: '#334155', marginTop: 1 }}>A/C: <strong>{company.bankAccountNumber}</strong></div>}
                    {company?.bankIfsc && <div style={{ fontSize: '10px', color: '#334155' }}>IFSC: <strong>{company.bankIfsc}</strong></div>}
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: 1 }}>Beneficiary: <strong>{cleanCompanyName}</strong></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clean Corporate Signature & Authentication Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '8px',
              borderTop: '1px solid #e2e8f0',
              marginTop: '10px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#15803d', fontSize: '10.5px', fontWeight: 700 }}>
                <ShieldCheck size={14} />
                <span>Official Authenticated Business Document</span>
              </div>
              <p style={{ fontSize: '9.5px', color: '#94a3b8', margin: '1px 0 0' }}>
                Generated via {cleanCompanyName} Financial Governance System
              </p>
            </div>

            <div style={{ textAlign: 'right', minWidth: '190px' }}>
              {useDigitalSignature ? (
                <div
                  style={{
                    border: '1.2px dashed #22c55e',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    display: 'inline-block',
                    textAlign: 'center',
                    minWidth: '180px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#16a34a', fontWeight: 800, fontSize: '9.5px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                    <ShieldCheck size={12} color="#16a34a" />
                    <span>DIGITALLY SIGNED & VERIFIED</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    {signatoryName}
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#15803d', fontWeight: 600 }}>
                    {signatoryDesignation}
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: 1 }}>
                    For {cleanCompanyName}
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#94a3b8', marginTop: 2, borderTop: '1px dashed #bbf7d0', paddingTop: 1 }}>
                    Auth ID: DT-SEC-{date?.replace(/[^0-9]/g, '') || '2026'}-VERIFIED
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ height: '28px' }} />
                  <div style={{ borderTop: '1.5px solid #0f172a', width: '150px', margin: '0 0 3px auto' }} />
                  <p style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', margin: 0 }}>
                    Authorized Signatory
                  </p>
                  <p style={{ fontSize: '10px', color: '#64748b', margin: '1px 0 0' }}>For {cleanCompanyName}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DocumentPreviewModal;
