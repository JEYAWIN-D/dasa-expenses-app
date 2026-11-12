import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logAudit } from '../../utils/audit.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../database/data');
const DATA_FILE = path.join(DATA_DIR, 'employees.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed dataset representing realistic IT Services & Consulting organization
const INITIAL_SEED_EMPLOYEES = [
  {
    id: 'emp-uuid-001',
    employeeCode: 'ITS-2024-001',
    firstName: 'Rahul',
    middleName: 'K.',
    lastName: 'Sharma',
    fullName: 'Rahul K. Sharma',
    personalEmail: 'rahul.sharma.dev@gmail.com',
    officialEmail: 'rahul.sharma@dasatech.in',
    phone: '+91 98450 12345',
    phoneMasked: '+91 98450 XX345',
    dob: '1990-05-14',
    dobDmy: '14-05-1990',
    gender: 'MALE',
    maritalStatus: 'MARRIED',
    bloodGroup: 'O_POS',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    digitalSignatureUrl: 'https://placehold.co/200x60/png?text=Rahul+Sharma',
    
    // Org & Role
    department: 'Engineering & Cloud Architecture',
    designation: 'Principal Software Architect',
    gradeLevel: 'L5 / Director Band',
    workLocation: 'Bengaluru (Hybrid)',
    employmentStatus: 'CONFIRMED_ACTIVE',
    joiningDate: '2023-04-10',
    probationPeriodMonths: 6,
    probationEndDate: '2023-10-10',
    confirmedAt: '2023-10-10',
    reportingManager: 'Venkatesh Rao (CTO)',
    
    // Compensation & Statutory
    annualCtc: 3200000,
    annualCtcWords: 'Thirty-Two Lakhs Rupees Only',
    taxRegime: 'NEW_REGIME',
    statutory: {
      panNumber: 'ABCPS1234F',
      panMasked: 'XXXXX1234F',
      aadhaarNumber: '548988124589',
      aadhaarMasked: 'XXXX-XXXX-4589',
      pfUan: '100984512390',
      pfUanMasked: 'XXXX-XXXX-2390',
      esiNumber: null,
      bankName: 'HDFC Bank Ltd',
      bankAccountNumber: '50100234567890',
      bankAccountMasked: 'XXXX-XXXX-7890',
      bankIfsc: 'HDFC0001234',
    },
    
    // Addresses
    currentAddress: {
      street: 'Flat 402, Prestige Palms, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      country: 'India',
    },
    permanentAddress: {
      street: 'Flat 402, Prestige Palms, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      country: 'India',
    },
    emergencyContact: {
      name: 'Pooja Sharma',
      relation: 'Spouse',
      phone: '+91 98450 99887',
    },

    // Education & Past Experience
    education: [
      {
        degreeType: 'BACHELORS',
        degreeName: 'B.Tech in Computer Science & Engineering',
        institution: 'National Institute of Technology, Karnataka (NITK)',
        graduationYear: 2012,
        score: '8.8 CGPA',
        documentUrl: '/docs/rahul_btech_degree.pdf',
        status: 'VERIFIED',
      },
    ],
    experience: [
      {
        companyName: 'Infosys Technologies Ltd',
        designation: 'Senior Lead Specialist',
        startDate: '2018-06-01',
        endDate: '2023-03-31',
        lastDrawnCtc: 2400000,
        hrContact: 'verifications@infosys.com',
        documents: ['relieving_letter.pdf', 'experience_cert.pdf'],
        status: 'VERIFIED',
      },
    ],

    // KYC Documents
    kycDocuments: [
      {
        id: 'doc-1',
        documentType: 'PAN',
        title: 'PAN Card Card Copy',
        idNumberMasked: 'XXXXX1234F',
        idNumberFull: 'ABCPS1234F',
        fileUrl: '/uploads/pan_rahul.pdf',
        mimeType: 'application/pdf',
        fileSize: '1.2 MB',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'hr.operations@dasatech.in',
        verifiedAt: '2023-04-12T10:30:00Z',
        ocrConfidence: 99,
        rejectionReason: null,
      },
      {
        id: 'doc-2',
        documentType: 'AADHAAR',
        title: 'Aadhaar Card (Masked e-Aadhaar)',
        idNumberMasked: 'XXXX-XXXX-4589',
        idNumberFull: '548988124589',
        fileUrl: '/uploads/aadhaar_rahul.pdf',
        mimeType: 'application/pdf',
        fileSize: '1.8 MB',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'hr.operations@dasatech.in',
        verifiedAt: '2023-04-12T10:32:00Z',
        ocrConfidence: 98,
        rejectionReason: null,
      },
    ],

    // BGV Lifecycle
    bgv: {
      overallStatus: 'CLEARED',
      agency: 'AuthBridge Global Solutions',
      referenceId: 'AB-2023-89410',
      initiatedAt: '2023-04-02',
      completedAt: '2023-04-09',
      checks: [
        { name: 'Identity & Criminal Database Check', status: 'CLEARED', date: '2023-04-05' },
        { name: 'Highest Educational Verification', status: 'CLEARED', date: '2023-04-07' },
        { name: 'Past 5-Year Employment & Conduct', status: 'CLEARED', date: '2023-04-09' },
      ],
      reportUrl: '/bgv/reports/AB-2023-89410_Rahul_Cleared.pdf',
    },

    // IT Asset Allocation
    assets: [
      {
        id: 'ast-1',
        assetTag: 'DASA-LAP-2023-088',
        type: 'LAPTOP',
        make: 'Apple MacBook Pro 16" M2 Max (32GB / 1TB)',
        serialNumber: 'C02G9988MD6R',
        allocatedAt: '2023-04-10',
        condition: 'BRAND_NEW_SEALED',
        status: 'ALLOCATED',
        acknowledgedByEmployee: true,
      },
      {
        id: 'ast-2',
        assetTag: 'DASA-KEY-2023-014',
        type: 'SECURITY_KEY',
        make: 'Yubico YubiKey 5C NFC',
        serialNumber: 'YK-9948210',
        allocatedAt: '2023-04-10',
        condition: 'BRAND_NEW',
        status: 'ALLOCATED',
        acknowledgedByEmployee: true,
      },
    ],

    // Generated Legal Documents
    generatedDocuments: [
      {
        id: 'doc-gen-1',
        category: 'APPOINTMENT_LETTER',
        title: 'Executive Appointment & Terms of Employment',
        issuedDate: '2023-04-01',
        eSignedAt: '2023-04-02T11:00:00Z',
        storageKey: '/legal/appointments/DASA_APT_2023_001.pdf',
        status: 'SIGNED',
      },
      {
        id: 'doc-gen-2',
        category: 'NDA_IP_AGREEMENT',
        title: 'Non-Disclosure & Intellectual Property Assignment',
        issuedDate: '2023-04-10',
        eSignedAt: '2023-04-10T09:15:00Z',
        storageKey: '/legal/nda/DASA_NDA_2023_001.pdf',
        status: 'SIGNED',
      },
    ],

    createdAt: '2023-04-01T08:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'emp-uuid-002',
    employeeCode: 'ITS-2024-002',
    firstName: 'Priya',
    middleName: 'M.',
    lastName: 'Sundaram',
    fullName: 'Priya M. Sundaram',
    personalEmail: 'priya.sundaram.dev@gmail.com',
    officialEmail: 'priya.sundaram@dasatech.in',
    phone: '+91 97401 54321',
    phoneMasked: '+91 97401 XX321',
    dob: '1995-11-20',
    dobDmy: '20-11-1995',
    gender: 'FEMALE',
    maritalStatus: 'SINGLE',
    bloodGroup: 'B_POS',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    digitalSignatureUrl: 'https://placehold.co/200x60/png?text=Priya+Sundaram',

    department: 'DevOps & Site Reliability',
    designation: 'Senior Cloud & DevOps Engineer',
    gradeLevel: 'L3 / Senior Technical Specialist',
    workLocation: 'Bengaluru (Hybrid)',
    employmentStatus: 'ACTIVE_PROBATION',
    joiningDate: '2026-08-01',
    probationPeriodMonths: 3,
    probationEndDate: '2026-11-01',
    confirmedAt: null,
    reportingManager: 'Rahul K. Sharma (Principal Architect)',

    annualCtc: 2100000,
    annualCtcWords: 'Twenty-One Lakhs Rupees Only',
    taxRegime: 'NEW_REGIME',
    statutory: {
      panNumber: 'BGKPS7762H',
      panMasked: 'XXXXX7762H',
      aadhaarNumber: '891044237891',
      aadhaarMasked: 'XXXX-XXXX-7891',
      pfUan: '101299887711',
      pfUanMasked: 'XXXX-XXXX-7711',
      esiNumber: null,
      bankName: 'ICICI Bank Ltd',
      bankAccountNumber: '002901588722',
      bankAccountMasked: 'XXXX-XXXX-8722',
      bankIfsc: 'ICIC0000029',
    },

    currentAddress: {
      street: '12th Cross, HSR Layout Sector 3',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102',
      country: 'India',
    },
    permanentAddress: {
      street: '12th Cross, HSR Layout Sector 3',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102',
      country: 'India',
    },
    emergencyContact: {
      name: 'Murugan Sundaram',
      relation: 'Father',
      phone: '+91 94440 12345',
    },

    education: [
      {
        degreeType: 'BACHELORS',
        degreeName: 'B.E. in Electronics & Communication',
        institution: 'PSG College of Technology, Coimbatore',
        graduationYear: 2017,
        score: '8.4 CGPA',
        documentUrl: '/docs/priya_degree.pdf',
        status: 'VERIFIED',
      },
    ],
    experience: [
      {
        companyName: 'Wipro Limited',
        designation: 'Senior Systems Engineer',
        startDate: '2021-02-01',
        endDate: '2026-07-15',
        lastDrawnCtc: 1550000,
        hrContact: 'talent.bgv@wipro.com',
        documents: ['relieving.pdf', 'payslip.pdf'],
        status: 'VERIFIED',
      },
    ],

    kycDocuments: [
      {
        id: 'doc-3',
        documentType: 'PAN',
        title: 'PAN Card Copy',
        idNumberMasked: 'XXXXX7762H',
        idNumberFull: 'BGKPS7762H',
        fileUrl: '/uploads/pan_priya.pdf',
        mimeType: 'application/pdf',
        fileSize: '1.4 MB',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'hr.operations@dasatech.in',
        verifiedAt: '2026-08-03T14:20:00Z',
        ocrConfidence: 97,
        rejectionReason: null,
      },
      {
        id: 'doc-4',
        documentType: 'AADHAAR',
        title: 'Masked Aadhaar Card Copy',
        idNumberMasked: 'XXXX-XXXX-7891',
        idNumberFull: '891044237891',
        fileUrl: '/uploads/aadhaar_priya.pdf',
        mimeType: 'application/pdf',
        fileSize: '2.1 MB',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'hr.operations@dasatech.in',
        verifiedAt: '2026-08-03T14:22:00Z',
        ocrConfidence: 99,
        rejectionReason: null,
      },
    ],

    bgv: {
      overallStatus: 'CLEARED',
      agency: 'IDfy Background Technologies',
      referenceId: 'IDFY-2026-9042',
      initiatedAt: '2026-07-20',
      completedAt: '2026-07-28',
      checks: [
        { name: 'National Identity Check (Aadhaar & PAN)', status: 'CLEARED', date: '2026-07-22' },
        { name: 'Education Credential Verification', status: 'CLEARED', date: '2026-07-25' },
        { name: 'Prior Employer HR Verification', status: 'CLEARED', date: '2026-07-28' },
      ],
      reportUrl: '/bgv/reports/Priya_Cleared.pdf',
    },

    assets: [
      {
        id: 'ast-3',
        assetTag: 'DASA-LAP-2026-104',
        type: 'LAPTOP',
        make: 'Lenovo ThinkPad P14s Gen 4 (AMD Ryzen 7 PRO / 32GB / 1TB)',
        serialNumber: 'PF-491299A',
        allocatedAt: '2026-08-01',
        condition: 'EXCELLENT',
        status: 'ALLOCATED',
        acknowledgedByEmployee: true,
      },
      {
        id: 'ast-4',
        assetTag: 'DASA-MON-2026-052',
        type: 'MONITOR',
        make: 'Dell UltraSharp 27" 4K USB-C Hub (U2723QE)',
        serialNumber: 'CN-09941-DELL',
        allocatedAt: '2026-08-01',
        condition: 'BRAND_NEW',
        status: 'ALLOCATED',
        acknowledgedByEmployee: true,
      },
    ],

    generatedDocuments: [
      {
        id: 'doc-gen-3',
        category: 'APPOINTMENT_LETTER',
        title: 'Employment Offer & Appointment Letter',
        issuedDate: '2026-07-15',
        eSignedAt: '2026-07-16T15:00:00Z',
        storageKey: '/legal/appointments/DASA_APT_2026_002.pdf',
        status: 'SIGNED',
      },
      {
        id: 'doc-gen-4',
        category: 'NDA_IP_AGREEMENT',
        title: 'Proprietary IP Assignment & Non-Disclosure Agreement',
        issuedDate: '2026-08-01',
        eSignedAt: '2026-08-01T10:00:00Z',
        storageKey: '/legal/nda/DASA_NDA_2026_002.pdf',
        status: 'SIGNED',
      },
    ],

    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-10-22T11:30:00Z',
  },
  {
    id: 'emp-uuid-003',
    employeeCode: 'ITS-2024-003',
    firstName: 'Vikram',
    middleName: null,
    lastName: 'Patel',
    fullName: 'Vikram Patel',
    personalEmail: 'vikram.patel.qa@gmail.com',
    officialEmail: 'vikram.patel@dasatech.in',
    phone: '+91 99002 88441',
    phoneMasked: '+91 99002 XX441',
    dob: '1993-08-25',
    dobDmy: '25-08-1993',
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    bloodGroup: 'A_POS',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    digitalSignatureUrl: 'https://placehold.co/200x60/png?text=Vikram+Patel',

    department: 'Quality Engineering & Testing',
    designation: 'QA Automation Lead',
    gradeLevel: 'L3 / Lead Specialist',
    workLocation: 'Bengaluru (On-site)',
    employmentStatus: 'SUBMITTED_FOR_VERIFICATION',
    joiningDate: '2026-11-03',
    probationPeriodMonths: 6,
    probationEndDate: '2027-05-03',
    confirmedAt: null,
    reportingManager: 'Rahul K. Sharma (Principal Architect)',

    annualCtc: 1850000,
    annualCtcWords: 'Eighteen Lakhs Fifty Thousand Rupees Only',
    taxRegime: 'NEW_REGIME',
    statutory: {
      panNumber: 'CPAPP4412K',
      panMasked: 'XXXXX4412K',
      aadhaarNumber: '772188401129',
      aadhaarMasked: 'XXXX-XXXX-1129',
      pfUan: '100411223399',
      pfUanMasked: 'XXXX-XXXX-3399',
      esiNumber: null,
      bankName: 'Axis Bank Ltd',
      bankAccountNumber: '9180200445511',
      bankAccountMasked: 'XXXX-XXXX-5511',
      bankIfsc: 'UTIB0000140',
    },

    currentAddress: {
      street: 'B-304, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      country: 'India',
    },
    permanentAddress: {
      street: 'Navrangpura, Near University Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380009',
      country: 'India',
    },
    emergencyContact: {
      name: 'Ramesh Patel',
      relation: 'Father',
      phone: '+91 98250 11223',
    },

    education: [
      {
        degreeType: 'BACHELORS',
        degreeName: 'B.E. in Information Technology',
        institution: 'Gujarat Technological University',
        graduationYear: 2015,
        score: '8.1 CGPA',
        documentUrl: '/docs/vikram_degree.pdf',
        status: 'UNDER_REVIEW',
      },
    ],
    experience: [
      {
        companyName: 'Mindtree Ltd',
        designation: 'Senior Test Engineer',
        startDate: '2019-07-01',
        endDate: '2026-10-15',
        lastDrawnCtc: 1350000,
        hrContact: 'experience@mindtree.com',
        documents: ['mindtree_relieving.pdf'],
        status: 'UNDER_REVIEW',
      },
    ],

    // KYC Documents pending HR review
    kycDocuments: [
      {
        id: 'doc-5',
        documentType: 'PAN',
        title: 'PAN Card Copy',
        idNumberMasked: 'XXXXX4412K',
        idNumberFull: 'CPAPP4412K',
        fileUrl: '/uploads/pan_vikram_scan.pdf',
        mimeType: 'application/pdf',
        fileSize: '1.9 MB',
        verificationStatus: 'UNDER_REVIEW',
        verifiedBy: null,
        verifiedAt: null,
        ocrConfidence: 96,
        rejectionReason: null,
      },
      {
        id: 'doc-6',
        documentType: 'AADHAAR',
        title: 'Aadhaar Card Front & Back',
        idNumberMasked: 'XXXX-XXXX-1129',
        idNumberFull: '772188401129',
        fileUrl: '/uploads/aadhaar_vikram_scan.pdf',
        mimeType: 'application/pdf',
        fileSize: '2.5 MB',
        verificationStatus: 'UNDER_REVIEW',
        verifiedBy: null,
        verifiedAt: null,
        ocrConfidence: 94,
        rejectionReason: null,
      },
      {
        id: 'doc-7',
        documentType: 'DEGREE_CERTIFICATE',
        title: 'B.E. Convocation Certificate',
        idNumberMasked: 'DEG-2015-8841',
        idNumberFull: 'DEG-2015-8841',
        fileUrl: '/uploads/degree_vikram.pdf',
        mimeType: 'application/pdf',
        fileSize: '3.1 MB',
        verificationStatus: 'PENDING',
        verifiedBy: null,
        verifiedAt: null,
        ocrConfidence: 92,
        rejectionReason: null,
      },
    ],

    bgv: {
      overallStatus: 'PENDING',
      agency: 'AuthBridge Global Solutions',
      referenceId: 'AB-2026-99120',
      initiatedAt: '2026-10-21',
      completedAt: null,
      checks: [
        { name: 'National Identity Check', status: 'IN_PROGRESS', date: '2026-10-21' },
        { name: 'Education Credential Verification', status: 'PENDING', date: null },
        { name: 'Past Employment Verification', status: 'PENDING', date: null },
      ],
      reportUrl: null,
    },

    assets: [],
    generatedDocuments: [
      {
        id: 'doc-gen-5',
        category: 'OFFER_LETTER',
        title: 'Formal Offer of Employment',
        issuedDate: '2026-10-18',
        eSignedAt: '2026-10-19T10:00:00Z',
        storageKey: '/legal/offers/DASA_OFFER_2026_003.pdf',
        status: 'SIGNED',
      },
    ],

    createdAt: '2026-10-18T07:30:00Z',
    updatedAt: '2026-10-22T14:00:00Z',
  },
  {
    id: 'emp-uuid-004',
    employeeCode: 'ITS-2024-004',
    firstName: 'Ananya',
    middleName: null,
    lastName: 'Roy',
    fullName: 'Ananya Roy',
    personalEmail: 'ananya.roy.design@gmail.com',
    officialEmail: 'ananya.roy@dasatech.in',
    phone: '+91 98300 44221',
    phoneMasked: '+91 98300 XX221',
    dob: '1996-03-12',
    dobDmy: '12-03-1996',
    gender: 'FEMALE',
    maritalStatus: 'SINGLE',
    bloodGroup: 'AB_POS',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    digitalSignatureUrl: 'https://placehold.co/200x60/png?text=Ananya+Roy',

    department: 'Product Design & Experience',
    designation: 'Senior Product Designer',
    gradeLevel: 'L3 / Design Lead',
    workLocation: 'Bengaluru (Hybrid)',
    employmentStatus: 'BGV_IN_PROGRESS',
    joiningDate: '2026-11-10',
    probationPeriodMonths: 3,
    probationEndDate: '2027-02-10',
    confirmedAt: null,
    reportingManager: 'Venkatesh Rao (CTO)',

    annualCtc: 1950000,
    annualCtcWords: 'Nineteen Lakhs Fifty Thousand Rupees Only',
    taxRegime: 'NEW_REGIME',
    statutory: {
      panNumber: 'AMRPR8831B',
      panMasked: 'XXXXX8831B',
      aadhaarNumber: '992144301128',
      aadhaarMasked: 'XXXX-XXXX-1128',
      pfUan: '100998877123',
      pfUanMasked: 'XXXX-XXXX-7123',
      esiNumber: null,
      bankName: 'State Bank of India',
      bankAccountNumber: '38820019441',
      bankAccountMasked: 'XXXX-XXXX-9441',
      bankIfsc: 'SBIN0004112',
    },

    currentAddress: {
      street: '7th Main, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India',
    },
    permanentAddress: {
      street: 'Salt Lake Sector 1',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700064',
      country: 'India',
    },
    emergencyContact: {
      name: 'Subhash Roy',
      relation: 'Father',
      phone: '+91 98310 99882',
    },

    education: [
      {
        degreeType: 'BACHELORS',
        degreeName: 'Bachelor of Design (Interaction Design)',
        institution: 'National Institute of Design (NID), Ahmedabad',
        graduationYear: 2018,
        score: '8.7 CGPA',
        documentUrl: '/docs/ananya_nid.pdf',
        status: 'VERIFIED',
      },
    ],
    experience: [
      {
        companyName: 'Swiggy (Bundl Technologies)',
        designation: 'Product Designer II',
        startDate: '2021-09-01',
        endDate: '2026-10-10',
        lastDrawnCtc: 1600000,
        hrContact: 'verifications@swiggy.in',
        documents: ['swiggy_relieving.pdf'],
        status: 'VERIFIED',
      },
    ],

    kycDocuments: [
      {
        id: 'doc-8',
        documentType: 'PAN',
        title: 'PAN Card Copy',
        idNumberMasked: 'XXXXX8831B',
        idNumberFull: 'AMRPR8831B',
        fileUrl: '/uploads/pan_ananya.pdf',
        mimeType: 'application/pdf',
        fileSize: '1.7 MB',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'hr.operations@dasatech.in',
        verifiedAt: '2026-10-21T11:00:00Z',
        ocrConfidence: 98,
        rejectionReason: null,
      },
      {
        id: 'doc-9',
        documentType: 'AADHAAR',
        title: 'Aadhaar Card Copy',
        idNumberMasked: 'XXXX-XXXX-1128',
        idNumberFull: '992144301128',
        fileUrl: '/uploads/aadhaar_ananya.pdf',
        mimeType: 'application/pdf',
        fileSize: '2.0 MB',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'hr.operations@dasatech.in',
        verifiedAt: '2026-10-21T11:05:00Z',
        ocrConfidence: 99,
        rejectionReason: null,
      },
    ],

    bgv: {
      overallStatus: 'IN_PROGRESS',
      agency: 'IDfy Background Technologies',
      referenceId: 'IDFY-2026-10499',
      initiatedAt: '2026-10-21',
      completedAt: null,
      checks: [
        { name: 'National Identity Check', status: 'CLEARED', date: '2026-10-22' },
        { name: 'Highest Education Check (NID)', status: 'IN_PROGRESS', date: '2026-10-22' },
        { name: 'Employment Check (Swiggy)', status: 'IN_PROGRESS', date: '2026-10-22' },
      ],
      reportUrl: null,
    },

    assets: [
      {
        id: 'ast-5',
        assetTag: 'DASA-LAP-2026-118',
        type: 'LAPTOP',
        make: 'Apple MacBook Pro 14" M3 Pro (18GB / 512GB Space Black)',
        serialNumber: 'C02K9981LL7Q',
        allocatedAt: '2026-10-22',
        condition: 'BRAND_NEW_SEALED',
        status: 'READY_FOR_DISPATCH',
        acknowledgedByEmployee: false,
      },
    ],

    generatedDocuments: [
      {
        id: 'doc-gen-6',
        category: 'OFFER_LETTER',
        title: 'Offer of Employment',
        issuedDate: '2026-10-15',
        eSignedAt: '2026-10-16T12:00:00Z',
        storageKey: '/legal/offers/DASA_OFFER_2026_004.pdf',
        status: 'SIGNED',
      },
    ],

    createdAt: '2026-10-15T11:00:00Z',
    updatedAt: '2026-10-22T16:00:00Z',
  },
  {
    id: 'emp-uuid-005',
    employeeCode: 'ITS-2024-005',
    firstName: 'Sneha',
    middleName: null,
    lastName: 'Kulkarni',
    fullName: 'Sneha Kulkarni',
    personalEmail: 'sneha.kulkarni.ui@gmail.com',
    officialEmail: 'sneha.kulkarni@dasatech.in',
    phone: '+91 98231 66554',
    phoneMasked: '+91 98231 XX554',
    dob: '1998-04-18',
    dobDmy: '18-04-1998',
    gender: 'FEMALE',
    maritalStatus: 'SINGLE',
    bloodGroup: 'B_POS',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    digitalSignatureUrl: 'https://placehold.co/200x60/png?text=Sneha+Kulkarni',

    department: 'Frontend Engineering',
    designation: 'Frontend Engineer (React / TypeScript)',
    gradeLevel: 'L2 / Associate Specialist',
    workLocation: 'Pune (Remote)',
    employmentStatus: 'PRE_BOARDING',
    joiningDate: '2026-11-15',
    probationPeriodMonths: 6,
    probationEndDate: '2027-05-15',
    confirmedAt: null,
    reportingManager: 'Rahul K. Sharma (Principal Architect)',

    annualCtc: 1250000,
    annualCtcWords: 'Twelve Lakhs Fifty Thousand Rupees Only',
    taxRegime: 'NEW_REGIME',
    statutory: {
      panNumber: 'AZKPK9921M',
      panMasked: 'XXXXX9921M',
      aadhaarNumber: '448199201144',
      aadhaarMasked: 'XXXX-XXXX-1144',
      pfUan: '100887711244',
      pfUanMasked: 'XXXX-XXXX-1244',
      esiNumber: null,
      bankName: 'Kotak Mahindra Bank',
      bankAccountNumber: '9012445588',
      bankAccountMasked: 'XXXX-XXXX-5588',
      bankIfsc: 'KKBK0000958',
    },

    currentAddress: {
      street: 'Baner-Pashan Link Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411045',
      country: 'India',
    },
    permanentAddress: {
      street: 'Kothrud, Near Karve Statue',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
      country: 'India',
    },
    emergencyContact: {
      name: 'Ashok Kulkarni',
      relation: 'Father',
      phone: '+91 98220 99441',
    },

    education: [
      {
        degreeType: 'BACHELORS',
        degreeName: 'B.E. in Computer Engineering',
        institution: 'Pune Institute of Computer Technology (PICT)',
        graduationYear: 2020,
        score: '8.6 CGPA',
        documentUrl: '/docs/sneha_degree.pdf',
        status: 'PENDING',
      },
    ],
    experience: [
      {
        companyName: 'Persistent Systems',
        designation: 'Software Engineer',
        startDate: '2020-08-01',
        endDate: '2026-10-31',
        lastDrawnCtc: 850000,
        hrContact: 'hr@persistent.com',
        documents: ['persistent_offer.pdf'],
        status: 'PENDING',
      },
    ],

    kycDocuments: [
      {
        id: 'doc-10',
        documentType: 'PAN',
        title: 'PAN Card Copy',
        idNumberMasked: 'XXXXX9921M',
        idNumberFull: 'AZKPK9921M',
        fileUrl: '/uploads/pan_sneha.pdf',
        mimeType: 'application/pdf',
        fileSize: '1.5 MB',
        verificationStatus: 'PENDING',
        verifiedBy: null,
        verifiedAt: null,
        ocrConfidence: 95,
        rejectionReason: null,
      },
    ],

    bgv: {
      overallStatus: 'NOT_STARTED',
      agency: null,
      referenceId: null,
      initiatedAt: null,
      completedAt: null,
      checks: [],
      reportUrl: null,
    },

    assets: [],
    generatedDocuments: [
      {
        id: 'doc-gen-7',
        category: 'OFFER_LETTER',
        title: 'Offer Letter with CTC Breakup',
        issuedDate: '2026-10-20',
        eSignedAt: '2026-10-21T09:30:00Z',
        storageKey: '/legal/offers/DASA_OFFER_2026_005.pdf',
        status: 'SIGNED',
      },
    ],

    createdAt: '2026-10-20T08:00:00Z',
    updatedAt: '2026-10-21T10:00:00Z',
  },
  {
    id: 'emp-uuid-006',
    employeeCode: 'ITS-2024-006',
    firstName: 'Karthik',
    middleName: null,
    lastName: 'Raman',
    fullName: 'Karthik Raman',
    personalEmail: 'karthik.raman.cloud@gmail.com',
    officialEmail: 'karthik.raman@dasatech.in',
    phone: '+91 94441 88772',
    phoneMasked: '+91 94441 XX772',
    dob: '1992-01-30',
    dobDmy: '30-01-1992',
    gender: 'MALE',
    maritalStatus: 'MARRIED',
    bloodGroup: 'O_POS',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    digitalSignatureUrl: 'https://placehold.co/200x60/png?text=Karthik+Raman',

    department: 'Backend Engineering',
    designation: 'Senior Backend Go Developer',
    gradeLevel: 'L3 / Senior Technical Specialist',
    workLocation: 'Bengaluru (On-site)',
    employmentStatus: 'RELIEVED',
    joiningDate: '2022-01-10',
    probationPeriodMonths: 6,
    probationEndDate: '2022-07-10',
    confirmedAt: '2022-07-10',
    resignationDate: '2026-08-01',
    relievingDate: '2026-09-30',
    reportingManager: 'Rahul K. Sharma (Principal Architect)',

    annualCtc: 2400000,
    annualCtcWords: 'Twenty-Four Lakhs Rupees Only',
    taxRegime: 'OLD_REGIME',
    statutory: {
      panNumber: 'DKRPR1140P',
      panMasked: 'XXXXX1140P',
      aadhaarNumber: '662099124451',
      aadhaarMasked: 'XXXX-XXXX-4451',
      pfUan: '100114455882',
      pfUanMasked: 'XXXX-XXXX-5882',
      esiNumber: null,
      bankName: 'HDFC Bank Ltd',
      bankAccountNumber: '5010044991122',
      bankAccountMasked: 'XXXX-XXXX-1122',
      bankIfsc: 'HDFC0000053',
    },

    currentAddress: {
      street: 'Koramangala 4th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      country: 'India',
    },
    permanentAddress: {
      street: 'T. Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      country: 'India',
    },
    emergencyContact: {
      name: 'Deepa Raman',
      relation: 'Spouse',
      phone: '+91 94440 99881',
    },

    education: [
      {
        degreeType: 'BACHELORS',
        degreeName: 'B.Tech in Information Technology',
        institution: 'Anna University, Chennai',
        graduationYear: 2014,
        score: '8.3 CGPA',
        documentUrl: '/docs/karthik_degree.pdf',
        status: 'VERIFIED',
      },
    ],
    experience: [],
    kycDocuments: [
      {
        id: 'doc-11',
        documentType: 'PAN',
        title: 'PAN Card Copy',
        idNumberMasked: 'XXXXX1140P',
        idNumberFull: 'DKRPR1140P',
        fileUrl: '/uploads/pan_karthik.pdf',
        mimeType: 'application/pdf',
        fileSize: '1.2 MB',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'hr.operations@dasatech.in',
        verifiedAt: '2022-01-12T10:00:00Z',
        ocrConfidence: 99,
        rejectionReason: null,
      },
    ],
    bgv: {
      overallStatus: 'CLEARED',
      agency: 'AuthBridge Global Solutions',
      referenceId: 'AB-2022-10499',
      initiatedAt: '2022-01-05',
      completedAt: '2022-01-10',
      checks: [
        { name: 'Identity & Criminal Background', status: 'CLEARED', date: '2022-01-08' },
        { name: 'Educational Verification', status: 'CLEARED', date: '2022-01-09' },
      ],
      reportUrl: '/bgv/reports/Karthik_Cleared.pdf',
    },
    assets: [
      {
        id: 'ast-6',
        assetTag: 'DASA-LAP-2022-045',
        type: 'LAPTOP',
        make: 'Dell XPS 15 (i9 / 32GB / 1TB)',
        serialNumber: 'DL-994411X',
        allocatedAt: '2022-01-10',
        returnedAt: '2026-09-30',
        condition: 'RETURNED_IN_GOOD_CONDITION',
        status: 'RETURNED',
        acknowledgedByEmployee: true,
      },
    ],
    generatedDocuments: [
      {
        id: 'doc-gen-8',
        category: 'RELIEVING_LETTER',
        title: 'Relieving & Experience Certificate',
        issuedDate: '2026-09-30',
        eSignedAt: '2026-09-30T17:00:00Z',
        storageKey: '/legal/relieving/DASA_REL_2026_006.pdf',
        status: 'SIGNED',
      },
    ],
    createdAt: '2022-01-05T08:00:00Z',
    updatedAt: '2026-09-30T17:30:00Z',
  },
];

// Helper to read and write database file safely
function loadEmployeesData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_SEED_EMPLOYEES, null, 2), 'utf-8');
      return INITIAL_SEED_EMPLOYEES;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_EMPLOYEES;
  } catch (err) {
    console.error('Error loading employees data file, returning in-memory seed:', err);
    return INITIAL_SEED_EMPLOYEES;
  }
}

function saveEmployeesData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving employees data file:', err);
  }
}

// In-memory runtime cache synchronized with JSON
let employeesStore = loadEmployeesData();

// Indian Statutory Calculation Engine for CTC Breakup
export function calculateSalaryBreakup(annualCtc = 0) {
  const ctc = Number(annualCtc || 0);
  const monthlyCtc = Math.round(ctc / 12);

  // Basic is typically 45% of CTC
  const basicAnnual = Math.round(ctc * 0.45);
  const basicMonthly = Math.round(basicAnnual / 12);

  // HRA is 50% of Basic
  const hraAnnual = Math.round(basicAnnual * 0.50);
  const hraMonthly = Math.round(hraAnnual / 12);

  // Employer PF is 12% of Basic, capped at 1800/mo or standard statutory
  const employerPfMonthly = Math.min(Math.round(basicMonthly * 0.12), 1800);
  const employerPfAnnual = employerPfMonthly * 12;

  // Gratuity accrual is 4.81% of Basic
  const gratuityMonthly = Math.round(basicMonthly * 0.0481);
  const gratuityAnnual = gratuityMonthly * 12;

  // Special Allowance absorbs remaining balance
  const specialAllowanceAnnual = Math.max(0, ctc - (basicAnnual + hraAnnual + employerPfAnnual + gratuityAnnual));
  const specialAllowanceMonthly = Math.round(specialAllowanceAnnual / 12);

  // Gross Earnings (Cash in hand components)
  const grossMonthly = basicMonthly + hraMonthly + specialAllowanceMonthly;
  const grossAnnual = basicAnnual + hraAnnual + specialAllowanceAnnual;

  // Deductions
  const employeePfMonthly = employerPfMonthly;
  const employeePfAnnual = employerPfMonthly * 12;
  const ptMonthly = 200; // Standard metro PT
  const ptAnnual = 2400;
  
  // Estimated TDS (Simplified New Tax Regime 115BAC estimate)
  let estimatedAnnualTax = 0;
  if (ctc > 1500000) {
    estimatedAnnualTax = Math.round((ctc - 1500000) * 0.30 + 150000);
  } else if (ctc > 1200000) {
    estimatedAnnualTax = Math.round((ctc - 1200000) * 0.20 + 90000);
  } else if (ctc > 900000) {
    estimatedAnnualTax = Math.round((ctc - 900000) * 0.15 + 45000);
  } else if (ctc > 600000) {
    estimatedAnnualTax = Math.round((ctc - 600000) * 0.10 + 15000);
  } else if (ctc > 300000) {
    estimatedAnnualTax = Math.round((ctc - 300000) * 0.05);
  }
  const estimatedMonthlyTax = Math.round(estimatedAnnualTax / 12);

  const totalDeductionsMonthly = employeePfMonthly + ptMonthly + estimatedMonthlyTax;
  const totalDeductionsAnnual = employeePfAnnual + ptAnnual + estimatedAnnualTax;

  const netTakeHomeMonthly = Math.max(0, grossMonthly - totalDeductionsMonthly);
  const netTakeHomeAnnual = Math.max(0, grossAnnual - totalDeductionsAnnual);

  return {
    annualCtc: ctc,
    monthlyCtc,
    basicMonthly,
    basicAnnual,
    hraMonthly,
    hraAnnual,
    specialAllowanceMonthly,
    specialAllowanceAnnual,
    employerPfMonthly,
    employerPfAnnual,
    gratuityMonthly,
    gratuityAnnual,
    grossMonthly,
    grossAnnual,
    employeePfMonthly,
    employeePfAnnual,
    ptMonthly,
    ptAnnual,
    estimatedMonthlyTax,
    estimatedAnnualTax,
    totalDeductionsMonthly,
    totalDeductionsAnnual,
    netTakeHomeMonthly,
    netTakeHomeAnnual,
  };
}

/**
 * Get Employees List with Filters, Pagination, and Metrics
 */
export async function getEmployeesList({
  page = 1,
  limit = 20,
  search = '',
  status = '',
  department = '',
  verificationStatus = '',
}) {
  let filtered = [...employeesStore];

  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.officialEmail.toLowerCase().includes(q) ||
        e.personalEmail.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q)
    );
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((e) => e.employmentStatus === status);
  }

  if (department && department !== 'ALL') {
    filtered = filtered.filter((e) => e.department.toLowerCase().includes(department.toLowerCase()));
  }

  if (verificationStatus && verificationStatus !== 'ALL') {
    filtered = filtered.filter((e) =>
      e.kycDocuments.some((d) => d.verificationStatus === verificationStatus)
    );
  }

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // Metric Aggregations
  const metrics = {
    totalEmployees: employeesStore.length,
    preBoarding: employeesStore.filter((e) => e.employmentStatus === 'PRE_BOARDING').length,
    submittedForReview: employeesStore.filter((e) => e.employmentStatus === 'SUBMITTED_FOR_VERIFICATION').length,
    bgvInProgress: employeesStore.filter((e) => e.employmentStatus === 'BGV_IN_PROGRESS').length,
    activeProbation: employeesStore.filter((e) => e.employmentStatus === 'ACTIVE_PROBATION').length,
    confirmedActive: employeesStore.filter((e) => e.employmentStatus === 'CONFIRMED_ACTIVE').length,
    relieved: employeesStore.filter((e) => e.employmentStatus === 'RELIEVED').length,
    pendingKycCount: employeesStore.reduce(
      (acc, e) => acc + e.kycDocuments.filter((d) => d.verificationStatus === 'UNDER_REVIEW' || d.verificationStatus === 'PENDING').length,
      0
    ),
  };

  return {
    employees: paginated,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit) || 1,
    metrics,
  };
}

/**
 * Get Single Employee Details
 */
export async function getEmployeeById(id, { unmasked = false } = {}) {
  const emp = employeesStore.find((e) => e.id === id || e.employeeCode === id);
  if (!emp) {
    throw new Error(`Employee with ID ${id} not found.`);
  }

  // Clone object
  const copy = JSON.parse(JSON.stringify(emp));

  // If unmasked is false, ensure sensitive PII is masked
  if (!unmasked) {
    if (copy.statutory) {
      copy.statutory.panNumber = copy.statutory.panMasked;
      copy.statutory.aadhaarNumber = copy.statutory.aadhaarMasked;
      copy.statutory.bankAccountNumber = copy.statutory.bankAccountMasked;
    }
  }

  return copy;
}

/**
 * Create / Onboard New Employee Candidate
 */
export async function createEmployee(payload, actor = null) {
  const existingCode = employeesStore.find((e) => e.employeeCode === payload.employeeCode);
  if (existingCode) {
    throw new Error(`Employee Code ${payload.employeeCode} already exists.`);
  }

  const existingEmail = employeesStore.find(
    (e) => e.officialEmail?.toLowerCase() === payload.officialEmail?.toLowerCase() ||
           e.personalEmail?.toLowerCase() === payload.personalEmail?.toLowerCase()
  );
  if (existingEmail) {
    throw new Error(`An employee with email ${payload.officialEmail || payload.personalEmail} already exists.`);
  }

  const autoIndex = employeesStore.length + 1;
  const newCode = payload.employeeCode || `ITS-${new Date().getFullYear()}-${String(autoIndex).padStart(3, '0')}`;
  const ctc = Number(payload.annualCtc || 1200000);

  const newEmployee = {
    id: `emp-uuid-${Date.now()}`,
    employeeCode: newCode,
    firstName: payload.firstName || '',
    middleName: payload.middleName || null,
    lastName: payload.lastName || '',
    fullName: `${payload.firstName || ''} ${payload.middleName ? payload.middleName + ' ' : ''}${payload.lastName || ''}`.trim(),
    personalEmail: (payload.personalEmail || '').toLowerCase().trim(),
    officialEmail: (payload.officialEmail || `${payload.firstName.toLowerCase()}.${payload.lastName.toLowerCase()}@dasatech.in`).toLowerCase().trim(),
    phone: payload.phone || '',
    phoneMasked: payload.phone ? payload.phone.replace(/(\d{5})(\d{3})(\d{2})/, '$1 XX$3') : '',
    dob: payload.dob || '1995-01-01',
    dobDmy: payload.dob ? payload.dob.split('-').reverse().join('-') : '01-01-1995',
    gender: payload.gender || 'MALE',
    maritalStatus: payload.maritalStatus || 'SINGLE',
    bloodGroup: payload.bloodGroup || 'O_POS',
    profilePhotoUrl: payload.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    digitalSignatureUrl: payload.digitalSignatureUrl || null,

    department: payload.department || 'Engineering',
    designation: payload.designation || 'Software Engineer',
    gradeLevel: payload.gradeLevel || 'L2 / Associate Specialist',
    workLocation: payload.workLocation || 'Bengaluru (Hybrid)',
    employmentStatus: payload.employmentStatus || 'PRE_BOARDING',
    joiningDate: payload.joiningDate || new Date().toISOString().split('T')[0],
    probationPeriodMonths: Number(payload.probationPeriodMonths || 6),
    probationEndDate: payload.probationEndDate || null,
    confirmedAt: null,
    reportingManager: payload.reportingManager || 'Rahul K. Sharma (Principal Architect)',

    annualCtc: ctc,
    annualCtcWords: payload.annualCtcWords || 'Twelve Lakhs Rupees Only',
    taxRegime: payload.taxRegime || 'NEW_REGIME',
    statutory: {
      panNumber: payload.panNumber || 'ABCDE1234F',
      panMasked: payload.panNumber ? `XXXXX${payload.panNumber.slice(-4)}` : 'XXXXX1234F',
      aadhaarNumber: payload.aadhaarNumber || '123456789012',
      aadhaarMasked: payload.aadhaarNumber ? `XXXX-XXXX-${payload.aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-9012',
      pfUan: payload.pfUan || null,
      pfUanMasked: payload.pfUan ? `XXXX-XXXX-${payload.pfUan.slice(-4)}` : null,
      esiNumber: payload.esiNumber || null,
      bankName: payload.bankName || 'HDFC Bank Ltd',
      bankAccountNumber: payload.bankAccountNumber || '50100234567890',
      bankAccountMasked: payload.bankAccountNumber ? `XXXX-XXXX-${payload.bankAccountNumber.slice(-4)}` : 'XXXX-XXXX-7890',
      bankIfsc: payload.bankIfsc || 'HDFC0001234',
    },

    currentAddress: payload.currentAddress || {
      street: 'Koramangala 5th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
      country: 'India',
    },
    permanentAddress: payload.permanentAddress || payload.currentAddress || {
      street: 'Koramangala 5th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
      country: 'India',
    },
    emergencyContact: payload.emergencyContact || {
      name: 'Primary Contact',
      relation: 'Parent / Spouse',
      phone: '+91 98450 00000',
    },

    education: payload.education || [],
    experience: payload.experience || [],
    kycDocuments: payload.kycDocuments || [],
    bgv: {
      overallStatus: 'NOT_STARTED',
      agency: null,
      referenceId: null,
      initiatedAt: null,
      completedAt: null,
      checks: [],
      reportUrl: null,
    },
    assets: [],
    generatedDocuments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // If KYC documents are provided, ensure proper statuses
  if (newEmployee.kycDocuments.length > 0) {
    newEmployee.employmentStatus = 'SUBMITTED_FOR_VERIFICATION';
  }

  employeesStore.unshift(newEmployee);
  saveEmployeesData(employeesStore);

  logAudit({
    module: 'EMPLOYEE',
    userEmail: actor?.email || 'admin@dasatech.in',
    action: 'CREATE_EMPLOYEE_ONBOARDING',
    entityId: newEmployee.id,
    entityType: 'Employee',
    details: `Onboarded new candidate: ${newEmployee.fullName} (${newEmployee.designation})`,
  });

  return newEmployee;
}

/**
 * Update Employee Profile
 */
export async function updateEmployee(id, updates, actor = null) {
  const index = employeesStore.findIndex((e) => e.id === id || e.employeeCode === id);
  if (index === -1) {
    throw new Error(`Employee with ID ${id} not found.`);
  }

  const existing = employeesStore[index];

  // Merge deeply
  const updated = {
    ...existing,
    ...updates,
    statutory: {
      ...existing.statutory,
      ...(updates.statutory || {}),
    },
    currentAddress: {
      ...existing.currentAddress,
      ...(updates.currentAddress || {}),
    },
    permanentAddress: {
      ...existing.permanentAddress,
      ...(updates.permanentAddress || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  // If PAN or Aadhaar updated, refresh masks
  if (updates.statutory?.panNumber) {
    updated.statutory.panMasked = `XXXXX${updates.statutory.panNumber.slice(-4)}`;
  }
  if (updates.statutory?.aadhaarNumber) {
    updated.statutory.aadhaarMasked = `XXXX-XXXX-${updates.statutory.aadhaarNumber.slice(-4)}`;
  }
  if (updates.statutory?.bankAccountNumber) {
    updated.statutory.bankAccountMasked = `XXXX-XXXX-${updates.statutory.bankAccountNumber.slice(-4)}`;
  }

  employeesStore[index] = updated;
  saveEmployeesData(employeesStore);

  logAudit({
    module: 'EMPLOYEE',
    userEmail: actor?.email || 'admin@dasatech.in',
    action: 'UPDATE_EMPLOYEE_PROFILE',
    entityId: updated.id,
    entityType: 'Employee',
    details: `Updated employee profile: ${updated.fullName}`,
  });

  return updated;
}

/**
 * Submit / Upload KYC Document
 */
export async function submitKycDocument(employeeId, docData, actor = null) {
  const index = employeesStore.findIndex((e) => e.id === employeeId || e.employeeCode === employeeId);
  if (index === -1) {
    throw new Error(`Employee ${employeeId} not found.`);
  }

  const emp = employeesStore[index];
  const newDoc = {
    id: `doc-${Date.now()}`,
    documentType: docData.documentType,
    title: docData.title || `${docData.documentType} Document`,
    idNumberMasked: docData.idNumber ? `XXXXX${docData.idNumber.slice(-4)}` : 'XXXX-XXXX',
    idNumberFull: docData.idNumber || null,
    fileUrl: docData.fileUrl || '/uploads/sample_upload.pdf',
    mimeType: docData.mimeType || 'application/pdf',
    fileSize: docData.fileSize || '1.8 MB',
    verificationStatus: 'UNDER_REVIEW',
    verifiedBy: null,
    verifiedAt: null,
    ocrConfidence: docData.ocrConfidence || 95,
    rejectionReason: null,
  };

  // Replace if exists, or append
  const docIdx = emp.kycDocuments.findIndex((d) => d.documentType === docData.documentType);
  if (docIdx !== -1) {
    emp.kycDocuments[docIdx] = newDoc;
  } else {
    emp.kycDocuments.push(newDoc);
  }

  emp.employmentStatus = 'SUBMITTED_FOR_VERIFICATION';
  emp.updatedAt = new Date().toISOString();

  employeesStore[index] = emp;
  saveEmployeesData(employeesStore);

  return newDoc;
}

/**
 * HR Document Verification Desk: Approve or Reject Document
 */
export async function verifyKycDocument(employeeId, documentId, { status, rejectionReason }, actor = null) {
  const empIndex = employeesStore.findIndex((e) => e.id === employeeId || e.employeeCode === employeeId);
  if (empIndex === -1) {
    throw new Error(`Employee ${employeeId} not found.`);
  }

  const emp = employeesStore[empIndex];
  const doc = emp.kycDocuments.find((d) => d.id === documentId || d.documentType === documentId);
  if (!doc) {
    throw new Error(`Document ${documentId} not found on employee.`);
  }

  doc.verificationStatus = status; // 'VERIFIED' or 'REJECTED'
  doc.verifiedBy = actor?.email || 'hr.admin@dasatech.in';
  doc.verifiedAt = new Date().toISOString();
  doc.rejectionReason = status === 'REJECTED' ? rejectionReason : null;

  // Check if all documents are verified
  const allVerified = emp.kycDocuments.length > 0 && emp.kycDocuments.every((d) => d.verificationStatus === 'VERIFIED');
  if (allVerified) {
    emp.employmentStatus = 'BGV_IN_PROGRESS';
    // Auto-initialize BGV if not started
    if (emp.bgv.overallStatus === 'NOT_STARTED') {
      emp.bgv = {
        overallStatus: 'IN_PROGRESS',
        agency: 'IDfy Background Technologies',
        referenceId: `IDFY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        initiatedAt: new Date().toISOString().split('T')[0],
        completedAt: null,
        checks: [
          { name: 'National Identity Check (Aadhaar & PAN)', status: 'IN_PROGRESS', date: new Date().toISOString().split('T')[0] },
          { name: 'Highest Degree Credential Verification', status: 'PENDING', date: null },
          { name: 'Prior Employer HR Cross-Check', status: 'PENDING', date: null },
        ],
        reportUrl: null,
      };
    }
  }

  emp.updatedAt = new Date().toISOString();
  employeesStore[empIndex] = emp;
  saveEmployeesData(employeesStore);

  logAudit({
    module: 'EMPLOYEE',
    userEmail: actor?.email || 'hr.admin@dasatech.in',
    action: `VERIFY_KYC_${status}`,
    entityId: emp.id,
    entityType: 'EmployeeKyc',
    details: `${status} KYC document ${doc.documentType} for ${emp.fullName}. Note: ${rejectionReason || 'Approved successfully'}`,
  });

  return { success: true, document: doc, employeeStatus: emp.employmentStatus };
}

/**
 * IT Asset Allocation & Return Management
 */
export async function allocateAsset(employeeId, assetData, actor = null) {
  const empIndex = employeesStore.findIndex((e) => e.id === employeeId || e.employeeCode === employeeId);
  if (empIndex === -1) {
    throw new Error(`Employee ${employeeId} not found.`);
  }

  const emp = employeesStore[empIndex];
  const newAsset = {
    id: `ast-${Date.now()}`,
    assetTag: assetData.assetTag || `DASA-LAP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    type: assetData.type || 'LAPTOP',
    make: assetData.make || 'Lenovo ThinkPad / MacBook Pro',
    serialNumber: assetData.serialNumber || 'SN-UNKNOWN',
    allocatedAt: new Date().toISOString().split('T')[0],
    condition: assetData.condition || 'EXCELLENT',
    status: 'ALLOCATED',
    acknowledgedByEmployee: Boolean(assetData.acknowledgedByEmployee),
  };

  emp.assets.push(newAsset);
  emp.updatedAt = new Date().toISOString();
  employeesStore[empIndex] = emp;
  saveEmployeesData(employeesStore);

  return newAsset;
}

export async function returnAsset(employeeId, assetId, returnData, actor = null) {
  const empIndex = employeesStore.findIndex((e) => e.id === employeeId || e.employeeCode === employeeId);
  if (empIndex === -1) {
    throw new Error(`Employee ${employeeId} not found.`);
  }

  const emp = employeesStore[empIndex];
  const asset = emp.assets.find((a) => a.id === assetId);
  if (!asset) {
    throw new Error(`Asset ${assetId} not found.`);
  }

  asset.status = 'RETURNED';
  asset.returnedAt = new Date().toISOString().split('T')[0];
  asset.condition = returnData.condition || 'GOOD';

  emp.updatedAt = new Date().toISOString();
  employeesStore[empIndex] = emp;
  saveEmployeesData(employeesStore);

  return asset;
}

/**
 * BGV (Background Verification) Stage Updates
 */
export async function updateBgvStatus(employeeId, { overallStatus, checkName, checkStatus, reportUrl }, actor = null) {
  const empIndex = employeesStore.findIndex((e) => e.id === employeeId || e.employeeCode === employeeId);
  if (empIndex === -1) {
    throw new Error(`Employee ${employeeId} not found.`);
  }

  const emp = employeesStore[empIndex];
  if (overallStatus) {
    emp.bgv.overallStatus = overallStatus;
    if (overallStatus === 'CLEARED') {
      emp.bgv.completedAt = new Date().toISOString().split('T')[0];
      if (emp.employmentStatus === 'BGV_IN_PROGRESS') {
        emp.employmentStatus = 'ACTIVE_PROBATION'; // Ready for Day 1 active duty
      }
    }
  }

  if (reportUrl) {
    emp.bgv.reportUrl = reportUrl;
  }

  if (checkName && checkStatus) {
    const existingCheck = emp.bgv.checks.find((c) => c.name === checkName);
    if (existingCheck) {
      existingCheck.status = checkStatus;
      existingCheck.date = new Date().toISOString().split('T')[0];
    } else {
      emp.bgv.checks.push({
        name: checkName,
        status: checkStatus,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }

  emp.updatedAt = new Date().toISOString();
  employeesStore[empIndex] = emp;
  saveEmployeesData(employeesStore);

  return emp.bgv;
}

/**
 * Probation & Confirmation Management
 */
export async function updateProbationReview(employeeId, { action, notes, newConfirmationDate }, actor = null) {
  const empIndex = employeesStore.findIndex((e) => e.id === employeeId || e.employeeCode === employeeId);
  if (empIndex === -1) {
    throw new Error(`Employee ${employeeId} not found.`);
  }

  const emp = employeesStore[empIndex];

  if (action === 'CONFIRM') {
    emp.employmentStatus = 'CONFIRMED_ACTIVE';
    emp.confirmedAt = new Date().toISOString();
    emp.probationRemarks = notes || 'Performance objectives met satisfactorily.';
  } else if (action === 'EXTEND') {
    emp.probationEndDate = newConfirmationDate || emp.probationEndDate;
    emp.probationRemarks = notes || 'Probation extended for 3 months to evaluate project delivery.';
  }

  emp.updatedAt = new Date().toISOString();
  employeesStore[empIndex] = emp;
  saveEmployeesData(employeesStore);

  return emp;
}

/**
 * Automated HR Document Generation Engine
 * Handles 6 Production Legal Templates with Dynamic Variable Substitution:
 * 1. Offer & Appointment Letter
 * 2. NDA & Intellectual Property Assignment
 * 3. Salary Structure & Compensation Letter (CTC Breakup)
 * 4. Relieving Letter & Work Experience Certificate
 * 5. Code of Conduct & IT Security Policy
 * 6. Appraisal & Salary Revision Letter
 */
export async function generateLegalDocument(employeeId, documentType, options = {}, actor = null) {
  const emp = employeesStore.find((e) => e.id === employeeId || e.employeeCode === employeeId);
  if (!emp) {
    throw new Error(`Employee ${employeeId} not found.`);
  }

  const salary = calculateSalaryBreakup(emp.annualCtc);
  const now = new Date();
  const issueDate = options.issueDate || now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const watermarkText = `CONFIDENTIAL • ${emp.employeeCode} • ${actor?.email || 'PORTAL'} • ${now.toISOString()}`;

  // Master Template Catalog
  const placeholders = {
    company_legal_name: 'DASA TECH CONSULTING PRIVATE LIMITED',
    company_cin: 'U72900KA2022PTC159044',
    company_registered_address: 'Level 4, DASA Tower, Outer Ring Road, Kadubeesanahalli, Bengaluru - 560103, Karnataka, India',
    company_hr_email: 'talent.operations@dasatech.in',
    company_website: 'https://dasatech.in',
    company_bgv_email: 'bgv.desk@dasatech.in',
    
    candidate_name: emp.fullName,
    employee_code: emp.employeeCode,
    designation: emp.designation,
    department_name: emp.department,
    grade_level: emp.gradeLevel,
    work_location: emp.workLocation,
    joining_date: emp.joiningDate,
    probation_period_months: emp.probationPeriodMonths,
    probation_period_words: emp.probationPeriodMonths === 3 ? 'Three' : 'Six',
    probation_notice_days: 30,
    confirmed_notice_days: 90,
    jurisdiction_city: 'Bengaluru',
    authorized_signatory_name: 'Jeyawin D.',
    authorized_signatory_title: 'Chief Executive Officer & Managing Director',
    candidate_permanent_address: `${emp.permanentAddress.street}, ${emp.permanentAddress.city}, ${emp.permanentAddress.state} - ${emp.permanentAddress.pincode}`,
    candidate_personal_email: emp.personalEmail,
    candidate_phone: emp.phone,
    candidate_pan_last4: emp.statutory.panMasked.slice(-4),
    candidate_aadhaar_last4: emp.statutory.aadhaarMasked.slice(-4),
    issue_date: issueDate,
    appointment_ref_number: `DASA/HR/APT/${new Date().getFullYear()}/${emp.employeeCode.replace('ITS-', '')}`,
    relieving_ref_code: `DASA/REL/${new Date().getFullYear()}/${emp.employeeCode.replace('ITS-', '')}`,
    resignation_date: emp.resignationDate || '2026-08-01',
    relieving_date: emp.relievingDate || '2026-09-30',
    last_held_designation: emp.designation,
    office_location: emp.workLocation,
    hr_head_name: 'Jeyawin D.',
    mediclaim_sum_insured: '5,00,000',

    // Financial calculations
    annual_ctc_in_figures: emp.annualCtc.toLocaleString('en-IN'),
    annual_ctc_in_words: emp.annualCtcWords,
    basic_monthly: salary.basicMonthly.toLocaleString('en-IN'),
    basic_annual: salary.basicAnnual.toLocaleString('en-IN'),
    hra_monthly: salary.hraMonthly.toLocaleString('en-IN'),
    hra_annual: salary.hraAnnual.toLocaleString('en-IN'),
    special_allowance_monthly: salary.specialAllowanceMonthly.toLocaleString('en-IN'),
    special_allowance_annual: salary.specialAllowanceAnnual.toLocaleString('en-IN'),
    bonus_monthly: '0',
    bonus_annual: '0',
    gross_earnings_monthly: salary.grossMonthly.toLocaleString('en-IN'),
    gross_earnings_annual: salary.grossAnnual.toLocaleString('en-IN'),
    employer_pf_monthly: salary.employerPfMonthly.toLocaleString('en-IN'),
    employer_pf_annual: salary.employerPfAnnual.toLocaleString('en-IN'),
    employer_esi_monthly: '0',
    employer_esi_annual: '0',
    gratuity_monthly: salary.gratuityMonthly.toLocaleString('en-IN'),
    gratuity_annual: salary.gratuityAnnual.toLocaleString('en-IN'),
    retirals_monthly: (salary.employerPfMonthly + salary.gratuityMonthly).toLocaleString('en-IN'),
    retirals_annual: (salary.employerPfAnnual + salary.gratuityAnnual).toLocaleString('en-IN'),
    total_ctc_monthly: salary.monthlyCtc.toLocaleString('en-IN'),
    employee_pf_monthly: salary.employeePfMonthly.toLocaleString('en-IN'),
    employee_pf_annual: salary.employeePfAnnual.toLocaleString('en-IN'),
    professional_tax_monthly: salary.ptMonthly.toLocaleString('en-IN'),
    professional_tax_annual: salary.ptAnnual.toLocaleString('en-IN'),
    tds_estimated_monthly: salary.estimatedMonthlyTax.toLocaleString('en-IN'),
    tds_estimated_annual: salary.estimatedAnnualTax.toLocaleString('en-IN'),
    total_deductions_monthly: salary.totalDeductionsMonthly.toLocaleString('en-IN'),
    total_deductions_annual: salary.totalDeductionsAnnual.toLocaleString('en-IN'),
    net_take_home_monthly: salary.netTakeHomeMonthly.toLocaleString('en-IN'),
    net_take_home_annual: salary.netTakeHomeAnnual.toLocaleString('en-IN'),
  };

  let templateHtml = '';
  let documentTitle = '';

  switch (documentType) {
    case 'APPOINTMENT_LETTER':
    case 'OFFER_LETTER':
      documentTitle = 'Letter of Appointment & Terms of Employment';
      templateHtml = getAppointmentTemplate();
      break;
    case 'NDA_IP_AGREEMENT':
      documentTitle = 'Non-Disclosure & Intellectual Property Assignment Agreement';
      templateHtml = getNdaTemplate();
      break;
    case 'SALARY_ANNEXURE':
      documentTitle = 'Annexure A - Compensation & CTC Structure';
      templateHtml = getSalaryAnnexureTemplate();
      break;
    case 'RELIEVING_LETTER':
      documentTitle = 'Relieving Letter & Work Experience Certificate';
      templateHtml = getRelievingTemplate();
      break;
    case 'CODE_OF_CONDUCT':
      documentTitle = 'Code of Conduct & IT Information Security Policy';
      templateHtml = getCodeOfConductTemplate();
      break;
    case 'APPRAISAL_LETTER':
      documentTitle = 'Annual Appraisal & Compensation Revision Letter';
      templateHtml = getAppraisalTemplate();
      break;
    default:
      throw new Error(`Unsupported document category: ${documentType}`);
  }

  // Handlebars-style variable interpolation
  let renderedHtml = templateHtml;
  Object.keys(placeholders).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    renderedHtml = renderedHtml.replace(regex, placeholders[key] ?? '');
  });

  // Inject dynamic security watermark
  const watermarkBanner = `
    <div style="position: fixed; top: 40%; left: 10%; transform: rotate(-35deg); font-size: 24pt; color: rgba(180, 180, 180, 0.22); font-weight: bold; pointer-events: none; z-index: 9999; text-transform: uppercase;">
      ${watermarkText}
    </div>
  `;
  renderedHtml = renderedHtml.replace('<body>', `<body>${watermarkBanner}`);

  // Register in employee record
  const newDocRecord = {
    id: `doc-gen-${Date.now()}`,
    category: documentType,
    title: documentTitle,
    issuedDate: issueDate,
    eSignedAt: null,
    storageKey: `/legal/${documentType.toLowerCase()}/${emp.employeeCode}_${Date.now()}.pdf`,
    status: 'GENERATED_PENDING_SIGNATURE',
  };

  const empIndex = employeesStore.findIndex((e) => e.id === emp.id);
  employeesStore[empIndex].generatedDocuments.unshift(newDocRecord);
  saveEmployeesData(employeesStore);

  logAudit({
    module: 'EMPLOYEE',
    userEmail: actor?.email || 'hr.admin@dasatech.in',
    action: `GENERATE_${documentType}`,
    entityId: emp.id,
    entityType: 'GeneratedDocument',
    details: `Generated legal document: ${documentTitle} for ${emp.fullName}`,
  });

  return {
    documentId: newDocRecord.id,
    title: documentTitle,
    documentType,
    issuedDate: issueDate,
    renderedHtml,
    placeholders,
    watermarkText,
  };
}

// ----------------- LEGAL HTML TEMPLATE STRINGS -----------------

function getAppointmentTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Letter of Appointment</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; margin: 40px; }
  .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 10px; margin-bottom: 20px; }
  .company-title { font-size: 16pt; font-weight: bold; color: #003366; text-transform: uppercase; }
  .doc-title { font-size: 13pt; font-weight: bold; text-decoration: underline; margin-top: 15px; }
  .clause-title { font-weight: bold; margin-top: 14px; text-decoration: underline; }
  .sign-section { margin-top: 40px; page-break-inside: avoid; }
</style>
</head>
<body>
<div class="header">
  <div class="company-title">{{company_legal_name}}</div>
  <div>CIN: {{company_cin}} | Registered Office: {{company_registered_address}}</div>
  <div>Email: {{company_hr_email}} | Website: {{company_website}}</div>
</div>
<p><strong>Date:</strong> {{issue_date}}</p>
<p><strong>Ref No:</strong> {{appointment_ref_number}}<br><strong>Strictly Private & Confidential</strong></p>
<p>To,<br><strong>{{candidate_name}}</strong><br>Address: {{candidate_permanent_address}}<br>Email: {{candidate_personal_email}}<br>Mobile: {{candidate_phone}}</p>
<div class="doc-title" align="center">LETTER OF APPOINTMENT</div>
<p>Dear <strong>{{candidate_name}}</strong>,</p>
<p>Pursuant to our interviews and discussions, the Management of <strong>{{company_legal_name}}</strong> ("Company") is pleased to appoint you as <strong>{{designation}}</strong> in Band/Level <strong>{{grade_level}}</strong>, based at our office located at <strong>{{work_location}}</strong>. Your employment shall commence on or before <strong>{{joining_date}}</strong> ("Commencement Date").</p>
<div class="clause-title">1. Remuneration & Compensation</div>
<p>Your Total Fixed Cost to Company (CTC) will be <strong>INR {{annual_ctc_in_figures}}/-</strong> (Indian Rupees {{annual_ctc_in_words}}) per annum. A detailed breakdown of your compensation structure is set forth in <strong>Annexure A</strong>.</p>
<div class="clause-title">2. Probation & Confirmation</div>
<p>You shall be on probation for a period of <strong>{{probation_period_months}} ({{probation_period_words}}) months</strong> from the Commencement Date. Your probation period may be extended at the sole discretion of the Company depending on your performance appraisal.</p>
<div class="clause-title">3. Notice Period & Separation Terms</div>
<p>(a) During the Probationary Period, either party may terminate this employment contract by giving <strong>{{probation_notice_days}} days'</strong> prior written notice.</p>
<p>(b) Upon successful confirmation, the notice period shall be <strong>{{confirmed_notice_days}} days</strong>.</p>
<div class="clause-title">4. Background Verification (BGV)</div>
<p>This appointment is contingent upon the satisfactory clearance of your past credentials, educational certificates, identity documents, and criminal history through an independent agency appointed by the Company.</p>
<div class="sign-section">
  <table style="width: 100%; border: none;">
    <tr>
      <td style="width: 50%; border: none; vertical-align: top;">
        <p>For <strong>{{company_legal_name}}</strong></p><br><br>
        <p>___________________________________<br><strong>{{authorized_signatory_name}}</strong><br>{{authorized_signatory_title}}<br>Date: {{issue_date}}</p>
      </td>
      <td style="width: 50%; border: none; vertical-align: top;">
        <p><strong>ACCEPTANCE & ACKNOWLEDGEMENT</strong></p>
        <p>I have carefully read, understood, and accept the terms outlined in this Appointment Letter. I confirm my joining on <strong>{{joining_date}}</strong>.</p><br>
        <p>___________________________________<br>Candidate Signature: <strong>{{candidate_name}}</strong><br>Aadhaar (Last 4 Digits): XXXX-XXXX-{{candidate_aadhaar_last4}}<br>Date: ________________________</p>
      </td>
    </tr>
  </table>
</div>
</body>
</html>`;
}

function getNdaTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Non-Disclosure & IP Assignment Agreement</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5pt; line-height: 1.5; color: #222; margin: 45px; }
  h1 { font-size: 13pt; text-align: center; text-transform: uppercase; margin-bottom: 20px; font-weight: bold; }
  h2 { font-size: 11pt; font-weight: bold; margin-top: 15px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
  .parties { background-color: #fafafa; border: 1px solid #e0e0e0; padding: 12px; margin-bottom: 15px; }
</style>
</head>
<body>
<h1>EMPLOYEE NON-DISCLOSURE, INTELLECTUAL PROPERTY ASSIGNMENT, AND NON-SOLICITATION AGREEMENT</h1>
<div class="parties">
  <p>This Agreement is entered into on <strong>{{joining_date}}</strong> by and between:</p>
  <p><strong>1. {{company_legal_name}}</strong>, having its corporate office at {{company_registered_address}} (the <strong>"Company"</strong>); and</p>
  <p><strong>2. {{candidate_name}}</strong>, residing at {{candidate_permanent_address}}, holder of PAN <strong>XXXXX{{candidate_pan_last4}}</strong> (the <strong>"Employee"</strong>).</p>
</div>
<h2>1. Definition of Confidential Information</h2>
<p>Confidential Information includes all software code (object and source code), algorithmic logic, database schemas, cryptographic keys, system architecture diagrams, client deliverables, and technical roadmaps accessed via corporate repositories (GitHub, AWS, Azure, Jira, etc.).</p>
<h2>2. Non-Disclosure & IP Assignment</h2>
<p>The Employee agrees to hold all Confidential Information in strictest confidence. All inventions, scripts, and software developed during employment shall be deemed "Works Made for Hire" and the Employee unconditionally assigns all worldwide intellectual property rights to the Company in perpetuity.</p>
<h2>3. Non-Solicitation</h2>
<p>For a period of 12 months following separation, the Employee shall not directly or indirectly solicit any employees, clients, or partners of the Company.</p>
<table style="width: 100%; margin-top: 50px; border: none;">
  <tr>
    <td style="width: 50%; border: none;"><strong>For {{company_legal_name}}</strong><br><br><br>Authorized Signatory: <strong>{{authorized_signatory_name}}</strong><br>{{authorized_signatory_title}}</td>
    <td style="width: 50%; border: none;"><strong>Employee Acknowledged & Agreed</strong><br><br><br>Signature: ______________________________<br>Name: <strong>{{candidate_name}}</strong><br>Date: {{joining_date}}</td>
  </tr>
</table>
</body>
</html>`;
}

function getSalaryAnnexureTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Annexure A - Compensation Breakup</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 10pt; color: #333; margin: 35px; }
  .title-bar { background-color: #002b49; color: white; padding: 8px 12px; font-weight: bold; font-size: 11pt; text-align: center; }
  .table-box { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 12px; }
  .table-box th, .table-box td { border: 1px solid #b0b0b0; padding: 6px 8px; font-size: 9.5pt; }
  .table-box th { background-color: #f5f7fa; text-align: left; }
  .num { text-align: right; }
  .total-row { font-weight: bold; background-color: #eaeff5; }
</style>
</head>
<body>
<div class="title-bar">ANNEXURE A: COMPENSATION & BENEFITS BREAKUP</div>
<table style="width: 100%; border: none; margin-top: 10px; margin-bottom: 10px;">
  <tr>
    <td style="width: 50%; border: none;"><strong>Employee Name:</strong> {{candidate_name}}<br><strong>Designation:</strong> {{designation}}</td>
    <td style="width: 50%; border: none;"><strong>Band / Grade:</strong> {{grade_level}}<br><strong>Annual CTC:</strong> INR {{annual_ctc_in_figures}}/-</td>
  </tr>
</table>
<table class="table-box">
  <thead><tr><th>Salary Components</th><th class="num">Monthly (INR)</th><th class="num">Annualized (INR)</th></tr></thead>
  <tbody>
    <tr><td colspan="3" style="background-color: #e6ecf2; font-weight: bold;">(A) Direct Cash Inflows / Gross Earnings</td></tr>
    <tr><td>Basic Salary</td><td class="num">{{basic_monthly}}</td><td class="num">{{basic_annual}}</td></tr>
    <tr><td>House Rent Allowance (HRA)</td><td class="num">{{hra_monthly}}</td><td class="num">{{hra_annual}}</td></tr>
    <tr><td>Special Allowance</td><td class="num">{{special_allowance_monthly}}</td><td class="num">{{special_allowance_annual}}</td></tr>
    <tr class="total-row"><td>Total Gross Earnings (A)</td><td class="num">{{gross_earnings_monthly}}</td><td class="num">{{gross_earnings_annual}}</td></tr>
    <tr><td colspan="3" style="background-color: #e6ecf2; font-weight: bold;">(B) Employer's Statutory Contributions & Retirals</td></tr>
    <tr><td>Employer PF Contribution (12% of Basic or Capped)</td><td class="num">{{employer_pf_monthly}}</td><td class="num">{{employer_pf_annual}}</td></tr>
    <tr><td>Gratuity Accrual (4.81% of Basic)</td><td class="num">{{gratuity_monthly}}</td><td class="num">{{gratuity_annual}}</td></tr>
    <tr class="total-row"><td>Total Employer Retirals & Benefits (B)</td><td class="num">{{retirals_monthly}}</td><td class="num">{{retirals_annual}}</td></tr>
    <tr style="background-color: #d1dde6; font-weight: bold;"><td>TOTAL COST TO COMPANY (CTC) = (A + B)</td><td class="num">{{total_ctc_monthly}}</td><td class="num">{{annual_ctc_in_figures}}</td></tr>
    <tr><td colspan="3" style="background-color: #e6ecf2; font-weight: bold;">(C) Standard Employee Deductions (Estimated)</td></tr>
    <tr><td>Employee PF Contribution</td><td class="num">{{employee_pf_monthly}}</td><td class="num">{{employee_pf_annual}}</td></tr>
    <tr><td>Professional Tax (PT)</td><td class="num">{{professional_tax_monthly}}</td><td class="num">{{professional_tax_annual}}</td></tr>
    <tr><td>Estimated TDS / Income Tax</td><td class="num">{{tds_estimated_monthly}}</td><td class="num">{{tds_estimated_annual}}</td></tr>
    <tr class="total-row"><td>Total Deductions (C)</td><td class="num">{{total_deductions_monthly}}</td><td class="num">{{total_deductions_annual}}</td></tr>
    <tr style="background-color: #c9e2b3; font-weight: bold; font-size: 10pt;"><td>ESTIMATED NET TAKE-HOME PAY (A - C)</td><td class="num">{{net_take_home_monthly}}</td><td class="num">{{net_take_home_annual}}</td></tr>
  </tbody>
</table>
<p style="font-size: 8.5pt; color: #666;">Note: TDS will be deducted in accordance with the tax regime elected by you under Section 115BAC of the Income Tax Act.</p>
</body>
</html>`;
}

function getRelievingTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Relieving & Experience Certificate</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; margin: 50px; color: #111; }
  .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 30px; }
  .title { font-size: 14pt; font-weight: bold; text-align: center; text-decoration: underline; margin: 25px 0; }
</style>
</head>
<body>
<div class="header">
  <h2 style="margin: 0; text-transform: uppercase;">{{company_legal_name}}</h2>
  <div style="font-size: 9pt;">CIN: {{company_cin}} | {{company_registered_address}}</div>
  <div style="font-size: 9pt;">Verification: {{company_bgv_email}}</div>
</div>
<p><strong>Date:</strong> {{issue_date}}</p>
<p><strong>Ref Code:</strong> {{relieving_ref_code}}</p>
<div class="title">RELIEVING LETTER & SERVICE EXPERIENCE CERTIFICATE</div>
<p><strong>TO WHOMSOEVER IT MAY CONCERN</strong></p>
<p>This is to certify that <strong>{{candidate_name}}</strong> (Employee Code: <strong>{{employee_code}}</strong>) was employed with <strong>{{company_legal_name}}</strong> from <strong>{{joining_date}}</strong> to the close of business hours on <strong>{{relieving_date}}</strong>.</p>
<p>During their tenure with us, they served in the role of <strong>{{last_held_designation}}</strong> in the <strong>{{department_name}}</strong> department, operating out of our <strong>{{office_location}}</strong> office.</p>
<p>Pursuant to their resignation submitted on <strong>{{resignation_date}}</strong>, they have been officially relieved of their responsibilities after completing their contractual notice period and completing all knowledge transfer (KT) milestones.</p>
<p>We confirm that all company assets, credentials, source code repositories, and access badges assigned to {{candidate_name}} have been returned in full working condition, and their Full and Final Settlement (F&F) accounts have been cleared.</p>
<div style="margin-top: 60px;">
  <p>__________________________________________<br><strong>Authorized Signatory</strong><br><strong>{{hr_head_name}}</strong><br>Head - People & Talent Operations<br>{{company_legal_name}}</p>
</div>
</body>
</html>`;
}

function getCodeOfConductTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Code of Conduct & IT Security Policy</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5pt; line-height: 1.5; color: #222; margin: 40px; }
  h1 { font-size: 13pt; text-align: center; text-transform: uppercase; margin-bottom: 20px; font-weight: bold; }
  h2 { font-size: 11pt; font-weight: bold; margin-top: 15px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
</style>
</head>
<body>
<h1>CODE OF CONDUCT & IT INFORMATION SECURITY ACKNOWLEDGEMENT</h1>
<p>This policy outlines the technical and behavioral compliance expected from <strong>{{candidate_name}}</strong> ({{employee_code}}) at <strong>{{company_legal_name}}</strong>.</p>
<h2>1. Information Security & Zero-Trust Access</h2>
<p>Employees must use multi-factor authentication (MFA) on all company systems. Storing client source code, API keys, or production data on unauthorized personal storage (Dropbox, personal USB drives) is strictly prohibited.</p>
<h2>2. Anti-Harassment (POSH) & Respectful Workplace</h2>
<p>The Company maintains zero tolerance towards workplace harassment, discrimination, or abusive conduct in accordance with the Prevention of Sexual Harassment (PoSH) Act, 2013.</p>
<h2>3. Clean Desk & Screen Locking</h2>
<p>Employees must lock unattended workstations and ensure client confidential files are not left in accessible physical or digital spaces.</p>
<div style="margin-top: 50px;">
  <p>I hereby acknowledge that I have read and agree to adhere strictly to the Code of Conduct and IT Information Security Policy.</p><br>
  <p>Signature: ______________________________<br>Name: <strong>{{candidate_name}}</strong><br>Date: {{issue_date}}</p>
</div>
</body>
</html>`;
}

function getAppraisalTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Annual Appraisal & Compensation Revision</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; margin: 45px; color: #111; }
  .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 10px; margin-bottom: 20px; }
  .title { font-size: 13pt; font-weight: bold; text-align: center; text-decoration: underline; margin: 20px 0; }
</style>
</head>
<body>
<div class="header">
  <h2 style="margin: 0; color: #003366;">{{company_legal_name}}</h2>
  <div style="font-size: 9pt;">CIN: {{company_cin}} | {{company_registered_address}}</div>
</div>
<p><strong>Date:</strong> {{issue_date}}</p>
<p>To,<br><strong>{{candidate_name}}</strong><br>Emp Code: {{employee_code}}<br>Designation: {{designation}}</p>
<div class="title">ANNUAL PERFORMANCE APPRAISAL & SALARY REVISION</div>
<p>Dear <strong>{{candidate_name}}</strong>,</p>
<p>In recognition of your performance, technical contributions, and client deliverable excellence over the past evaluation cycle, the Management is delighted to inform you that your compensation has been revised to <strong>INR {{annual_ctc_in_figures}}/-</strong> per annum with effect from the current appraisal cycle.</p>
<p>We appreciate your continued commitment to engineering excellence at {{company_legal_name}} and look forward to your impactful contributions in our upcoming projects.</p>
<div style="margin-top: 60px;">
  <p>Warm regards,<br><br>__________________________________________<br><strong>{{authorized_signatory_name}}</strong><br>{{authorized_signatory_title}}<br>{{company_legal_name}}</p>
</div>
</body>
</html>`;
}
