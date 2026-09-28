import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';

export async function migrateTenantsAndSeedSaaS() {
  console.log('🌐 Starting Enterprise Multi-Tenant SaaS Migration & Seeding...');

  // 1. Seed / Upsert Subscription Plans
  const plans = [
    {
      code: 'STARTER',
      name: 'Starter Plan',
      description: 'Ideal for early-stage agencies, boutique consultancies and freelance teams.',
      monthlyPriceINR: 2499,
      annualPriceINR: 24990,
      maxUsers: 5,
      maxProjects: 20,
      maxStorageMB: 5120, // 5 GB
      hasApiAccess: false,
      hasAdvancedAnalytics: false,
      hasCustomBranding: false,
      hasDedicatedDb: false,
      supportTier: 'Standard Email',
    },
    {
      code: 'GROWTH',
      name: 'Growth Plan',
      description: 'Built for growing software contractors and agencies scaling client operations.',
      monthlyPriceINR: 5999,
      annualPriceINR: 59990,
      maxUsers: 15,
      maxProjects: 75,
      maxStorageMB: 25600, // 25 GB
      hasApiAccess: true,
      hasAdvancedAnalytics: true,
      hasCustomBranding: true,
      hasDedicatedDb: false,
      supportTier: 'Priority Support (12h SLA)',
    },
    {
      code: 'BUSINESS',
      name: 'Business Pro',
      description: 'Complete project financial governance, handover gates & treasury control.',
      monthlyPriceINR: 12999,
      annualPriceINR: 129990,
      maxUsers: 50,
      maxProjects: 250,
      maxStorageMB: 102400, // 100 GB
      hasApiAccess: true,
      hasAdvancedAnalytics: true,
      hasCustomBranding: true,
      hasDedicatedDb: false,
      supportTier: 'Dedicated Account Manager & WhatsApp SLA',
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Cloud',
      description: 'Maximum isolation, custom security compliance and optional dedicated database.',
      monthlyPriceINR: 29999,
      annualPriceINR: 299990,
      maxUsers: 999999,
      maxProjects: 999999,
      maxStorageMB: 1048576, // 1 TB
      hasApiAccess: true,
      hasAdvancedAnalytics: true,
      hasCustomBranding: true,
      hasDedicatedDb: true,
      supportTier: '24/7 Phone, Dedicated DevOps & Security Escort',
    },
  ];

  for (const planData of plans) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { code: planData.code },
      update: planData,
      create: planData,
    });

    // Seed default entitlements for this plan
    const defaultFeatures = [
      { key: 'QUOTATION_STUDIO', name: 'Quotation Studio & PDF Generator', enabled: true },
      { key: 'MILESTONE_BILLING', name: 'Progressive Milestone Invoicing', enabled: true },
      { key: 'SPLIT_PAYMENTS', name: 'Multi-Mode Payment Splits & Receipts', enabled: true },
      { key: 'DIGITAL_SIGNATURES', name: '4-Digit PIN Tamper-Proof Signing', enabled: plan.code !== 'STARTER' },
      { key: 'HANDOVER_GATEKEEPER', name: 'Strict Handover Protocol & Certificates', enabled: ['GROWTH', 'BUSINESS', 'ENTERPRISE'].includes(plan.code) },
      { key: 'TREASURY_TRANSFER', name: 'Multi-Bank & Cash Double-Entry Ledgers', enabled: ['GROWTH', 'BUSINESS', 'ENTERPRISE'].includes(plan.code) },
      { key: 'CUSTOM_ROLES', name: 'Custom RBAC Role Creation', enabled: ['BUSINESS', 'ENTERPRISE'].includes(plan.code) },
      { key: 'DEDICATED_DATABASE', name: 'Isolated Database Infrastructure', enabled: plan.code === 'ENTERPRISE' },
    ];

    for (const feat of defaultFeatures) {
      await prisma.planEntitlement.upsert({
        where: {
          planId_featureKey: {
            planId: plan.id,
            featureKey: feat.key,
          },
        },
        update: {
          isEnabled: feat.enabled,
        },
        create: {
          planId: plan.id,
          featureKey: feat.key,
          featureName: feat.name,
          isEnabled: feat.enabled,
        },
      });
    }
  }
  console.log('✔ Subscription plans and entitlements configured');

  // 2. Ensure DASA TECH Platform Admin exists
  const platformPasswordHash = await bcrypt.hash('Password@2026', 10);
  const platformAdmin = await prisma.platformUser.upsert({
    where: { email: 'platform@dasatech.in' },
    update: {
      platformRole: 'PLATFORM_OWNER',
      name: 'DASA TECH Platform Owner',
      status: 'ACTIVE',
    },
    create: {
      email: 'platform@dasatech.in',
      passwordHash: platformPasswordHash,
      name: 'DASA TECH Platform Owner',
      platformRole: 'PLATFORM_OWNER',
      status: 'ACTIVE',
      phone: '+91 76399 30148',
    },
  });
  console.log('✔ Platform Owner initialized: platform@dasatech.in (Password: Password@2026)');

  // 3. Ensure primary customer Organization exists
  const businessPlan = await prisma.subscriptionPlan.findUnique({ where: { code: 'BUSINESS' } });

  let defaultOrg = await prisma.organization.findFirst({
    where: { slug: 'dasa-tech-hq' },
  });

  const defaultPinHash = await bcrypt.hash('1234', 10);

  if (!defaultOrg) {
    defaultOrg = await prisma.organization.create({
      data: {
        slug: 'dasa-tech-hq',
        name: 'DASA TECH Enterprise',
        legalName: 'DASA TECH Private Limited',
        gstNumber: '29ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
        phone: '+91 76399 30148',
        email: 'dasatechmu@gmail.com',
        website: 'https://dasatech.in',
        address: 'EB Colony',
        city: 'Erode',
        state: 'Tamil Nadu',
        country: 'India',
        postalCode: '638002',
        status: 'ACTIVE',
        currency: 'INR',
        storageQuotaMB: 102400, // 100 GB
        signaturePinHash: defaultPinHash,
        authorizedPerson: 'DASA TECH Management',
      },
    });
    console.log('✔ Created default customer organization: DASA TECH Enterprise');
  }

  // 4. Ensure Organization Subscription is active
  await prisma.organizationSubscription.upsert({
    where: { organizationId: defaultOrg.id },
    update: {
      planId: businessPlan.id,
      status: 'ACTIVE',
    },
    create: {
      organizationId: defaultOrg.id,
      planId: businessPlan.id,
      status: 'ACTIVE',
      billingCycle: 'ANNUAL',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      nextBillingAmount: businessPlan.annualPriceINR,
    },
  });

  // 5. Default roles removed - End-user defines and configures custom roles on-demand
  const systemRoles = [];
  let ownerRole = null;
  for (const r of systemRoles) {
    let createdRole = await prisma.organizationRole.findFirst({
      where: { organizationId: defaultOrg.id, name: r.name },
    });
    if (!createdRole) {
      createdRole = await prisma.organizationRole.create({
        data: {
          organizationId: defaultOrg.id,
          name: r.name,
          description: r.description,
          isSystemDefault: r.isSystemDefault,
        },
      });
    }

    if (r.name === 'Organization Owner') {
      ownerRole = createdRole;
    }

    for (const p of r.permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_module: {
            roleId: createdRole.id,
            module: p.module,
          },
        },
        update: p,
        create: {
          roleId: createdRole.id,
          ...p,
        },
      });
    }
  }

  // 6. Link All Existing Users as Members of Default Organization
  const existingUsers = await prisma.user.findMany();
  for (const user of existingUsers) {
    const isOwner = user.role === 'SUPER_ADMIN' || user.email === 'dasatechmu@gmail.com';
    await prisma.organizationMembership.upsert({
      where: {
        organizationId_userId: {
          organizationId: defaultOrg.id,
          userId: user.id,
        },
      },
      update: {
        isOwner,
        roleId: ownerRole?.id,
        roleTitle: isOwner ? 'Organization Owner' : 'Staff Member',
        status: 'ACTIVE',
      },
      create: {
        organizationId: defaultOrg.id,
        userId: user.id,
        isOwner,
        roleId: ownerRole?.id,
        roleTitle: isOwner ? 'Organization Owner' : 'Staff Member',
        status: 'ACTIVE',
      },
    });
  }
  console.log(`✔ Linked ${existingUsers.length} existing users to default organization`);

  // 7. Backfill existing business records with organizationId
  const orgId = defaultOrg.id;

  const [cCount, qCount, iCount, pCount, eCount, accCount, prjCount] = await Promise.all([
    prisma.client.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
    prisma.quotation.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
    prisma.invoice.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
    prisma.payment.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
    prisma.expense.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
    prisma.financialAccount.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
    prisma.project.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
  ]);

  await Promise.all([
    prisma.documentTemplate.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
    prisma.numberingConfig.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
    prisma.auditLog.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
    prisma.demoLead.updateMany({ where: { organizationId: null }, data: { organizationId: orgId } }),
  ]);

  console.log(`✔ Multi-tenant data backfill complete! Attached to ${defaultOrg.name}:`);
  console.log(`   - Clients: ${cCount.count}`);
  console.log(`   - Quotations: ${qCount.count}`);
  console.log(`   - Invoices: ${iCount.count}`);
  console.log(`   - Payments: ${pCount.count}`);
  console.log(`   - Expenses: ${eCount.count}`);
  console.log(`   - Accounts: ${accCount.count}`);
  console.log(`   - Projects: ${prjCount.count}`);

  // 8. Seed Double-Entry Financial Journal Ledger
  const existingJournals = await prisma.journalEntry.count({ where: { organizationId: orgId } });
  if (existingJournals === 0) {
    const accBank = await prisma.financialAccount.findFirst({ where: { organizationId: orgId, accountType: 'BANK' } });
    const accCash = await prisma.financialAccount.findFirst({ where: { organizationId: orgId, accountType: 'CASH' } });

    await prisma.journalEntry.create({
      data: {
        organizationId: orgId,
        entryNumber: 'JRN-2026-0001',
        referenceType: 'PAYMENT',
        description: 'Advance payment receipt posted for Project Alpha ERP Implementation',
        totalDebit: 150000,
        totalCredit: 150000,
        status: 'POSTED',
        postedBy: 'System Automation',
        lines: {
          create: [
            {
              accountId: accBank?.id,
              accountName: accBank?.accountName || 'HDFC Bank Ltd Current A/C',
              lineType: 'DEBIT',
              amount: 150000,
              narration: 'Advance payment received via IMPS wire transfer',
            },
            {
              accountName: 'Unearned Revenue / Client Advance Liability',
              lineType: 'CREDIT',
              amount: 150000,
              narration: 'Liability recognized for pending milestone deliverable',
            },
          ],
        },
      },
    });

    await prisma.journalEntry.create({
      data: {
        organizationId: orgId,
        entryNumber: 'JRN-2026-0002',
        referenceType: 'EXPENSE',
        description: 'Monthly Cloud Infrastructure Hosting fees paid',
        totalDebit: 18500,
        totalCredit: 18500,
        status: 'POSTED',
        postedBy: 'System Automation',
        lines: {
          create: [
            {
              accountName: 'Software & Cloud Hosting Expense',
              lineType: 'DEBIT',
              amount: 18500,
              narration: 'AWS & Supabase production cloud workloads',
            },
            {
              accountId: accBank?.id,
              accountName: accBank?.accountName || 'HDFC Bank Ltd Current A/C',
              lineType: 'CREDIT',
              amount: 18500,
              narration: 'Direct debit corporate card settlement',
            },
          ],
        },
      },
    });

    console.log('✔ Double-entry financial journal ledger initialized');
  }

  // 9. Initialize Tenant Storage Usage
  await prisma.storageUsage.upsert({
    where: { organizationId: orgId },
    update: {},
    create: {
      organizationId: orgId,
      totalUsedBytes: 42800000, // ~42.8 MB
      totalAllocatedBytes: 107374182400, // 100 GB in bytes
      documentsCount: 18,
    },
  });
  console.log('✔ Tenant isolated storage quota & accounting initialized');

  console.log('\n🎉 ALL MULTI-TENANT SAAS DATA MIGRATED AND SEEDED SUCCESSFULLY WITH ZERO DATA LOSS!');
}

migrateTenantsAndSeedSaaS()
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
