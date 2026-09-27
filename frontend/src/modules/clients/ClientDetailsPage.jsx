import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  FileSpreadsheet,
  FileCheck2,
  Receipt,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';

export default function ClientDetailsPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quotations'); // quotations, invoices, payments, contacts
  const notify = useNotification();

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clients/${id}`);
      setClient(res.data);
    } catch (err) {
      notify.error(err.message || 'Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  if (loading && !client) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <RefreshCw size={20} className="animate-spin" />
      </div>
    );
  }

  if (!client) {
    return <div className="card">Client not found.</div>;
  }

  const stats = client.stats || {};

  return (
    <div>
      {/* Back button and Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link to="/clients" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Clients</span>
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {client.clientCode}
        </span>
      </div>

      {/* Client Profile Header Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800 }}>{client.companyName}</h1>
              <Badge status={client.status} />
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Primary Contact: <strong>{client.contactPerson}</strong>
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} />
                {client.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} />
                {client.phone}
              </span>
              {client.city && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} />
                  {client.city}, {client.state}
                </span>
              )}
              {client.gstNumber && <span><strong>GST:</strong> {client.gstNumber}</span>}
              {client.panNumber && <span><strong>PAN:</strong> {client.panNumber}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to={`/quotations/new?clientId=${client.id}`} className="btn btn-secondary">
              <Plus size={14} />
              <span>Create Quotation</span>
            </Link>
            <Link to={`/invoices/new?clientId=${client.id}`} className="btn btn-primary">
              <Plus size={14} />
              <span>Generate Invoice</span>
            </Link>
          </div>
        </div>

        {/* Financial Stat Pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Invoiced
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
              ₹{Number(stats.totalInvoiced || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#ecfdf5', borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
              Total Paid
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#065f46', marginTop: 4 }}>
              ₹{Number(stats.totalPaid || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ padding: 12, backgroundColor: stats.pendingBalance > 0 ? '#fef2f2' : '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: stats.pendingBalance > 0 ? '#991b1b' : 'var(--text-muted)', textTransform: 'uppercase' }}>
              Outstanding Balance
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: stats.pendingBalance > 0 ? '#dc2626' : 'var(--text-main)', marginTop: 4 }}>
              ₹{Number(stats.pendingBalance || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('quotations')}
          style={{
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'quotations' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'quotations' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Quotations ({client.quotations?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'invoices' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'invoices' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Invoices & Bills ({client.invoices?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          style={{
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'payments' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'payments' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Payments Received ({client.payments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          style={{
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'contacts' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'contacts' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Contacts ({client.contacts?.length || 0})
        </button>
      </div>

      {/* Tab Content: Quotations */}
      {activeTab === 'quotations' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quotation No</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Digital Signature</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(!client.quotations || client.quotations.length === 0) ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    No quotations found for this client.
                  </td>
                </tr>
              ) : (
                client.quotations.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{q.quotationNumber}</span>
                    </td>
                    <td>{new Date(q.quotationDate).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(q.totalAmount).toLocaleString('en-IN')}</td>
                    <td>
                      {q.isDigitallySigned ? (
                        <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>✓ Verified</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unsigned</span>
                      )}
                    </td>
                    <td><Badge status={q.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/quotations/${q.id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Invoices */}
      {activeTab === 'invoices' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(!client.invoices || client.invoices.length === 0) ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    No invoices recorded for this client.
                  </td>
                </tr>
              ) : (
                client.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{inv.invoiceNumber}</span>
                    </td>
                    <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(inv.totalAmount).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#059669', fontWeight: 600 }}>₹{Number(inv.paidAmount).toLocaleString('en-IN')}</td>
                    <td style={{ color: inv.balanceDue > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                      ₹{Number(inv.balanceDue).toLocaleString('en-IN')}
                    </td>
                    <td><Badge status={inv.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/invoices/${inv.id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Payments */}
      {activeTab === 'payments' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Payment Date</th>
                <th>Type</th>
                <th>Mode</th>
                <th>Reference</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(!client.payments || client.payments.length === 0) ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    No payments received yet.
                  </td>
                </tr>
              ) : (
                client.payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{p.receiptNumber}</span>
                    </td>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td><Badge status={p.paymentType} /></td>
                    <td>{p.paymentMode}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.referenceNumber || '—'}</td>
                    <td style={{ fontWeight: 800, color: '#065f46' }}>
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Contacts */}
      {activeTab === 'contacts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {(!client.contacts || client.contacts.length === 0) ? (
            <div className="card" style={{ color: 'var(--text-muted)' }}>No additional contacts found.</div>
          ) : (
            client.contacts.map((contact) => (
              <div key={contact.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{contact.name}</span>
                  {contact.isPrimary && (
                    <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: '#eff6ff', color: 'var(--primary)', padding: '2px 6px', borderRadius: 4 }}>
                      PRIMARY
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{contact.designation || 'Staff'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-main)' }}>
                  <div>Email: {contact.email || '—'}</div>
                  <div>Phone: {contact.phone || '—'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
