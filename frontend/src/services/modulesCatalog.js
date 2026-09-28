// Comprehensive Modules & Submodules Catalog for Custom RBAC and User Access Delegation

export const SYSTEM_MODULES_CATALOG = [
  {
    id: 'PROJECTS',
    name: 'Projects & Handover',
    category: 'Operations',
    description: 'Engineering project tracking, milestones, team assignment, and handovers',
    color: '#2563eb',
    badge: 'Core Project Engine',
    submodules: [
      { id: 'projects_list', name: 'Project Listing & Health', description: 'Browse project cards, status, and health metrics' },
      { id: 'projects_create', name: 'Create New Project', description: 'Initialize project, set contract value, and assign clients' },
      { id: 'projects_milestones', name: 'Milestone Progress Tracker', description: 'Define deliverables, track progress percentages, and billings' },
      { id: 'projects_handover', name: 'Official Handover Signoff', description: 'Issue handover certificates and client signoffs' },
      { id: 'projects_team', name: 'Team & Staff Allocation', description: 'Assign project leads, site engineers, and subcontractors' },
      { id: 'projects_vault', name: 'Project Vault & Blueprints', description: 'Upload drawings, specifications, and CAD files' },
    ],
  },
  {
    id: 'QUOTATIONS',
    name: 'Quotations & Proposals',
    category: 'Sales & Revenue',
    description: 'Pricing proposals, itemized bill of quantities, AMC contracts, and client negotiations',
    color: '#7c3aed',
    badge: 'Revenue Builder',
    submodules: [
      { id: 'quotes_list', name: 'Quotations Directory', description: 'Search, filter, and inspect quotation statuses' },
      { id: 'quotes_create', name: 'Quotation Studio & Builder', description: 'Draft proposals with line items, margins, and GST rates' },
      { id: 'quotes_edit', name: 'Proposal Revisions & Versions', description: 'Edit line items, update discounts, and track revisions' },
      { id: 'quotes_amc', name: 'AMC Maintenance Packages', description: 'Configure multi-tier Annual Maintenance Contract packages' },
      { id: 'quotes_negotiation', name: 'Client Negotiation Portal', description: 'Manage client discount requests and revised margins' },
      { id: 'quotes_templates', name: 'Clauses & Terms Templates', description: 'Maintain standard terms of delivery and payment schedules' },
      { id: 'quotes_approve', name: 'Official Signoff & Delivery', description: 'Approve quotation for client signature and conversion' },
    ],
  },
  {
    id: 'CLIENTS',
    name: 'Clients & Accounts',
    category: 'Sales & Revenue',
    description: 'Manage client companies, statutory GSTINs, and customer ledger statements',
    color: '#0891b2',
    badge: 'CRM Master',
    submodules: [
      { id: 'clients_directory', name: 'Client Directory', description: 'View client companies, contacts, and addresses' },
      { id: 'clients_create', name: 'Onboard New Client', description: 'Register billing addresses, GSTIN, PAN, and payment terms' },
      { id: 'clients_statement', name: 'Customer Statements & Aging', description: 'Generate account statements and overdue balances' },
    ],
  },
  {
    id: 'INVOICES',
    name: 'Invoices & Billing',
    category: 'Financial Billing',
    description: 'GST tax invoicing, milestone progress bills, proforma, and PDF delivery',
    color: '#059669',
    badge: 'Tax Compliance',
    submodules: [
      { id: 'invoices_list', name: 'Tax Invoices Register', description: 'Track all issued, paid, and overdue GST invoices' },
      { id: 'invoices_create', name: 'Create GST Tax Invoice', description: 'Generate compliant tax invoices with HSN/SAC codes' },
      { id: 'invoices_proforma', name: 'Proforma Invoices', description: 'Issue advance estimate proforma bills before tax invoice' },
      { id: 'invoices_milestone', name: 'Milestone Progress Invoicing', description: 'Bill against completed milestone handover criteria' },
      { id: 'invoices_pdf', name: 'Print & PDF Generator', description: 'Download print-ready signed tax invoices' },
      { id: 'invoices_cancel', name: 'Cancel / Void Invoices', description: 'Audit invoice cancellations and issue credit notes' },
    ],
  },
  {
    id: 'PAYMENTS',
    name: 'Payments Received',
    category: 'Financial Billing',
    description: 'Incoming customer receipts, multi-mode split payments, and receipt vouchers',
    color: '#0d9488',
    badge: 'Treasury Inflow',
    submodules: [
      { id: 'payments_list', name: 'Payment Transactions Register', description: 'Audit incoming settlements and bank dates' },
      { id: 'payments_record', name: 'Log Customer Payment', description: 'Record payment against issued invoice' },
      { id: 'payments_split', name: 'Multi-Mode Split Accounting', description: 'Split single payment across Bank, Cash, UPI, and Cheque' },
      { id: 'payments_vouchers', name: 'Payment Receipt Vouchers', description: 'Issue customer acknowledgment receipt slips' },
    ],
  },
  {
    id: 'EXPENSES',
    name: 'Expenses & Reimbursements',
    category: 'Cost Accounting',
    description: 'Project expenditures, employee claims, and managerial signoffs',
    color: '#d97706',
    badge: 'Outgoings Control',
    submodules: [
      { id: 'expenses_list', name: 'Expense Register', description: 'Browse project outgoings and operating costs' },
      { id: 'expenses_submit', name: 'Submit Expense Claim', description: 'Staff expense filing with receipt attachments' },
      { id: 'expenses_approve', name: 'Managerial Audit & Approval', description: 'Verify and disburse expense reimbursements' },
      { id: 'expenses_categories', name: 'Expense Categories', description: 'Configure travel, site materials, food, utilities' },
    ],
  },
  {
    id: 'VENDORS',
    name: 'Vendors & Subcontractors',
    category: 'Cost Accounting',
    description: 'Supplier master directory, purchase bills, and disbursement tracking',
    color: '#4f46e5',
    badge: 'Payables Control',
    submodules: [
      { id: 'vendors_directory', name: 'Vendor Directory', description: 'Manage supplier contacts, GST numbers, and bank details' },
      { id: 'vendors_bills', name: 'Vendor Bills & Payables', description: 'Record incoming vendor bills against projects' },
      { id: 'vendors_payments', name: 'Vendor Disbursements', description: 'Log outbound payments to suppliers' },
    ],
  },
  {
    id: 'TREASURY',
    name: 'Cash & Bank Accounts',
    category: 'Treasury & Cashflow',
    description: 'Bank account balances, petty cash registers, and fund transfers',
    color: '#0284c7',
    badge: 'Liquidity Vault',
    submodules: [
      { id: 'cashbank_accounts', name: 'Bank & Cash Accounts', description: 'View current balances across all accounts' },
      { id: 'cashbank_transfer', name: 'Inter-Account Fund Transfer', description: 'Transfer funds between bank and petty cash' },
      { id: 'cashbank_reconcile', name: 'Statement Reconciliation', description: 'Verify ledger balance against bank statements' },
    ],
  },
  {
    id: 'REPORTS',
    name: 'Financial Reports & Analytics',
    category: 'Intelligence',
    description: 'Real-time P&L, GST filing reports, cash flow velocity, and analytics',
    color: '#db2777',
    badge: 'Executive BI',
    submodules: [
      { id: 'reports_overview', name: 'Financial KPI Dashboard', description: 'Real-time revenue, margins, and expense ratios' },
      { id: 'reports_pl', name: 'Profit & Loss Statement', description: 'Net earnings and project margin reports' },
      { id: 'reports_gst', name: 'GST Tax Summary & GSTR-1', description: 'B2B/B2C GST tax reports for monthly filing' },
      { id: 'reports_cashflow', name: 'Cash Flow Trajectory', description: '30-day and 90-day cash flow inflow vs outflow' },
    ],
  },
  {
    id: 'LEADS',
    name: 'Demo Leads & Pipeline',
    category: 'Sales & Revenue',
    description: 'Inbound sales inquiries, demo requests, and customer conversion',
    color: '#e11d48',
    badge: 'Inbound Funnel',
    submodules: [
      { id: 'leads_pipeline', name: 'Leads Pipeline & Stages', description: 'Track prospect status from inquiry to negotiation' },
      { id: 'leads_capture', name: 'Capture New Inquiry', description: 'Register prospective client requirements' },
      { id: 'leads_convert', name: 'Convert Lead to Client / Quote', description: 'One-click conversion to quotation proposal' },
    ],
  },
  {
    id: 'TEAM',
    name: 'Team & User Management',
    category: 'Governance & Seats',
    description: 'Create user credentials with Name and DOB password (d-m-y), and assign custom access',
    color: '#059669',
    badge: 'User Security',
    submodules: [
      { id: 'team_directory', name: 'Staff Directory & Credentials', description: 'View staff members, DOBs, and passwords' },
      { id: 'team_create', name: 'Create User with DOB Password', description: 'Generate credentials with Name & DOB (d-m-y)' },
      { id: 'team_roles', name: 'Custom Roles & RBAC Matrix', description: 'Create and assign custom module permissions' },
      { id: 'team_status', name: 'Activate / Suspend User Access', description: 'Control active login sessions' },
    ],
  },
  {
    id: 'DOCUMENTS',
    name: 'Tenant Cloud Storage',
    category: 'Vault & Assets',
    description: 'Encrypted document vault for blueprints, contracts, and receipts',
    color: '#ea580c',
    badge: 'Encrypted Vault',
    submodules: [
      { id: 'docs_vault', name: 'Document Explorer', description: 'Browse organized folder hierarchies' },
      { id: 'docs_upload', name: 'Upload Files & Contracts', description: 'Store PDF agreements and site photographs' },
      { id: 'docs_delete', name: 'Archive & Delete Files', description: 'Manage storage quota' },
    ],
  },
  {
    id: 'SETTINGS',
    name: 'Company Settings & Security',
    category: 'System Configuration',
    description: 'Configure company profile, official stamps/seals, numbering, and security',
    color: '#4338ca',
    badge: 'Workspace Root',
    submodules: [
      { id: 'settings_profile', name: 'Company Profile & Tax IDs', description: 'GSTIN, PAN, addresses, contacts' },
      { id: 'settings_assets', name: 'Official Stamp & Signatures', description: 'Upload company seal and digital signature PIN' },
      { id: 'settings_numbering', name: 'Custom Numbering Schemes', description: 'Prefixes for invoices, quotes, payments' },
      { id: 'settings_audit', name: 'Security Audit Trail', description: 'Inspect login attempts and administrative actions' },
    ],
  },
];

export const CORE_ACCESS_ACTIONS = [
  { key: 'canView', label: 'View', description: 'Browse and read module records', default: true },
  { key: 'canCreate', label: 'Create', description: 'Draft and create new entries', default: true },
  { key: 'canEdit', label: 'Edit', description: 'Modify and update records', default: false },
  { key: 'canDelete', label: 'Delete', description: 'Void or remove records', default: false },
  { key: 'canApprove', label: 'Approve', description: 'Authorize and sign off documents', default: false },
  { key: 'canExport', label: 'Export', description: 'Download print PDFs and Excel sheets', default: true },
];

export const CORE_ACCESS_SCOPES = [
  { key: 'ORGANIZATION', label: 'Entire Workspace', description: 'Unrestricted access across all company data' },
  { key: 'ASSIGNED_PROJECTS', label: 'Assigned Projects Only', description: 'Restricted exclusively to projects where user is assigned' },
  { key: 'ASSIGNED_DEPARTMENT', label: 'Department Only', description: 'Restricted to records belonging to staff member department' },
  { key: 'OWN', label: 'Own Records Only', description: 'Strictly restricted to records created by this individual' },
];

/**
 * Normalizes any date string into standard (d-m-y) format: DD-MM-YYYY
 * e.g., "1995-08-15" -> "15-08-1995"
 *       "15/8/1995"  -> "15-08-1995"
 *       "15081995"   -> "15-08-1995"
 */
export function formatDobToDmy(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  // YYYY-MM-DD
  const ymd = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) {
    const day = ymd[3].padStart(2, '0');
    const month = ymd[2].padStart(2, '0');
    const year = ymd[1];
    return `${day}-${month}-${year}`;
  }
  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    const year = dmy[3];
    return `${day}-${month}-${year}`;
  }
  // DDMMYYYY
  const num8 = str.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (num8) {
    return `${num8[1]}-${num8[2]}-${num8[3]}`;
  }
  return str;
}
