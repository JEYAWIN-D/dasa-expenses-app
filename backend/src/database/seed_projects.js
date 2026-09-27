import { prisma } from '../config/prisma.js';

async function seedProjectsAndAccounts() {
  console.log('🚀 Seeding Financial Accounts, Projects, Milestones, Split Payments & Ledgers...');

  // 1. Ensure NumberingConfig for PROJECT exists
  await prisma.numberingConfig.upsert({
    where: { documentType: 'PROJECT' },
    update: {},
    create: {
      documentType: 'PROJECT',
      prefix: 'PRJ',
      includeFiscalYear: true,
      currentSequence: 104,
      padLength: 4,
    },
  });

  // 2. Financial Accounts (Cash in hand, Google Pay, Banks)
  const accCash = await prisma.financialAccount.upsert({
    where: { accountCode: 'ACC-CASH' },
    update: { currentBalance: 0, openingBalance: 0 },
    create: {
      accountCode: 'ACC-CASH',
      accountName: 'Cash in Hand (Office Vault)',
      accountType: 'CASH',
      openingBalance: 0,
      currentBalance: 0,
      isDefault: false,
      isActive: true,
    },
  });

  const accGpay = await prisma.financialAccount.upsert({
    where: { accountCode: 'ACC-GPAY' },
    update: { currentBalance: 28000 },
    create: {
      accountCode: 'ACC-GPAY',
      accountName: 'Google Pay / UPI (DASA TECH)',
      accountType: 'UPI',
      openingBalance: 27000,
      currentBalance: 28000,
      isDefault: false,
      isActive: true,
    },
  });

  const accHdfc = await prisma.financialAccount.upsert({
    where: { accountCode: 'ACC-HDFC' },
    update: { currentBalance: 485000 },
    create: {
      accountCode: 'ACC-HDFC',
      accountName: 'HDFC Bank Ltd Current A/C',
      accountType: 'BANK',
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200012345678',
      ifscCode: 'HDFC0001234',
      openingBalance: 350000,
      currentBalance: 485000,
      isDefault: true,
      isActive: true,
    },
  });

  const accIcici = await prisma.financialAccount.upsert({
    where: { accountCode: 'ACC-ICICI' },
    update: { currentBalance: 150000 },
    create: {
      accountCode: 'ACC-ICICI',
      accountName: 'ICICI Bank Operations Reserve',
      accountType: 'BANK',
      bankName: 'ICICI Bank Ltd',
      accountNumber: '001105023944',
      ifscCode: 'ICIC0000011',
      openingBalance: 150000,
      currentBalance: 150000,
      isDefault: false,
      isActive: true,
    },
  });
  console.log('✔ Financial accounts initialized (Cash in Hand, GPay, HDFC, ICICI)');

  // 3. Find Clients & Quotations
  const clients = await prisma.client.findMany({ take: 3 });
  if (clients.length === 0) {
    console.error('No clients found. Please run main seed first.');
    return;
  }
  const client1 = clients[0];
  const client2 = clients.length > 1 ? clients[1] : clients[0];

  const quotations = await prisma.quotation.findMany({ take: 2 });
  const quote1 = quotations[0] || null;

  // 4. Create Project 1: Enterprise Cloud Migration (TechNova)
  const existingPrj1 = await prisma.project.findFirst({ where: { projectCode: 'PRJ-2026-0101' } });
  if (!existingPrj1) {
    const prj1 = await prisma.project.create({
      data: {
        projectCode: 'PRJ-2026-0101',
        name: 'Enterprise Cloud Migration & Microservices',
        description: 'Complete containerization, multi-region Kubernetes deployment and zero-downtime database migration.',
        clientId: client1.id,
        quotationId: quote1?.id || null,
        status: 'IN_PROGRESS',
        startDate: new Date('2026-09-01'),
        deadline: new Date('2026-11-30'),
        quotationValue: 280000,
        additionalCharges: 20000,
        totalProjectValue: 300000,
        advanceRequiredPercent: 50,
        advanceRequiredAmount: 150000,
        advanceReceived: 140000,
        assignedTeam: JSON.stringify([
          { name: 'DASA', role: 'Solutions Architect & Lead', email: 'dasatechmu@gmail.com' },
          { name: 'Kavitha R', role: 'DevOps Engineer', email: 'kavitha@dasatech.com' },
          { name: 'Sanjay P', role: 'Full Stack Dev', email: 'sanjay@dasatech.com' },
        ]),
        handoverStatus: 'NOT_READY',
      },
    });

    // Milestones for Project 1
    const m1 = await prisma.projectMilestone.create({
      data: {
        projectId: prj1.id,
        title: 'Phase 1: Architecture & 50% Advance Kickoff',
        milestoneOrder: 1,
        percentage: 50,
        amount: 150000,
        dueDate: new Date('2026-09-05'),
        status: 'PARTIALLY_PAID',
        paidAmount: 140000,
        notes: 'Advance agreement signed. ₹1,40,000 received; ₹10,000 pending clearance.',
      },
    });

    const m2 = await prisma.projectMilestone.create({
      data: {
        projectId: prj1.id,
        title: 'Phase 2: Staging Testing & Data Sync (30%)',
        milestoneOrder: 2,
        percentage: 30,
        amount: 90000,
        dueDate: new Date('2026-10-15'),
        status: 'PENDING',
        paidAmount: 0,
        notes: 'Due upon successful staging UAT sign-off.',
      },
    });

    const m3 = await prisma.projectMilestone.create({
      data: {
        projectId: prj1.id,
        title: 'Phase 3: Production Cutover & Handover (20%)',
        milestoneOrder: 3,
        percentage: 20,
        amount: 60000,
        dueDate: new Date('2026-11-30'),
        status: 'PENDING',
        paidAmount: 0,
        notes: 'Final settlement required for handover clearance.',
      },
    });

    // Advance Payment with Split for Project 1
    const pay1 = await prisma.payment.create({
      data: {
        receiptNumber: 'REC-2026-0105',
        clientId: client1.id,
        projectId: prj1.id,
        milestoneId: m1.id,
        paymentType: 'ADVANCE',
        amount: 140000,
        paymentDate: new Date('2026-09-05'),
        paymentMode: 'BANK_TRANSFER',
        referenceNumber: 'HDFC-NEFT-991204',
        notes: 'Advance payment split across Bank NEFT and Corporate UPI',
        isDigitallySigned: true,
        signedAt: new Date('2026-09-05'),
        signedBy: 'DASA (Managing Director)',
        splits: {
          create: [
            { paymentMode: 'BANK_TRANSFER', amount: 125000, accountId: accHdfc.id, accountName: accHdfc.accountName, referenceNumber: 'HDFC-NEFT-991204' },
            { paymentMode: 'UPI', amount: 15000, accountId: accGpay.id, accountName: accGpay.accountName, referenceNumber: 'UPI-TXN-90211' },
          ],
        },
      },
    });

    // Expenses against Project 1
    await prisma.expense.create({
      data: {
        expenseCode: 'EXP-2026-0104',
        category: 'Cloud Hosting & Infra',
        amount: 24500,
        expenseDate: new Date('2026-09-06'),
        paymentMode: 'BANK_TRANSFER',
        projectId: prj1.id,
        accountId: accHdfc.id,
        description: 'AWS Multi-region VPC, ECS Cluster and Aurora Postgres setup',
        referenceNumber: 'AWS-INV-7712',
        approvalStatus: 'APPROVED',
        approvedBy: 'DASA',
        approvedAt: new Date('2026-09-06'),
      },
    });

    await prisma.expense.create({
      data: {
        expenseCode: 'EXP-2026-0105',
        category: 'Consulting & Freelancers',
        amount: 35000,
        expenseDate: new Date('2026-09-12'),
        paymentMode: 'BANK_TRANSFER',
        projectId: prj1.id,
        accountId: accHdfc.id,
        description: 'Database migration specialist contract - 40 hours',
        referenceNumber: 'CON-INV-4412',
        approvalStatus: 'APPROVED',
        approvedBy: 'DASA',
        approvedAt: new Date('2026-09-12'),
      },
    });

    await prisma.expense.create({
      data: {
        expenseCode: 'EXP-2026-0106',
        category: 'Travel & Client Meetings',
        amount: 4200,
        expenseDate: new Date('2026-09-14'),
        paymentMode: 'CASH',
        projectId: prj1.id,
        accountId: accCash.id,
        description: 'Client onsite architecture workshop travel & meals',
        isReimbursable: true,
        employeeName: 'Kavitha R',
        reimbursementStatus: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'DASA',
        approvedAt: new Date('2026-09-15'),
      },
    });
    console.log('✔ Project 1 seeded: PRJ-2026-0101 (Enterprise Cloud Migration)');
  }

  // 5. Create Project 2: DASA Billing & Finance Portal (Zenith Retail India)
  // EXACT USER EXAMPLE: Advance payment of ₹11,200 (₹9,000 cash, ₹1,000 GPay, ₹1,200 bank transfer)
  const existingPrj2 = await prisma.project.findFirst({ where: { projectCode: 'PRJ-2026-0102' } });
  if (!existingPrj2) {
    const prj2 = await prisma.project.create({
      data: {
        projectCode: 'PRJ-2026-0102',
        name: 'Custom Quotation & Billing Financial Management System',
        description: 'End-to-end multi-project billing, advance tracking, split payments and automated handover workflow.',
        clientId: client2.id,
        status: 'IN_PROGRESS',
        startDate: new Date('2026-09-10'),
        deadline: new Date('2026-10-31'),
        quotationValue: 25000,
        additionalCharges: 0,
        totalProjectValue: 25000,
        advanceRequiredPercent: 44.8,
        advanceRequiredAmount: 11200,
        advanceReceived: 11200,
        assignedTeam: JSON.stringify([
          { name: 'DASA', role: 'Full Stack Architect', email: 'dasatechmu@gmail.com' },
          { name: 'Jeyawanthan', role: 'Senior React Engineer', email: 'jeya@dasatech.com' },
        ]),
        handoverStatus: 'NOT_READY',
      },
    });

    // Milestones for Project 2: Customizable payment milestones
    const m1 = await prisma.projectMilestone.create({
      data: {
        projectId: prj2.id,
        title: 'Phase 1: Advance Sign-off & UI Prototyping',
        milestoneOrder: 1,
        percentage: 44.8,
        amount: 11200,
        dueDate: new Date('2026-09-10'),
        status: 'PAID',
        paidAmount: 11200,
        completedAt: new Date('2026-09-10'),
        notes: 'Initial deposit received via multi-method payment.',
      },
    });

    const m2 = await prisma.projectMilestone.create({
      data: {
        projectId: prj2.id,
        title: 'Phase 2: Core Ledgers, Expense Tracking & Cash/Bank Module (32%)',
        milestoneOrder: 2,
        percentage: 32,
        amount: 8000,
        dueDate: new Date('2026-10-05'),
        status: 'PENDING',
        paidAmount: 0,
        notes: 'Payment upon delivery of expense ledger & cashflow system.',
      },
    });

    const m3 = await prisma.projectMilestone.create({
      data: {
        projectId: prj2.id,
        title: 'Phase 3: Final Payment Clearance & Project Handover (23.2%)',
        milestoneOrder: 3,
        percentage: 23.2,
        amount: 5800,
        dueDate: new Date('2026-10-31'),
        status: 'PENDING',
        paidAmount: 0,
        notes: 'Must be verified with zero outstanding prior to handover clearance.',
      },
    });

    // Advance Payment matching the user's specific multi-method example:
    // "single advance payment may consist of ₹9,000 in cash, ₹1,000 through GPay and ₹1,200 through bank transfer"
    await prisma.payment.create({
      data: {
        receiptNumber: 'REC-2026-0106',
        clientId: client2.id,
        projectId: prj2.id,
        milestoneId: m1.id,
        paymentType: 'ADVANCE',
        amount: 11200,
        paymentDate: new Date('2026-09-10'),
        paymentMode: 'CASH',
        referenceNumber: 'SPLIT-ADV-2026',
        bankAccount: 'Split: Cash + GPay + HDFC',
        notes: 'Multi-method Advance Payment: ₹9,000 in cash, ₹1,000 through GPay, ₹1,200 via HDFC bank transfer',
        isDigitallySigned: true,
        signedAt: new Date('2026-09-10'),
        signedBy: 'DASA (Managing Director)',
        splits: {
          create: [
            { paymentMode: 'CASH', amount: 9000, accountId: accCash.id, accountName: 'Cash in Hand (Office Vault)', referenceNumber: 'CASH-REC-01', notes: 'Physical cash received at office' },
            { paymentMode: 'UPI', amount: 1000, accountId: accGpay.id, accountName: 'Google Pay / UPI (DASA TECH)', referenceNumber: 'GPAY-UPI-882194', notes: 'GPay mobile transfer' },
            { paymentMode: 'BANK_TRANSFER', amount: 1200, accountId: accHdfc.id, accountName: 'HDFC Bank Ltd Current A/C', referenceNumber: 'HDFC-IMPS-77120', notes: 'Instant IMPS to HDFC bank account' },
          ],
        },
      },
    });

    // Project 2 Expenses (Deducted from available funds)
    await prisma.expense.create({
      data: {
        expenseCode: 'EXP-2026-0107',
        category: 'UI/UX Assets & Typography',
        amount: 1800,
        expenseDate: new Date('2026-09-12'),
        paymentMode: 'UPI',
        projectId: prj2.id,
        accountId: accGpay.id,
        description: 'Icon library enterprise license & typography assets',
        referenceNumber: 'LUCIDE-PRO-2026',
        approvalStatus: 'APPROVED',
        approvedBy: 'DASA',
        approvedAt: new Date('2026-09-12'),
      },
    });

    await prisma.expense.create({
      data: {
        expenseCode: 'EXP-2026-0108',
        category: 'Hosting & Domain Services',
        amount: 2400,
        expenseDate: new Date('2026-09-15'),
        paymentMode: 'BANK_TRANSFER',
        projectId: prj2.id,
        accountId: accHdfc.id,
        description: 'Cloud VPS node & SSL wildcard certificate',
        referenceNumber: 'HOST-INV-9931',
        approvalStatus: 'APPROVED',
        approvedBy: 'DASA',
        approvedAt: new Date('2026-09-15'),
      },
    });
    console.log('✔ Project 2 seeded: PRJ-2026-0102 (Multi-Method Advance: ₹9,000 Cash + ₹1,000 GPay + ₹1,200 Bank = ₹11,200)');
  }

  // 6. Create Project 3: Completed & Fully Handed Over (Zenith Retail India)
  const existingPrj3 = await prisma.project.findFirst({ where: { projectCode: 'PRJ-2026-0103' } });
  if (!existingPrj3) {
    const prj3 = await prisma.project.create({
      data: {
        projectCode: 'PRJ-2026-0103',
        name: 'Cybersecurity Infrastructure Hardening & Audit',
        description: 'Firewall architecture review, penetration testing, compliance certification and security training.',
        clientId: client2.id,
        status: 'HANDED_OVER',
        startDate: new Date('2026-08-01'),
        deadline: new Date('2026-08-30'),
        completedDate: new Date('2026-08-28'),
        handoverDate: new Date('2026-08-30'),
        quotationValue: 94400,
        additionalCharges: 0,
        totalProjectValue: 94400,
        advanceRequiredPercent: 50,
        advanceRequiredAmount: 47200,
        advanceReceived: 47200,
        assignedTeam: JSON.stringify([
          { name: 'DASA', role: 'Security Auditor', email: 'dasatechmu@gmail.com' },
        ]),
        handoverStatus: 'HANDED_OVER',
        handoverApprovedBy: 'DASA (Managing Director)',
        handoverNotes: 'Zero outstanding balance confirmed. All deliverables validated and handover certificate officially signed.',
      },
    });

    // Milestones for Project 3
    await prisma.projectMilestone.createMany({
      data: [
        {
          projectId: prj3.id,
          title: 'Phase 1: Initial Security Audit & Threat Modeling (50%)',
          milestoneOrder: 1,
          percentage: 50,
          amount: 47200,
          dueDate: new Date('2026-08-05'),
          status: 'PAID',
          paidAmount: 47200,
          completedAt: new Date('2026-08-05'),
        },
        {
          projectId: prj3.id,
          title: 'Phase 2: Remediation & Final Handover Certification (50%)',
          milestoneOrder: 2,
          percentage: 50,
          amount: 47200,
          dueDate: new Date('2026-08-28'),
          status: 'PAID',
          paidAmount: 47200,
          completedAt: new Date('2026-08-28'),
        },
      ],
    });

    // Payments for Project 3 (Total ₹94,400 received -> Balance ₹0)
    await prisma.payment.create({
      data: {
        receiptNumber: 'REC-2026-0107',
        clientId: client2.id,
        projectId: prj3.id,
        paymentType: 'ADVANCE',
        amount: 47200,
        paymentDate: new Date('2026-08-05'),
        paymentMode: 'BANK_TRANSFER',
        referenceNumber: 'HDFC-RTGS-551201',
        bankAccount: 'HDFC Bank Ltd Current A/C',
        notes: 'Advance 50% payment for security hardening',
        isDigitallySigned: true,
        signedAt: new Date('2026-08-05'),
        signedBy: 'DASA',
        splits: {
          create: [
            { paymentMode: 'BANK_TRANSFER', amount: 47200, accountId: accHdfc.id, accountName: 'HDFC Bank Ltd Current A/C', referenceNumber: 'HDFC-RTGS-551201' },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        receiptNumber: 'REC-2026-0108',
        clientId: client2.id,
        projectId: prj3.id,
        paymentType: 'FULL',
        amount: 47200,
        paymentDate: new Date('2026-08-28'),
        paymentMode: 'BANK_TRANSFER',
        referenceNumber: 'HDFC-IMPS-88912',
        bankAccount: 'HDFC Bank Ltd Current A/C',
        notes: 'Final settlement payment cleared prior to handover',
        isDigitallySigned: true,
        signedAt: new Date('2026-08-28'),
        signedBy: 'DASA',
        splits: {
          create: [
            { paymentMode: 'BANK_TRANSFER', amount: 47200, accountId: accHdfc.id, accountName: 'HDFC Bank Ltd Current A/C', referenceNumber: 'HDFC-IMPS-88912' },
          ],
        },
      },
    });

    // Project 3 Expenses
    await prisma.expense.create({
      data: {
        expenseCode: 'EXP-2026-0109',
        category: 'Third-Party Security Tooling',
        amount: 18000,
        expenseDate: new Date('2026-08-10'),
        paymentMode: 'BANK_TRANSFER',
        projectId: prj3.id,
        accountId: accHdfc.id,
        description: 'Vulnerability scan credits & external penetration report fee',
        referenceNumber: 'SEC-TOOL-881',
        approvalStatus: 'APPROVED',
        approvedBy: 'DASA',
        approvedAt: new Date('2026-08-10'),
      },
    });
    console.log('✔ Project 3 seeded: PRJ-2026-0103 (Completed & Handed Over with Zero Balance)');
  }

  console.log('🎉 All Project & Financial tracking data successfully seeded!');
}

seedProjectsAndAccounts()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
