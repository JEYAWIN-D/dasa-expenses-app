import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useCompany } from '../../contexts/CompanyContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  Building,
  ShieldCheck,
  ScrollText,
  Hash,
  Activity,
  Users,
  Save,
  KeyRound,
  Plus,
  RefreshCw,
  Stamp,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Trash2,
  Star,
  Sparkles,
  Award,
  Pencil,
  Palette,
  Check,
  RotateCcw,
  Sliders,
  CheckSquare,
  Square,
  Eye,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { useTheme, AVAILABLE_FONTS, COLOR_PRESETS } from '../../contexts/ThemeContext.jsx';
import {
  SYSTEM_ROLES,
  PERMISSION_MODULES,
  getCustomRolePermissions,
  saveCustomRolePermissions,
  getDefaultRolePermissions,
} from '../../services/rbac.service.js';

// Vector generators for instant realistic demo corporate stamps and logos
function generateCorporateSealSvg(companyName = 'DASA TECH', city = 'ERODE') {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
    <circle cx="120" cy="120" r="112" fill="none" stroke="%231e3a8a" stroke-width="5" stroke-dasharray="8 4"/>
    <circle cx="120" cy="120" r="102" fill="none" stroke="%231e3a8a" stroke-width="3"/>
    <circle cx="120" cy="120" r="68" fill="none" stroke="%231e3a8a" stroke-width="2"/>
    <path id="curveTop" fill="none" d="M 28,120 A 92,92 0 1,1 212,120" />
    <path id="curveBottom" fill="none" d="M 212,120 A 92,92 0 0,1 28,120" />
    <text font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="%231e3a8a" letter-spacing="2.5">
      <textPath href="%23curveTop" startOffset="50%" text-anchor="middle">${encodeURIComponent(companyName)}</textPath>
    </text>
    <text font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="%231e3a8a" letter-spacing="3">
      <textPath href="%23curveBottom" startOffset="50%" text-anchor="middle">★ ${encodeURIComponent(city)} • CORPORATE SEAL ★</textPath>
    </text>
    <circle cx="120" cy="120" r="54" fill="%231e3a8a" opacity="0.06"/>
    <polygon points="120,80 125,95 140,95 128,105 132,120 120,110 108,120 112,105 100,95 115,95" fill="%231e3a8a"/>
    <text x="120" y="142" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%231e3a8a" text-anchor="middle">OFFICIAL</text>
    <text x="120" y="156" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="%231e3a8a" text-anchor="middle">VERIFIED</text>
  </svg>`;
}

function generateAccountsStampSvg(companyName = 'DASA TECH') {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120" width="240" height="120">
    <rect x="6" y="6" width="228" height="108" rx="8" fill="none" stroke="%237c3aed" stroke-width="4"/>
    <rect x="12" y="12" width="216" height="96" rx="4" fill="%237c3aed" opacity="0.04" stroke="%237c3aed" stroke-width="1.5" stroke-dasharray="4 2"/>
    <text x="120" y="38" font-family="Arial, sans-serif" font-size="10" font-weight="900" fill="%237c3aed" text-anchor="middle" letter-spacing="1">${encodeURIComponent(companyName)}</text>
    <text x="120" y="68" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="%237c3aed" text-anchor="middle" letter-spacing="2">ACCOUNTS DEPT</text>
    <text x="120" y="94" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%237c3aed" text-anchor="middle" letter-spacing="1">✔ AUDITED %26 AUTHORIZED</text>
  </svg>`;
}

function generateDirectorSealSvg(name = 'MANAGING DIRECTOR') {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
    <circle cx="120" cy="120" r="112" fill="none" stroke="%23dc2626" stroke-width="4"/>
    <circle cx="120" cy="120" r="102" fill="none" stroke="%23dc2626" stroke-width="2" stroke-dasharray="6 3"/>
    <path id="curveTop" fill="none" d="M 28,120 A 92,92 0 1,1 212,120" />
    <path id="curveBottom" fill="none" d="M 212,120 A 92,92 0 0,1 28,120" />
    <text font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="%23dc2626" letter-spacing="3">
      <textPath href="%23curveTop" startOffset="50%" text-anchor="middle">OFFICE OF THE DIRECTOR</textPath>
    </text>
    <text font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="%23dc2626" letter-spacing="2">
      <textPath href="%23curveBottom" startOffset="50%" text-anchor="middle">★ AUTHORIZED SIGNATORY ★</textPath>
    </text>
    <text x="120" y="118" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="%23dc2626" text-anchor="middle">AUTHENTIC</text>
    <text x="120" y="136" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="%23dc2626" text-anchor="middle">${encodeURIComponent(name)}</text>
  </svg>`;
}

function generateTechLogoSvg(name = 'DASA TECH') {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%232563eb"/>
        <stop offset="100%" stop-color="%234f46e5"/>
      </linearGradient>
    </defs>
    <rect x="8" y="12" width="56" height="56" rx="14" fill="url(%23logoGrad)"/>
    <path d="M26 52 L36 28 L46 52 Z M31 44 L41 44" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="78" y="44" font-family="sans-serif" font-size="24" font-weight="800" fill="%230f172a" letter-spacing="-0.5">${encodeURIComponent(name)}</text>
    <text x="80" y="60" font-family="sans-serif" font-size="10" font-weight="700" fill="%2364748b" letter-spacing="2">SOFTWARE SOLUTIONS</text>
  </svg>`;
}

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'company'; // company, assets, templates, numbering, audit, users

  const notify = useNotification();
  const { reloadCompany } = useCompany();
  const [loading, setLoading] = useState(false);

  // Tab 1: Company Profile Form
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    tagline: '',
    logoUrl: '',
    sealUrl: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    gstNumber: '',
    panNumber: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankSwift: '',
    termsAndConditions: '',
    authorizedPerson: '',
    currency: 'INR',
  });

  // Tab 2: Change PIN Form
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '' });
  const [changingPin, setChangingPin] = useState(false);

  // Tab: Assets (Logos & Seals)
  const [assets, setAssets] = useState([]);
  const [uploadLogoName, setUploadLogoName] = useState('');
  const [uploadLogoPreview, setUploadLogoPreview] = useState('');
  const [uploadLogoIsPrimary, setUploadLogoIsPrimary] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [uploadSealName, setUploadSealName] = useState('');
  const [uploadSealPreview, setUploadSealPreview] = useState('');
  const [uploadSealIsPrimary, setUploadSealIsPrimary] = useState(true);
  const [uploadingSeal, setUploadingSeal] = useState(false);

  // Tab: Document Templates
  const [templates, setTemplates] = useState([]);

  // Tab: Numbering Configs
  const [numbering, setNumbering] = useState([]);

  // Tab: Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);

  // Tab: Team Users
  const { user: authUser } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'FINANCE',
    phone: '',
  });
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'FINANCE',
    status: 'ACTIVE',
    password: '',
  });
  const [updatingUser, setUpdatingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  // Tab: Appearance & Styling
  const { theme, updateTheme, resetTheme } = useTheme();
  const [appearanceForm, setAppearanceForm] = useState(theme);

  useEffect(() => {
    setAppearanceForm(theme);
  }, [theme]);

  // Tab: Custom RBAC Role Permissions
  const [rbacPermissions, setRbacPermissions] = useState(() => getCustomRolePermissions());
  const [selectedRbacRole, setSelectedRbacRole] = useState('ADMIN');
  const [userSubTab, setUserSubTab] = useState('users'); // 'users' or 'rbac'
  const [rbacViewMode, setRbacViewMode] = useState('single'); // 'single' role or 'matrix' comparative

  const handleSelectColorPreset = (preset) => {
    const updated = {
      ...appearanceForm,
      primaryColor: preset.primary,
      accentColor: preset.accent,
    };
    setAppearanceForm(updated);
    updateTheme({ primaryColor: preset.primary, accentColor: preset.accent });
    notify.success(`Applied ${preset.name} color palette!`);
  };

  const handleSelectFont = (fontName) => {
    const updated = { ...appearanceForm, fontFamily: fontName };
    setAppearanceForm(updated);
    updateTheme({ fontFamily: fontName });
    notify.success(`Typography switched to ${fontName}!`);
  };

  const handleSelectFontSize = (size) => {
    const updated = { ...appearanceForm, fontSize: size };
    setAppearanceForm(updated);
    updateTheme({ fontSize: size });
  };

  const handleSaveAppearance = (e) => {
    if (e) e.preventDefault();
    updateTheme(appearanceForm);
    notify.success('Appearance & regional settings saved successfully!');
  };

  const handleResetAppearance = () => {
    if (window.confirm('Reset all colors, typography, and regional settings to factory defaults?')) {
      resetTheme();
      notify.info('Appearance reset to factory defaults.');
    }
  };

  // RBAC handlers
  const handleToggleRbacPermission = (roleKey, permKey) => {
    if (roleKey === 'SUPER_ADMIN') {
      notify.info('Super Admin permissions are perpetual and cannot be restricted.');
      return;
    }
    setRbacPermissions((prev) => {
      const rolePerms = { ...prev[roleKey] };
      rolePerms[permKey] = !rolePerms[permKey];
      return {
        ...prev,
        [roleKey]: rolePerms,
      };
    });
  };

  const handleGrantAllForRole = (roleKey) => {
    if (roleKey === 'SUPER_ADMIN') return;
    setRbacPermissions((prev) => {
      const updatedRole = {};
      PERMISSION_MODULES.forEach((mod) => {
        mod.permissions.forEach((p) => {
          updatedRole[p.key] = true;
        });
      });
      return { ...prev, [roleKey]: updatedRole };
    });
    notify.success(`Granted all access rights to ${roleKey}`);
  };

  const handleSetReadOnlyForRole = (roleKey) => {
    if (roleKey === 'SUPER_ADMIN') return;
    setRbacPermissions((prev) => {
      const updatedRole = {};
      PERMISSION_MODULES.forEach((mod) => {
        mod.permissions.forEach((p) => {
          updatedRole[p.key] = p.key.endsWith('_view');
        });
      });
      return { ...prev, [roleKey]: updatedRole };
    });
    notify.info(`Set ${roleKey} to Read-Only access`);
  };

  const handleResetRoleToDefaults = (roleKey) => {
    const defaultMap = getDefaultRolePermissions();
    setRbacPermissions((prev) => ({
      ...prev,
      [roleKey]: { ...defaultMap[roleKey] },
    }));
    notify.info(`Reset ${roleKey} permissions to system defaults`);
  };

  const handleSaveRbacMatrix = () => {
    saveCustomRolePermissions(rbacPermissions);
    notify.success('Role-Based Access Control matrix saved and active!');
  };

  const handleResetAllRbac = () => {
    if (window.confirm('Reset role permissions for ALL roles back to default?')) {
      const defaultMap = getDefaultRolePermissions();
      setRbacPermissions(defaultMap);
      saveCustomRolePermissions(defaultMap);
      notify.success('All roles reset to default permissions.');
    }
  };

  // Fetch data per tab on-demand
  useEffect(() => {
    async function loadTabData() {
      setLoading(true);
      try {
        if (currentTab === 'company') {
          const [resCompany, resAssets] = await Promise.all([
            api.get('/settings/company'),
            api.get('/settings/assets').catch(() => ({ data: [] })),
          ]);
          if (resCompany.data) setCompanyForm(resCompany.data);
          if (resAssets.data) setAssets(resAssets.data);
        } else if (currentTab === 'assets') {
          const [resAssets, resCompany] = await Promise.all([
            api.get('/settings/assets'),
            api.get('/settings/company'),
          ]);
          setAssets(resAssets.data || []);
          if (resCompany.data) setCompanyForm(resCompany.data);
        } else if (currentTab === 'templates') {
          const res = await api.get('/settings/templates');
          setTemplates(res?.data || []);
        } else if (currentTab === 'numbering') {
          const res = await api.get('/settings/numbering');
          setNumbering(res?.data || []);
        } else if (currentTab === 'audit') {
          const res = await api.get('/settings/audit-logs', { limit: 50 });
          setAuditLogs(res?.data || []);
          setAuditTotal(res?.pagination?.total || 0);
        } else if (currentTab === 'users') {
          const res = await api.get('/settings/users');
          setUsersList(res?.data || []);
        }
      } catch (err) {
        notify.error(err.message || 'Failed to load settings data');
      } finally {
        setLoading(false);
      }
    }
    loadTabData();
  }, [currentTab]);

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings/company', companyForm);
      await reloadCompany();
      notify.success('Company profile updated successfully!');
    } catch (err) {
      notify.error(err.message || 'Failed to save company settings');
    }
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    if (pinForm.newPin.length !== 4) {
      notify.error('New PIN must be exactly 4 digits');
      return;
    }
    try {
      setChangingPin(true);
      await api.post('/settings/change-pin', pinForm);
      notify.success('Digital signature PIN changed successfully!');
      setPinForm({ currentPin: '', newPin: '' });
    } catch (err) {
      notify.error(err.message || 'Failed to update PIN');
    } finally {
      setChangingPin(false);
    }
  };

  // Asset: File selection & upload handlers
  const handleLogoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.error('Please select a valid image file (PNG, SVG, JPG, WebP)');
      return;
    }

    if (!uploadLogoName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadLogoName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setUploadLogoPreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogoSubmit = async (e) => {
    e.preventDefault();
    if (!uploadLogoPreview) {
      notify.error('Please select an image file or load a preset logo first');
      return;
    }

    try {
      setUploadingLogo(true);
      await api.post('/settings/assets', {
        type: 'LOGO',
        name: uploadLogoName || 'Company Logo',
        url: uploadLogoPreview,
        isPrimary: uploadLogoIsPrimary,
      });

      notify.success('Company logo uploaded successfully!');
      setUploadLogoPreview('');
      setUploadLogoName('');
      const res = await api.get('/settings/assets');
      setAssets(res.data || []);
      const resComp = await api.get('/settings/company');
      if (resComp.data) setCompanyForm(resComp.data);
      await reloadCompany();
    } catch (err) {
      notify.error(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSealFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.error('Please select an image file for the company seal');
      return;
    }

    if (!uploadSealName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadSealName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setUploadSealPreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSealSubmit = async (e) => {
    e.preventDefault();
    if (!uploadSealPreview) {
      notify.error('Please select a seal image or generate a corporate seal first');
      return;
    }

    try {
      setUploadingSeal(true);
      await api.post('/settings/assets', {
        type: 'SEAL',
        name: uploadSealName || 'Official Corporate Seal',
        url: uploadSealPreview,
        isPrimary: uploadSealIsPrimary,
      });

      notify.success('Company seal uploaded successfully!');
      setUploadSealPreview('');
      setUploadSealName('');
      const res = await api.get('/settings/assets');
      setAssets(res.data || []);
      const resComp = await api.get('/settings/company');
      if (resComp.data) setCompanyForm(resComp.data);
      await reloadCompany();
    } catch (err) {
      notify.error(err.message || 'Failed to upload seal');
    } finally {
      setUploadingSeal(false);
    }
  };

  const handleSetPrimary = async (asset) => {
    try {
      await api.put(`/settings/assets/${asset.id}/primary`);
      notify.success(`Set "${asset.name}" as the active primary ${asset.type.toLowerCase()}`);
      const res = await api.get('/settings/assets');
      setAssets(res.data || []);
      const resComp = await api.get('/settings/company');
      if (resComp.data) setCompanyForm(resComp.data);
      await reloadCompany();
    } catch (err) {
      notify.error(err.message || 'Failed to set primary asset');
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (!window.confirm(`Are you sure you want to delete ${asset.type.toLowerCase()} "${asset.name}"?`)) return;
    try {
      await api.delete(`/settings/assets/${asset.id}`);
      notify.success(`${asset.type} deleted successfully`);
      const res = await api.get('/settings/assets');
      setAssets(res.data || []);
      const resComp = await api.get('/settings/company');
      if (resComp.data) setCompanyForm(resComp.data);
      await reloadCompany();
    } catch (err) {
      notify.error(err.message || 'Failed to delete asset');
    }
  };

  const handleUpdateTemplate = async (template) => {
    try {
      await api.put(`/settings/templates/${template.id}`, template);
      notify.success(`${template.name} template updated!`);
    } catch (err) {
      notify.error(err.message || 'Failed to update template');
    }
  };

  const handleUpdateNumbering = async (numConfig) => {
    try {
      await api.put(`/settings/numbering/${numConfig.id}`, numConfig);
      notify.success(`${numConfig.documentType} sequence updated!`);
    } catch (err) {
      notify.error(err.message || 'Failed to update numbering');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings/users', newUserForm);
      notify.success('Staff user created successfully!');
      setIsAddUserOpen(false);
      setNewUserForm({ name: '', email: '', password: '', role: 'FINANCE', phone: '' });
      const res = await api.get('/settings/users');
      setUsersList(res.data);
    } catch (err) {
      notify.error(err.message || 'Failed to create user');
    }
  };

  const handleOpenEditUser = (u) => {
    setEditUserForm({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      status: u.status || 'ACTIVE',
      password: '',
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async (e) => {
    if (e) e.preventDefault();
    try {
      setUpdatingUser(true);
      const payload = {
        name: editUserForm.name,
        email: editUserForm.email,
        phone: editUserForm.phone || null,
        role: editUserForm.role,
        status: editUserForm.status,
      };
      if (editUserForm.password && editUserForm.password.trim().length >= 6) {
        payload.password = editUserForm.password.trim();
      }
      await api.put(`/settings/users/${editUserForm.id}`, payload);
      notify.success(`Staff user "${editUserForm.name}" updated successfully!`);
      setIsEditUserOpen(false);
      const res = await api.get('/settings/users');
      setUsersList(res.data);
    } catch (err) {
      notify.error(err.message || 'Failed to update user');
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteUser = (u) => {
    if (u.id === authUser?.id) {
      notify.info("You are currently logged in as this user. Click 'Edit' to change your name, email, or password. To delete this user, please create and log in with another Admin account.");
      return;
    }
    setDeleteConfirmUser(u);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    try {
      setDeletingUserId(deleteConfirmUser.id);
      await api.delete(`/settings/users/${deleteConfirmUser.id}`);
      notify.success(`Staff member "${deleteConfirmUser.name}" deleted successfully!`);
      setDeleteConfirmUser(null);
      const res = await api.get('/settings/users');
      setUsersList(res.data);
    } catch (err) {
      notify.error(err.message || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const logoAssets = assets.filter((a) => a.type === 'LOGO');
  const sealAssets = assets.filter((a) => a.type === 'SEAL');

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>System Settings & Governance</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Configure company profile, multiple logos, official company seals/stamps, document styling, and team RBAC.
        </p>
      </div>

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-subtle)', marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'company', label: 'Company Profile', icon: <Building size={15} /> },
          { key: 'assets', label: `Logos & Seals (${logoAssets.length + sealAssets.length})`, icon: <Stamp size={15} /> },
          { key: 'appearance', label: 'Theme & Appearance', icon: <Palette size={15} /> },
          { key: 'templates', label: 'Document Templates', icon: <ScrollText size={15} /> },
          { key: 'numbering', label: 'Numbering Config', icon: <Hash size={15} /> },
          { key: 'audit', label: 'Audit Trail', icon: <Activity size={15} /> },
          { key: 'users', label: 'Team & RBAC', icon: <Users size={15} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSearchParams({ tab: tab.key })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              borderBottom: currentTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              color: currentTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <RefreshCw size={20} className="animate-spin" />
        </div>
      ) : (
        <>
          {/* TAB 1: Company Profile & Signature PIN */}
          {currentTab === 'company' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              <form onSubmit={handleSaveCompany} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Company Information & Details</h3>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Company Legal Name *</label>
                    <input
                      required
                      className="form-input"
                      value={companyForm.companyName}
                      onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tagline / Subtitle</label>
                    <input
                      className="form-input"
                      value={companyForm.tagline || ''}
                      onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      required
                      className="form-input"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">GST / VAT Number</label>
                    <input
                      className="form-input"
                      value={companyForm.gstNumber || ''}
                      onChange={(e) => setCompanyForm({ ...companyForm, gstNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PAN Number</label>
                    <input
                      className="form-input"
                      value={companyForm.panNumber || ''}
                      onChange={(e) => setCompanyForm({ ...companyForm, panNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Office Street Address *</label>
                  <input
                    required
                    className="form-input"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      required
                      className="form-input"
                      value={companyForm.city}
                      onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      required
                      className="form-input"
                      value={companyForm.state}
                      onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PIN / Postal Code</label>
                    <input
                      className="form-input"
                      value={companyForm.postalCode || ''}
                      onChange={(e) => setCompanyForm({ ...companyForm, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                  Bank Account Details (Printed on Invoices & Quotes)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Bank Name</label>
                    <input
                      className="form-input"
                      value={companyForm.bankName || ''}
                      onChange={(e) => setCompanyForm({ ...companyForm, bankName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Holder Name</label>
                    <input
                      className="form-input"
                      value={companyForm.bankAccountName || ''}
                      onChange={(e) => setCompanyForm({ ...companyForm, bankAccountName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Number</label>
                    <input
                      className="form-input"
                      value={companyForm.bankAccountNumber || ''}
                      onChange={(e) => setCompanyForm({ ...companyForm, bankAccountNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">IFSC Code</label>
                    <input
                      className="form-input"
                      value={companyForm.bankIfsc || ''}
                      onChange={(e) => setCompanyForm({ ...companyForm, bankIfsc: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Authorized Signatory Name & Title</label>
                  <input
                    className="form-input"
                    value={companyForm.authorizedPerson || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, authorizedPerson: e.target.value })}
                    placeholder="e.g. Vikram Aditya (Managing Director)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Default Commercial Terms</label>
                  <textarea
                    className="form-textarea"
                    value={companyForm.termsAndConditions || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, termsAndConditions: e.target.value })}
                  />
                </div>
              </form>

              {/* Right column: Active Assets Badge & Digital Signature PIN Settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Active Brand Assets Quick Preview Card */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>Active Document Assets</h3>
                    <button
                      type="button"
                      onClick={() => setSearchParams({ tab: 'assets' })}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11 }}
                    >
                      Manage All
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                        Active Primary Logo
                      </div>
                      {companyForm.logoUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={companyForm.logoUrl}
                            alt="Active Logo"
                            style={{ height: 38, maxWidth: 140, objectFit: 'contain' }}
                          />
                          <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓ Applied to Docs</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No active logo set.</span>
                      )}
                    </div>

                    <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                        Active Company Seal / Stamp
                      </div>
                      {companyForm.sealUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={companyForm.sealUrl}
                            alt="Active Seal"
                            style={{ height: 46, width: 46, objectFit: 'contain' }}
                          />
                          <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>✓ Active Official Stamp</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No official seal uploaded.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Digital Signature PIN form */}
                <form onSubmit={handleChangePin} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <KeyRound size={18} color="var(--primary)" />
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>Digital Signature PIN</h3>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                    A secure 4-digit PIN is required each time you authorize a quotation, invoice, or receipt with your digital signature.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Current 4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      className="form-input"
                      value={pinForm.currentPin}
                      onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value.replace(/\D/g, '') })}
                      placeholder="••••"
                      style={{ letterSpacing: 4, fontWeight: 700 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New 4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      className="form-input"
                      value={pinForm.newPin}
                      onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value.replace(/\D/g, '') })}
                      placeholder="••••"
                      style={{ letterSpacing: 4, fontWeight: 700 }}
                    />
                  </div>

                  <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={changingPin}>
                    {changingPin ? 'Updating...' : 'Change Signature PIN'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: LOGOS & COMPANY SEALS (MULTIPLE) */}
          {currentTab === 'assets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Introduction Banner */}
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
                    Brand Identity & Official Seal Repository
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Upload and manage multiple corporate logos and official rubber seals/stamps. The active primary logo and seal are automatically stamped across all quotations, invoices, and payment receipts.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadLogoPreview(generateTechLogoSvg(companyForm.companyName || 'DASA TECH'));
                      setUploadLogoName('Primary Vector Brand Mark');
                      notify.info('Generated modern vector brand logo. Click "Upload & Save Logo" to apply.');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Sparkles size={14} color="var(--primary)" />
                    <span>Generate Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadSealPreview(generateCorporateSealSvg(companyForm.companyName || 'DASA TECH', companyForm.city || 'ERODE'));
                      setUploadSealName('Official Corporate Round Stamp');
                      notify.info('Generated circular corporate seal SVG. Click "Upload & Save Seal" to apply.');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Sparkles size={14} color="#7c3aed" />
                    <span>Generate Round Seal</span>
                  </button>
                </div>
              </div>

              {/* ---------------- SECTION 1: LOGOS (MULTIPLE) ---------------- */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ImageIcon size={20} color="var(--primary)" />
                      <span>Company Logos ({logoAssets.length})</span>
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Upload primary banners, dark mode logos, and square brand symbols.
                    </p>
                  </div>
                </div>

                {/* Upload Form Box */}
                <form
                  onSubmit={handleUploadLogoSubmit}
                  style={{
                    padding: 16,
                    backgroundColor: '#f8fafc',
                    borderRadius: 8,
                    border: '1px dashed #cbd5e1',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: 14, alignItems: 'center' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: 12 }}>Select Image File (PNG, SVG, JPG, WebP)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileSelect}
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: 12 }}>Logo Descriptive Name</label>
                      <input
                        className="form-input"
                        value={uploadLogoName}
                        onChange={(e) => setUploadLogoName(e.target.value)}
                        placeholder="e.g. Primary Header Logo"
                        style={{ padding: '7px 10px', fontSize: 13 }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 16 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={uploadLogoIsPrimary}
                          onChange={(e) => setUploadLogoIsPrimary(e.target.checked)}
                        />
                        <span>Set as Active</span>
                      </label>

                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={uploadingLogo || !uploadLogoPreview}
                      >
                        <Upload size={14} />
                        <span>{uploadingLogo ? 'Saving...' : 'Upload & Save'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Temporary Preview if chosen */}
                  {uploadLogoPreview && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          height: 48,
                          maxWidth: 160,
                          padding: '4px 10px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img src={uploadLogoPreview} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Preview loaded. Click <strong>Upload & Save</strong> to store in database.
                      </span>
                    </div>
                  )}
                </form>

                {/* Grid of uploaded logos */}
                {logoAssets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: 13 }}>
                    No custom logos uploaded yet. Use the uploader above or click "Generate Logo".
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {logoAssets.map((logo) => (
                      <div
                        key={logo.id}
                        style={{
                          border: `1.5px solid ${logo.isPrimary ? 'var(--primary)' : 'var(--border-subtle)'}`,
                          borderRadius: 8,
                          padding: 14,
                          backgroundColor: logo.isPrimary ? '#eff6ff' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: logo.isPrimary ? '0 2px 8px rgba(37, 99, 235, 0.12)' : 'var(--shadow-sm)',
                        }}
                      >
                        <div>
                          {/* Image display container with checkered background */}
                          <div
                            style={{
                              height: 90,
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 10,
                              marginBottom: 12,
                              backgroundImage: 'linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)',
                              backgroundSize: '16px 16px',
                              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                            }}
                          >
                            <img
                              src={logo.url}
                              alt={logo.name}
                              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{logo.name}</div>
                            {logo.isPrimary ? (
                              <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 99, border: '1px solid #86efac' }}>
                                PRIMARY ACTIVE
                              </span>
                            ) : (
                              <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: 99 }}>
                                ALTERNATIVE
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Added {new Date(logo.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                          {!logo.isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(logo)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11 }}
                            >
                              <Star size={13} color="var(--primary)" />
                              <span>Set as Active</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={13} />
                              <span>Active on Documents</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteAsset(logo)}
                            className="btn btn-outline-danger btn-sm"
                            title="Delete logo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ---------------- SECTION 2: COMPANY SEALS / STAMPS (MULTIPLE) ---------------- */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Stamp size={20} color="#7c3aed" />
                      <span>Company Seals & Rubber Stamps ({sealAssets.length})</span>
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Upload official corporate round seals, accounts verification stamps, and director notary seals.
                    </p>
                  </div>
                </div>

                {/* Upload Seal Form Box */}
                <form
                  onSubmit={handleUploadSealSubmit}
                  style={{
                    padding: 16,
                    backgroundColor: '#faf5ff',
                    borderRadius: 8,
                    border: '1px dashed #d8b4fe',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: 14, alignItems: 'center' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: 12 }}>Select Stamp Image (PNG transparent, SVG, JPG)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSealFileSelect}
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: 12 }}>Seal / Stamp Name</label>
                      <input
                        className="form-input"
                        value={uploadSealName}
                        onChange={(e) => setUploadSealName(e.target.value)}
                        placeholder="e.g. Official Round Corporate Seal"
                        style={{ padding: '7px 10px', fontSize: 13 }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 16 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={uploadSealIsPrimary}
                          onChange={(e) => setUploadSealIsPrimary(e.target.checked)}
                        />
                        <span>Set as Active</span>
                      </label>

                      <button
                        type="submit"
                        className="btn btn-sm"
                        style={{ backgroundColor: '#7c3aed', color: '#ffffff' }}
                        disabled={uploadingSeal || !uploadSealPreview}
                      >
                        <Upload size={14} />
                        <span>{uploadingSeal ? 'Saving...' : 'Upload & Save'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Stamp Preset Generators shortcuts */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid #f3e8ff' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed' }}>STAMP GENERATOR PRESETS:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadSealPreview(generateCorporateSealSvg(companyForm.companyName || 'DASA TECH', companyForm.city || 'ERODE'));
                        setUploadSealName('Official Corporate Round Stamp');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      ★ Circular Corporate Stamp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadSealPreview(generateAccountsStampSvg(companyForm.companyName || 'DASA TECH'));
                        setUploadSealName('Accounts Dept Cleared Seal');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      ✔ Accounts Clearance Stamp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadSealPreview(generateDirectorSealSvg(companyForm.authorizedPerson || 'MANAGING DIRECTOR'));
                        setUploadSealName('Director Notary Seal');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      ✦ Director Authority Seal
                    </button>
                  </div>

                  {/* Stamp Preview if loaded */}
                  {uploadSealPreview && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div
                        style={{
                          height: 72,
                          width: 72,
                          padding: 4,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d8b4fe',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img src={uploadSealPreview} alt="Seal Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Seal preview loaded. Click <strong>Upload & Save</strong> to store in database.
                      </span>
                    </div>
                  )}
                </form>

                {/* Grid of uploaded company seals */}
                {sealAssets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: 13 }}>
                    No company seals uploaded yet. Use the uploader above or select one of the stamp presets!
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {sealAssets.map((seal) => (
                      <div
                        key={seal.id}
                        style={{
                          border: `1.5px solid ${seal.isPrimary ? '#a855f7' : 'var(--border-subtle)'}`,
                          borderRadius: 8,
                          padding: 14,
                          backgroundColor: seal.isPrimary ? '#faf5ff' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: seal.isPrimary ? '0 2px 8px rgba(168, 85, 247, 0.12)' : 'var(--shadow-sm)',
                        }}
                      >
                        <div>
                          {/* Rubber Stamp visual presentation container */}
                          <div
                            style={{
                              height: 100,
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 10,
                              marginBottom: 12,
                            }}
                          >
                            <img
                              src={seal.url}
                              alt={seal.name}
                              style={{
                                maxHeight: '100%',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.1))',
                                transform: 'rotate(-3deg)',
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{seal.name}</div>
                            {seal.isPrimary ? (
                              <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '2px 8px', borderRadius: 99, border: '1px solid #d8b4fe' }}>
                                ACTIVE STAMP
                              </span>
                            ) : (
                              <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: 99 }}>
                                ALTERNATIVE
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Added {new Date(seal.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                          {!seal.isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(seal)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11 }}
                            >
                              <Stamp size={13} color="#7c3aed" />
                              <span>Set as Active Stamp</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: '#7e22ce', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={13} />
                              <span>Stamped on Documents</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteAsset(seal)}
                            className="btn btn-outline-danger btn-sm"
                            title="Delete seal"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: THEME, COLORS, FONTS & COMMON FEATURES */}
          {currentTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Header card with action buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 24px',
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Palette size={20} color="var(--primary)" />
                    <span>Visual Branding, Fonts & Global Settings</span>
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                    Select color themes, Google fonts, typography scaling, currency symbol, date formatting, and regional preferences across the system in real-time.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleResetAppearance}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <RotateCcw size={14} />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAppearance}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Save size={14} />
                    <span>Save Theme Settings</span>
                  </button>
                </div>
              </div>

              {/* Grid: 2 Columns (Controls on Left, Live Interactive Preview on Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* 1. Curated Color Presets */}
                  <div className="card">
                    <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={16} color="var(--primary)" />
                      <span>Curated Color Themes (1-Click Switch)</span>
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                      {COLOR_PRESETS.map((preset) => {
                        const isSelected =
                          appearanceForm.primaryColor.toLowerCase() === preset.primary.toLowerCase();
                        return (
                          <div
                            key={preset.name}
                            onClick={() => handleSelectColorPreset(preset)}
                            style={{
                              padding: 12,
                              borderRadius: 10,
                              border: isSelected ? `2px solid ${preset.primary}` : '1.5px solid #e2e8f0',
                              backgroundColor: isSelected ? `${preset.primary}10` : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s ease',
                              boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <div
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    backgroundColor: preset.primary,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                  }}
                                />
                                <div
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    backgroundColor: preset.accent,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                                {preset.name}
                              </span>
                            </div>
                            {isSelected && <Check size={16} color={preset.primary} strokeWidth={3} />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Hex Color Pickers */}
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>
                        Or Choose Custom Hex Colors:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label className="form-label" style={{ fontSize: 12 }}>Primary Brand Color</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="color"
                              value={appearanceForm.primaryColor}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAppearanceForm((prev) => ({ ...prev, primaryColor: val }));
                                updateTheme({ primaryColor: val });
                              }}
                              style={{ width: 40, height: 38, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
                            />
                            <input
                              type="text"
                              className="form-input"
                              value={appearanceForm.primaryColor}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAppearanceForm((prev) => ({ ...prev, primaryColor: val }));
                                if (/^#[0-9A-Fa-f]{6}$/.test(val)) updateTheme({ primaryColor: val });
                              }}
                              placeholder="#2563eb"
                              style={{ fontFamily: 'monospace', fontWeight: 700 }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: 12 }}>Accent Highlight Color</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="color"
                              value={appearanceForm.accentColor}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAppearanceForm((prev) => ({ ...prev, accentColor: val }));
                                updateTheme({ accentColor: val });
                              }}
                              style={{ width: 40, height: 38, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
                            />
                            <input
                              type="text"
                              className="form-input"
                              value={appearanceForm.accentColor}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAppearanceForm((prev) => ({ ...prev, accentColor: val }));
                                if (/^#[0-9A-Fa-f]{6}$/.test(val)) updateTheme({ accentColor: val });
                              }}
                              placeholder="#3b82f6"
                              style={{ fontFamily: 'monospace', fontWeight: 700 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Modern Google Fonts Selector */}
                  <div className="card">
                    <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
                      System Typography & Google Fonts
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                      {AVAILABLE_FONTS.map((font) => {
                        const isSelected = appearanceForm.fontFamily === font.name;
                        return (
                          <div
                            key={font.name}
                            onClick={() => handleSelectFont(font.name)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: 10,
                              border: isSelected ? '2px solid var(--primary)' : '1.5px solid #e2e8f0',
                              backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                              transition: 'all 0.15s ease',
                              fontFamily: font.family,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 14, fontWeight: 800, color: isSelected ? 'var(--primary)' : '#0f172a' }}>
                                {font.name}
                              </span>
                              {isSelected && <Check size={16} color="var(--primary)" strokeWidth={3} />}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.3 }}>
                              ₹1,25,000.00 Quotation #QT-2026
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Font Size Scaling */}
                  <div className="card">
                    <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>
                      Font Scaling & Interface Density
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                      Scale the entire application's font size proportionally for maximum comfort or high-density table views.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                      {[
                        { size: '13px', label: 'Compact', desc: '13px High-Density' },
                        { size: '14px', label: 'Standard', desc: '14px Default (Recommended)' },
                        { size: '15px', label: 'Comfortable', desc: '15px Balanced' },
                        { size: '16px', label: 'Large', desc: '16px High-Legibility' },
                      ].map((item) => {
                        const isSelected = appearanceForm.fontSize === item.size;
                        return (
                          <button
                            key={item.size}
                            type="button"
                            onClick={() => handleSelectFontSize(item.size)}
                            style={{
                              padding: '12px 10px',
                              borderRadius: 8,
                              border: isSelected ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                              backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                              color: isSelected ? 'var(--primary)' : '#1e293b',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 4,
                              textAlign: 'center',
                            }}
                          >
                            <span style={{ fontSize: item.size, fontWeight: 800 }}>{item.label}</span>
                            <span style={{ fontSize: 11, color: '#64748b' }}>{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Common Features: Currency, Date & Number Formats */}
                  <div className="card">
                    <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
                      Regional Formatting & Common Accounting Features
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Primary Currency Symbol</label>
                        <select
                          className="form-select"
                          value={appearanceForm.currencySymbol}
                          onChange={(e) => {
                            const val = e.target.value;
                            let code = 'INR';
                            if (val === '$') code = 'USD';
                            else if (val === '€') code = 'EUR';
                            else if (val === '£') code = 'GBP';
                            else if (val === 'AED') code = 'AED';
                            else if (val === 'S$') code = 'SGD';
                            const updated = { ...appearanceForm, currencySymbol: val, currencyCode: code };
                            setAppearanceForm(updated);
                            updateTheme(updated);
                          }}
                        >
                          <option value="₹">₹ - Indian Rupee (INR)</option>
                          <option value="$">$ - US Dollar (USD)</option>
                          <option value="€">€ - Euro (EUR)</option>
                          <option value="£">£ - British Pound (GBP)</option>
                          <option value="AED">AED - UAE Dirham (AED)</option>
                          <option value="S$">S$ - Singapore Dollar (SGD)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Number Notation System</label>
                        <select
                          className="form-select"
                          value={appearanceForm.numberFormat}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...appearanceForm, numberFormat: val };
                            setAppearanceForm(updated);
                            updateTheme(updated);
                          }}
                        >
                          <option value="IN">Indian Subcontinent (Lakhs & Crores: 1,23,456.78)</option>
                          <option value="INTL">International Standard (Millions: 123,456.78)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Date Display Format</label>
                        <select
                          className="form-select"
                          value={appearanceForm.dateFormat}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...appearanceForm, dateFormat: val };
                            setAppearanceForm(updated);
                            updateTheme(updated);
                          }}
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 25/09/2026)</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/25/2026)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-25)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Default Tax Engine Calculation</label>
                        <input
                          disabled
                          className="form-input"
                          value="Dual CGST (9%) + SGST (9%) or IGST (18%)"
                          style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Interactive Preview */}
                <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="card" style={{ boxShadow: 'var(--shadow-md)', border: '1.5px solid var(--primary-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--primary)' }}>
                        Live Design System Preview
                      </span>
                      <span style={{ fontSize: 11, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                        Real-time
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Typography demo */}
                      <div style={{ padding: 14, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                          Typography: {appearanceForm.fontFamily} ({appearanceForm.fontSize})
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                          DASA TECH ENTERPRISE
                        </div>
                        <div style={{ fontSize: 13, color: '#475569' }}>
                          Official Quotation & Billing Governance Platform
                        </div>
                      </div>

                      {/* Interactive Buttons Demo */}
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                          Dynamic Buttons
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-primary btn-sm">
                            <Plus size={14} />
                            <span>Primary Action</span>
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm">
                            Secondary
                          </button>
                          <button type="button" className="btn btn-outline-danger btn-sm">
                            Danger
                          </button>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                          Workflow Badges
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                            ● ACTIVE PROPOSAL
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backgroundColor: '#ecfdf5', color: '#047857' }}>
                            ✔ APPROVED
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backgroundColor: '#eff6ff', color: '#2563eb' }}>
                            ★ VERIFIED
                          </span>
                        </div>
                      </div>

                      {/* Sample Calculation Card */}
                      <div style={{ padding: 14, backgroundColor: '#ffffff', borderRadius: 10, border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                          Sample Billing Card ({appearanceForm.currencySymbol})
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                          <span>Enterprise Software License</span>
                          <span style={{ fontWeight: 600 }}>{appearanceForm.currencySymbol} 2,50,000.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                          <span>Comprehensive AMC (1 Year)</span>
                          <span style={{ fontWeight: 600 }}>{appearanceForm.currencySymbol} 35,000.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          <span>GST (18%)</span>
                          <span style={{ fontWeight: 600 }}>{appearanceForm.currencySymbol} 51,300.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900, color: 'var(--primary)', paddingTop: 8, borderTop: '1.5px dashed #cbd5e1' }}>
                          <span>Grand Total</span>
                          <span>{appearanceForm.currencySymbol} 3,36,300.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Document Templates */}
          {currentTab === 'templates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {templates.map((tpl) => (
                <div key={tpl.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{tpl.name} ({tpl.type})</h3>
                    <button
                      type="button"
                      onClick={() => handleUpdateTemplate(tpl)}
                      className="btn btn-primary btn-sm"
                    >
                      <Save size={14} />
                      <span>Update Template</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Document Header Title</label>
                      <input
                        className="form-input"
                        value={tpl.headerText || ''}
                        onChange={(e) => {
                          const updated = templates.map((t) => t.id === tpl.id ? { ...t, headerText: e.target.value } : t);
                          setTemplates(updated);
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Footer Acknowledgment</label>
                      <input
                        className="form-input"
                        value={tpl.footerText || ''}
                        onChange={(e) => {
                          const updated = templates.map((t) => t.id === tpl.id ? { ...t, footerText: e.target.value } : t);
                          setTemplates(updated);
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Terms & Conditions</label>
                    <textarea
                      className="form-textarea"
                      value={tpl.termsText || ''}
                      onChange={(e) => {
                        const updated = templates.map((t) => t.id === tpl.id ? { ...t, termsText: e.target.value } : t);
                        setTemplates(updated);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 24, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={tpl.showLogo}
                        onChange={(e) => {
                          const updated = templates.map((t) => t.id === tpl.id ? { ...t, showLogo: e.target.checked } : t);
                          setTemplates(updated);
                        }}
                      />
                      Show Company Logo
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={tpl.showBankDetails}
                        onChange={(e) => {
                          const updated = templates.map((t) => t.id === tpl.id ? { ...t, showBankDetails: e.target.checked } : t);
                          setTemplates(updated);
                        }}
                      />
                      Display Bank Details
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={tpl.showSignature}
                        onChange={(e) => {
                          const updated = templates.map((t) => t.id === tpl.id ? { ...t, showSignature: e.target.checked } : t);
                          setTemplates(updated);
                        }}
                      />
                      Display Digital Signature Stamp
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={tpl.showSeal !== false}
                        onChange={(e) => {
                          const updated = templates.map((t) => t.id === tpl.id ? { ...t, showSeal: e.target.checked } : t);
                          setTemplates(updated);
                        }}
                      />
                      Display Official Company Seal / Stamp
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Numbering Configuration */}
          {currentTab === 'numbering' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document Module</th>
                    <th>Prefix</th>
                    <th>Include Fiscal Year</th>
                    <th>Current Next Sequence</th>
                    <th>Zero Padding</th>
                    <th style={{ textAlign: 'right' }}>Save</th>
                  </tr>
                </thead>
                <tbody>
                  {numbering.map((nc) => (
                    <tr key={nc.id}>
                      <td style={{ fontWeight: 700 }}>{nc.documentType}</td>
                      <td>
                        <input
                          className="form-input"
                          style={{ width: 80 }}
                          value={nc.prefix}
                          onChange={(e) => {
                            const updated = numbering.map((n) => n.id === nc.id ? { ...n, prefix: e.target.value } : n);
                            setNumbering(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={nc.includeFiscalYear}
                          onChange={(e) => {
                            const updated = numbering.map((n) => n.id === nc.id ? { ...n, includeFiscalYear: e.target.checked } : n);
                            setNumbering(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: 100 }}
                          value={nc.currentSequence}
                          onChange={(e) => {
                            const updated = numbering.map((n) => n.id === nc.id ? { ...n, currentSequence: parseInt(e.target.value, 10) } : n);
                            setNumbering(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: 70 }}
                          value={nc.padLength}
                          onChange={(e) => {
                            const updated = numbering.map((n) => n.id === nc.id ? { ...n, padLength: parseInt(e.target.value, 10) } : n);
                            setNumbering(updated);
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleUpdateNumbering(nc)} className="btn btn-secondary btn-sm">
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: Audit Logs */}
          {currentTab === 'audit' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Module</th>
                    <th>Action</th>
                    <th>Operation Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{log.user?.name || log.userEmail || 'System'}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                          {log.module}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{log.details}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: Team & Users + Custom RBAC */}
          {currentTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Sub-tab Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6, backgroundColor: '#f1f5f9', padding: 4, borderRadius: 8 }}>
                  <button
                    type="button"
                    onClick={() => setUserSubTab('users')}
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: userSubTab === 'users' ? '#ffffff' : 'transparent',
                      color: userSubTab === 'users' ? 'var(--primary)' : '#64748b',
                      boxShadow: userSubTab === 'users' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Users size={15} />
                    <span>Staff Directory ({usersList.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserSubTab('rbac')}
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: userSubTab === 'rbac' ? '#ffffff' : 'transparent',
                      color: userSubTab === 'rbac' ? 'var(--primary)' : '#64748b',
                      boxShadow: userSubTab === 'rbac' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <ShieldCheck size={15} />
                    <span>Custom Role Permissions (RBAC)</span>
                  </button>
                </div>

                {userSubTab === 'users' && (
                  <button onClick={() => setIsAddUserOpen(true)} className="btn btn-primary">
                    <Plus size={16} />
                    <span>Add Staff Member</span>
                  </button>
                )}

                {userSubTab === 'rbac' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: 2 }}>
                      <button
                        type="button"
                        onClick={() => setRbacViewMode('single')}
                        className={`btn btn-sm ${rbacViewMode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '4px 10px', fontSize: 11 }}
                      >
                        Single Role View
                      </button>
                      <button
                        type="button"
                        onClick={() => setRbacViewMode('matrix')}
                        className={`btn btn-sm ${rbacViewMode === 'matrix' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '4px 10px', fontSize: 11 }}
                      >
                        Comparative Matrix Table
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetAllRbac}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <RotateCcw size={14} />
                      <span>Reset All Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRbacMatrix}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Save size={14} />
                      <span>Save Role Permissions</span>
                    </button>
                  </div>
                )}
              </div>

              {/* VIEW 1: STAFF DIRECTORY */}
              {userSubTab === 'users' && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Staff Name</th>
                        <th>Email</th>
                        <th>System Role</th>
                        <th>Phone</th>
                        <th>Last Login</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 700 }}>
                            {u.name}
                            {u.id === authUser?.id && (
                              <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--primary)', fontWeight: 800 }}>
                                (You)
                              </span>
                            )}
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: '#eff6ff', color: 'var(--primary)', padding: '2px 8px', borderRadius: 99 }}>
                              {u.role}
                            </span>
                          </td>
                          <td>{u.phone || '—'}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: u.status === 'ACTIVE' ? '#047857' : '#dc2626',
                                backgroundColor: u.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                                padding: '2px 6px',
                                borderRadius: 4,
                              }}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenEditUser(u)}
                                title="Edit Staff Member"
                                style={{ padding: '4px 8px', fontSize: 12 }}
                              >
                                <Pencil size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteUser(u)}
                                disabled={deletingUserId === u.id}
                                title={u.id === authUser?.id ? 'Active user account: Click Edit to customize credentials' : 'Delete Staff Member'}
                                style={{ padding: '4px 8px' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VIEW 2: CUSTOM RBAC PERMISSIONS */}
              {userSubTab === 'rbac' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {rbacViewMode === 'single' ? (
                    <>
                      {/* Role selection pills */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {SYSTEM_ROLES.map((r) => {
                          const isSelected = selectedRbacRole === r.key;
                          return (
                            <button
                              key={r.key}
                              type="button"
                              onClick={() => setSelectedRbacRole(r.key)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: isSelected ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                                backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                                color: isSelected ? 'var(--primary)' : '#334155',
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <Shield size={14} color={isSelected ? 'var(--primary)' : '#64748b'} />
                              <span>{r.label}</span>
                              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>({r.key})</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Role Card & Quick Presets */}
                      {(() => {
                        const activeRoleObj = SYSTEM_ROLES.find((r) => r.key === selectedRbacRole);
                        const isSuperAdmin = selectedRbacRole === 'SUPER_ADMIN';

                        return (
                          <div className="card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                                    {activeRoleObj?.label} Permissions
                                  </h3>
                                  <span style={{ fontSize: 11, backgroundColor: '#eff6ff', color: 'var(--primary)', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                                    {selectedRbacRole}
                                  </span>
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                                  {activeRoleObj?.description}
                                </p>
                              </div>

                              {!isSuperAdmin ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleGrantAllForRole(selectedRbacRole)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: 11 }}
                                  >
                                    Grant All Permissions
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSetReadOnlyForRole(selectedRbacRole)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: 11 }}
                                  >
                                    Set Read-Only
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleResetRoleToDefaults(selectedRbacRole)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: 11 }}
                                  >
                                    Reset to Defaults
                                  </button>
                                </div>
                              ) : (
                                <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#ecfdf5', padding: '6px 12px', borderRadius: 6 }}>
                                  <CheckCircle2 size={15} />
                                  <span>Super Admin has permanent universal access across all modules.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Module Permissions Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
                        {PERMISSION_MODULES.map((mod) => (
                          <div key={mod.category} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8, margin: 0 }}>
                              {mod.category}
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {mod.permissions.map((perm) => {
                                const isChecked = Boolean(rbacPermissions[selectedRbacRole]?.[perm.key]);
                                const isSuperAdmin = selectedRbacRole === 'SUPER_ADMIN';

                                return (
                                  <label
                                    key={perm.key}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 12px',
                                      borderRadius: 6,
                                      backgroundColor: isChecked ? '#f0fdf4' : '#f8fafc',
                                      border: isChecked ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                                      cursor: isSuperAdmin ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.1s ease',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isSuperAdmin}
                                        onChange={() => handleToggleRbacPermission(selectedRbacRole, perm.key)}
                                        style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: isSuperAdmin ? 'not-allowed' : 'pointer' }}
                                      />
                                      <span style={{ fontSize: 13, fontWeight: 600, color: isChecked ? '#166534' : '#475569' }}>
                                        {perm.label}
                                      </span>
                                    </div>
                                    <code style={{ fontSize: 10, color: '#94a3b8' }}>{perm.key}</code>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* COMPARATIVE MATRIX TABLE ACROSS ALL 7 ROLES */
                    <div className="table-container card" style={{ padding: 0, overflowX: 'auto' }}>
                      <table className="data-table" style={{ fontSize: 12 }}>
                        <thead>
                          <tr>
                            <th style={{ minWidth: 220 }}>Module & Permission</th>
                            {SYSTEM_ROLES.map((r) => (
                              <th key={r.key} style={{ textAlign: 'center', minWidth: 100 }}>
                                <div style={{ fontWeight: 800 }}>{r.label}</div>
                                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{r.key}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {PERMISSION_MODULES.map((mod) => (
                            <React.Fragment key={mod.category}>
                              <tr style={{ backgroundColor: '#f8fafc' }}>
                                <td colSpan={SYSTEM_ROLES.length + 1} style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 12, padding: '8px 12px' }}>
                                  ● {mod.category}
                                </td>
                              </tr>
                              {mod.permissions.map((perm) => (
                                <tr key={perm.key}>
                                  <td style={{ fontWeight: 600 }}>{perm.label}</td>
                                  {SYSTEM_ROLES.map((r) => {
                                    const isAllowed = Boolean(rbacPermissions[r.key]?.[perm.key]);
                                    const isSuperAdmin = r.key === 'SUPER_ADMIN';

                                    return (
                                      <td key={r.key} style={{ textAlign: 'center' }}>
                                        <input
                                          type="checkbox"
                                          checked={isAllowed}
                                          disabled={isSuperAdmin}
                                          onChange={() => handleToggleRbacPermission(r.key, perm.key)}
                                          style={{ cursor: isSuperAdmin ? 'not-allowed' : 'pointer', accentColor: 'var(--primary)' }}
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Staff User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add New Staff Member"
        maxWidth={480}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateUser}>
              Create User
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              required
              className="form-input"
              value={newUserForm.name}
              onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Work Email *</label>
            <input
              type="email"
              required
              className="form-input"
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Password *</label>
            <input
              type="password"
              required
              className="form-input"
              value={newUserForm.password}
              onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Assignment *</label>
            <select
              className="form-select"
              value={newUserForm.role}
              onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="FINANCE">Finance</option>
              <option value="SALES">Sales</option>
              <option value="STAFF">Staff</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Edit Staff User Modal */}
      <Modal
        isOpen={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        title={`Edit Staff Member: ${editUserForm.name}`}
        maxWidth={480}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdateUser} disabled={updatingUser}>
              {updatingUser ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdateUser}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              required
              className="form-input"
              value={editUserForm.name}
              onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Work Email *</label>
            <input
              type="email"
              required
              className="form-input"
              value={editUserForm.email}
              onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              value={editUserForm.phone || ''}
              onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Role Assignment *</label>
              <select
                className="form-select"
                value={editUserForm.role}
                onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="FINANCE">Finance</option>
                <option value="SALES">Sales</option>
                <option value="STAFF">Staff</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status *</label>
              <select
                className="form-select"
                value={editUserForm.status}
                onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
            <label className="form-label">Reset Password (Optional)</label>
            <input
              type="password"
              className="form-input"
              value={editUserForm.password}
              onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
              placeholder="Leave blank to keep existing password"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Minimum 6 characters. Leave blank if you don't wish to reset their password.
            </span>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmUser)}
        onClose={() => setDeleteConfirmUser(null)}
        title="Confirm Staff Member Deletion"
        maxWidth={460}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeleteConfirmUser(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none' }}
              onClick={handleConfirmDelete}
              disabled={Boolean(deletingUserId)}
            >
              {deletingUserId ? 'Deleting...' : 'Yes, Delete Staff Member'}
            </button>
          </>
        }
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: 14, color: 'var(--text-main)', marginBottom: 12, lineHeight: 1.5 }}>
            Are you sure you want to permanently delete staff member <strong>{deleteConfirmUser?.name}</strong> (<code>{deleteConfirmUser?.email}</code>)?
          </p>
          <div style={{ padding: 12, backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 12 }}>
            ⚠️ This will revoke their access immediately. All historical audit logs and generated business records will be retained for regulatory compliance.
          </div>
        </div>
      </Modal>
    </div>
  );
}
