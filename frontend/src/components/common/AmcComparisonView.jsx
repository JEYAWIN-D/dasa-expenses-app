import React from 'react';
import { ShieldCheck, CheckCircle2, Star, Check, Layers, Clock, Wrench, Calendar } from 'lucide-react';

/**
 * Computes subtotal, discount, taxable, GST, and grandTotal for an AMC package.
 */
export function calculateAmcTotals(pkg) {
  if (!pkg) return { subtotal: 0, discountAmount: 0, taxableAmount: 0, taxAmount: 0, grandTotal: 0 };

  const items = Array.isArray(pkg.items) ? pkg.items : [];
  
  // If package has items, compute subtotal from items. Otherwise fallback to pkg.costValue
  let subtotal = 0;
  if (items.length > 0) {
    subtotal = items.reduce((acc, it) => {
      const qty = Number(it.quantity) || 1;
      const price = Number(it.unitPrice) || 0;
      return acc + (qty * price);
    }, 0);
  } else {
    subtotal = Number(pkg.costValue) || 0;
  }

  const discType = pkg.discountType === '₹' ? '₹' : '%';
  const discVal = Number(pkg.discountValue || pkg.discountPercent || 0);
  let discountAmount = 0;
  if (discType === '₹') {
    discountAmount = Math.min(subtotal, Math.max(0, discVal));
  } else {
    discountAmount = (subtotal * Math.min(100, Math.max(0, discVal))) / 100;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = Number(pkg.taxRate !== undefined ? pkg.taxRate : 18);
  const taxAmount = (taxableAmount * taxRate) / 100;
  const grandTotal = taxableAmount + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountPercent: subtotal > 0 ? Math.round(((discountAmount / subtotal) * 100) * 10) / 10 : 0,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

/**
 * Reusable AMC Display Component supporting:
 * 1. Side-by-side Executive Comparison Matrix when multiple AMCs exist
 * 2. Complete itemized scope breakdown for each AMC package
 * 3. Client formal acceptance sign-off block for PDF proposals
 */
export function AmcComparisonView({ amcPackages, isPrint = false }) {
  let list = [];
  try {
    if (amcPackages) {
      list = typeof amcPackages === 'string' ? JSON.parse(amcPackages) : amcPackages;
    }
  } catch (e) {
    list = [];
  }

  if (!list || !Array.isArray(list) || list.length === 0) {
    return null;
  }

  const isMultiple = list.length > 1;

  return (
    <div style={{ marginBottom: isPrint ? 20 : 28 }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: '2px solid #2563eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={isPrint ? 16 : 20} color="#2563eb" />
          <span
            style={{
              fontSize: isPrint ? 13 : 16,
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#0f172a',
              letterSpacing: '0.5px',
            }}
          >
            Annual Maintenance Contract (AMC) & SLA Support {isMultiple ? '— Plan Options & Comparison' : 'Package'}
          </span>
        </div>
        <span
          style={{
            fontSize: isPrint ? 10 : 11,
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            padding: '2px 8px',
            borderRadius: 99,
            fontWeight: 700,
            border: '1px solid #bfdbfe',
          }}
        >
          {isMultiple ? `${list.length} AMC Options Available` : 'Optional SLA Coverage'}
        </span>
      </div>

      {/* 1. SIDE-BY-SIDE COMPARISON TABLE (If multiple AMC options exist) */}
      {isMultiple && (
        <div
          style={{
            marginBottom: isPrint ? 18 : 24,
            borderRadius: 8,
            overflow: 'hidden',
            border: '1.5px solid #cbd5e1',
            boxShadow: isPrint ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: isPrint ? 10.5 : 12,
              tableLayout: 'fixed',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }}>
                <th
                  style={{
                    padding: isPrint ? '8px 10px' : '12px 14px',
                    textAlign: 'left',
                    width: isPrint ? '24%' : '25%',
                    fontSize: isPrint ? 11 : 13,
                    fontWeight: 800,
                    borderRight: '1px solid #3b82f6',
                  }}
                >
                  AMC Plan Parameter
                </th>
                {list.map((pkg, idx) => {
                  const heading = pkg.heading || `Service Category #${idx + 1}`;
                  const title = pkg.title || `AMC Option #${idx + 1}`;
                  return (
                    <th
                      key={idx}
                      style={{
                        padding: isPrint ? '8px 10px' : '12px 14px',
                        textAlign: 'center',
                        fontSize: isPrint ? 11 : 13,
                        fontWeight: 800,
                        borderRight: idx < list.length - 1 ? '1px solid #3b82f6' : 'none',
                        backgroundColor: idx === 0 ? '#1d4ed8' : '#1e3a8a',
                      }}
                    >
                      <div
                        style={{
                          fontSize: isPrint ? 9 : 10,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          color: '#bfdbfe',
                          marginBottom: 2,
                        }}
                      >
                        {heading}
                      </div>
                      <div style={{ fontSize: isPrint ? 12 : 14, fontWeight: 900 }}>
                        {title}
                      </div>
                      <div style={{ fontSize: isPrint ? 9 : 10, fontWeight: 600, color: '#e0e7ff', marginTop: 2 }}>
                        Billing: {pkg.period || 'Annual'}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Row: AMC Heading / Category */}
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: isPrint ? '6px 10px' : '10px 14px', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                  AMC Category / Domain
                </td>
                {list.map((pkg, idx) => (
                  <td key={idx} style={{ padding: isPrint ? '6px 10px' : '10px 14px', textAlign: 'center', fontWeight: 700, color: '#1e293b', borderRight: idx < list.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: 4, fontSize: isPrint ? 9.5 : 11 }}>
                      {pkg.heading || 'Comprehensive Maintenance'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row: Response Time / SLA */}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: isPrint ? '6px 10px' : '10px 14px', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                  SLA Response Time
                </td>
                {list.map((pkg, idx) => (
                  <td key={idx} style={{ padding: isPrint ? '6px 10px' : '10px 14px', textAlign: 'center', color: '#1e293b', fontWeight: 600, borderRight: idx < list.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    {pkg.slaResponseTime || '4 Hours Critical / Next Business Day'}
                  </td>
                ))}
              </tr>

              {/* Row: Preventive Service Visits */}
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: isPrint ? '6px 10px' : '10px 14px', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                  Preventive Maintenance
                </td>
                {list.map((pkg, idx) => (
                  <td key={idx} style={{ padding: isPrint ? '6px 10px' : '10px 14px', textAlign: 'center', color: '#1e293b', borderRight: idx < list.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    {pkg.preventiveVisits || '4 Quarterly Scheduled Visits'}
                  </td>
                ))}
              </tr>

              {/* Row: Spare Parts Coverage */}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: isPrint ? '6px 10px' : '10px 14px', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                  Parts & Consumables
                </td>
                {list.map((pkg, idx) => (
                  <td key={idx} style={{ padding: isPrint ? '6px 10px' : '10px 14px', textAlign: 'center', color: '#1e293b', borderRight: idx < list.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    {pkg.sparesCoverage || 'Labor Only (Parts at actuals)'}
                  </td>
                ))}
              </tr>

              {/* Row: Covered Deliverables / Scope Summary */}
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: isPrint ? '6px 10px' : '10px 14px', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                  Covered Scope Items
                </td>
                {list.map((pkg, idx) => {
                  const items = Array.isArray(pkg.items) ? pkg.items : [];
                  return (
                    <td key={idx} style={{ padding: isPrint ? '6px 10px' : '10px 14px', textAlign: 'left', verticalAlign: 'top', borderRight: idx < list.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      {items.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {items.map((it, iIdx) => (
                            <li key={iIdx} style={{ fontSize: isPrint ? 9.5 : 11, color: '#334155' }}>
                              <strong>{it.title || `Service #${iIdx + 1}`}</strong>
                              {it.quantity && it.unit ? ` (${it.quantity} ${it.unit})` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ fontSize: isPrint ? 9.5 : 11, color: '#64748b' }}>
                          {pkg.description || 'General maintenance & SLA support'}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Base Subtotal */}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: isPrint ? '6px 10px' : '10px 14px', fontWeight: 700, color: '#64748b', borderRight: '1px solid #e2e8f0' }}>
                  Base Plan Subtotal
                </td>
                {list.map((pkg, idx) => {
                  const totals = calculateAmcTotals(pkg);
                  return (
                    <td key={idx} style={{ padding: isPrint ? '6px 10px' : '10px 14px', textAlign: 'center', fontWeight: 600, color: '#475569', borderRight: idx < list.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      ₹{Number(totals.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Plan Discount */}
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: isPrint ? '6px 10px' : '10px 14px', fontWeight: 700, color: '#dc2626', borderRight: '1px solid #e2e8f0' }}>
                  Discount Savings
                </td>
                {list.map((pkg, idx) => {
                  const totals = calculateAmcTotals(pkg);
                  return (
                    <td key={idx} style={{ padding: isPrint ? '6px 10px' : '10px 14px', textAlign: 'center', fontWeight: 700, color: totals.discountAmount > 0 ? '#dc2626' : '#94a3b8', borderRight: idx < list.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      {totals.discountAmount > 0 ? `-₹${Number(totals.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  );
                })}
              </tr>

              {/* Row: GST / Tax */}
              <tr style={{ borderBottom: '1.5px solid #cbd5e1' }}>
                <td style={{ padding: isPrint ? '6px 10px' : '10px 14px', fontWeight: 700, color: '#64748b', borderRight: '1px solid #e2e8f0' }}>
                  GST / Taxes
                </td>
                {list.map((pkg, idx) => {
                  const totals = calculateAmcTotals(pkg);
                  return (
                    <td key={idx} style={{ padding: isPrint ? '6px 10px' : '10px 14px', textAlign: 'center', fontWeight: 600, color: '#475569', borderRight: idx < list.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      +₹{Number(totals.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({totals.taxRate}%)
                    </td>
                  );
                })}
              </tr>

              {/* Row: Grand Total Investment (Bold Highlight) */}
              <tr style={{ backgroundColor: '#eff6ff', borderBottom: '2px solid #2563eb' }}>
                <td style={{ padding: isPrint ? '8px 10px' : '12px 14px', fontWeight: 900, color: '#1e3a8a', fontSize: isPrint ? 11 : 13, borderRight: '1px solid #bfdbfe' }}>
                  Total Package Value
                </td>
                {list.map((pkg, idx) => {
                  const totals = calculateAmcTotals(pkg);
                  return (
                    <td
                      key={idx}
                      style={{
                        padding: isPrint ? '8px 10px' : '12px 14px',
                        textAlign: 'center',
                        fontWeight: 900,
                        fontSize: isPrint ? 12 : 15,
                        color: '#1d4ed8',
                        borderRight: idx < list.length - 1 ? '1px solid #bfdbfe' : 'none',
                      }}
                    >
                      <div>₹{Number(totals.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div style={{ fontSize: isPrint ? 9 : 10, fontWeight: 700, color: '#475569', marginTop: 2 }}>
                        / {pkg.period || 'Year'}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Formal Client Selection Checkbox in PDF/Print */}
              {isPrint && (
                <tr style={{ backgroundColor: '#ffffff' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                    Client Selection:
                  </td>
                  {list.map((pkg, idx) => (
                    <td key={idx} style={{ padding: '8px 10px', textAlign: 'center', borderRight: idx < list.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 10.5, border: '1px solid #94a3b8', padding: '3px 8px', borderRadius: 4 }}>
                        <span style={{ display: 'inline-block', width: 12, height: 12, border: '1.5px solid #0f172a', borderRadius: 2 }} />
                        <span>Accept Option #{idx + 1}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. DETAILED SCOPE ITEMS PER AMC PACKAGE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isPrint ? 14 : 20 }}>
        {list.map((pkg, pIdx) => {
          const totals = calculateAmcTotals(pkg);
          const items = Array.isArray(pkg.items) ? pkg.items : [];
          const heading = pkg.heading || `Category #${pIdx + 1}`;
          const title = pkg.title || `AMC Option #${pIdx + 1}`;

          return (
            <div
              key={pIdx}
              style={{
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                boxShadow: isPrint ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
                pageBreakInside: 'avoid',
              }}
            >
              {/* Header Banner */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: isPrint ? '6px 12px' : '10px 16px',
                  backgroundColor: '#f1f5f9',
                  borderBottom: '1px solid #cbd5e1',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: isPrint ? 9 : 10,
                      fontWeight: 800,
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                    }}
                  >
                    {heading}
                  </span>
                  <span style={{ fontSize: isPrint ? 12 : 14, fontWeight: 800, color: '#0f172a' }}>
                    {title}
                  </span>
                  <span style={{ fontSize: isPrint ? 10 : 11, color: '#64748b' }}>
                    ({pkg.period || 'Annual'})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: isPrint ? 10 : 11, color: '#475569', fontWeight: 600 }}>
                    SLA: {pkg.slaResponseTime || '4hr Critical'}
                  </span>
                  <span style={{ fontSize: isPrint ? 12 : 14, fontWeight: 900, color: '#1d4ed8' }}>
                    ₹{Number(totals.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {pkg.period || 'Year'}
                  </span>
                </div>
              </div>

              {/* Scope & Deliverables Line Items Table */}
              {items.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isPrint ? 10 : 11.5 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '6px 10px', textAlign: 'left', width: 30 }}>#</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left' }}>Deliverable / Service Item</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left' }}>Scope Description</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', width: 60 }}>Qty</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', width: 60 }}>Unit</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: 80 }}>Rate (₹)</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: 90 }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, iIdx) => {
                      const qty = Number(it.quantity) || 1;
                      const rate = Number(it.unitPrice) || 0;
                      const lineTotal = qty * rate;

                      return (
                        <tr
                          key={iIdx}
                          style={{
                            borderBottom: iIdx < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                          }}
                        >
                          <td style={{ padding: '6px 10px', color: '#64748b' }}>{iIdx + 1}</td>
                          <td style={{ padding: '6px 10px', fontWeight: 700, color: '#0f172a' }}>
                            {it.title || `Service #${iIdx + 1}`}
                          </td>
                          <td style={{ padding: '6px 10px', color: '#475569', fontSize: isPrint ? 9.5 : 11 }}>
                            {it.description || '—'}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center', color: '#1e293b' }}>
                            {qty}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}>
                            {it.unit || 'Lump Sum'}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#1e293b' }}>
                            ₹{Number(rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            ₹{Number(lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '10px 16px', fontSize: isPrint ? 10 : 12, color: '#475569', lineHeight: 1.5 }}>
                  <strong>Included Coverage:</strong> {pkg.description || 'Comprehensive support, scheduled maintenance, and SLA coverage.'}
                </div>
              )}

              {/* Financial Breakdown Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: isPrint ? '6px 12px' : '8px 16px',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: isPrint ? 9.5 : 11.5,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ color: '#64748b' }}>
                  {pkg.terms && <span><strong>Terms:</strong> {pkg.terms}</span>}
                </div>

                <div style={{ display: 'flex', gap: 16, fontWeight: 600 }}>
                  <span>Subtotal: ₹{Number(totals.subtotal).toLocaleString('en-IN')}</span>
                  {totals.discountAmount > 0 && (
                    <span style={{ color: '#dc2626' }}>
                      Discount: -₹{Number(totals.discountAmount).toLocaleString('en-IN')}
                    </span>
                  )}
                  <span>GST ({totals.taxRate}%): +₹{Number(totals.taxAmount).toLocaleString('en-IN')}</span>
                  <span style={{ fontWeight: 800, color: '#1d4ed8' }}>
                    Net: ₹{Number(totals.grandTotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
