// Role-Based Access Control (RBAC) Permission Definitions and Customization Service

export const SYSTEM_ROLES = [
  { key: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full unrestricted governance & system authority' },
  { key: 'ADMIN', label: 'Administrator', description: 'Full operations, staff and financial management' },
  { key: 'MANAGER', label: 'Business Manager', description: 'Quotes, invoicing, approvals, and team supervision' },
  { key: 'FINANCE', label: 'Finance & Accounts', description: 'Billing, invoice payments, expenses, cashflow and reporting' },
  { key: 'SALES', label: 'Sales Executive', description: 'Client acquisition, quote creation and negotiation' },
  { key: 'STAFF', label: 'Operations Staff', description: 'Line items view, customer support and task processing' },
  { key: 'VIEWER', label: 'Auditor / Viewer', description: 'Strictly read-only access across all records' },
];

export const PERMISSION_MODULES = [
  {
    category: 'Quotations & Proposals',
    permissions: [
      { key: 'quotes_view', label: 'View Quotations', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE', 'SALES', 'STAFF', 'VIEWER'] },
      { key: 'quotes_create', label: 'Create & Revise Quotations', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'] },
      { key: 'quotes_sign', label: 'Digitally Sign & Approve', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
      { key: 'quotes_delete', label: 'Delete Quotations', defaultRoles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    category: 'Invoices & Billing',
    permissions: [
      { key: 'invoices_view', label: 'View Invoices & Bills', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE', 'SALES', 'STAFF', 'VIEWER'] },
      { key: 'invoices_create', label: 'Create & Issue Invoices', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE'] },
      { key: 'invoices_sign', label: 'Digitally Sign Invoices', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] },
      { key: 'invoices_delete', label: 'Delete Invoices', defaultRoles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    category: 'Clients & Accounts',
    permissions: [
      { key: 'clients_view', label: 'View Clients Directory', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE', 'SALES', 'STAFF', 'VIEWER'] },
      { key: 'clients_manage', label: 'Add & Edit Clients', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES', 'FINANCE'] },
      { key: 'clients_delete', label: 'Delete Clients', defaultRoles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    category: 'Payments & Financials',
    permissions: [
      { key: 'payments_view', label: 'View Payments Received', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE', 'STAFF', 'VIEWER'] },
      { key: 'payments_record', label: 'Record New Payments', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE'] },
      { key: 'payments_delete', label: 'Delete Payment Records', defaultRoles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    category: 'Expenses & Vendors',
    permissions: [
      { key: 'expenses_view', label: 'View Expenses & Vendors', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE', 'VIEWER'] },
      { key: 'expenses_manage', label: 'Create / Edit Expenses & Vendors', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] },
      { key: 'expenses_delete', label: 'Delete Expenses & Vendors', defaultRoles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    category: 'Reports & Governance',
    permissions: [
      { key: 'reports_view', label: 'Access Financial Reports & Analytics', defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE', 'VIEWER'] },
      { key: 'settings_manage', label: 'Company Profile, Logos & Seals', defaultRoles: ['SUPER_ADMIN', 'ADMIN'] },
      { key: 'users_manage', label: 'Staff Management & Custom RBAC', defaultRoles: ['SUPER_ADMIN'] },
    ],
  },
];

// Build initial default permission map
export function getDefaultRolePermissions() {
  const map = {};
  SYSTEM_ROLES.forEach((r) => {
    map[r.key] = {};
  });

  PERMISSION_MODULES.forEach((mod) => {
    mod.permissions.forEach((perm) => {
      SYSTEM_ROLES.forEach((r) => {
        // SUPER_ADMIN always has all permissions
        if (r.key === 'SUPER_ADMIN') {
          map[r.key][perm.key] = true;
        } else {
          map[r.key][perm.key] = perm.defaultRoles.includes(r.key);
        }
      });
    });
  });

  return map;
}

export function getCustomRolePermissions() {
  try {
    const saved = localStorage.getItem('bizfinance_rbac_permissions');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure SUPER_ADMIN always retains true for all
      if (parsed['SUPER_ADMIN']) {
        Object.keys(parsed['SUPER_ADMIN']).forEach((k) => {
          parsed['SUPER_ADMIN'][k] = true;
        });
      }
      return parsed;
    }
  } catch (e) {
    // fallback
  }
  return getDefaultRolePermissions();
}

export function saveCustomRolePermissions(permissions) {
  // Ensure SUPER_ADMIN always has full access
  const safe = { ...permissions };
  if (safe['SUPER_ADMIN']) {
    Object.keys(safe['SUPER_ADMIN']).forEach((k) => {
      safe['SUPER_ADMIN'][k] = true;
    });
  }
  localStorage.setItem('bizfinance_rbac_permissions', JSON.stringify(safe));
}

export function hasUserPermission(userRole, permissionKey) {
  if (!userRole) return false;
  if (userRole === 'SUPER_ADMIN') return true;

  const permissions = getCustomRolePermissions();
  if (!permissions[userRole]) {
    return false;
  }
  return Boolean(permissions[userRole][permissionKey]);
}
