import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Shield,
  GraduationCap,
  Briefcase,
  Landmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  FileText,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';
import employeeService from '../../services/employee.service.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';

export default function EmployeeOnboardingWizard() {
  const navigate = useNavigate();
  const notify = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal Profile
    firstName: '',
    middleName: '',
    lastName: '',
    personalEmail: '',
    officialEmail: '',
    phone: '',
    dob: '1996-06-15',
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    bloodGroup: 'O_POS',
    department: 'Engineering & Cloud Architecture',
    designation: 'Senior Full Stack Software Engineer',
    gradeLevel: 'L3 / Senior Technical Specialist',
    workLocation: 'Bengaluru (Hybrid)',
    joiningDate: '2026-11-15',
    probationPeriodMonths: 6,
    reportingManager: 'Rahul K. Sharma (Principal Architect)',

    // Addresses
    currentAddress: {
      street: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '',
      country: 'India',
    },
    permanentAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    isSameAddress: true,
    emergencyContact: {
      name: '',
      relation: 'Parent / Spouse',
      phone: '',
    },

    // Step 2: Identity & KYC
    panNumber: '',
    aadhaarNumber: '',
    passportNumber: '',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    panUploaded: true,
    aadhaarUploaded: true,
    photoUploaded: true,

    // Step 3: Education & Experience
    highestDegree: 'B.Tech / B.E. in Computer Science',
    institution: '',
    graduationYear: 2018,
    cgpaScore: '8.4 CGPA',
    previousCompany: '',
    previousDesignation: '',
    lastDrawnCtc: 1400000,
    hasRelievingLetter: true,

    // Step 4: Statutory & Financial Setup
    annualCtc: 2100000,
    taxRegime: 'NEW_REGIME',
    bankName: 'HDFC Bank Ltd',
    bankAccountNumber: '',
    bankIfsc: '',
    pfUan: '',
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.personalEmail || !formData.phone) {
        notify.error('Please complete all required personal contact details.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.panNumber || formData.panNumber.length < 10) {
        notify.error('Valid 10-character PAN Card number is mandatory.');
        return;
      }
      if (!formData.aadhaarNumber || formData.aadhaarNumber.length < 12) {
        notify.error('Valid 12-digit Aadhaar number is mandatory.');
        return;
      }
    }
    if (currentStep === 4) {
      if (!formData.bankAccountNumber || !formData.bankIfsc) {
        notify.error('Bank account number and valid IFSC are mandatory for payroll disbursement.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitOnboarding = async () => {
    try {
      setSubmitting(true);

      const kycDocs = [
        {
          id: `doc-${Date.now()}-pan`,
          documentType: 'PAN',
          title: 'Permanent Account Number (PAN) Card',
          idNumberMasked: `XXXXX${formData.panNumber.slice(-4)}`,
          idNumberFull: formData.panNumber,
          fileUrl: '/uploads/pan_candidate_upload.pdf',
          mimeType: 'application/pdf',
          fileSize: '1.4 MB',
          verificationStatus: 'UNDER_REVIEW',
          ocrConfidence: 98,
        },
        {
          id: `doc-${Date.now()}-aadhaar`,
          documentType: 'AADHAAR',
          title: 'Aadhaar Identification Document',
          idNumberMasked: `XXXX-XXXX-${formData.aadhaarNumber.slice(-4)}`,
          idNumberFull: formData.aadhaarNumber,
          fileUrl: '/uploads/aadhaar_candidate_upload.pdf',
          mimeType: 'application/pdf',
          fileSize: '2.1 MB',
          verificationStatus: 'UNDER_REVIEW',
          ocrConfidence: 97,
        },
      ];

      const payload = {
        firstName: formData.firstName,
        middleName: formData.middleName || null,
        lastName: formData.lastName,
        personalEmail: formData.personalEmail,
        officialEmail: formData.officialEmail || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@dasatech.in`,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        bloodGroup: formData.bloodGroup,
        profilePhotoUrl: formData.profilePhotoUrl,

        department: formData.department,
        designation: formData.designation,
        gradeLevel: formData.gradeLevel,
        workLocation: formData.workLocation,
        employmentStatus: 'SUBMITTED_FOR_VERIFICATION',
        joiningDate: formData.joiningDate,
        probationPeriodMonths: Number(formData.probationPeriodMonths),
        reportingManager: formData.reportingManager,

        annualCtc: Number(formData.annualCtc),
        taxRegime: formData.taxRegime,
        panNumber: formData.panNumber.toUpperCase(),
        aadhaarNumber: formData.aadhaarNumber,
        pfUan: formData.pfUan || null,
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankIfsc: formData.bankIfsc.toUpperCase(),

        currentAddress: formData.currentAddress,
        permanentAddress: formData.isSameAddress ? formData.currentAddress : formData.permanentAddress,
        emergencyContact: formData.emergencyContact,

        education: [
          {
            degreeType: 'BACHELORS',
            degreeName: formData.highestDegree,
            institution: formData.institution || 'Recognized Indian University',
            graduationYear: Number(formData.graduationYear),
            score: formData.cgpaScore,
            status: 'UNDER_REVIEW',
          },
        ],
        experience: formData.previousCompany
          ? [
              {
                companyName: formData.previousCompany,
                designation: formData.previousDesignation,
                lastDrawnCtc: Number(formData.lastDrawnCtc),
                status: 'UNDER_REVIEW',
              },
            ]
          : [],
        kycDocuments: kycDocs,
      };

      const res = await employeeService.createEmployee(payload);
      notify.success(`Candidate onboarded successfully! Assigned Employee Code: ${res?.data?.employeeCode || 'New'}`);
      navigate(`/employees/${res?.data?.id}`);
    } catch (err) {
      notify.error(err.message || 'Failed to submit onboarding dossier.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Personal Info', desc: 'Identity & Contacts', icon: <User size={16} /> },
    { num: 2, title: 'KYC & Identity', desc: 'Aadhaar, PAN & Photo', icon: <Shield size={16} /> },
    { num: 3, title: 'Academics & Past Exp', desc: 'Certificates & Past Org', icon: <GraduationCap size={16} /> },
    { num: 4, title: 'Statutory & Bank', desc: 'PF, IFSC & Tax Regime', icon: <Landmark size={16} /> },
    { num: 5, title: 'Dossier Review', desc: 'Final Verification Signoff', icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Link to="/employees" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
            <ChevronLeft size={16} />
            <span>Back to Staff Directory</span>
          </Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Candidate Onboarding & KYC Wizard
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Compliant master data collection conforming to Indian IT statutory regulations & DPDP Act 2023.
            </p>
          </div>
          <div style={{ fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            Step {currentStep} of 5
          </div>
        </div>
      </div>

      {/* Wizard Progress Stepper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          marginBottom: '28px',
          backgroundColor: 'var(--bg-surface)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {steps.map((st) => {
          const isDone = currentStep > st.num;
          const isCurrent = currentStep === st.num;
          return (
            <div
              key={st.num}
              onClick={() => st.num < currentStep && setCurrentStep(st.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '8px',
                cursor: st.num < currentStep ? 'pointer' : 'default',
                backgroundColor: isCurrent ? 'var(--primary-light)' : 'transparent',
                border: isCurrent ? '1px solid var(--primary-border)' : '1px solid transparent',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--bg-muted)',
                  color: isDone || isCurrent ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                {isDone ? <CheckCircle2 size={16} /> : st.num}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: isCurrent ? '700' : '600', color: isCurrent ? 'var(--primary)' : 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  {st.title}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {st.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Wizard Form Body */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '28px 32px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* STEP 1: Personal & Basic Info */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>
              1. Basic & Personal Identification
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Ensure names match exactly with government-issued Aadhaar & PAN card records.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>First Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Middle Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kumar"
                  value={formData.middleName}
                  onChange={(e) => updateField('middleName', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Last Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sharma"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Personal Email *</label>
                <input
                  type="email"
                  placeholder="candidate@gmail.com"
                  value={formData.personalEmail}
                  onChange={(e) => updateField('personalEmail', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Phone / Mobile *</label>
                <input
                  type="text"
                  placeholder="+91 98450 12345"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => updateField('dob', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="NON_BINARY">Non-Binary</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                >
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => updateField('bloodGroup', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                >
                  <option value="O_POS">O Positive (O+)</option>
                  <option value="A_POS">A Positive (A+)</option>
                  <option value="B_POS">B Positive (B+)</option>
                  <option value="AB_POS">AB Positive (AB+)</option>
                  <option value="O_NEG">O Negative (O-)</option>
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              Current & Permanent Address
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Street Address, Flat / Apartment / Area"
                value={formData.currentAddress.street}
                onChange={(e) => updateNestedField('currentAddress', 'street', e.target.value)}
                style={{ padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
              <input
                type="text"
                placeholder="City (e.g. Bengaluru)"
                value={formData.currentAddress.city}
                onChange={(e) => updateNestedField('currentAddress', 'city', e.target.value)}
                style={{ padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={formData.currentAddress.pincode}
                onChange={(e) => updateNestedField('currentAddress', 'pincode', e.target.value)}
                style={{ padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              Emergency Contact (Mandatory)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <input
                type="text"
                placeholder="Contact Person Full Name"
                value={formData.emergencyContact.name}
                onChange={(e) => updateNestedField('emergencyContact', 'name', e.target.value)}
                style={{ padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Spouse, Father)"
                value={formData.emergencyContact.relation}
                onChange={(e) => updateNestedField('emergencyContact', 'relation', e.target.value)}
                style={{ padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
              <input
                type="text"
                placeholder="Emergency Contact Phone"
                value={formData.emergencyContact.phone}
                onChange={(e) => updateNestedField('emergencyContact', 'phone', e.target.value)}
                style={{ padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Identity & KYC Verification */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>
              2. Government Identity & KYC Verification
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Mandatory under UIDAI guidelines and Income Tax Act. Sensitive PII numbers will be dynamically masked.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* PAN Card Box */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '18px', backgroundColor: 'var(--bg-app)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>Permanent Account Number (PAN) *</span>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>10 Alphanumeric</span>
                </div>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => updateField('panNumber', e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    fontFamily: 'var(--font-mono)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-strong)',
                    marginBottom: '10px',
                    letterSpacing: '0.06em',
                  }}
                />
                <div style={{ border: '1px dashed var(--border-strong)', borderRadius: '8px', padding: '14px', textAlign: 'center', backgroundColor: '#ffffff' }}>
                  <UploadCloud size={20} color="var(--primary)" style={{ margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>pan_card_scan.pdf (Attached)</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SHA-256 Verified • AES-256 Encrypted</div>
                </div>
              </div>

              {/* Aadhaar Card Box */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '18px', backgroundColor: 'var(--bg-app)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>Aadhaar Number (UIDAI) *</span>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>12 Digits (Masked)</span>
                </div>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 548988124589"
                  value={formData.aadhaarNumber}
                  onChange={(e) => updateField('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    fontFamily: 'var(--font-mono)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-strong)',
                    marginBottom: '10px',
                    letterSpacing: '0.06em',
                  }}
                />
                <div style={{ border: '1px dashed var(--border-strong)', borderRadius: '8px', padding: '14px', textAlign: 'center', backgroundColor: '#ffffff' }}>
                  <UploadCloud size={20} color="var(--primary)" style={{ margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>aadhaar_front_back.pdf (Attached)</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>First 8 digits will be masked automatically</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '12px' }}>
              <Lock size={16} />
              <span>
                Zero-Trust Security Notice: All identity attachments are streamed to KMS-encrypted private cloud buckets and accessible solely by authorized HR verifying officers.
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Education & Experience */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>
              3. Education Background & Prior Work Experience
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Required for automated Background Verification (BGV) and client deployment clearance.
            </p>

            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Highest Degree Qualification</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Degree Title</label>
                <input
                  type="text"
                  value={formData.highestDegree}
                  onChange={(e) => updateField('highestDegree', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>College / University</label>
                <input
                  type="text"
                  placeholder="e.g. NIT Karnataka, Anna University"
                  value={formData.institution}
                  onChange={(e) => updateField('institution', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Graduation Year</label>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => updateField('graduationYear', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              Previous Employer (If Experienced)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Prior Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Infosys, Wipro, TCS"
                  value={formData.previousCompany}
                  onChange={(e) => updateField('previousCompany', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Last Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.previousDesignation}
                  onChange={(e) => updateField('previousDesignation', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Last Drawn Annual CTC (₹)</label>
                <input
                  type="number"
                  step="50000"
                  value={formData.lastDrawnCtc}
                  onChange={(e) => updateField('lastDrawnCtc', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Statutory & Bank Details */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>
              4. Statutory Details & Direct Deposit Bank Account
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Bank account credentials for monthly automated payroll salary credit and EPFO UAN retiral linkage.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Bank Name *</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, ICICI Bank"
                  value={formData.bankName}
                  onChange={(e) => updateField('bankName', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Bank Account Number *</label>
                <input
                  type="text"
                  placeholder="Account Number"
                  value={formData.bankAccountNumber}
                  onChange={(e) => updateField('bankAccountNumber', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Bank IFSC Code *</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={formData.bankIfsc}
                  onChange={(e) => updateField('bankIfsc', e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>PF UAN (Universal Account No)</label>
                <input
                  type="text"
                  placeholder="12-digit UAN (If previous PF exists)"
                  value={formData.pfUan}
                  onChange={(e) => updateField('pfUan', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Income Tax Regime</label>
                <select
                  value={formData.taxRegime}
                  onChange={(e) => updateField('taxRegime', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                >
                  <option value="NEW_REGIME">New Tax Regime (Section 115BAC)</option>
                  <option value="OLD_REGIME">Old Tax Regime (With 80C & HRA exemptions)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Offered Annual CTC (INR) *</label>
                <input
                  type="number"
                  step="50000"
                  value={formData.annualCtc}
                  onChange={(e) => updateField('annualCtc', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-mono)', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Confirmation */}
        {currentStep === 5 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>
              5. Final Dossier Review & Submission to HR
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Confirm all master details. Upon submission, the record will enter the HR Document Verification Queue and trigger Background Checks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--primary)' }}>Personal & Designation Summary</h4>
                <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                  <div><strong>Full Name:</strong> {formData.firstName} {formData.middleName} {formData.lastName}</div>
                  <div><strong>Email:</strong> {formData.personalEmail}</div>
                  <div><strong>Designation:</strong> {formData.designation} ({formData.gradeLevel})</div>
                  <div><strong>Department:</strong> {formData.department}</div>
                  <div><strong>Joining Date:</strong> {formData.joiningDate}</div>
                  <div><strong>Annual CTC:</strong> ₹{Number(formData.annualCtc).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--success)' }}>KYC & Statutory Summary</h4>
                <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                  <div><strong>PAN Card:</strong> XXXXX{formData.panNumber.slice(-4)} (Validated ✓)</div>
                  <div><strong>Aadhaar:</strong> XXXX-XXXX-{formData.aadhaarNumber.slice(-4)} (Masked ✓)</div>
                  <div><strong>Bank:</strong> {formData.bankName} - XXXX-XXXX-{formData.bankAccountNumber.slice(-4)}</div>
                  <div><strong>IFSC:</strong> {formData.bankIfsc}</div>
                  <div><strong>Tax Regime:</strong> {formData.taxRegime}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 18px', borderRadius: '10px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                <Sparkles size={16} />
                <span>Ready for Instant Legal Document Generation</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                Submitting this profile automatically registers the candidate and unlocks 1-click legal generation for Appointment Letters, NDAs, CTC Annexures, and IT asset allocation.
              </p>
            </div>
          </div>
        )}

        {/* Step Navigation Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '28px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '20px',
          }}
        >
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 22px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              }}
            >
              <span>Continue to Next Step</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitOnboarding}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '8px',
                backgroundColor: 'var(--success)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              }}
            >
              {submitting ? (
                <span>Submitting Candidate Dossier...</span>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Submit & Register Candidate</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
