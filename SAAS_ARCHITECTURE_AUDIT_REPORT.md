# DASA EXPENCES — Enterprise Multi-Tenant SaaS Architecture & Audit Report

**System:** DASA EXPENCES SaaS Platform  
**Owner & Developer:** DASA TECH (https://dasatech.in)  
**Date:** September 2026  
**Document Version:** 1.0.0 (Enterprise SaaS Upgrade)  

---

## 1. Executive Summary & Codebase Audit

### 1.1 Current Architecture Overview
The current DASA EXPENCES application is built as a single-tenant Node.js (Express + Prisma + PostgreSQL) and React 19 (Vite + Vanilla CSS / Tailwind design system) ERP.
It features modules for:
- Quotation Studio with digital signing and revision history
- Project financial tracking and milestone billing
- Invoicing and split-payment receipts
- Cashflow and multi-account treasury management
- Demo lead capture and sales pipeline
- Digital signature authorization via 4-digit PIN

### 1.2 Identified Architectural Weaknesses & Gaps
1. **Single-Tenant Database Model:**
   - Database entities (`Client`, `Quotation`, `Invoice`, `Payment`, `Expense`, `FinancialAccount`, `Project`, etc.) lack `organizationId` foreign keys.
   - Any authenticated user queries the entire database table without tenant boundaries.
2. **Absence of Platform Administration Boundary:**
   - No separate `/platform-admin` portal exists for DASA TECH to administer customer subscriptions, SaaS plans, storage allocations, security alerts, and tenant health.
3. **Flat Role-Based Access Control (RBAC):**
   - Users are bound to a static global enum (`Role`: `SUPER_ADMIN`, `ADMIN`, `FINANCE`, `SALES`, etc.) instead of organization-scoped memberships with customizable roles and granular permission matrices.
4. **No Subscription & Entitlement Engine:**
   - Missing subscription models (`SubscriptionPlan`, `OrganizationSubscription`, `PlanEntitlement`, `FeatureOverride`). No server-side enforcement of seat limits, project quotas, or storage allowances.
5. **Storage & Financial Ledger Isolation:**
   - Company assets and files are stored without tenant-isolated namespaces or quota accounting.
   - Financial transactions lack double-entry journal ledger immutability and formal reversal audit trails.

---

## 2. Three-Tier SaaS Application Environments

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DASA EXPENCES SAAS                               │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│    A. DASA TECH PLATFORM     │   B. CUSTOMER ORGANIZATION   │  C. CUSTOMER  │
│        ADMINISTRATION        │            PORTAL            │   EMPLOYEE    │
│       (/platform-admin)      │            (/app)            │    PORTAL     │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Platform Owner / Admins    │ • Organization Owner         │ • Scoped to   │
│ • Tenant Lifecycle & Onboard │ • Finance & Project Managers │   Assigned    │
│ • Subscriptions, MRR, ARR    │ • Quotations, Billing, Cash  │   Projects &  │
│ • Global Storage & Resource  │ • Staff Invites & RBAC       │   Own Expenses│
│ • Platform SOC & Alerts      │ • Plan & Usage Quotas        │ • Denied Bank │
│ • Demo Request Approvals     │ • Customer Security Center   │   & Admin Data│
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

---

## 3. Database Migration Strategy (Zero Data Loss)

1. **Schema Extension:**
   - Introduce `Organization`, `OrganizationMembership`, `OrganizationRole`, `RolePermission`, `Department`, `Branch`.
   - Introduce `SubscriptionPlan`, `PlanEntitlement`, `OrganizationSubscription`, `SubscriptionInvoice`, `FeatureOverride`.
   - Introduce `PlatformUser`, `PlatformRole`, `PlatformSecurityEvent`, `PlatformAuditLog`.
   - Introduce `JournalEntry`, `JournalLine`, `Document`, `StorageUsage`, `UserInvitation`, `UserSession`, `SupportTicket`.
   - Add `organizationId` (foreign key, indexed) to all tenant tables: `Client`, `Quotation`, `Invoice`, `Payment`, `Expense`, `FinancialAccount`, `Project`, `DocumentTemplate`, `NumberingConfig`, `AuditLog`, `DemoLead`.

2. **Automated Data Migration Script (`migrate_tenants.js`):**
   - Automatically provisions a root "DASA TECH Enterprise" workspace.
   - Automatically backfills all existing clients, quotations, projects, invoices, payments, and accounts into this active workspace.
   - Links the existing Super Admin user as Organization Owner.
   - Creates standard SaaS plans: **Starter**, **Growth**, **Business**, **Enterprise**.
   - Guarantees **zero disruption** to existing business records.

---

## 4. Multi-Tenant Authorization & Security Principles

1. **Server-Side Tenant Derivation:**
   - The active `organizationId` is derived exclusively from verified JWT session claims and database membership validation. Frontend client headers are never trusted.
2. **Deny-by-Default Central Authorization:**
   - All protected endpoints verify:
     1. Token signature and active user status
     2. Valid organization membership
     3. Granular permission check (`View`, `Create`, `Edit`, `Submit`, `Approve`, `Delete`, `Export`)
     4. Resource scope matching (`OWN`, `ASSIGNED_PROJECTS`, `ASSIGNED_DEPARTMENT`, `ORGANIZATION`)
     5. Subscription feature entitlement and resource quotas
3. **Tenant Storage Isolation:**
   - Private namespaces (`organizations/{orgId}/projects/{prjId}/documents/{docId}`).
   - Server-side pre-signed URLs with short TTL and quota accounting.

---

## 5. Implementation Roadmap

- **Step 1:** Update `backend/prisma/schema.prisma` with all SaaS entities, foreign keys, and indexes. Push schema to PostgreSQL.
- **Step 2:** Execute automated data migration script to backfill existing records into the initial tenant workspace and seed plans/roles.
- **Step 3:** Implement backend multi-tenant middleware (`tenant.middleware.js`, `rbac.service.js`, `entitlement.service.js`, `storage.service.js`, `journal.service.js`).
- **Step 4:** Build DASA TECH Platform Administration backend routes (`/api/platform/*`) and UI (`/platform-admin/*`).
- **Step 5:** Enhance Customer Organization Portal (`/app/*`) with Organization Switcher, Team Invitations, Custom Roles, Subscription Manager, Storage Dashboard, and Security Center.
- **Step 6:** Run automated cross-tenant security and load tests, and deliver the final report.
