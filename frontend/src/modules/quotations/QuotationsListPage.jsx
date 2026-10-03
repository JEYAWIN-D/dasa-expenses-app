import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import {
  Plus,
  Search,
  Eye,
  ShieldCheck,
  Printer,
  ArrowRight,
  Trash2,
  Edit3,
  FolderKanban,
  FileCheck2,
  CheckCircle2,
  Layers,
  Archive,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/common/Badge.jsx';
import { DocumentPreviewModal } from '../../components/common/DocumentPreviewModal.jsx';
import { PinSignatureModal } from '../../components/common/PinSignatureModal.jsx';

export default function QuotationsListPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ active: 0, converted: 0, archived: 0, all: 0 });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tab, setTab] = useState('active'); // 'active', 'converted', 'archived', 'all'
  const [loading, setLoading] = useState(true);

  // Modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [signTargetId, setSignTargetId] = useState(null);

  const notify = useNotification();

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/quotations', { page, limit, search, status, tab });
      setQuotations(res.data || []);
      setTotal(res.pagination?.total || 0);
      if (res.counts) {
        setCounts(res.counts);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to load quotations');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, tab, notify]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleOpenPreview = async (id) => {
    try {
      const res = await api.get(`/quotations/${id}`);
      const doc = res?.data?.id ? res.data : (res?.data?.data || res?.data || res);
      setPreviewDoc(doc);
    } catch (err) {
      notify.error(err.message || 'Failed to load quotation for preview');
    }
  };

  const handleSignConfirm = async (pin) => {
    if (!signTargetId) return;
    try {
      await api.post(`/quotations/${signTargetId}/sign`, { pin });
      notify.success('Quotation digitally signed successfully!');
      fetchQuotations();
    } catch (err) {
      throw err; // Captured in PinSignatureModal
    }
  };

  const handleConvertToInvoice = async (id, num) => {
    if (!window.confirm(`Convert quotation ${num} directly into an Issued Invoice?`)) return;
    try {
      const res = await api.post(`/quotations/${id}/convert-to-invoice`);
      notify.success(`Created invoice ${res.data?.invoiceNumber || ''}!`);
      fetchQuotations();
    } catch (err) {
      notify.error(err.message || 'Conversion failed');
    }
  };

  const handleDeleteQuotation = async (id, num) => {
    if (!window.confirm(`Are you sure you want to permanently delete quotation ${num}?`)) return;
    try {
      await api.delete(`/quotations/${id}`);
      notify.success(`Quotation ${num} deleted successfully`);
      fetchQuotations();
    } catch (err) {
      notify.error(err.message || 'Failed to delete quotation');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Quotation Management</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Create professional commercial proposals, track revisions, negotiate, and convert to invoices.
          </p>
        </div>
        <Link to="/quotations/new" className="btn btn-primary">
          <Plus size={16} />
          <span>Create Quotation</span>
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
        <button
          onClick={() => { setTab('active'); setStatus(''); setPage(1); }}
          className={`btn btn-sm ${tab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
        >
          <FileCheck2 size={14} />
          <span>Active Proposals</span>
          <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, backgroundColor: tab === 'active' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)' }}>
            {counts.active}
          </span>
        </button>

        <button
          onClick={() => { setTab('converted'); setStatus(''); setPage(1); }}
          className={`btn btn-sm ${tab === 'converted' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
        >
          <CheckCircle2 size={14} />
          <span>Converted to Invoice</span>
          <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, backgroundColor: tab === 'converted' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)' }}>
            {counts.converted}
          </span>
        </button>

        <button
          onClick={() => { setTab('archived'); setStatus(''); setPage(1); }}
          className={`btn btn-sm ${tab === 'archived' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
        >
          <Archive size={14} />
          <span>Rejected / Expired</span>
          <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, backgroundColor: tab === 'archived' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)' }}>
            {counts.archived}
          </span>
        </button>

        <button
          onClick={() => { setTab('all'); setStatus(''); setPage(1); }}
          className={`btn btn-sm ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
        >
          <Layers size={14} />
          <span>All Quotations</span>
          <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, backgroundColor: tab === 'all' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)' }}>
            {counts.all}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            className="form-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search quotation number, client name, or project..."
            style={{ paddingLeft: 38 }}
          />
        </div>

        {tab === 'all' && (
          <select
            className="form-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            style={{ width: 170 }}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="NEGOTIATION">In Negotiation</option>
            <option value="REVISED">Revised</option>
            <option value="APPROVED">Approved</option>
            <option value="CONVERTED">Converted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        )}
      </div>

      {/* Quotations Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: 150 }}>Quote # / Rev</th>
              <th style={{ minWidth: 180 }}>Client</th>
              <th style={{ minWidth: 160 }}>Project Scope</th>
              <th style={{ minWidth: 110 }}>Issue Date</th>
              <th style={{ minWidth: 110 }}>Expiry Date</th>
              <th style={{ minWidth: 130 }}>Total Amount</th>
              <th style={{ minWidth: 130 }}>Digital Signature</th>
              <th style={{ minWidth: 120 }}>Status</th>
              <th style={{ minWidth: 150, textAlign: 'right' }}>Actions (CRUD)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Loading quotations...</span>
                  </div>
                </td>
              </tr>
            ) : quotations.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No quotations in this view</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {tab === 'active' && 'All active proposals are currently converted or archived.'}
                    {tab === 'converted' && 'No quotations have been converted to invoices yet.'}
                    {tab === 'archived' && 'No rejected or archived quotations.'}
                    {tab === 'all' && 'Try adjusting your search criteria or create a new quotation.'}
                  </div>
                </td>
              </tr>
            ) : (
              quotations.map((q) => (
                <tr key={q.id}>
                  <td>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 13 }}>
                      <Link to={`/quotations/${q.id}`}>{q.quotationNumber}</Link>
                    </div>
                    {q.revisionNumber > 0 && (
                      <span style={{ fontSize: 10, backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4, fontWeight: 800, display: 'inline-block', marginTop: 3 }}>
                        Rev #{q.revisionNumber}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{q.client?.companyName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{q.client?.contactPerson}</div>
                  </td>
                  <td>
                    {q.project ? (
                      <Link
                        to={`/projects/${q.project.id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}
                      >
                        <FolderKanban size={13} />
                        <span>{q.project.name}</span>
                      </Link>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stand-alone Proposal</span>
                    )}
                  </td>
                  <td style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>
                    {new Date(q.quotationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 500, color: new Date(q.expiryDate) < new Date() ? 'var(--danger)' : '#475569' }}>
                    {new Date(q.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#09090b' }}>
                      ₹{Number(q.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    {q.isDigitallySigned ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <ShieldCheck size={13} />
                        Signed
                      </span>
                    ) : (
                      <button
                        onClick={() => setSignTargetId(q.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999 }}
                      >
                        Sign (PIN)
                      </button>
                    )}
                  </td>
                  <td><Badge status={q.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      {/* View & Edit */}
                      <Link to={`/quotations/${q.id}`} className="btn btn-secondary btn-sm" title="View & Edit Details">
                        <Eye size={13} />
                      </Link>

                      {/* Print / PDF */}
                      <button
                        onClick={() => handleOpenPreview(q.id)}
                        className="btn btn-secondary btn-sm"
                        title="Print / PDF Preview"
                      >
                        <Printer size={13} />
                      </button>

                      {/* Convert to Invoice */}
                      {q.status !== 'CONVERTED' && (
                        <button
                          onClick={() => handleConvertToInvoice(q.id, q.quotationNumber)}
                          className="btn btn-secondary btn-sm"
                          title="Convert to Invoice"
                          style={{ color: '#059669' }}
                        >
                          <ArrowRight size={13} />
                        </button>
                      )}

                      {/* Delete */}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} quotations
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-secondary btn-sm">
              Previous
            </button>
            <button disabled={page * limit >= total} onClick={() => setPage(page + 1)} className="btn btn-secondary btn-sm">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Document Print/PDF Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
          type="QUOTATION"
        />
      )}

      {/* Digital Signature PIN Modal */}
      <PinSignatureModal
        isOpen={!!signTargetId}
        onClose={() => setSignTargetId(null)}
        onConfirm={handleSignConfirm}
        documentName="Quotation"
      />
    </div>
  );
}
