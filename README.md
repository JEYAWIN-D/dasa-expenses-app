# DASA EXPENCES — Quotation, Billing & Business Finance Management System

> **Developed by [DASA TECH](https://dasatech.in)**  
> Integrated Quotation, Milestone Finance, Advance Payments, Expense Management & Project Handover Platform.

---

## 🌟 Overview

**DASA EXPENCES** is an enterprise-grade SaaS and business finance ERP built for project-driven agencies, software contractors, service firms, and enterprises. It tracks every rupee across the full client delivery lifecycle—from initial lead capture and interactive quotation negotiation, through milestone billing, multi-mode payment splits, real-time treasury tracking, and strict financial handover gatekeeping.

---

## 🚀 Key Modules & Capabilities

1. **Quotation Studio & Versioning**
   - Professional PDF & digital quotation generator with GST/PAN compliance.
   - Quotation revision tracking with side-by-side revision audit logs.
   - Client negotiation portal with real-time discount negotiations.
   - One-click Quotation-to-Project & Quotation-to-Invoice conversion.

2. **Milestone Financial Billing & Invoicing**
   - Progressive milestone billing linked directly to project deliverables.
   - GST invoices with payment status automation (Draft, Issued, Partially Paid, Paid, Overdue).
   - Automated payment reminder triggers and overdue notifications.

3. **Multi-Mode Payment Splits & Digital Receipts**
   - Record payments split across multiple accounts (Cash, Bank Transfer, UPI, Credit Card, Cheque).
   - Tamper-proof 4-digit PIN Digital Signature authorization.
   - Printable official receipts and tax clearance acknowledgments.

4. **Project Finance & Handover Gatekeeper**
   - Track Project Budget vs. Invoiced Amount vs. Collected Cash vs. Vendor Expenses.
   - Strict Handover Protocol: Blocks project handover if pending dues exceed company policy.
   - Automated generation of Handover Certificates, Project Completion Letters, and AMC Contracts.

5. **Treasury & Multi-Account Banking**
   - Real-time balances for Cash in Hand, UPI Accounts, and Current Bank Accounts.
   - Automated double-entry internal fund transfers and audit trails.

6. **Lead Pipeline & Public Marketing Suite**
   - High-converting SaaS landing pages (Home, Solutions, Features, How It Works, Pricing, Demo Request).
   - In-app CRM pipeline tracking inquiries from lead to client conversion.

7. **Enterprise Cybersecurity & Defense-in-Depth**
   - Dedicated brute-force rate limiters on Authentication and Digital Signature PINs.
   - Recursive input sanitization against XSS, script injection, and prototype pollution.
   - Helmet HTTP security headers (strict CSP, HSTS, X-Frame-Options).
   - Strict Role-Based Access Control (RBAC) and immutable security audit logs.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS / Vanilla CSS Design System, Lucide Icons
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL
- **Security:** Helmet, Express Rate Limit, Bcrypt, JWT, Zod Validation

---

## ⚙️ Quick Start Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm / yarn / pnpm

### 1. Clone Repository
```bash
git clone https://github.com/JEYAWIN-D/dasa-expenses-app.git
cd dasa-expenses-app
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL database credentials and JWT Secret
npx prisma db push
node src/database/seed.js
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Access the Application
- **Marketing & Public Portal:** `http://localhost:5173`
- **ERP Dashboard:** `http://localhost:5173/dashboard`
- **Backend API:** `http://localhost:5000/api`

---

## 🛡️ License & Ownership

Owned and developed by **DASA TECH**  
Website: [https://dasatech.in](https://dasatech.in)  
Contact: +91 76399 30148
