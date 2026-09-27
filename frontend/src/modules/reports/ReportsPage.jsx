import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  FileText,
  CheckCircle2,
  FolderKanban,
  Receipt,
  FileCheck2,
  Printer,
  ShieldCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('projects'); // projects, gst, payments, sales, revenue, expenses, clients
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const notify = useNotification();

  const handleTabChange = (reportType) => {
    if (reportType === activeReport) return;
    setData(null);
    setLoading(true);
    setActiveReport(reportType);
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      let res;
      if (activeReport === 'projects') {
        res = await api.get('/reports/projects');
      } else if (activeReport === 'gst') {
        res = await api.get('/reports/gst');
      } else if (activeReport === 'payments') {
        res = await api.get('/reports/payments');
      } else if (activeReport === 'sales') {
        res = await api.get('/reports/sales');
      } else if (activeReport === 'revenue') {
        res = await api.get('/reports/revenue');
      } else if (activeReport === 'expenses') {
        res = await api.get('/reports/expenses');
      } else if (activeReport === 'clients') {
        res = await api.get('/reports/clients');
      }
      setData(res?.data ?? null);
    } catch (err) {
      notify.error(err.message || 'Failed to generate report');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport]);

  const exportCSV = () => {
    if (!data) {
      notify.error('No report data available to export');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReport === 'projects') {
      const projects = data.projects || [];
      if (projects.length === 0) {
        notify.info('No projects data to export');
        return;
      }
      csvContent += 'Project Code,Project Name,Customer,Status,Total Value (INR),Invoiced (INR),Received (INR),Pending Due (INR),Expenses (INR),Net Profit (INR),Margin (%)\n';
      projects.forEach((r) => {
        csvContent += `"${r.projectCode}","${r.name}","${r.clientName}","${r.status}",${r.totalProjectValue || 0},${r.totalInvoiced || 0},${r.totalPaid || 0},${r.outstandingDue || 0},${r.totalExpenses || 0},${r.estimatedProfit || 0},${r.profitMargin || 0}%\n`;
      });
    } else if (activeReport === 'gst') {
      const invoices = data.invoices || [];
      if (invoices.length === 0) {
        notify.info('No GST invoices to export');
        return;
      }
      csvContent += 'Invoice Number,Date,Customer,GSTIN,Interstate,Taxable Subtotal (INR),CGST (INR),SGST (INR),IGST (INR),Total GST (INR),Grand Total (INR),Status\n';
      invoices.forEach((inv) => {
        csvContent += `"${inv.invoiceNumber}","${new Date(inv.invoiceDate).toLocaleDateString('en-GB')}","${inv.clientName}","${inv.clientGst}","${inv.isInterstate ? 'YES' : 'NO'}",${inv.taxableValue || 0},${inv.cgst || 0},${inv.sgst || 0},${inv.igst || 0},${inv.taxAmount || 0},${inv.totalAmount || 0},"${inv.status}"\n`;
      });
    } else if (activeReport === 'payments') {
      const payments = data.payments || [];
      if (payments.length === 0) {
        notify.info('No payments to export');
        return;
      }
      csvContent += 'Receipt Number,Date,Customer,Project,Invoice,Payment Mode,Ref / UTR #,Amount (INR),Notes\n';
      payments.forEach((p) => {
        csvContent += `"${p.receiptNumber}","${new Date(p.paymentDate).toLocaleDateString('en-GB')}","${p.clientName}","${p.projectCode}","${p.invoiceNumber}","${p.paymentMode}","${p.referenceNumber}",${p.amount || 0},"${p.notes || ''}"\n`;
      });
    } else if (activeReport === 'clients') {
      if (!Array.isArray(data) || data.length === 0) {
        notify.info('No client balances to export');
        return;
      }
      csvContent += 'Client Code,Company Name,Contact Person,Total Billed (INR),Total Paid (INR),Pending Due (INR)\n';
      data.forEach((row) => {
        csvContent += `"${row.clientCode || ''}","${row.companyName || ''}","${row.contactPerson || ''}",${row.totalBilled || 0},${row.totalPaid || 0},${row.pendingDue || 0}\n`;
      });
    } else if (activeReport === 'revenue') {
      csvContent += 'Month,Revenue (INR)\n';
      if (Array.isArray(data.monthlyData)) {
        data.monthlyData.forEach((row) => {
          csvContent += `"${row.month}",${row.amount}\n`;
        });
      }
    } else if (activeReport === 'expenses') {
      csvContent += 'Category,Amount (INR),Transaction Count\n';
      if (Array.isArray(data.categories)) {
        data.categories.forEach((row) => {
          csvContent += `"${row.category}",${row.amount},${row.count}\n`;
        });
      }
    } else {
      csvContent += `Metric,Value\nTotal Quotations,${data.totalQuotations || 0}\nApproved,${data.approvedQuotations || 0}\nConversion Rate,${data.conversionRate || 0}%\nTotal Invoiced,${data.totalInvoicedAmount || 0}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success('Report CSV exported!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.4px' }}>
            Comprehensive Business & Project Reports
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Centralized project financials, GST tax bills & liabilities, payments collected ledger, and company audits.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} className="btn btn-secondary no-print" title="Print report or save as PDF">
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button onClick={exportCSV} className="btn btn-primary no-print">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button onClick={fetchReport} className="btn btn-secondary no-print" title="Refresh report">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => handleTabChange('projects')}
          className={`btn ${activeReport === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FolderKanban size={15} />
          <span>Project-Wise Financials</span>
        </button>

        <button
          onClick={() => handleTabChange('gst')}
          className={`btn ${activeReport === 'gst' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileCheck2 size={15} />
          <span>GST Tax Bills & Liability</span>
        </button>

        <button
          onClick={() => handleTabChange('payments')}
          className={`btn ${activeReport === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Receipt size={15} />
          <span>Payments Received Ledger</span>
        </button>

        <button
          onClick={() => handleTabChange('clients')}
          className={`btn ${activeReport === 'clients' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={15} />
          <span>Client Outstanding Balances</span>
        </button>

        <button
          onClick={() => handleTabChange('revenue')}
          className={`btn ${activeReport === 'revenue' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <TrendingUp size={15} />
          <span>Revenue Analytics</span>
        </button>

        <button
          onClick={() => handleTabChange('expenses')}
          className={`btn ${activeReport === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Wallet size={15} />
          <span>Expenses Breakdown</span>
        </button>

        <button
          onClick={() => handleTabChange('sales')}
          className={`btn ${activeReport === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BarChart3 size={15} />
          <span>Sales & Quotation Pipeline</span>
        </button>
      </div>

      {/* Loading & Empty State Handling */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 12 }}>
          <RefreshCw size={26} className="animate-spin" color="var(--primary)" />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Compiling comprehensive financial report...</span>
        </div>
      ) : !data ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <FileText size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
          <div>No report data available for the selected view.</div>
        </div>
      ) : (
        <>
          {/* 1. PROJECT-WISE FINANCIAL REPORT */}
          {activeReport === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Summary KPIs Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Portfolio Value</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalPortfolioValue || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{data.summary?.totalProjects || 0} Projects</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#2563eb' }}>Total Invoiced</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalInvoiced || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Tax Bills Issued</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>Total Collected</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalCollected || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Cash, UPI & Bank Receipts</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#b45309' }}>Pending Balance Due</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#b45309', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalOutstanding || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Outstanding Collections</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569' }}>Project Expenses</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#475569', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalExpenses || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Direct Project Outflows</div>
                </div>

                <div className="card" style={{ padding: 16, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#166534' }}>Net Profit</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#15803d', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalNetProfit || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>Avg Margin: {data.summary?.averageProfitMargin || 0}%</div>
                </div>
              </div>

              {/* Data Table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#f8fafc' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Project-by-Project Financial Breakdown</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px' }}>Project Code & Name</th>
                        <th style={{ padding: '12px 16px' }}>Client</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Value</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Invoiced (₹)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Received (₹)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Balance Due</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Expenses</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Net Profit</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Margin %</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Handover Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }} className="no-print">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!data.projects || data.projects.length === 0) ? (
                        <tr>
                          <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                            No projects found in database.
                          </td>
                        </tr>
                      ) : (
                        data.projects.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700, color: '#1e40af' }}>{p.projectCode}</div>
                              <div style={{ color: 'var(--text-main)', marginTop: 2 }}>{p.name}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600 }}>{p.clientName}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>{p.city}</div>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>
                              ₹{Number(p.totalProjectValue || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>
                              ₹{Number(p.totalInvoiced || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                              ₹{Number(p.totalPaid || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: p.outstandingDue > 0 ? '#b45309' : '#059669' }}>
                              ₹{Number(p.outstandingDue || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', color: '#475569' }}>
                              ₹{Number(p.totalExpenses || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#15803d' }}>
                              ₹{Number(p.estimatedProfit || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>
                              {p.profitMargin || 0}%
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  backgroundColor: p.handoverStatus === 'HANDED_OVER' ? '#f0fdf4' : '#fffbeb',
                                  color: p.handoverStatus === 'HANDED_OVER' ? '#15803d' : '#b45309',
                                }}
                              >
                                {p.handoverStatus === 'HANDED_OVER' ? 'Handover Cleared' : 'Locked (Pending)'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }} className="no-print">
                              <Link
                                to={`/projects/${p.id}`}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: '#2563eb',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <span>Open</span>
                                <ArrowRight size={12} />
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. GST TAX BILLS & LIABILITY REPORT */}
          {activeReport === 'gst' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Taxable Turnover</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalTaxableValue || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Base sales without tax</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#2563eb' }}>CGST Collected</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalCgst || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Central Goods & Service Tax</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>SGST Collected</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalSgst || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>State Goods & Service Tax</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#7c3aed' }}>Total GST Output Liability</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalTaxAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Total GST collected across invoices</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#0f172a' }}>Total Invoice Billing</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalInvoiceAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{data.summary?.totalInvoices || 0} Bills Generated</div>
                </div>
              </div>

              {/* GST Table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>GST Tax Invoices Register</h3>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Company GSTIN: <strong>{data.companyGst}</strong>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px' }}>Invoice #</th>
                        <th style={{ padding: '12px 16px' }}>Date</th>
                        <th style={{ padding: '12px 16px' }}>Customer & GSTIN</th>
                        <th style={{ padding: '12px 16px' }}>Project</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Taxable Subtotal</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>CGST</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>SGST</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>IGST</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total GST</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Bill (₹)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!data.invoices || data.invoices.length === 0) ? (
                        <tr>
                          <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                            No GST tax invoices generated yet. Create invoices inside any project or the Invoices module.
                          </td>
                        </tr>
                      ) : (
                        data.invoices.map((inv) => (
                          <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e40af' }}>{inv.invoiceNumber}</td>
                            <td style={{ padding: '12px 16px' }}>{new Date(inv.invoiceDate).toLocaleDateString('en-GB')}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600 }}>{inv.clientName}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>GSTIN: {inv.clientGst}</div>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{inv.projectCode}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                              ₹{Number(inv.taxableValue || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', color: '#2563eb' }}>
                              ₹{Number(inv.cgst || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', color: '#059669' }}>
                              ₹{Number(inv.sgst || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', color: '#7c3aed' }}>
                              ₹{Number(inv.igst || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>
                              ₹{Number(inv.taxAmount || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                              ₹{Number(inv.totalAmount || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  backgroundColor: inv.status === 'PAID' ? '#dcfce7' : '#eff6ff',
                                  color: inv.status === 'PAID' ? '#15803d' : '#1d4ed8',
                                }}
                              >
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. PAYMENTS RECEIVED LEDGER REPORT */}
          {activeReport === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Amount Collected</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                    ₹{Number(data.summary?.totalAmountCollected || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{data.summary?.totalReceipts || 0} Total Receipts Issued</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#047857' }}>Cash Collected</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                    ₹{Number(data.summary?.byMode?.CASH || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Direct physical cash drawer</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#2563eb' }}>UPI & GPay Collected</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                    ₹{Number(data.summary?.byMode?.UPI || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Instant digital UPI collections</div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#0f172a' }}>Bank Transfers / Cheques</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    ₹{Number(data.summary?.byMode?.BANK_TRANSFER || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>IMPS, NEFT, RTGS & Cheques</div>
                </div>
              </div>

              {/* Payments Table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#f8fafc' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Itemized Payment Receipts & Split Ledger</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px' }}>Receipt #</th>
                        <th style={{ padding: '12px 16px' }}>Date</th>
                        <th style={{ padding: '12px 16px' }}>Client</th>
                        <th style={{ padding: '12px 16px' }}>Project</th>
                        <th style={{ padding: '12px 16px' }}>Invoice</th>
                        <th style={{ padding: '12px 16px' }}>Primary Mode</th>
                        <th style={{ padding: '12px 16px' }}>Ref / UTR</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount (₹)</th>
                        <th style={{ padding: '12px 16px' }}>Payment Splits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!data.payments || data.payments.length === 0) ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                            No payment receipts recorded yet.
                          </td>
                        </tr>
                      ) : (
                        data.payments.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e40af' }}>{p.receiptNumber}</td>
                            <td style={{ padding: '12px 16px' }}>{new Date(p.paymentDate).toLocaleDateString('en-GB')}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.clientName}</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{p.projectCode}</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{p.invoiceNumber}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  backgroundColor: p.paymentMode === 'CASH' ? '#ecfdf5' : '#eff6ff',
                                  color: p.paymentMode === 'CASH' ? '#047857' : '#1d4ed8',
                                }}
                              >
                                {p.paymentMode}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{p.referenceNumber}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                              ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {p.splits && p.splits.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  {p.splits.map((s, sIdx) => (
                                    <span key={sIdx} style={{ fontSize: 11, color: '#64748b' }}>
                                      • {s.paymentMode}: <strong>₹{Number(s.amount).toLocaleString('en-IN')}</strong> {s.accountName ? `(${s.accountName})` : ''}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>Direct</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. SALES & PIPELINE REPORT */}
          {activeReport === 'sales' && !Array.isArray(data) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Quotations</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{data.totalQuotations || 0}</div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>Approved & Won</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginTop: 4 }}>{data.approvedQuotations || 0}</div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#2563eb' }}>Win Conversion Rate</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>{data.conversionRate || 0}%</div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#7c3aed' }}>Invoiced Total</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
                    ₹{Number(data.totalInvoicedAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. REVENUE ANALYTICS */}
          {activeReport === 'revenue' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  Annual Revenue ({data.year || new Date().getFullYear()}): ₹{Number(data.totalRevenue || 0).toLocaleString('en-IN')}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Monthly cash inflow collections from customer invoice payments.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10 }}>
                  {data.monthlyData?.map((m) => (
                    <div key={m.month} style={{ textAlign: 'center', padding: '12px 6px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{m.month}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: m.amount > 0 ? '#059669' : 'var(--text-muted)', marginTop: 4 }}>
                        ₹{Number(m.amount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. EXPENSES BREAKDOWN */}
          {activeReport === 'expenses' && !Array.isArray(data) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  Total Business Expenses: ₹{Number(data.totalExpenses || 0).toLocaleString('en-IN')}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Categorical breakdown of vendor bills, cloud infrastructure, and operational overhead.
                </p>

                {(!data.categories || data.categories.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: 13 }}>
                    No expenses recorded for this period.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '10px 14px' }}>Expense Category</th>
                        <th style={{ padding: '10px 14px' }}>Recorded Transactions</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.categories.map((cat) => (
                        <tr key={cat.category} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600 }}>{cat.category}</td>
                          <td style={{ padding: '10px 14px' }}>{cat.count}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>
                            ₹{Number(cat.amount || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* 7. CLIENT BALANCES */}
          {activeReport === 'clients' && Array.isArray(data) && (
            <div>
              {data.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    No Outstanding Client Balances
                  </h3>
                  <p style={{ fontSize: 13, maxWidth: 500, margin: '0 auto', lineHeight: 1.5 }}>
                    All client accounts are clear! There are currently no pending overdue or unpaid invoice balances.
                  </p>
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px' }}>Client Code</th>
                        <th style={{ padding: '12px 16px' }}>Company Name</th>
                        <th style={{ padding: '12px 16px' }}>Contact Person</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Invoiced</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Paid</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Pending Due Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{c.clientCode}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>{c.companyName}</td>
                          <td style={{ padding: '12px 16px' }}>{c.contactPerson}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>₹{Number(c.totalBilled || 0).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                            ₹{Number(c.totalPaid || 0).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: (c.pendingDue || 0) > 0 ? '#dc2626' : '#059669' }}>
                            ₹{Number(c.pendingDue || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
