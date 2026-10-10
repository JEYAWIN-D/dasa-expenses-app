import React, { useRef, useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import { Printer, ShieldCheck, Calendar, Clock, FileText, CheckCircle2, Building2, User, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { Badge } from './Badge.jsx';
import { useCompany } from '../../contexts/CompanyContext.jsx';
import { AmcComparisonView } from './AmcComparisonView.jsx';
import { numberToWordsINR } from '../../utils/numberToWordsINR.js';
import { printDocument } from '../../utils/printDocument.js';

export function DocumentPreviewModal({ isOpen, onClose, document, type = 'QUOTATION' }) {
  const { company: globalCompany } = useCompany();
  const printableRef = useRef(null);

  const [includeDigitalSignature, setIncludeDigitalSignature] = useState(
    document?.isDigitallySigned !== undefined ? Boolean(document.isDigitallySigned) : true
  );

  useEffect(() => {
    if (document) {
      setIncludeDigitalSignature(
        document.isDigitallySigned !== undefined ? Boolean(document.isDigitallySigned) : true
      );
    }
  }, [document?.id, document?.isDigitallySigned]);

  if (!document) return null;

  // Merge document companyProfile with current active company profile (active branding takes precedence)
  const rawCompany = { ...(document.companyProfile || {}), ...(globalCompany || {}) };
  
  // Cleanse any corrupted strings and guarantee modern DASA TECH defaults
  const cleanCity = (rawCompany.city || 'Erode').replace(/BanERODEgalore/gi, 'Erode');
  const company = {
    ...rawCompany,
    companyName: rawCompany.companyName || 'DASA TECH',
    tagline: rawCompany.tagline || 'Enterprise Cloud & Software Engineering',
    logoUrl: rawCompany.logoUrl || '/dasa-tech-logo.png',
    address: rawCompany.address || 'EB Colony',
    city: cleanCity,
    state: rawCompany.state || 'Tamil Nadu',
    postalCode: rawCompany.postalCode || '638002',
    country: rawCompany.country || 'India',
    gstNumber: (rawCompany.gstNumber && rawCompany.gstNumber !== '33ABCDE1234F1Z5') ? rawCompany.gstNumber : '',
    panNumber: (rawCompany.panNumber && rawCompany.panNumber !== 'ABCDE1234F') ? rawCompany.panNumber : '',
    email: rawCompany.email || 'dasatechmu@gmail.com',
    phone: rawCompany.phone || '+91 76399 30148',
  };

  const isInvoice = type === 'INVOICE';
  const isPayment = type === 'PAYMENT';
  const isQuotation = type === 'QUOTATION';

  const docNumber = document.quotationNumber || document.invoiceNumber || document.receiptNumber || '';
  const docDate = document.quotationDate || document.invoiceDate || document.paymentDate || '';
  const client = document.client || {};

  // Check intra-state vs inter-state supply for Indian GST
  const clientState = client.state || 'Tamil Nadu';
  const isInterState = client.state && client.state.toLowerCase() !== 'tamil nadu' && client.state.toLowerCase() !== 'tn';
  const stateCodeSupplier = '33'; // Tamil Nadu GST state code
  const stateCodeRecipient = isInterState ? 'XX' : '33';

  // Tax calculations breakdown
  const subtotal = Number(document.subtotal || (isPayment ? document.amount : 0) || 0);
  const totalTax = Number(document.taxAmount || 0);
  const cgstAmount = isInterState ? 0 : totalTax / 2;
  const sgstAmount = isInterState ? 0 : totalTax / 2;
  const igstAmount = isInterState ? totalTax : 0;
  const grandTotal = Number(document.totalAmount || document.amount || (subtotal + totalTax));

  // Validity calculation for quotations
  const expiryDate = document.expiryDate ? new Date(document.expiryDate) : null;
  const issueDate = docDate ? new Date(docDate) : new Date();
  const validityDays = expiryDate ? Math.max(1, Math.round((expiryDate - issueDate) / (1000 * 60 * 60 * 24))) : 30;
  const isExpired = expiryDate && expiryDate < new Date();

  const cleanNoteText = (() => {
    if (!document.notes) return null;
    if (document.notes.includes('Cash (₹9,000)') || document.notes.includes('(₹9,000)')) {
      if (document.splits && document.splits.length > 0) {
        return (
          'Advance payment received in multiple channels: ' +
          document.splits
            .map((s) => `${s.paymentMode} (₹${Number(s.amount).toLocaleString('en-IN')}${s.referenceNumber ? ' Ref: ' + s.referenceNumber : ''})`)
            .join(', ')
        );
      }
      return `Advance payment received: ₹${Number(document.amount || 0).toLocaleString('en-IN')}`;
    }
    return document.notes;
  })();

  const handlePrint = () => {
    if (printableRef.current) {
      printDocument(printableRef.current, `${docNumber} - ${company.companyName}`);
    } else {
      window.print();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview: ${docNumber} — ${isInvoice ? 'GST Tax Invoice' : isPayment ? 'Payment Receipt' : 'Commercial Quotation'}`}
      maxWidth={900}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 10 }}>
          <button
            type="button"
            className="no-print"
            onClick={() => setIncludeDigitalSignature((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: includeDigitalSignature ? '#ecfdf5' : '#f1f5f9',
              color: includeDigitalSignature ? '#047857' : '#475569',
              border: `1.5px solid ${includeDigitalSignature ? '#10b981' : '#cbd5e1'}`,
            }}
            title="Click to ADD or REMOVE digital signature"
          >
            <ShieldCheck size={16} color={includeDigitalSignature ? '#059669' : '#94a3b8'} />
            <span>Digital Signature: <strong>{includeDigitalSignature ? 'ADDED (Click to Remove)' : 'REMOVED (Click to Add)'}</strong></span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" className="btn btn-secondary no-print" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary no-print" onClick={handlePrint}>
              <Printer size={16} />
              Print / Save Official PDF
            </button>
          </div>
        </div>
      }
    >
      {/* Top Banner to Add/Remove Digital Signature */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: includeDigitalSignature ? '#f0fdf4' : '#f8fafc',
          border: `1.5px solid ${includeDigitalSignature ? '#86efac' : '#e2e8f0'}`,
          borderRadius: 8,
          padding: '8px 14px',
          margin: '0 0 16px 0',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px' }}>
          <ShieldCheck size={16} color={includeDigitalSignature ? '#16a34a' : '#94a3b8'} />
          <span style={{ color: includeDigitalSignature ? '#166534' : '#475569', fontWeight: 600 }}>
            Digital Signature: <strong>{includeDigitalSignature ? 'Active (Cryptographic stamp applied)' : 'Removed (Clean line for manual signing)'}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIncludeDigitalSignature((prev) => !prev)}
          style={{
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: includeDigitalSignature ? '#ef4444' : '#16a34a',
            color: '#ffffff',
          }}
        >
          {includeDigitalSignature ? '✕ Remove Signature' : '✓ Add Digital Signature'}
        </button>
      </div>
      <div
        ref={printableRef}
        className="printable-document"
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '32px 38px',
          fontFamily: 'var(--font-sans)',
          lineHeight: 1.45,
        }}
      >
        {/* =========================================================================
            1. QUOTATION / COMMERCIAL PROPOSAL SPECIALIZED EXECUTIVE TEMPLATE
           ========================================================================= */}
        {isQuotation ? (
          <div>
            {/* Top Branding & Quotation Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2.5px solid #1e3a8a',
                paddingBottom: 22,
                marginBottom: 24,
                gap: 20,
              }}
            >
              {/* Supplier Branding */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1 }}>
                <img
                  src={company.logoUrl}
                  alt={company.companyName}
                  onError={(e) => {
                    e.currentTarget.src = '/dasa-tech-logo.png';
                  }}
                  style={{
                    height: 64,
                    width: 64,
                    objectFit: 'contain',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    padding: 4,
                    backgroundColor: '#ffffff',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
                      {company.companyName}
                    </h1>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: '1px solid #bfdbfe',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Verified Supplier
                    </span>
                  </div>
                  {company.tagline && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 }}>
                      {company.tagline}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginTop: 5, maxWidth: 420 }}>
                    <div>{company.address}, {company.city}, {company.state} - {company.postalCode}</div>
                    {(company.gstNumber || company.panNumber) && (
                      <div style={{ marginTop: 4, fontSize: 11 }}>
                        {company.gstNumber && (
                          <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: 4, marginRight: 6 }}>
                            <strong>GSTIN:</strong> {company.gstNumber}
                          </span>
                        )}
                        {company.panNumber && (
                          <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                            <strong>PAN:</strong> {company.panNumber}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quotation Identity Card */}
              <div style={{ textAlign: 'right', minWidth: 260 }}>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 900,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                    boxShadow: '0 2px 4px rgba(30, 58, 138, 0.15)',
                  }}
                >
                  Commercial Proposal
                </div>

                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  {docNumber}
                </div>

                {document.revisionNumber > 0 ? (
                  <div style={{ marginTop: 2 }}>
                    <span style={{ fontSize: 11, backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                      Revision #{document.revisionNumber}
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                    Initial Commercial Offer (Rev #0)
                  </div>
                )}

                <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>
                  Date of Issue: <strong>{docDate ? new Date(docDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</strong>
                </div>

                <div style={{ fontSize: 12, color: isExpired ? '#dc2626' : '#1e40af', fontWeight: 700, marginTop: 2 }}>
                  Valid Until: <strong>{expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 Days from Issue'}</strong>{' '}
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>({validityDays} Days)</span>
                </div>

                {document.status && (
                  <div style={{ marginTop: 6 }}>
                    <Badge status={document.status} />
                  </div>
                )}
              </div>
            </div>

            {/* Proposal Parties Overview (2-Column Grid) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: 16,
                marginBottom: 24,
                padding: '16px 20px',
                backgroundColor: '#f8fafc',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
              }}
            >
              {/* Client Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#1e40af', marginBottom: 6, letterSpacing: 0.5 }}>
                  <Building2 size={13} />
                  <span>Proposal Prepared For (Client):</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>
                  {client.companyName || 'Valued Customer'}
                </div>
                {client.contactPerson && (
                  <div style={{ fontSize: 13, color: '#334155', fontWeight: 600, marginTop: 2 }}>
                    Attn: {client.contactPerson}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginTop: 5 }}>
                  {client.address && <div>{client.address}, {client.city || ''} {client.state ? `- ${client.state}` : ''}</div>}
                  {client.phone && <div>Phone: <strong>{client.phone}</strong></div>}
                  {client.email && <div>Email: <strong>{client.email}</strong></div>}
                  {client.gstNumber && (
                    <div style={{ marginTop: 4 }}>
                      <strong>GSTIN:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{client.gstNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Commercial & Project Terms Summary */}
              <div style={{ borderLeft: '1.5px solid #cbd5e1', paddingLeft: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#1e40af', marginBottom: 6, letterSpacing: 0.5 }}>
                  <FileText size={13} />
                  <span>Commercial & Engagement Terms:</span>
                </div>
                <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>
                  <div>Currency: <strong>Indian Rupees (INR — ₹)</strong></div>
                  <div>Delivery / Timeline: <strong>As per agreed Project Milestones</strong></div>
                  <div>Payment Terms: <strong>Milestone schedule / Net 15 Days</strong></div>
                  <div>Warranty / Support: <strong>1-Year Standard Support Included</strong></div>
                  {document.notes && (
                    <div style={{ marginTop: 4, color: '#0f172a', fontSize: 12 }}>
                      <strong>Project Scope:</strong> <span>{document.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scope of Work & Deliverables Table */}
            <div style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '11px 10px', width: 38, textAlign: 'center' }}>#</th>
                    <th style={{ padding: '11px 14px' }}>Scope of Work & Deliverables Specification</th>
                    <th style={{ padding: '11px 10px', textAlign: 'right', width: 55 }}>Qty</th>
                    <th style={{ padding: '11px 12px', textAlign: 'right', width: 110 }}>Unit Rate (₹)</th>
                    <th style={{ padding: '11px 10px', textAlign: 'right', width: 75 }}>GST %</th>
                    <th style={{ padding: '11px 14px', textAlign: 'right', width: 130 }}>Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items && document.items.length > 0 ? (
                    document.items.map((item, idx) => {
                      const qty = Number(item.quantity || 1);
                      const price = Number(item.unitPrice || 0);
                      const taxRate = Number(item.taxPercent !== undefined ? item.taxPercent : 18);
                      const lineTotal = Number(item.totalPrice || (qty * price));

                      return (
                        <tr
                          key={item.id || idx}
                          style={{
                            borderBottom: '1px solid #e2e8f0',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                            verticalAlign: 'top',
                          }}
                        >
                          <td style={{ padding: '12px 10px', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {item.title && (
                              <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0f172a', marginBottom: item.description ? 4 : 0 }}>
                                {item.title}
                              </div>
                            )}
                            {item.description && (
                              <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', color: '#1e293b', fontWeight: 600 }}>
                            {qty}
                          </td>
                          <td style={{ padding: '12px 12px', textAlign: 'right', color: '#1e293b' }}>
                            ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', color: '#64748b' }}>
                            {taxRate}%
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: 13 }}>
                            ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                        No itemized deliverables specified.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Optional AMC / Maintenance Packages Matrix */}
            <AmcComparisonView amcPackages={document.amcPackages} isPrint={true} />

            {/* Commercial Summary & Totals Calculation */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.3fr 1fr',
                gap: 20,
                marginBottom: 24,
                alignItems: 'start',
                pageBreakInside: 'avoid',
              }}
            >
              {/* Left Column: Amount in Words & Value Proposition */}
              <div>
                <div
                  style={{
                    padding: '14px 18px',
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 12,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#1e40af', marginBottom: 3 }}>
                    Total Quotation Value (in words):
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {numberToWordsINR(grandTotal)}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 11.5,
                    color: '#475569',
                    padding: '10px 14px',
                    backgroundColor: '#eff6ff',
                    borderLeft: '3.5px solid #2563eb',
                    borderRadius: '0 6px 6px 0',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 2 }}>Commercial Value Proposition:</div>
                  Pricing is inclusive of system engineering, project deployment, quality assurance, documentation, and handover training.
                </div>
              </div>

              {/* Right Column: Totals Breakdown Box */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '14px 20px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#475569' }}>
                  <span>Scope Base Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {document.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#dc2626', fontWeight: 600 }}>
                    <span>Commercial Discount ({document.discountRate || 0}%):</span>
                    <span>-₹{Number(document.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {totalTax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#475569' }}>
                    <span>Estimated GST / Taxes ({document.taxRate || 18}%):</span>
                    <span style={{ fontWeight: 600 }}>+₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0 4px 0',
                    borderTop: '2px solid #0f172a',
                    marginTop: 8,
                    fontSize: 17,
                    fontWeight: 900,
                    color: '#1e3a8a',
                  }}
                >
                  <span>Grand Total Quote:</span>
                  <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Proposal Notes / Scope Remarks (If provided) */}
            {document.notes && (
              <div style={{ marginBottom: 18, pageBreakInside: 'avoid' }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 4, letterSpacing: 0.5 }}>
                  Proposal Scope & Commercial Remarks:
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#334155',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                    padding: '10px 14px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                  }}
                >
                  {document.notes}
                </div>
              </div>
            )}

            {/* Payment Mode, Schedule & Bank Transfer Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: (company.bankName || company.bankAccountNumber || company.upiId) ? '1.2fr 1fr' : '1fr',
                gap: 16,
                marginBottom: 20,
                pageBreakInside: 'avoid',
              }}
            >
              {/* Payment Mode & Schedule */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#1e3a8a', marginBottom: 6, letterSpacing: 0.5 }}>
                  💳 Payment Mode & Commercial Schedule
                </div>
                <div style={{ fontSize: 11, color: '#334155', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>Accepted Modes: </span>
                    <span>{document.paymentMode || company.defaultPaymentMode || 'Bank Transfer (NEFT/RTGS/IMPS), UPI'}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>Payment Terms: </span>
                    <span>{document.paymentTerms || company.defaultPaymentTerms || '50% Advance with PO, 50% on Delivery/Completion'}</span>
                  </div>
                </div>
              </div>

              {/* Bank & UPI Details */}
              {(company.bankName || company.bankAccountNumber || company.upiId) && (
                <div
                  style={{
                    padding: '12px 14px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 6, letterSpacing: 0.5 }}>
                    🏛️ Remittance / Bank Account
                  </div>
                  <div style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.4 }}>
                    {company.bankName && <div><strong>Bank:</strong> {company.bankName}</div>}
                    {company.bankAccountNumber && <div><strong>A/C No:</strong> {company.bankAccountNumber}</div>}
                    {company.bankIfsc && <div><strong>IFSC:</strong> {company.bankIfsc}</div>}
                    {company.upiId && <div><strong>UPI ID:</strong> {company.upiId}</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Commercial Terms & Conditions */}
            <div style={{ marginBottom: 24, pageBreakInside: 'avoid' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 6, letterSpacing: 0.5 }}>
                Terms & Conditions of Commercial Proposal:
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#475569',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                }}
              >
                {(document.terms || company.termsAndConditions || (
                  `1. Validity: This quotation is valid for 30 calendar days from the date of issuance.\n2. Payment Milestones: 50% advance on agreement, 40% on UAT delivery, 10% on final handover.\n3. Scope Changes: Any modifications beyond the outlined specifications will be mutually scoped under a revision or addendum.\n4. Taxes: GST is applicable as per Government of India statutory rates.\n5. Jurisdiction: All agreements are subject to Erode, Tamil Nadu jurisdiction.`
                )).replace(/Bangalore/gi, 'Erode').replace(/BanERODEgalore/gi, 'Erode')}
              </div>
            </div>

            {/* Formal Dual Signatures Block (Client Acceptance + DASA TECH Seal) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 32,
                paddingTop: 16,
                borderTop: '1.5px solid #e2e8f0',
                pageBreakInside: 'avoid',
              }}
            >
              {/* Client Acceptance Block */}
              <div
                style={{
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: 8,
                  padding: '14px 18px',
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 130,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
                    Client Acceptance & Approval
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                    I hereby accept the scope, terms, and commercial pricing presented above.
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: 6, marginTop: 36, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569' }}>
                  <span>Authorized Signature & Seal</span>
                  <span>Date: ____________</span>
                </div>
              </div>

              {/* DASA TECH Official Issuance & Digital Sign Block */}
              <div
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  position: 'relative',
                }}
              >
                {/* Official Seal Stamp */}
                {company.sealUrl && (
                  <div style={{ marginBottom: 6 }}>
                    <img
                      src={company.sealUrl}
                      alt="Official Company Seal"
                      style={{
                        height: 72,
                        width: 72,
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))',
                        transform: 'rotate(-4deg)',
                      }}
                    />
                  </div>
                )}

                {includeDigitalSignature ? (
                  <div
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#f0fdf4',
                      border: '1.5px dashed #22c55e',
                      borderRadius: 8,
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#16a34a', fontWeight: 800, fontSize: 12 }}>
                      <ShieldCheck size={16} />
                      <span>{document.approvalText || company.signatureApprovalText || 'DASA TECH ADMIN APPROVED'}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#15803d', marginTop: 3, fontWeight: 700 }}>
                      {document.signedBy || `${document.authorizedPerson || company.authorizedPerson || 'DASA TECH Admin'} (${document.authorizedDesignation || company.authorizedDesignation || 'Authorized Signatory'})`}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                      {document.signedAt ? new Date(document.signedAt).toLocaleString('en-IN') : `${new Date().toLocaleDateString('en-IN')} (Tamper-evident verification)`}
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '100%', paddingTop: 14, borderTop: '1px solid #cbd5e1' }}>
                    {(document.authorizedPerson || company.authorizedPerson) && (
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a' }}>
                        {document.authorizedPerson || company.authorizedPerson}
                      </div>
                    )}
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                      {document.authorizedDesignation || company.authorizedDesignation || 'Authorized Signatory'}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>For {company.companyName}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Statutory Proposal Footer */}
            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 10.5, color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
              This is a computer-generated commercial quotation issued by {company.companyName}. Valid upon formal client acceptance.
            </div>
          </div>
        ) : (
          /* =========================================================================
              2. INVOICE & PAYMENT RECEIPT TEMPLATES
             ========================================================================= */
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2.5px solid #0f172a',
                paddingBottom: 20,
                marginBottom: 20,
              }}
            >
              {/* Supplier Branding */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <img
                  src={company.logoUrl}
                  alt={company.companyName}
                  onError={(e) => {
                    e.currentTarget.src = '/dasa-tech-logo.png';
                  }}
                  style={{ height: 60, width: 60, objectFit: 'contain', borderRadius: 8 }}
                />
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                    {company.companyName}
                  </h2>
                  {company.tagline && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
                      {company.tagline}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginTop: 4, maxWidth: 380 }}>
                    <div>{company.address}, {company.city}</div>
                    <div>{company.state} - {company.postalCode}, {company.country}</div>
                    <div>Phone: <strong>{company.phone}</strong> | Email: <strong>{company.email}</strong></div>
                    <div style={{ marginTop: 4, fontSize: 11 }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: 4, marginRight: 6 }}>
                        <strong>GSTIN:</strong> {company.gstNumber} (State: {company.state} - {stateCodeSupplier})
                      </span>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                        <strong>PAN:</strong> {company.panNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice / Document Metadata */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: 1.2,
                    color: isInvoice ? '#047857' : '#7c3aed',
                    lineHeight: 1.1,
                  }}
                >
                  {isInvoice ? 'TAX INVOICE' : 'PAYMENT RECEIPT'}
                </div>
                {isInvoice && (
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 3 }}>
                    [ ORIGINAL FOR RECIPIENT ]
                  </div>
                )}
                {isInvoice && (
                  <div style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic', marginTop: 1 }}>
                    Issued under Rule 46 of CGST Rules, 2017
                  </div>
                )}

                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
                  {docNumber}
                </div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>
                  Invoice Date: <strong>{docDate ? new Date(docDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</strong>
                </div>
                {document.dueDate && (
                  <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 2 }}>
                    Payment Due: <strong>{new Date(document.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                  </div>
                )}
                {document.status && (
                  <div style={{ marginTop: 6 }}>
                    <Badge status={document.status} />
                  </div>
                )}
              </div>
            </div>

            {/* GST Party Details: Bill To & Supply Particulars */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: 16,
                marginBottom: 20,
                padding: '14px 18px',
                backgroundColor: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              {/* Recipient Details */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 4, letterSpacing: 0.5 }}>
                  {isPayment ? 'Details of Payer / Received From:' : 'Details of Receiver | Billed To:'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{client.companyName || 'Valued Customer'}</div>
                {client.contactPerson && <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>Attn: {client.contactPerson}</div>}
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginTop: 4 }}>
                  {client.address && <div>{client.address}, {client.city || ''}</div>}
                  <div>State: <strong>{clientState}</strong> (State Code: <strong>{stateCodeRecipient}</strong>)</div>
                  <div>Phone: {client.phone || 'N/A'} | Email: {client.email || 'N/A'}</div>
                  <div style={{ marginTop: 4 }}>
                    <strong>GSTIN / UIN:</strong>{' '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: client.gstNumber ? '#0f172a' : '#64748b' }}>
                      {client.gstNumber || 'Unregistered Consumer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Place of Supply, Reverse Charge & Bank Details */}
              <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: 16 }}>
                {isInvoice && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 4, letterSpacing: 0.5 }}>
                      Tax & Dispatch Particulars:
                    </div>
                    <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>
                      <div>Place of Supply (POS): <strong>{clientState} ({stateCodeRecipient})</strong></div>
                      <div>Reverse Charge (RCM): <strong>No</strong> (Tax is payable by Supplier)</div>
                      <div>Supply Type: <strong>{isInterState ? 'Inter-State Supply (IGST)' : 'Intra-State Supply (CGST + SGST)'}</strong></div>
                      {document.notes && <div>Purpose: <span style={{ color: '#0f172a', fontWeight: 600 }}>{document.notes}</span></div>}
                    </div>
                  </>
                )}

                <div style={{ marginTop: isInvoice ? 10 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 4, letterSpacing: 0.5 }}>
                    Payment / Treasury Remittance:
                  </div>
                  {company.bankName && company.bankAccountNumber ? (
                    <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                      <div>Bank: <strong>{company.bankName}</strong></div>
                      <div>Account No: <strong>{company.bankAccountNumber}</strong></div>
                      <div>IFSC Code: <strong>{company.bankIfsc}</strong></div>
                      <div>A/C Name: <strong>{company.bankAccountName || company.companyName}</strong></div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                      <div>Payment Mode: <strong>Direct Bank Transfer / NEFT / IMPS / UPI</strong></div>
                      <div>Beneficiary: <strong>{company.companyName}</strong></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table (For Invoices) */}
            {!isPayment && document.items && (
              <div style={{ marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                      <th style={{ padding: '10px 10px', width: 35, textAlign: 'center' }}>#</th>
                      <th style={{ padding: '10px 12px' }}>Description of Goods / Services</th>
                      {isInvoice && <th style={{ padding: '10px 8px', width: 75, textAlign: 'center' }}>SAC / HSN</th>}
                      <th style={{ padding: '10px 10px', textAlign: 'right', width: 50 }}>Qty</th>
                      <th style={{ padding: '10px 10px', textAlign: 'right', width: 95 }}>Rate (₹)</th>
                      <th style={{ padding: '10px 10px', textAlign: 'right', width: 100 }}>Taxable (₹)</th>
                      {isInvoice && !isInterState && (
                        <>
                          <th style={{ padding: '10px 8px', textAlign: 'right', width: 70 }}>CGST (9%)</th>
                          <th style={{ padding: '10px 8px', textAlign: 'right', width: 70 }}>SGST (9%)</th>
                        </>
                      )}
                      {isInvoice && isInterState && (
                        <th style={{ padding: '10px 8px', textAlign: 'right', width: 80 }}>IGST (18%)</th>
                      )}
                      <th style={{ padding: '10px 12px', textAlign: 'right', width: 110 }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.items.map((item, idx) => {
                      const itemQty = Number(item.quantity || 1);
                      const itemUnitPrice = Number(item.unitPrice || 0);
                      const itemTaxable = itemUnitPrice > 0 ? (itemQty * itemUnitPrice) : Number(item.totalPrice || 0);
                      const taxRate = Number(item.taxPercent !== undefined ? item.taxPercent : 18);
                      const itemCgst = isInterState ? 0 : (itemTaxable * (taxRate / 200));
                      const itemSgst = isInterState ? 0 : (itemTaxable * (taxRate / 200));
                      const itemIgst = isInterState ? (itemTaxable * (taxRate / 100)) : 0;
                      const itemTotalWithTax = itemTaxable + itemCgst + itemSgst + itemIgst;

                      return (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                          <td style={{ padding: '10px 8px', color: '#64748b', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ padding: '10px 12px' }}>
                            {item.title && (
                              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: item.description ? 3 : 0 }}>
                                {item.title}
                              </div>
                            )}
                            {item.description && (
                              <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                                {item.description}
                              </div>
                            )}
                          </td>
                          {isInvoice && (
                            <td style={{ padding: '10px 8px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                              {item.sacCode || item.hsnCode || '998314'}
                            </td>
                          )}
                          <td style={{ padding: '10px 10px', textAlign: 'right' }}>{item.quantity}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'right' }}>₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600 }}>₹{itemTaxable.toLocaleString('en-IN')}</td>
                          {isInvoice && !isInterState && (
                            <>
                              <td style={{ padding: '10px 8px', textAlign: 'right', color: '#475569' }}>₹{itemCgst.toLocaleString('en-IN')}</td>
                              <td style={{ padding: '10px 8px', textAlign: 'right', color: '#475569' }}>₹{itemSgst.toLocaleString('en-IN')}</td>
                            </>
                          )}
                          {isInvoice && isInterState && (
                            <td style={{ padding: '10px 8px', textAlign: 'right', color: '#475569' }}>₹{itemIgst.toLocaleString('en-IN')}</td>
                          )}
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>
                            ₹{itemTotalWithTax.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment Channels & Multi-Method Allocation Table */}
            {isPayment && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Payment Allocation & Multi-Channel Breakdown
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                    {document.splits && document.splits.length > 1
                      ? `Split across ${document.splits.length} payment channels`
                      : 'Single channel remittance'}
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, border: '1px solid #cbd5e1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                      <th style={{ padding: '9px 10px', width: 35, textAlign: 'center' }}>#</th>
                      <th style={{ padding: '9px 12px' }}>Payment Mode / Channel</th>
                      <th style={{ padding: '9px 12px' }}>Destination / Deposited Account</th>
                      <th style={{ padding: '9px 12px' }}>Reference / UTR / Cheque #</th>
                      <th style={{ padding: '9px 12px' }}>Allocation Purpose / Notes</th>
                      <th style={{ padding: '9px 12px', textAlign: 'right', width: 140 }}>Allocated Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.splits && document.splits.length > 0 ? (
                      document.splits.map((s, idx) => (
                        <tr key={s.id || idx} style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle' }}>
                          <td style={{ padding: '10px 8px', color: '#64748b', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: s.paymentMode === 'CASH' ? '#ecfdf5' : s.paymentMode === 'UPI' ? '#eff6ff' : '#f8fafc',
                                color: s.paymentMode === 'CASH' ? '#047857' : s.paymentMode === 'UPI' ? '#1d4ed8' : '#0f172a',
                                border: '1px solid #cbd5e1',
                              }}
                            >
                              {s.paymentMode}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#334155', fontWeight: 500 }}>
                            {s.accountName || (s.paymentMode === 'CASH' ? 'Cash in Hand (Office Vault)' : (document.bankAccount || 'Company Operating Account'))}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                            {s.referenceNumber || document.referenceNumber || '—'}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '12px' }}>
                            {s.notes || (document.invoice ? `Applied towards Invoice ${document.invoice.invoiceNumber}` : (document.project ? `Allocated towards Project ${document.project.name || document.project.projectCode}` : 'Settlement credit'))}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '13px' }}>
                            ₹{Number(s.amount).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 8px', color: '#64748b', textAlign: 'center' }}>1</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                            }}
                          >
                            {document.paymentMode || 'DIRECT_TRANSFER'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#334155', fontWeight: 500 }}>
                          {document.bankAccount || 'Company Operating Account'}
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                          {document.referenceNumber || '—'}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '12px' }}>
                          {document.invoice ? `Payment towards Invoice ${document.invoice.invoiceNumber}` : (document.project ? `Settlement for ${document.project.name || document.project.projectCode}` : 'Payment settlement')}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '13px' }}>
                          ₹{Number(document.amount || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #0f172a' }}>
                      <td colSpan={5} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>
                        Total Cleared & Reconciled Amount:
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#059669', fontSize: '14px' }}>
                        ₹{Number(document.amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Totals Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20, alignItems: 'start' }}>
              <div>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 2 }}>
                    Amount Chargeable (in words):
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {numberToWordsINR(isPayment ? (document.amount || 0) : grandTotal)}
                  </div>
                </div>

                {isInvoice && (
                  <div
                    style={{
                      fontSize: 11,
                      color: '#475569',
                      fontStyle: 'italic',
                      marginTop: 10,
                      padding: '8px 12px',
                      backgroundColor: '#f0fdf4',
                      borderLeft: '3px solid #059669',
                      borderRadius: '0 6px 6px 0',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Statutory Declaration:</strong> Certified that the particulars given above are true and correct and the amount indicated represents the price actually charged.
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '12px 18px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                {!isPayment ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span style={{ color: '#64748b' }}>Taxable Subtotal:</span>
                      <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {document.discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#dc2626' }}>
                        <span>Discount:</span>
                        <span>-₹{Number(document.discountAmount).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {totalTax > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#475569' }}>
                        <span>GST / Taxes:</span>
                        <span style={{ fontWeight: 600 }}>+₹{totalTax.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderTop: '2px solid #0f172a',
                        marginTop: 6,
                        fontSize: 16,
                        fontWeight: 900,
                      }}
                    >
                      <span>Grand Total (₹):</span>
                      <span style={{ color: '#0f172a' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#ecfdf5',
                      borderRadius: 6,
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#065f46',
                    }}
                  >
                    <span>Total Received:</span>
                    <span>₹{Number(document.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Signature */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: 24,
                paddingTop: 16,
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                  Terms & Conditions:
                </div>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {(document.terms || company.termsAndConditions || (
                    `1. All payments are strictly due within 15 days of invoice date.\n2. Goods/Services once supplied cannot be taken back or refunded.\n3. Late payments subject to 1.5% interest per month.\n4. Disputes subject to Erode jurisdiction.`
                  )).replace(/Bangalore/gi, 'Erode').replace(/BanERODEgalore/gi, 'Erode')}
                </div>
              </div>

              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>
                {company.sealUrl && (
                  <div style={{ marginBottom: 10 }}>
                    <img
                      src={company.sealUrl}
                      alt="Official Company Seal"
                      style={{
                        height: 72,
                        width: 72,
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))',
                        transform: 'rotate(-4deg)',
                      }}
                    />
                  </div>
                )}

                {includeDigitalSignature ? (
                  <div
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#f0fdf4',
                      border: '1.5px dashed #22c55e',
                      borderRadius: 8,
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#16a34a', fontWeight: 700, fontSize: 12 }}>
                      <ShieldCheck size={16} />
                      <span>DIGITALLY SIGNED & VERIFIED</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#15803d', marginTop: 4, fontWeight: 600 }}>
                      {document.signedBy || `${company.authorizedPerson || 'DASA (Authorized Officer)'} (${company.authorizedDesignation || 'Authorized Signatory'})`}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                      {document.signedAt ? new Date(document.signedAt).toLocaleString('en-IN') : `${new Date().toLocaleDateString('en-IN')} (Tamper-evident verification)`}
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '100%', paddingTop: 16, borderTop: '1px solid #cbd5e1' }}>
                    {company.authorizedPerson && (
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                        {company.authorizedPerson}
                      </div>
                    )}
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Authorized Signatory</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>For {company.companyName}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 20, textAlign: 'center', fontSize: 10.5, color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
              This is a computer-generated tax document issued in compliance with GST Act, 2017. Generated by {company.companyName} Billing System.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
