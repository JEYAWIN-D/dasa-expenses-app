import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  FileText,
  Laptop,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Download,
  Printer,
  ChevronLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Building,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Lock,
  Plus,
  RefreshCw,
  Award,
  CreditCard,
  Briefcase,
  FileCheck2,
  XCircle,
} from 'lucide-react';
import employeeService from '../../services/employee.service.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [unmasked, setUnmasked] = useState(false);

  // Document Generator Modal State
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('APPOINTMENT_LETTER');
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [generatingDoc, setGeneratingDoc] = useState(false);

  // KYC Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedKycDoc, setSelectedKycDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('BLURRY_SCAN');
  const [rejectionCustomNote, setRejectionCustomNote] = useState('');

  // Asset Modal State
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [newAssetData, setNewAssetData] = useState({
    type: 'LAPTOP',
    make: 'Apple MacBook Pro 16" M3 Pro',
    serialNumber: '',
    assetTag: '',
    condition: 'BRAND_NEW_SEALED',
  });

  // Probation Confirmation Modal State
  const [probationModalOpen, setProbationModalOpen] = useState(false);
  const [probationRemarks, setProbationRemarks] = useState('');

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      const res = await employeeService.getEmployeeById(id, unmasked);
      if (res?.data) {
        setEmployee(res.data);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to retrieve employee profile');
    } finally {
      setLoading(false);
    }
  }, [id, unmasked, notify]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  // Handle Document Generation
  const handleGenerateDocument = async (docType) => {
    try {
      setGeneratingDoc(true);
      setSelectedDocType(docType);
      const res = await employeeService.generateDocument(id, docType);
      if (res?.data) {
        setGeneratedDoc(res.data);
        setDocModalOpen(true);
        notify.success(`${res.data.title} generated successfully!`);
        fetchEmployee();
      }
    } catch (err) {
      notify.error(err.message || 'Failed to generate document');
    } finally {
      setGeneratingDoc(false);
    }
  };

  // Handle KYC Document Verification (Approve)
  const handleApproveKyc = async (docId) => {
    try {
      await employeeService.verifyKyc(id, docId, { status: 'VERIFIED' });
      notify.success('Document marked as Verified successfully!');
      fetchEmployee();
    } catch (err) {
      notify.error(err.message || 'Failed to verify document');
    }
  };

  // Handle KYC Document Rejection
  const handleRejectKyc = async () => {
    if (!selectedKycDoc) return;
    try {
      const fullNote = `${rejectionReason}: ${rejectionCustomNote || 'Document scan does not meet compliance standards.'}`;
      await employeeService.verifyKyc(id, selectedKycDoc.id, {
        status: 'REJECTED',
        rejectionReason: fullNote,
      });
      notify.warning(`Document rejected and sent for candidate re-upload.`);
      setRejectModalOpen(false);
      setSelectedKycDoc(null);
      fetchEmployee();
    } catch (err) {
      notify.error(err.message || 'Failed to reject document');
    }
  };

  // Handle IT Asset Allocation
  const handleAllocateAsset = async (e) => {
    e.preventDefault();
    try {
      await employeeService.allocateAsset(id, newAssetData);
      notify.success('Hardware asset successfully allocated and recorded.');
      setAssetModalOpen(false);
      fetchEmployee();
    } catch (err) {
      notify.error(err.message || 'Failed to allocate asset');
    }
  };

  // Handle Return Asset
  const handleReturnAsset = async (assetId) => {
    try {
      await employeeService.returnAsset(id, assetId, { condition: 'RETURNED_IN_GOOD_CONDITION' });
      notify.success('Asset return acknowledged.');
      fetchEmployee();
    } catch (err) {
      notify.error(err.message || 'Failed to return asset');
    }
  };

  // Handle BGV Check Status Update
  const handleAdvanceBgvCheck = async (checkName) => {
    try {
      await employeeService.updateBgv(id, {
        checkName,
        checkStatus: 'CLEARED',
        overallStatus: 'CLEARED',
      });
      notify.success(`BGV Check "${checkName}" marked as Cleared!`);
      fetchEmployee();
    } catch (err) {
      notify.error(err.message || 'Failed to update BGV check');
    }
  };

  // Handle Probation Confirmation
  const handleConfirmProbation = async () => {
    try {
      await employeeService.updateProbation(id, {
        action: 'CONFIRM',
        notes: probationRemarks || 'Confirmed active after 6-month performance evaluation.',
      });
      notify.success('Employee confirmed active successfully!');
      setProbationModalOpen(false);
      fetchEmployee();
    } catch (err) {
      notify.error(err.message || 'Failed to confirm probation');
    }
  };

  // Print generated document
  const handlePrintDocument = () => {
    if (!generatedDoc?.renderedHtml) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatedDoc.renderedHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (loading && !employee) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <div>Loading candidate record...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <AlertCircle size={32} color="var(--danger)" style={{ margin: '0 auto 12px' }} />
        <h2>Employee Not Found</h2>
        <Link to="/employees" style={{ color: 'var(--primary)', marginTop: '8px', display: 'inline-block' }}>
          Back to Staff Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Back Link */}
      <div style={{ marginBottom: '16px' }}>
        <Link to="/employees" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
          <ChevronLeft size={16} />
          <span>Staff Directory</span>
        </Link>
      </div>

      {/* 360° Candidate Header Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 500px' }}>
          <img
            src={employee.profilePhotoUrl}
            alt={employee.fullName}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-md)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                {employee.fullName}
              </h1>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {employee.employeeCode}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  backgroundColor:
                    employee.employmentStatus === 'CONFIRMED_ACTIVE'
                      ? 'var(--success-light)'
                      : employee.employmentStatus === 'ACTIVE_PROBATION'
                      ? '#fef3c7'
                      : employee.employmentStatus === 'BGV_IN_PROGRESS'
                      ? '#ede9fe'
                      : '#ffedd5',
                  color:
                    employee.employmentStatus === 'CONFIRMED_ACTIVE'
                      ? 'var(--success-text)'
                      : employee.employmentStatus === 'ACTIVE_PROBATION'
                      ? '#92400e'
                      : employee.employmentStatus === 'BGV_IN_PROGRESS'
                      ? '#5b21b6'
                      : '#9a3412',
                }}
              >
                {employee.employmentStatus?.replace(/_/g, ' ')}
              </span>
            </div>

            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', margin: '4px 0 2px' }}>
              {employee.designation} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>• {employee.department} ({employee.gradeLevel})</span>
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={13} color="var(--primary)" />
                {employee.officialEmail}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={13} color="var(--primary)" />
                {employee.phoneMasked || employee.phone}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="var(--primary)" />
                {employee.workLocation}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} color="var(--primary)" />
                Joined: {employee.joiningDate}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setUnmasked(!unmasked)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-strong)',
              backgroundColor: unmasked ? '#fef2f2' : 'var(--bg-surface)',
              color: unmasked ? 'var(--danger)' : 'var(--text-main)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {unmasked ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{unmasked ? 'Mask PII' : 'Reveal Full PII (2FA)'}</span>
          </button>

          <button
            onClick={() => handleGenerateDocument('APPOINTMENT_LETTER')}
            disabled={generatingDoc}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Sparkles size={14} />
            <span>{generatingDoc ? 'Generating...' : 'Generate Legal Doc'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'profile', label: 'Master Profile', icon: <User size={15} /> },
          { id: 'kyc', label: `KYC & Verification (${employee.kycDocuments?.length || 0})`, icon: <ShieldCheck size={15} /> },
          { id: 'documents', label: `Legal Document Studio (${employee.generatedDocuments?.length || 0})`, icon: <FileText size={15} /> },
          { id: 'assets', label: `IT Asset Allocation (${employee.assets?.length || 0})`, icon: <Laptop size={15} /> },
          { id: 'bgv', label: 'BGV Tracking', icon: <Shield size={15} /> },
          { id: 'probation', label: 'Probation & Lifecycle', icon: <Award size={15} /> },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                border: 'none',
                borderBottom: active ? '3px solid var(--primary)' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: active ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.12s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: MASTER PROFILE ================= */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left Column: Personal, Education, Experience */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Personal Details */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="var(--primary)" />
                <span>Personal & Demographic Record</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Date of Birth</span>
                  <strong>{employee.dobDmy || employee.dob}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Gender</span>
                  <strong>{employee.gender}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Marital Status</span>
                  <strong>{employee.maritalStatus}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Blood Group</span>
                  <strong>{employee.bloodGroup?.replace('_', ' ')}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Personal Email</span>
                  <strong>{employee.personalEmail}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Reporting Line</span>
                  <strong>{employee.reportingManager}</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', fontSize: '13px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Emergency Contact</span>
                <strong>{employee.emergencyContact?.name} ({employee.emergencyContact?.relation})</strong> • {employee.emergencyContact?.phone}
              </div>
            </div>

            {/* Address Records */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--primary)" />
                <span>Residential Addresses</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Address</span>
                  <p style={{ margin: '6px 0 0', lineHeight: '1.6' }}>
                    {employee.currentAddress?.street}<br />
                    {employee.currentAddress?.city}, {employee.currentAddress?.state} - {employee.currentAddress?.pincode}
                  </p>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Permanent Address</span>
                  <p style={{ margin: '6px 0 0', lineHeight: '1.6' }}>
                    {employee.permanentAddress?.street}<br />
                    {employee.permanentAddress?.city}, {employee.permanentAddress?.state} - {employee.permanentAddress?.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic & Prior Experience History */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={16} color="var(--primary)" />
                <span>Academic & Prior Employment History</span>
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>Education Qualifications:</span>
                {employee.education?.map((edu, idx) => (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <div>
                      <strong>{edu.degreeName}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{edu.institution} • Class of {edu.graduationYear}</div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-muted)' }}>
                      {edu.score}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>Past Work Experience:</span>
                {employee.experience && employee.experience.length > 0 ? (
                  employee.experience.map((exp, idx) => (
                    <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <div>
                        <strong>{exp.companyName}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{exp.designation} ({exp.startDate} to {exp.endDate})</div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                        ₹{Number(exp.lastDrawnCtc).toLocaleString('en-IN')}/yr
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '6px 0' }}>Fresher / Direct Campus Graduate</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Statutory & Financial Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={16} color="var(--primary)" />
                <span>Statutory & Direct Deposit</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Permanent Account Number (PAN)</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                      {unmasked ? employee.statutory?.panNumber : employee.statutory?.panMasked}
                    </strong>
                    <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '700' }}>VALIDATED</span>
                  </div>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Aadhaar Card (UIDAI)</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                      {unmasked ? employee.statutory?.aadhaarNumber : employee.statutory?.aadhaarMasked}
                    </strong>
                    <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '700' }}>MASKED</span>
                  </div>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Salary Bank Account</span>
                  <strong>{employee.statutory?.bankName}</strong>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', marginTop: '2px' }}>
                    A/C: {unmasked ? employee.statutory?.bankAccountNumber : employee.statutory?.bankAccountMasked}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>IFSC: {employee.statutory?.bankIfsc}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PF UAN</span>
                    <strong style={{ display: 'block', fontSize: '12px' }}>{employee.statutory?.pfUanMasked || 'Pending'}</strong>
                  </div>
                  <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tax Regime</span>
                    <strong style={{ display: 'block', fontSize: '12px' }}>{employee.taxRegime}</strong>
                  </div>
                </div>
              </div>

              {/* Annual CTC Card */}
              <div style={{ marginTop: '20px', padding: '14px', borderRadius: '10px', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Offered Annual CTC</div>
                <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                  ₹{Number(employee.annualCtc).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11px' }}>~₹{Math.round(employee.annualCtc / 12).toLocaleString('en-IN')}/month gross</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: KYC & VERIFICATION DESK ================= */}
      {activeTab === 'kyc' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>HR Document Verification Desk</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Verify candidate uploaded government IDs, compare OCR reads, and issue approval or structured rejection notes.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
            {employee.kycDocuments?.map((doc) => {
              const isVerified = doc.verificationStatus === 'VERIFIED';
              const isRejected = doc.verificationStatus === 'REJECTED';
              const isPending = !isVerified && !isRejected;

              return (
                <div
                  key={doc.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: isVerified ? '1px solid var(--success-border)' : isRejected ? '1px solid var(--danger-border)' : '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
                        {doc.documentType}
                      </span>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '2px 0 0' }}>{doc.title}</h4>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: isVerified ? 'var(--success-light)' : isRejected ? 'var(--danger-light)' : '#fff7ed',
                        color: isVerified ? 'var(--success-text)' : isRejected ? 'var(--danger-text)' : '#c2410c',
                      }}
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>

                  {/* Document Preview Box */}
                  <div
                    style={{
                      height: '160px',
                      backgroundColor: 'var(--bg-app)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <FileText size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{doc.idNumberMasked}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      MIME: {doc.mimeType} • Size: {doc.fileSize} • OCR Match: {doc.ocrConfidence}%
                    </div>
                  </div>

                  {isRejected && doc.rejectionReason && (
                    <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '12px', marginBottom: '14px' }}>
                      <strong>Rejection Note:</strong> {doc.rejectionReason}
                    </div>
                  )}

                  {isVerified && (
                    <div style={{ fontSize: '11px', color: 'var(--success-text)', marginBottom: '14px' }}>
                      ✓ Verified by {doc.verifiedBy} on {new Date(doc.verifiedAt).toLocaleDateString()}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleApproveKyc(doc.id)}
                      disabled={isVerified}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: isVerified ? 'var(--bg-muted)' : 'var(--success)',
                        color: isVerified ? 'var(--text-muted)' : '#ffffff',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: isVerified ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>{isVerified ? 'Approved' : 'Approve KYC'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedKycDoc(doc);
                        setRejectModalOpen(true);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--danger)',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: '1px solid var(--danger-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: LEGAL DOCUMENT STUDIO ================= */}
      {activeTab === 'documents' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Automated Legal Document Studio</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Instant dynamic document rendering with automatic variable injection and anti-leak watermarking.
              </p>
            </div>
          </div>

          {/* Quick Legal Generator Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {[
              {
                type: 'APPOINTMENT_LETTER',
                title: 'Offer & Appointment Letter',
                desc: 'Includes probation, notice periods, band levels, and compensation terms.',
                color: 'var(--primary)',
              },
              {
                type: 'NDA_IP_AGREEMENT',
                title: 'NDA & IP Assignment',
                desc: 'Client source code protection, non-solicit covenants, and work-for-hire assignment.',
                color: '#7c3aed',
              },
              {
                type: 'SALARY_ANNEXURE',
                title: 'Annexure A - CTC Structure',
                desc: 'Itemized Basic, HRA, Retirals, PF Employer, PT, and Net Take-Home pay.',
                color: '#059669',
              },
              {
                type: 'RELIEVING_LETTER',
                title: 'Relieving & Experience Certificate',
                desc: 'Official offboarding certificate, clear tenure confirmation, and F&F settlement.',
                color: '#d97706',
              },
              {
                type: 'CODE_OF_CONDUCT',
                title: 'Code of Conduct & IT Policy',
                desc: 'MFA compliance, clean desk policies, and POSH anti-harassment standards.',
                color: '#0284c7',
              },
              {
                type: 'APPRAISAL_LETTER',
                title: 'Annual Appraisal & Revision',
                desc: 'Performance evaluation increment letter and revised compensation annexure.',
                color: '#db2777',
              },
            ].map((docItem) => (
              <div
                key={docItem.type}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '18px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px', color: docItem.color }}>
                    {docItem.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: '1.5' }}>
                    {docItem.desc}
                  </p>
                </div>
                <button
                  onClick={() => handleGenerateDocument(docItem.type)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid var(--primary-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} />
                  <span>Generate Document</span>
                </button>
              </div>
            ))}
          </div>

          {/* Historical Generated Documents Register */}
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Issued & Executed Legal Documents</h4>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 16px' }}>Document Category</th>
                  <th style={{ padding: '12px 16px' }}>Title</th>
                  <th style={{ padding: '12px 16px' }}>Issued Date</th>
                  <th style={{ padding: '12px 16px' }}>Execution Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {employee.generatedDocuments?.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No legal documents generated yet. Use the generators above.
                    </td>
                  </tr>
                ) : (
                  employee.generatedDocuments?.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--primary)' }}>{item.category}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>{item.title}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{item.issuedDate}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#065f46' }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleGenerateDocument(item.category)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-strong)',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}
                        >
                          View / Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: IT ASSETS ================= */}
      {activeTab === 'assets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>IT Asset Provisioning & Hardware Tracking</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Track laptops, security keys, monitors, and return condition signoffs.
              </p>
            </div>
            <button
              onClick={() => setAssetModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>Allocate Hardware Asset</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {employee.assets?.map((ast) => {
              const isAllocated = ast.status === 'ALLOCATED' || ast.status === 'READY_FOR_DISPATCH';
              return (
                <div
                  key={ast.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '18px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                      {ast.assetTag}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: isAllocated ? '#ecfdf5' : 'var(--bg-muted)', color: isAllocated ? '#065f46' : 'var(--text-muted)' }}>
                      {ast.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px' }}>{ast.make}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    S/N: <strong style={{ fontFamily: 'var(--font-mono)' }}>{ast.serialNumber}</strong> • Condition: {ast.condition}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Allocated: {ast.allocatedAt} {ast.returnedAt ? `• Returned: ${ast.returnedAt}` : ''}
                  </div>

                  {isAllocated && (
                    <button
                      onClick={() => handleReturnAsset(ast.id)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-strong)',
                        backgroundColor: 'transparent',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Record Hardware Return
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 5: BGV TRACKING ================= */}
      {activeTab === 'bgv' && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Background Verification (BGV) Lifecycle</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Conducted by certified independent BGV agencies conforming to SOC2 and client compliance policies.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: employee.bgv?.overallStatus === 'CLEARED' ? 'var(--success)' : '#7c3aed' }}>
                Status: {employee.bgv?.overallStatus || 'PENDING'}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ref: {employee.bgv?.referenceId || 'N/A'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {employee.bgv?.checks?.map((chk, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <strong style={{ fontSize: '13px' }}>{chk.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified date: {chk.date || 'Pending verification'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: chk.status === 'CLEARED' ? '#ecfdf5' : '#f5f3ff',
                      color: chk.status === 'CLEARED' ? '#065f46' : '#6d28d9',
                    }}
                  >
                    {chk.status}
                  </span>
                  {chk.status !== 'CLEARED' && (
                    <button
                      onClick={() => handleAdvanceBgvCheck(chk.name)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Clear Check
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: PROBATION & PERFORMANCE ================= */}
      {activeTab === 'probation' && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Probation & Confirmation Review</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Employees in probation undergo 3-month and 6-month evaluations before transition to permanent active service.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Probation Period</span>
              <strong style={{ display: 'block', fontSize: '16px' }}>{employee.probationPeriodMonths} Months</strong>
            </div>
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Completion Date</span>
              <strong style={{ display: 'block', fontSize: '16px' }}>{employee.probationEndDate || 'N/A'}</strong>
            </div>
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confirmation Status</span>
              <strong style={{ display: 'block', fontSize: '16px', color: employee.confirmedAt ? 'var(--success)' : '#d97706' }}>
                {employee.confirmedAt ? 'CONFIRMED' : 'ON PROBATION'}
              </strong>
            </div>
          </div>

          {!employee.confirmedAt && (
            <button
              onClick={() => setProbationModalOpen(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: 'var(--success)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Sign Off Probation & Confirm Active</span>
            </button>
          )}
        </div>
      )}

      {/* ================= MODAL: LEGAL DOCUMENT PREVIEW ================= */}
      {docModalOpen && generatedDoc && (
        <Modal
          isOpen={docModalOpen}
          onClose={() => setDocModalOpen(false)}
          title={generatedDoc.title}
          maxWidth="900px"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Watermarked with: <strong style={{ color: 'var(--text-main)' }}>{generatedDoc.watermarkText}</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handlePrintDocument}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Printer size={14} />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>

          <div
            style={{
              maxHeight: '65vh',
              overflowY: 'auto',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '24px',
              backgroundColor: '#ffffff',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
            }}
            dangerouslySetInnerHTML={{ __html: generatedDoc.renderedHtml }}
          />
        </Modal>
      )}

      {/* ================= MODAL: KYC REJECT REASON ================= */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject ${selectedKycDoc?.documentType} Document`}
          maxWidth="500px"
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Specify the compliance discrepancy. The candidate will receive a notification to resubmit a corrected scan.
            </p>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                Preset Rejection Category:
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              >
                <option value="BLURRY_OR_ILLEGIBLE">Blurry or Illegible Text / Flash Glare</option>
                <option value="NAME_MISMATCH">Name Mismatch with Master Record</option>
                <option value="EXPIRED_DOCUMENT">Document Expired</option>
                <option value="MISSING_PAGES">Missing Front or Back Page</option>
                <option value="TAMPERED_SUSPECTED">Suspected Document Tampering</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                Custom Reviewer Instructions for Candidate:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please provide a clear flat scan without camera shadow over the date of birth."
                value={rejectionCustomNote}
                onChange={(e) => setRejectionCustomNote(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setRejectModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-strong)', backgroundColor: 'transparent', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectKyc}
                style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--danger)', color: '#ffffff', fontWeight: '700', border: 'none', cursor: 'pointer' }}
              >
                Confirm Rejection & Notify
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: ALLOCATE ASSET ================= */}
      {assetModalOpen && (
        <Modal
          isOpen={assetModalOpen}
          onClose={() => setAssetModalOpen(false)}
          title="Allocate IT Hardware Asset"
          maxWidth="500px"
        >
          <form onSubmit={handleAllocateAsset}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Asset Category</label>
                <select
                  value={newAssetData.type}
                  onChange={(e) => setNewAssetData({ ...newAssetData, type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                >
                  <option value="LAPTOP">Laptop Workstation</option>
                  <option value="MONITOR">4K External Monitor</option>
                  <option value="SECURITY_KEY">Hardware Security Key (YubiKey)</option>
                  <option value="ACCESS_BADGE">Building RFID Access Badge</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Make & Specifications *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple MacBook Pro 16 M3 Max / Dell Precision"
                  value={newAssetData.make}
                  onChange={(e) => setNewAssetData({ ...newAssetData, make: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Hardware Serial Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C02G994411KL"
                  value={newAssetData.serialNumber}
                  onChange={(e) => setNewAssetData({ ...newAssetData, serialNumber: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Asset Inventory Tag (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. DASA-LAP-2026-099"
                  value={newAssetData.assetTag}
                  onChange={(e) => setNewAssetData({ ...newAssetData, assetTag: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setAssetModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-strong)', backgroundColor: 'transparent', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700', border: 'none', cursor: 'pointer' }}
              >
                Confirm Allocation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: CONFIRM PROBATION ================= */}
      {probationModalOpen && (
        <Modal
          isOpen={probationModalOpen}
          onClose={() => setProbationModalOpen(false)}
          title="Sign Off Probation & Confirm Active Employment"
          maxWidth="500px"
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Confirm that {employee.fullName} has successfully completed their contractual probation period and met performance deliverables.
            </p>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                Appraisal / Evaluation Remarks:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Technical architectural deliverables completed on time. Exceeds expectations."
                value={probationRemarks}
                onChange={(e) => setProbationRemarks(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setProbationModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-strong)', backgroundColor: 'transparent', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmProbation}
                style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--success)', color: '#ffffff', fontWeight: '700', border: 'none', cursor: 'pointer' }}
              >
                Confirm Active Employment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
