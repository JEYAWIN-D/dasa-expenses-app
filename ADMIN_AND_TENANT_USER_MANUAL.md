# DASA EXPENCES — SAAS PLATFORM ADMINISTRATOR & TENANT OWNER USER MANUAL

**Product:** DASA EXPENCES (Enterprise Multi-Tenant SaaS Platform)  
**Developed & Owned By:** DASA TECH ([dasatech.in](https://dasatech.in))  
**Contact / WhatsApp:** +91 76399 30148  
**Support Email:** [support@dasatech.in](mailto:support@dasatech.in)  

---

## PART 1: DASA TECH PLATFORM SUPER-ADMINISTRATOR GUIDE

### 1.1 Logging In to the Platform Command Center
- **URL:** `http://localhost:5173/platform-admin/login` (Production: `https://admin.dasatech.in`)
- **Default Credentials:**
  - **Email:** `platform@dasatech.in`
  - **Password:** `Password@2026`
- **Security Boundary:** The platform command center is isolated from customer tenant environments. Tenant administrators cannot access these APIs or routes.

### 1.2 SaaS Business Overview & KPIs (`/platform-admin/dashboard`)
- **Monthly Recurring Revenue (MRR):** Aggregated recurring subscription fees from active paid organizations.
- **Annual Recurring Revenue (ARR):** Projected 12-month run-rate based on active contracts.
- **Organization Health Meters:** Displays total registered, active, trial, and suspended workspaces.
- **Global Storage Consumption:** Real-time visibility into allocated versus consumed object storage across all tenants.

### 1.3 Customer Organization Management (`/platform-admin/organizations`)
- **Search & Filters:** Search companies by name, domain slug, owner email, or contact number.
- **Plan Modifications:** Upgrade or downgrade any customer organization between `STARTER`, `GROWTH`, `BUSINESS`, or `ENTERPRISE` tiers.
- **Account Suspension & Restoration:** Temporarily disable access for delinquent or disputed accounts with a single click.
- **Custom Quota Overrides:** Grant bonus storage, extra staff seats, or temporary feature unlocks directly from the tenant drill-down modal.

### 1.4 Pricing Plans & Entitlement Configuration (`/platform-admin/plans`)
- **Dynamic Pricing Controls:** Adjust monthly and annual rates for each subscription tier without changing source code.
- **Quota Enforcements:** Configure seat limits, max projects, custom roles allowance, and cloud storage capacities per tier.

### 1.5 Demo Leads & 1-Click Tenant Onboarding (`/platform-admin/demo-requests`)
- **Public Lead Ingestion:** Incoming enterprise inquiries from the marketing site are automatically funneled into this pipeline.
- **1-Click Workspace Provisioning:** Select any qualified lead, assign a subscription plan, enter a unique tenant slug (e.g. `acme-corp`), and click **Provision & Activate Organization**. The system automatically creates the tenant workspace, seeds default roles, and delivers initial owner credentials.

### 1.6 Platform Security Operations Center (SOC) (`/platform-admin/soc`)
- **Threat Telemetry:** Monitors cross-tenant access attempts, brute-force login anomalies, and unauthorized privilege escalation events.
- **Incident Investigation & Resolution:** Security admins can review raw event metadata, document investigation findings, and mark incidents as resolved with an immutable audit timestamp.

---

## PART 2: CUSTOMER ORGANIZATION OWNER USER MANUAL

### 2.1 Accessing Your Tenant Workspace
- **URL:** `http://localhost:5173/login` (Production: `https://app.dasatech.in`)
- **Default Owner Credentials:**
  - **Email:** `dasatechmu@gmail.com`
  - **Password:** `Admin@123`
- **Tenant Context:** Upon login, the workspace displays your company's name, active subscription status, and role badge (`SUPER_ADMIN` / `OWNER`).

### 2.2 Managing Staff & Team Seats (`/team`)
- **View Team Roster:** See all active, invited, and suspended team members.
- **Invite New Staff:**
  1. Click **Invite Staff Member**.
  2. Enter the employee's name, email, department, and select their organization role.
  3. The employee receives an invitation link to set up their password.
- **Seat Capacity Tracking:** Seat consumption is measured against your subscription plan quota to prevent unexpected overage fees.

### 2.3 Custom Roles & Granular RBAC (`/roles`)
- **Default Preset Roles:** Owner, Super Admin, Finance Manager, Accounts Executive, Project Coordinator, Employee.
- **Create Custom Roles:**
  1. Click **Create Custom Role**.
  2. Specify a title (e.g., *Junior Accounts Executive*).
  3. Choose the **Resource Scope**:
     - `OWN`: Staff can only see items they created.
     - `ASSIGNED_PROJECTS`: Staff can only interact with projects explicitly assigned to them.
     - `ORGANIZATION`: Company-wide visibility.
  4. Select granular permissions (e.g. *Draft Quotations*, *Submit Expenses*, *Approve Expenses*, *Manage Banking*).

### 2.4 SaaS Subscription & Quota Gauges (`/subscription`)
- **Plan Details:** Review renewal dates, billing cycle, and plan features.
- **Usage Meters:** Visual progress bars track current usage for:
  - Active Team Seats vs Plan Allowance
  - Active Projects vs Plan Capacity
  - Consumed Cloud Storage vs Quota Allocation
- **Upgrades:** Review available tiers (`STARTER`, `GROWTH`, `BUSINESS`, `ENTERPRISE`) and request seamless upgrades.

### 2.5 Private Tenant Cloud Storage (`/storage`)
- **Logical Data Isolation:** Documents are stored in encrypted tenant-specific namespaces (`organizations/{orgId}/documents/{docId}`).
- **Secure File Uploads:** Upload contracts, blueprints, and receipts with automated extension and malware filtering (executable types like `.exe` and `.bat` are automatically rejected).
- **Soft Deletion & Versioning:** Safely manage documents without risking accidental data loss.

### 2.6 Financial General Ledger & Immutability (`/journals`)
- **Double-Entry Bookkeeping:** Automatically records debit and credit legs for all approved invoices, payment receipts, and expense disbursements.
- **Equal Balance Guarantee:** Enforces that total debits strictly equal total credits.
- **Statutory Reversal Entries:** To correct a mistake, click **Post Reversal** and provide an audit reason. The system creates a formal reversing journal entry without modifying the original historical transaction, ensuring total compliance with financial accounting standards.

### 2.7 Workspace Security Center (`/security-settings`)
- **MFA Enforcement:** Toggle organization-wide Multi-Factor Authentication to require TOTP verification for all employees.
- **Active Device Sessions:** Review all active browser logins with IP address, device type, and login timestamp.
- **Remote Session Revocation:** Terminate compromised device sessions with a single click.
- **Security Audit Logs:** Inspect a chronological record of all sensitive actions within your workspace.

---
**DASA EXPENCES Support:**  
WhatsApp / Phone: +91 76399 30148  
Website: [dasatech.in](https://dasatech.in)  
Email: [support@dasatech.in](mailto:support@dasatech.in)
