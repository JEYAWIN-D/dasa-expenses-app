import React from 'react';
import { Modal } from './Modal.jsx';
import { Printer, ShieldCheck } from 'lucide-react';
import { Badge } from './Badge.jsx';
import { useCompany } from '../../contexts/CompanyContext.jsx';
import { AmcComparisonView } from './AmcComparisonView.jsx';
import { numberToWordsINR } from '../../utils/numberToWordsINR.js';

export function DocumentPreviewModal({ isOpen, onClose, document, type = 'QUOTATION' }) {
  const { company: globalCompany } = useCompany();
  if (!document) return null;

  // Merge document companyProfile with current active company profile (active branding takes precedence)
  const rawCompany = { ...(document.companyProfile || {}), ...(globalCompany || {}) };
  
  // Cleanse any corrupted strings like BanERODEgalore and guarantee modern DASA TECH defaults
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
    gstNumber: rawCompany.gstNumber || '33ABCDE1234F1Z5',
    panNumber: rawCompany.panNumber || 'ABCDE1234F',
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview: ${docNumber} — ${isInvoice ? 'GST Tax Invoice' : isPayment ? 'Payment Receipt' : 'Commercial Quotation'}`}
      maxWidth={880}
      footer={
        <>
          <button type="button" className="btn btn-secondary no-print" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary no-print" onClick={handlePrint}>
            <Printer size={16} />
            Print / Save Official PDF
          </button>
        </>
      }
    >
      <div
        className="printable-document"
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '28px 36px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Document Header */}
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
                color: isInvoice ? '#047857' : isPayment ? '#7c3aed' : '#1d4ed8',
                lineHeight: 1.1,
              }}
            >
              {isInvoice ? 'TAX INVOICE' : isPayment ? 'PAYMENT RECEIPT' : 'COMMERCIAL QUOTATION'}
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
              Invoice Date: <strong>{new Date(docDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
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
            {isInvoice ? (
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
            ) : null}

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
                  <div style={{ fontSize: 11, color: '#64748b' }}>Verified treasury bank details available on request</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
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
                        ₹{(isInvoice ? itemTotalWithTax : itemTaxable).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* GST Rule 46 Mandated Tax Summary Breakdown Table */}
        {isInvoice && totalTax > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 }}>
              HSN / SAC Tax Liability Summary (Rule 46 CGST Rules, 2017):
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'left' }}>HSN / SAC</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>Taxable Value (₹)</th>
                  {!isInterState ? (
                    <>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>CGST Rate</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>CGST Amount (₹)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>SGST Rate</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>SGST Amount (₹)</th>
                    </>
                  ) : (
                    <>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>IGST Rate</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>IGST Amount (₹)</th>
                    </>
                  )}
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>Total Tax Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontWeight: 600 }}>998314 (IT & Software Services)</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>₹{subtotal.toLocaleString('en-IN')}</td>
                  {!isInterState ? (
                    <>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>9.0%</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>₹{cgstAmount.toLocaleString('en-IN')}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>9.0%</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>₹{sgstAmount.toLocaleString('en-IN')}</td>
                    </>
                  ) : (
                    <>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>18.0%</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>₹{igstAmount.toLocaleString('en-IN')}</td>
                    </>
                  )}
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}>₹{totalTax.toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px' }}>Total Tax</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>₹{subtotal.toLocaleString('en-IN')}</td>
                  {!isInterState ? (
                    <>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>-</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>₹{cgstAmount.toLocaleString('en-IN')}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>-</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>₹{sgstAmount.toLocaleString('en-IN')}</td>
                    </>
                  ) : (
                    <>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>-</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>₹{igstAmount.toLocaleString('en-IN')}</td>
                    </>
                  )}
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>₹{totalTax.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Payment Receipt specific details */}
        {isPayment && (
          <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748b' }}>Payment Mode:</span>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{document.paymentMode}</div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#64748b' }}>Reference / UTR / Txn ID:</span>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{document.referenceNumber || 'N/A'}</div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#64748b' }}>Payment Type:</span>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{document.paymentType}</div>
              </div>
            </div>
            {document.notes && (
              <div style={{ marginTop: 12, fontSize: 13, color: '#475569' }}>
                <strong>Notes / Allocation:</strong> {document.notes}
              </div>
            )}
          </div>
        )}

        {/* Totals Calculation Section & Amount in Words */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20, alignItems: 'start' }}>
          {/* Amount in words & Statutory note */}
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
                <strong>Statutory Declaration:</strong> Certified that the particulars given above are true and correct and the amount indicated represents the price actually charged and there is no flow of additional consideration directly or indirectly from the buyer.
              </div>
            )}
          </div>

          {/* Right Column Totals Breakdown */}
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
                {isInvoice && !isInterState && totalTax > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#475569' }}>
                      <span>CGST (9.0%):</span>
                      <span style={{ fontWeight: 600 }}>+₹{cgstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#475569' }}>
                      <span>SGST (9.0%):</span>
                      <span style={{ fontWeight: 600 }}>+₹{sgstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
                {isInvoice && isInterState && totalTax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#475569' }}>
                    <span>IGST (18.0%):</span>
                    <span style={{ fontWeight: 600 }}>+₹{igstAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {!isInvoice && totalTax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: '#64748b' }}>Estimated Tax / GST:</span>
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

                {isInvoice && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#059669', fontSize: 13 }}>
                      <span>Amount Received / Paid:</span>
                      <span style={{ fontWeight: 700 }}>₹{Number(document.paidAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderTop: '1px dashed #cbd5e1',
                        color: (document.balanceDue ?? (grandTotal - (document.paidAmount || 0))) > 0 ? '#dc2626' : '#059669',
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      <span>Balance Due:</span>
                      <span>₹{Number(document.balanceDue ?? (grandTotal - (document.paidAmount || 0))).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
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

        {/* AMC Support Terms in Preview if present */}
        <AmcComparisonView amcPackages={document.amcPackages} isPrint={true} />

        {/* Terms & Digital Signature Section */}
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
            {/* Official Company Seal Stamp */}
            {company.sealUrl && (
              <div
                style={{
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={company.sealUrl}
                  alt="Official Company Seal"
                  style={{
                    height: 78,
                    width: 78,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))',
                    transform: 'rotate(-4deg)',
                  }}
                />
              </div>
            )}

            {document.isDigitallySigned ? (
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
                  {document.signedBy || company.authorizedPerson || 'DASA (Authorized Officer)'}
                </div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                  {document.signedAt ? new Date(document.signedAt).toLocaleString('en-IN') : 'Tamper-evident verification'}
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', paddingTop: 16, borderTop: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                  {company.authorizedPerson || 'DASA'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Authorized Signatory</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>For {company.companyName}</div>
              </div>
            )}
          </div>
        </div>

        {/* Statutory Compliance Footer */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 10.5, color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
          This is a computer-generated tax invoice issued in compliance with the Central Goods and Services Tax Act, 2017. Generated by {company.companyName} Billing System.
        </div>
      </div>
    </Modal>
  );
}
