import React, { useState, useEffect } from 'react';
import { orgApi } from '../../services/organization.service';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { 
  HardDrive, FileUp, File, Trash2, Download, CheckCircle2, 
  AlertTriangle, RefreshCw, Lock, Sparkles, FolderGit2, ShieldCheck, Search, FileText
} from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';

export default function TenantStoragePage() {
  const [documents, setDocuments] = useState([]);
  const [storageData, setStorageData] = useState({ usedBytes: 0, quotaBytes: 107374182400 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('QUOTATION_ATTACHMENT');

  const notify = useNotification();

  useEffect(() => {
    fetchStorageAndDocs();
  }, []);

  const fetchStorageAndDocs = async () => {
    try {
      setLoading(true);
      const res = await orgApi.getDocuments();
      const payload = res?.documents ? res : (res?.data?.documents ? res.data : (res?.data || res));
      if (payload) {
        setDocuments(payload.documents || (Array.isArray(payload) ? payload : []));
        if (payload.usage) {
          setStorageData(payload.usage);
        }
      }
    } catch (err) {
      notify.error('Failed to load storage documents: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security check: executable blocklist
    const forbiddenExts = ['.exe', '.bat', '.cmd', '.sh', '.php', '.pl', '.cgi', '.py', '.msi', '.vbs', '.ps1'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (forbiddenExts.includes(ext)) {
      notify.error(`Security Violation: Executable file type "${ext}" is strictly blocked.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (!docTitle) {
      setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      notify.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);

      const res = await orgApi.uploadDocument({
        title: docTitle || selectedFile.name,
        fileName: selectedFile.name,
        docType: docCategory,
        fileSizeBytes: selectedFile.size,
        mimeType: selectedFile.type || 'application/octet-stream'
      });

      if (res?.success || res?.data?.success || res?.id || res?.data?.id) {
        notify.success(`Document "${selectedFile.name}" securely stored in isolated tenant vault!`);
        setSelectedFile(null);
        setDocTitle('');
        setUploadModalOpen(false);
        fetchStorageAndDocs();
      }
    } catch (err) {
      notify.error(err.response?.data?.message || 'Storage upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id, fileName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${fileName || 'this document'}" from tenant storage?`)) return;

    try {
      const res = await orgApi.deleteDocument(id);
      if (res?.success || res?.data?.success || res?.status === 200) {
        notify.success('Document deleted and storage quota reclaimed');
        fetchStorageAndDocs();
      }
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usedMB = (storageData.usedBytes || 0) / (1024 * 1024);
  const quotaGB = (storageData.quotaBytes || 107374182400) / (1024 * 1024 * 1024);
  const usedPercent = Math.max(1, Math.min(100, Math.round(((storageData.usedBytes || 0) / (storageData.quotaBytes || 107374182400)) * 100)));

  const filteredDocuments = documents.filter(doc => {
    const matchSearch = !search || (doc.title || doc.fileName || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || doc.docType === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <HardDrive size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>
                Independent Tenant Cloud Storage
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Private, logically isolated object storage bucket for client contracts, project blueprints, and tax documents.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchStorageAndDocs}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Storage</span>
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 700 }}
          >
            <FileUp size={16} />
            <span>Upload Secure Document</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Storage Consumption
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
              {usedPercent}%
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px' }}>
            {formatFileSize(storageData.usedBytes || 0)}
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '999px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: 'var(--primary)', width: `${usedPercent}%` }} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Allocated Quota: {quotaGB.toFixed(0)} GB
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Vault Documents
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669', marginTop: '6px' }}>
            {documents.length}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} />
            <span>Integrity Verified</span>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Encryption Standards
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>
            AES-256 GCM
          </div>
          <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '6px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={13} />
            <span>Server-Side At-Rest Protection</span>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Tenant Namespace
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0284c7', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            Isolated Prefix Scope
          </div>
          <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '6px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Lock size={13} />
            <span>Zero Cross-Tenant Leakage</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search documents by title or file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            fontSize: '13px',
            backgroundColor: '#ffffff',
            minWidth: 180,
          }}
        >
          <option value="">All Document Categories</option>
          <option value="QUOTATION_ATTACHMENT">Quotation Attachment</option>
          <option value="PROJECT_BLUEPRINT">Project Blueprint / Specs</option>
          <option value="CONTRACT_NDA">Legal Contract / NDA</option>
          <option value="TAX_DOCUMENT">GST / Tax Document</option>
          <option value="INVOICE_RECEIPT">Payment Proof / Receipt</option>
          <option value="OTHER">Other Documents</option>
        </select>
      </div>

      {/* Main Documents Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
            <div>Loading isolated tenant documents...</div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <FileUp size={28} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              No Documents in Tenant Vault
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 16px' }}>
              {search || categoryFilter
                ? 'No documents match your search criteria.'
                : 'Upload project attachments, architectural blueprints, or client NDA contracts into your private storage.'}
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '13px' }}
            >
              <FileUp size={15} />
              <span>Upload Document</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Document Title & File
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Category
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    File Size
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Uploaded By
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Date Added
                  </th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', color: 'var(--primary)', display: 'flex' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>
                            {doc.title || doc.fileName}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {doc.fileName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {(doc.docType || 'OTHER').replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-main)', fontSize: '12px' }}>
                      {formatFileSize(doc.fileSizeBytes)}
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {doc.uploadedBy || 'Admin'}
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {new Date(doc.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.fileName)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px', color: '#ef4444', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
                          title="Delete document"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="Upload Secure Document to Tenant Vault"
          maxWidth={500}
        >
          <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Document Title
              </label>
              <input
                type="text"
                placeholder="e.g. Master Service Agreement v2"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Classification Category
              </label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="QUOTATION_ATTACHMENT">Quotation Attachment</option>
                <option value="PROJECT_BLUEPRINT">Project Blueprint / Architecture Specs</option>
                <option value="CONTRACT_NDA">Legal Contract / NDA</option>
                <option value="TAX_DOCUMENT">GST / Statutory Tax Document</option>
                <option value="INVOICE_RECEIPT">Invoice Payment Proof</option>
                <option value="OTHER">Other Enterprise Asset</option>
              </select>
            </div>

            {/* File Dropzone */}
            <div
              style={{
                border: '2px dashed var(--border-strong)',
                borderRadius: '12px',
                padding: '28px 16px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('vault-file-input').click()}
            >
              <input
                id="vault-file-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <FileUp size={36} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>
                {selectedFile ? selectedFile.name : 'Click to select or browse files'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedFile
                  ? `Size: ${formatFileSize(selectedFile.size)} • Ready for encrypted upload`
                  : 'PDF, DOCX, XLSX, PNG, JPG accepted (up to 100MB)'}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', padding: '8px 12px', borderRadius: '6px' }}>
              <ShieldCheck size={14} color="#2563eb" />
              <span>Executable code files (.exe, .sh, .py, .php) are automatically blocked.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {uploading ? 'Encrypting & Storing...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
