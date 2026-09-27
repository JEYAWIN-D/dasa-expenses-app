import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';

async function seed() {
  console.log('🌱 Starting database seed for Quotation, Billing & Business Finance...');

  // 1. Clean existing records for clean start
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quotationNegotiation.deleteMany();
  await prisma.quotationRevision.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.clientContact.deleteMany();
  await prisma.client.deleteMany();
  await prisma.documentTemplate.deleteMany();
  await prisma.numberingConfig.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Company Profile with Digital Signature PIN (PIN: "1234")
  const signaturePinHash = await bcrypt.hash('1234', 10);
  const company = await prisma.companyProfile.create({
    data: {
      companyName: 'DASA TECH',
      tagline: 'Enterprise Cloud & Software Engineering',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      address: 'EB Colony',
      city: 'Erode',
      state: 'Tamil Nadu',
      country: 'India',
      postalCode: '638002',
      phone: '+91 76399 30148',
      email: 'dasatechmu@gmail.com',
      website: 'https://dasatech.com',
      gstNumber: '29ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      bankName: 'HDFC Bank Ltd',
      bankAccountName: 'DASA TECH',
      bankAccountNumber: '50200012345678',
      bankIfsc: 'HDFC0001234',
      bankSwift: 'HDFCINBB',
      termsAndConditions: '1. All payments are strictly due within 15 days of invoice date.\n2. 50% advance required for project commencement.\n3. Late payments subject to 1.5% interest per month.\n4. Disputes subject to Bangalore jurisdiction.',
      authorizedPerson: 'DASA',
      signatureImageUrl: 'https://api.iconify.design/fluent-emoji-flat:pen.svg',
      signaturePinHash,
      currency: 'INR',
    },
  });
  console.log('✔ Company profile created with PIN: 1234');

  // 3. Numbering Config
  const numberingConfigs = [
    { documentType: 'QUOTATION', prefix: 'QT', includeFiscalYear: true, currentSequence: 104, padLength: 4 },
    { documentType: 'INVOICE', prefix: 'INV', includeFiscalYear: true, currentSequence: 106, padLength: 4 },
    { documentType: 'PAYMENT', prefix: 'REC', includeFiscalYear: true, currentSequence: 105, padLength: 4 },
    { documentType: 'EXPENSE', prefix: 'EXP', includeFiscalYear: true, currentSequence: 108, padLength: 4 },
    { documentType: 'CLIENT', prefix: 'CLI', includeFiscalYear: false, currentSequence: 104, padLength: 4 },
    { documentType: 'VENDOR', prefix: 'VEN', includeFiscalYear: false, currentSequence: 104, padLength: 4 },
  ];

  for (const nc of numberingConfigs) {
    await prisma.numberingConfig.create({ data: nc });
  }
  console.log('✔ Document numbering configurations initialized');

  // 4. Document Templates
  await prisma.documentTemplate.createMany({
    data: [
      {
        type: 'QUOTATION',
        name: 'Standard Corporate Quotation',
        headerText: 'SOFTWARE DEVELOPMENT & CONSULTING QUOTATION',
        footerText: 'Thank you for your business. We look forward to partnering with your team.',
        termsText: 'Validity: 30 days from date of issue. Scope changes will be charged separately as per approved change orders.',
        primaryColor: '#0f172a',
        accentColor: '#3b82f6',
        showLogo: true,
        showBankDetails: true,
        showSignature: true,
        isDefault: true,
      },
      {
        type: 'INVOICE',
        name: 'Standard Tax Invoice',
        headerText: 'TAX INVOICE',
        footerText: 'This is a computer-generated invoice with verified digital authorization.',
        termsText: 'Payment due on receipt. Please wire transfer to our bank account with invoice number reference.',
        primaryColor: '#0f172a',
        accentColor: '#10b981',
        showLogo: true,
        showBankDetails: true,
        showSignature: true,
        isDefault: true,
      },
      {
        type: 'RECEIPT',
        name: 'Official Payment Receipt',
        headerText: 'PAYMENT RECEIPT ACKNOWLEDGMENT',
        footerText: 'Thank you for your payment. Your account has been credited accordingly.',
        termsText: 'Subject to bank clearance of instruments.',
        primaryColor: '#0f172a',
        accentColor: '#8b5cf6',
        showLogo: true,
        showBankDetails: false,
        showSignature: true,
        isDefault: true,
      },
    ],
  });
  console.log('✔ Document templates seeded');

  // 5. Users
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@apexsolutions.com',
      passwordHash,
      name: 'Vikram Aditya',
      role: 'SUPER_ADMIN',
      phone: '+91 98765 43210',
      status: 'ACTIVE',
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      email: 'finance@apexsolutions.com',
      passwordHash: await bcrypt.hash('Finance@123', 10),
      name: 'Ananya Sharma',
      role: 'FINANCE',
      phone: '+91 98765 43211',
      status: 'ACTIVE',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'sales@apexsolutions.com',
      passwordHash: await bcrypt.hash('Sales@123', 10),
      name: 'Rohan Mehra',
      role: 'SALES',
      phone: '+91 98765 43212',
      status: 'ACTIVE',
    },
  });
  console.log('✔ Users seeded (admin@apexsolutions.com / Admin@123)');

  // 6. Clients
  const client1 = await prisma.client.create({
    data: {
      clientCode: 'CLI-0101',
      companyName: 'TechNova Cloud Corp',
      contactPerson: 'Arun Prakash',
      email: 'arun@technovacorp.example.com',
      phone: '+91 98450 11223',
      website: 'https://technovacorp.example.com',
      address: 'Plot 18, Electronic City Phase 1',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560100',
      gstNumber: '29AABCT1334M1ZV',
      panNumber: 'AABCT1334M',
      industry: 'Cloud Infrastructure & SaaS',
      clientType: 'Enterprise',
      leadSource: 'Referral',
      accountManager: 'Rohan Mehra',
      status: 'ACTIVE',
      tags: 'Tier-1, SaaS, High-Priority',
      notes: 'Key enterprise client. Long term SLA contract.',
      contacts: {
        create: [
          { name: 'Arun Prakash', designation: 'CTO', email: 'arun@technovacorp.example.com', phone: '+91 98450 11223', isPrimary: true },
          { name: 'Megha Nair', designation: 'Head of Procurement', email: 'megha@technovacorp.example.com', phone: '+91 98450 44556', isPrimary: false },
        ],
      },
    },
  });

  const client2 = await prisma.client.create({
    data: {
      clientCode: 'CLI-0102',
      companyName: 'Zenith Health Systems',
      contactPerson: 'Dr. Sunita Rao',
      email: 's.rao@zenithhealth.example.com',
      phone: '+91 98230 77889',
      website: 'https://zenithhealth.example.com',
      address: 'Level 5, Healthcare Hub, BKC',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400051',
      gstNumber: '27AABCS9876R1Z2',
      panNumber: 'AABCS9876R',
      industry: 'Healthcare & MedTech',
      clientType: 'Corporate',
      leadSource: 'Inbound Web',
      accountManager: 'Rohan Mehra',
      status: 'ACTIVE',
      tags: 'Healthcare, HIPAA, Annual-Retainer',
      notes: 'Developing clinical analytics portal and patient portal.',
      contacts: {
        create: [
          { name: 'Dr. Sunita Rao', designation: 'Director of Digital Health', email: 's.rao@zenithhealth.example.com', phone: '+91 98230 77889', isPrimary: true },
        ],
      },
    },
  });

  const client3 = await prisma.client.create({
    data: {
      clientCode: 'CLI-0103',
      companyName: 'BlueWave Logistics Ltd',
      contactPerson: 'Kunal Deshmukh',
      email: 'kunal@bluewave.example.com',
      phone: '+91 98111 22334',
      website: 'https://bluewavelogistics.example.com',
      address: 'Cargo Complex, Aerocity',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110037',
      gstNumber: '07AABCB5566K1Z9',
      panNumber: 'AABCB5566K',
      industry: 'Logistics & Supply Chain',
      clientType: 'Corporate',
      leadSource: 'Cold Outreach',
      accountManager: 'Rohan Mehra',
      status: 'ACTIVE',
      tags: 'Logistics, Fleet-Management',
      notes: 'GPS tracking and automated dispatch backend.',
    },
  });
  console.log('✔ Clients seeded');

  // 7. Vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      vendorCode: 'VEN-0101',
      vendorName: 'CloudScale Infrastructure Services',
      company: 'CloudScale Tech Pte Ltd',
      contactPerson: 'David Miller',
      email: 'billing@cloudscale.example.com',
      phone: '+1 415 555 0199',
      address: '100 Montgomery St, San Francisco, CA',
      gstNumber: '9920USA12345678',
      bankDetails: 'Bank: Silicon Valley Bank, Swift: SVBUS6S, Account: 987654321',
      totalPayable: 185000,
      totalPaid: 150000,
      outstanding: 35000,
      status: 'ACTIVE',
      notes: 'AWS and Cloud hosting infrastructure supplier',
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      vendorCode: 'VEN-0102',
      vendorName: 'WorkHub Executive Co-Working',
      company: 'WorkHub Spaces LLP',
      contactPerson: 'Pooja Hegde',
      email: 'accounts@workhub.example.com',
      phone: '+91 80 6789 0000',
      address: 'Ground Floor, Tech Park, Bangalore',
      gstNumber: '29AAFCW8899K1Z4',
      bankDetails: 'Bank: ICICI Bank, IFSC: ICIC0000104, Acc: 010405001234',
      totalPayable: 120000,
      totalPaid: 120000,
      outstanding: 0,
      status: 'ACTIVE',
      notes: 'Office premise leasing and fiber optic line',
    },
  });
  console.log('✔ Vendors seeded');

  // 8. Expenses
  await prisma.expense.createMany({
    data: [
      {
        expenseCode: 'EXP-2026-0101',
        category: 'Office Rent',
        amount: 60000,
        expenseDate: new Date('2026-09-01'),
        paymentMode: 'BANK_TRANSFER',
        vendorId: vendor2.id,
        description: 'September 2026 Office Space Rent & Facilities',
        referenceNumber: 'NEFT-RENT-SEP26',
        notes: 'Monthly recurring office lease payment',
        createdBy: 'finance@apexsolutions.com',
      },
      {
        expenseCode: 'EXP-2026-0102',
        category: 'Hosting & Cloud',
        amount: 85000,
        expenseDate: new Date('2026-09-05'),
        paymentMode: 'CREDIT_CARD',
        vendorId: vendor1.id,
        description: 'Dedicated Kubernetes cluster & CDN nodes for Q3',
        referenceNumber: 'CC-TXN-98441',
        notes: 'Production server hosting bill',
        createdBy: 'finance@apexsolutions.com',
      },
      {
        expenseCode: 'EXP-2026-0103',
        category: 'Software Subscription',
        amount: 25000,
        expenseDate: new Date('2026-09-10'),
        paymentMode: 'CREDIT_CARD',
        description: 'GitHub Enterprise, JetBrains, Figma & Slack team licenses',
        referenceNumber: 'SLK-2026-SUBS',
        notes: 'Developer tooling subscriptions',
        createdBy: 'admin@apexsolutions.com',
      },
    ],
  });
  console.log('✔ Expenses seeded');

  // 9. Quotations with Revision & Negotiation History
  const quote1 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2026-0101',
      revisionNumber: 1,
      clientId: client1.id,
      quotationDate: new Date('2026-09-01'),
      expiryDate: new Date('2026-10-01'),
      status: 'APPROVED',
      subtotal: 250000,
      discountRate: 5,
      discountAmount: 12500,
      taxRate: 18,
      taxAmount: 42750,
      totalAmount: 280250,
      notes: 'Includes 3 months of post-deployment hypercare support and SLA guarantee.',
      terms: '50% advance upon contract signing, 30% on staging delivery, 20% on go-live.',
      isDigitallySigned: true,
      signedAt: new Date('2026-09-03'),
      signedBy: 'Vikram Aditya (SUPER_ADMIN)',
      createdBy: 'sales@apexsolutions.com',
      items: {
        create: [
          { itemOrder: 1, description: 'Microservices Architecture Design & Docker Containerization', quantity: 1, unitPrice: 90000, discountPercent: 0, taxPercent: 18, totalPrice: 106200 },
          { itemOrder: 2, description: 'Client Portal Full-Stack React & Node.js Implementation', quantity: 1, unitPrice: 110000, discountPercent: 0, taxPercent: 18, totalPrice: 129800 },
          { itemOrder: 3, description: 'Automated CI/CD Pipeline Setup & Testing Suite', quantity: 1, unitPrice: 50000, discountPercent: 25, taxPercent: 18, totalPrice: 44250 },
        ],
      },
      negotiations: {
        create: [
          {
            round: 1,
            proposedBy: 'CLIENT',
            personName: 'Arun Prakash (CTO, TechNova)',
            previousAmount: 300000,
            offeredAmount: 260000,
            changeAmount: -40000,
            reason: 'Requested discount for annual partnership commitment',
            notes: 'Client requested lowering CI/CD pipeline cost',
            status: 'COUNTER_OFFERED',
          },
          {
            round: 2,
            proposedBy: 'COMPANY',
            personName: 'Rohan Mehra (Sales, Apex)',
            previousAmount: 260000,
            offeredAmount: 280250,
            changeAmount: 20250,
            reason: 'Offered 5% overall discount with complimentary 3 months SLA support',
            notes: 'Agreed on ₹2,80,250 inclusive of taxes',
            status: 'ACCEPTED',
          },
        ],
      },
    },
  });

  const quote2 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2026-0102',
      revisionNumber: 0,
      clientId: client2.id,
      quotationDate: new Date('2026-09-12'),
      expiryDate: new Date('2026-10-12'),
      status: 'NEGOTIATION',
      subtotal: 180000,
      discountRate: 0,
      discountAmount: 0,
      taxRate: 18,
      taxAmount: 32400,
      totalAmount: 212400,
      notes: 'HIPAA compliant cloud storage encryption and audit logs included.',
      terms: '30 days payment terms from milestone approval.',
      isDigitallySigned: true,
      signedAt: new Date('2026-09-12'),
      signedBy: 'Vikram Aditya (SUPER_ADMIN)',
      createdBy: 'sales@apexsolutions.com',
      items: {
        create: [
          { itemOrder: 1, description: 'Electronic Health Record (EHR) Integration Service', quantity: 1, unitPrice: 120000, discountPercent: 0, taxPercent: 18, totalPrice: 141600 },
          { itemOrder: 2, description: 'Role-based Patient Analytics & Compliance Dashboard', quantity: 1, unitPrice: 60000, discountPercent: 0, taxPercent: 18, totalPrice: 70800 },
        ],
      },
      negotiations: {
        create: [
          {
            round: 1,
            proposedBy: 'CLIENT',
            personName: 'Dr. Sunita Rao (Zenith Health)',
            previousAmount: 212400,
            offeredAmount: 190000,
            changeAmount: -22400,
            reason: 'Budget constraint for Q3 MedTech initiative',
            notes: 'Awaiting internal sales approval on 10% discount',
            status: 'PENDING',
          },
        ],
      },
    },
  });

  const quote3 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2026-0103',
      revisionNumber: 0,
      clientId: client3.id,
      quotationDate: new Date('2026-09-18'),
      expiryDate: new Date('2026-10-18'),
      status: 'SENT',
      subtotal: 150000,
      discountRate: 0,
      discountAmount: 0,
      taxRate: 18,
      taxAmount: 27000,
      totalAmount: 177000,
      notes: 'Real-time telemetry GPS parsing and driver mobile app backend.',
      terms: 'Standard milestones: 40% advance, 40% UAT, 20% release.',
      isDigitallySigned: false,
      createdBy: 'sales@apexsolutions.com',
      items: {
        create: [
          { itemOrder: 1, description: 'Fleet GPS Streaming Telemetry API Gateway', quantity: 1, unitPrice: 90000, discountPercent: 0, taxPercent: 18, totalPrice: 106200 },
          { itemOrder: 2, description: 'Driver Dispatch Mobile App Backend Services', quantity: 1, unitPrice: 60000, discountPercent: 0, taxPercent: 18, totalPrice: 70800 },
        ],
      },
    },
  });
  console.log('✔ Quotations seeded');

  // 10. Invoices & Payments (Advance, Partial, Due balance calculations)
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0101',
      clientId: client1.id,
      quotationId: quote1.id,
      invoiceDate: new Date('2026-09-04'),
      dueDate: new Date('2026-09-25'),
      status: 'PARTIALLY_PAID',
      subtotal: 250000,
      discountAmount: 12500,
      taxAmount: 42750,
      totalAmount: 280250,
      paidAmount: 140000,
      balanceDue: 140250,
      notes: 'Milestone 1 completed. 50% advance invoiced.',
      terms: 'Payment due on receipt. Wire to HDFC Bank.',
      isDigitallySigned: true,
      signedAt: new Date('2026-09-04'),
      signedBy: 'Vikram Aditya (SUPER_ADMIN)',
      createdBy: 'finance@apexsolutions.com',
      items: {
        create: [
          { itemOrder: 1, description: 'Milestone 1: Architecture Design & Docker Setup', quantity: 1, unitPrice: 100000, discountPercent: 0, taxPercent: 18, totalPrice: 118000 },
          { itemOrder: 2, description: 'Milestone 2: Client Portal Phase 1 Core Backend', quantity: 1, unitPrice: 150000, discountPercent: 8.33, taxPercent: 18, totalPrice: 162250 },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0102',
      clientId: client2.id,
      invoiceDate: new Date('2026-08-15'),
      dueDate: new Date('2026-08-30'),
      status: 'PAID',
      subtotal: 80000,
      discountAmount: 0,
      taxAmount: 14400,
      totalAmount: 94400,
      paidAmount: 94400,
      balanceDue: 0,
      notes: 'Security Audit & Vulnerability Assessment Report',
      terms: 'Net 15 days.',
      isDigitallySigned: true,
      signedAt: new Date('2026-08-15'),
      signedBy: 'Vikram Aditya (SUPER_ADMIN)',
      createdBy: 'finance@apexsolutions.com',
      items: {
        create: [
          { itemOrder: 1, description: 'HIPAA Cloud Infrastructure Security & Penetration Audit', quantity: 1, unitPrice: 80000, discountPercent: 0, taxPercent: 18, totalPrice: 94400 },
        ],
      },
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0103',
      clientId: client3.id,
      invoiceDate: new Date('2026-08-20'),
      dueDate: new Date('2026-09-05'),
      status: 'OVERDUE',
      subtotal: 45000,
      discountAmount: 0,
      taxAmount: 8100,
      totalAmount: 53100,
      paidAmount: 0,
      balanceDue: 53100,
      notes: 'Annual Telemetry Map License & Support Fee',
      terms: 'Immediate payment requested.',
      isDigitallySigned: true,
      signedAt: new Date('2026-08-20'),
      signedBy: 'Vikram Aditya (SUPER_ADMIN)',
      createdBy: 'finance@apexsolutions.com',
      items: {
        create: [
          { itemOrder: 1, description: 'Map Telemetry Annual Integration API Keys', quantity: 1, unitPrice: 45000, discountPercent: 0, taxPercent: 18, totalPrice: 53100 },
        ],
      },
    },
  });

  // 11. Payments against Invoices
  // Advance payment on Invoice 1
  await prisma.payment.create({
    data: {
      receiptNumber: 'REC-2026-0101',
      invoiceId: invoice1.id,
      clientId: client1.id,
      paymentType: 'ADVANCE',
      amount: 100000,
      paymentDate: new Date('2026-09-05'),
      paymentMode: 'BANK_TRANSFER',
      referenceNumber: 'HDFC-NEFT-991204',
      bankAccount: 'HDFC Bank (Acct ...5678)',
      notes: 'Initial 50% project kickoff advance payment',
      isDigitallySigned: true,
      signedAt: new Date('2026-09-05'),
      signedBy: 'Ananya Sharma (FINANCE)',
      createdBy: 'finance@apexsolutions.com',
    },
  });

  // Partial payment on Invoice 1
  await prisma.payment.create({
    data: {
      receiptNumber: 'REC-2026-0102',
      invoiceId: invoice1.id,
      clientId: client1.id,
      paymentType: 'PARTIAL',
      amount: 40000,
      paymentDate: new Date('2026-09-18'),
      paymentMode: 'UPI',
      referenceNumber: 'UPI-TXN-299388102',
      bankAccount: 'HDFC Bank (Acct ...5678)',
      notes: 'Interim sprint milestone payment',
      isDigitallySigned: true,
      signedAt: new Date('2026-09-18'),
      signedBy: 'Ananya Sharma (FINANCE)',
      createdBy: 'finance@apexsolutions.com',
    },
  });

  // Full payment on Invoice 2
  await prisma.payment.create({
    data: {
      receiptNumber: 'REC-2026-0103',
      invoiceId: invoice2.id,
      clientId: client2.id,
      paymentType: 'FULL',
      amount: 94400,
      paymentDate: new Date('2026-08-25'),
      paymentMode: 'BANK_TRANSFER',
      referenceNumber: 'ICIC-RTGS-881230',
      bankAccount: 'HDFC Bank (Acct ...5678)',
      notes: 'Full clearance for Security Audit Invoice',
      isDigitallySigned: true,
      signedAt: new Date('2026-08-25'),
      signedBy: 'Ananya Sharma (FINANCE)',
      createdBy: 'finance@apexsolutions.com',
    },
  });

  // 12. Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        userEmail: adminUser.email,
        module: 'AUTH',
        action: 'LOGIN',
        ipAddress: '127.0.0.1',
        details: 'Admin logged into system dashboard',
      },
      {
        userId: adminUser.id,
        userEmail: adminUser.email,
        module: 'SETTINGS',
        action: 'SETTINGS_CHANGE',
        ipAddress: '127.0.0.1',
        details: 'Configured company profile and digital signature PIN',
      },
      {
        userId: salesUser.id,
        userEmail: salesUser.email,
        module: 'QUOTATION',
        action: 'CREATE',
        entityId: quote1.id,
        entityType: 'QUOTATION',
        ipAddress: '127.0.0.1',
        details: 'Created quotation QT-2026-0101 for TechNova Cloud Corp',
      },
      {
        userId: adminUser.id,
        userEmail: adminUser.email,
        module: 'QUOTATION',
        action: 'SIGN',
        entityId: quote1.id,
        entityType: 'QUOTATION',
        ipAddress: '127.0.0.1',
        details: 'Verified 4-digit PIN and digitally signed quotation QT-2026-0101',
      },
      {
        userId: financeUser.id,
        userEmail: financeUser.email,
        module: 'PAYMENT',
        action: 'CREATE',
        entityId: invoice1.id,
        entityType: 'PAYMENT',
        ipAddress: '127.0.0.1',
        details: 'Recorded advance payment REC-2026-0101 for ₹1,00,000 against INV-2026-0101',
      },
    ],
  });

  console.log('🎉 Database successfully seeded with production-ready realistic business data!');
}

seed()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
