import React, { useState, useEffect } from 'react';
import { orgApi } from '../../services/organization.service';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { 
  ShieldCheck, Plus, CheckCircle2, AlertTriangle, RefreshCw, 
  Trash2, Edit3, Eye, EyeOff, Copy, KeyRound, Calendar, 
  Layers, Check, X, Users, Sparkles, FolderKanban, Shield,
  FileSpreadsheet, FileCheck2, Receipt, Wallet, Building2,
  Landmark, BarChart3, UserCheck, Settings, Info
} from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { 
  SYSTEM_MODULES_CATALOG, 
  CORE_ACCESS_ACTIONS, 
  CORE_ACCESS_SCOPES, 
  formatDobToDmy 
} from '../../services/modulesCatalog.js';

export default function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'users'
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Password visibility map: { [userId]: boolean }
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Create / Edit Role Modal State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    scope: 'ORGANIZATION',
    selectedModules: ['PROJECTS', 'QUOTATIONS'],
    selectedSubmodules: {
      PROJECTS: ['projects_list', 'projects_create', 'projects_milestones'],
      QUOTATIONS: ['quotes_list', 'quotes_create']
    },
    actions: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canApprove: false,
      canExport: true
    }
  });

  // Create User Modal State (User Name + DOB (d-m-y) password concept)
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    dob: '',
    email: '',
    roleId: '',
    roleTitle: '',
    departmentId: '',
    branchId: ''
  });
  const [showDobPasswordInModal, setShowDobPasswordInModal] = useState(true);
  const [createdCredentialsPreview, setCreatedCredentialsPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const notify = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, membersRes] = await Promise.all([
        orgApi.getRoles(),
        orgApi.getTeamMembers().catch(() => ({ data: { members: [] } }))
      ]);

      const rolesList = Array.isArray(rolesRes?.data)
        ? rolesRes.data
        : (Array.isArray(rolesRes?.data?.data) ? rolesRes.data.data : (Array.isArray(rolesRes) ? rolesRes : []));
      setRoles(rolesList);

      const memList = membersRes.data?.members || membersRes.data?.data || (Array.isArray(membersRes.data) ? membersRes.data : []);
      setMembers(memList);
    } catch (err) {
      notify.error('Failed to load data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // --- ROLE ACTIONS ---

  const handleOpenCreateRole = () => {
    setEditingRoleId(null);
    setRoleForm({
      name: '',
      description: '',
      scope: 'ORGANIZATION',
      selectedModules: ['PROJECTS', 'QUOTATIONS', 'INVOICES'],
      selectedSubmodules: {
        PROJECTS: ['projects_list', 'projects_create', 'projects_milestones', 'projects_handover'],
        QUOTATIONS: ['quotes_list', 'quotes_create', 'quotes_amc'],
        INVOICES: ['invoices_list', 'invoices_create', 'invoices_milestone']
      },
      actions: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canApprove: false,
        canExport: true
      }
    });
    setRoleModalOpen(true);
  };

  const handleOpenEditRole = (role) => {
    setEditingRoleId(role.id);
    let parsedSubmodules = {};
    if (role.description) {
      try {
        const parsed = JSON.parse(role.description);
        if (parsed?.submodules) parsedSubmodules = parsed.submodules;
      } catch (e) {}
    }

    const enabledModules = (role.permissions || []).filter(p => p.canView || p.canCreate).map(p => p.module);
    const firstPerm = role.permissions?.[0] || {};

    setRoleForm({
      name: role.name,
      description: role.description?.startsWith('{') ? '' : role.description,
      scope: firstPerm.scope || 'ORGANIZATION',
      selectedModules: enabledModules.length > 0 ? enabledModules : ['PROJECTS'],
      selectedSubmodules: parsedSubmodules,
      actions: {
        canView: firstPerm.canView ?? true,
        canCreate: firstPerm.canCreate ?? true,
        canEdit: firstPerm.canEdit ?? false,
        canDelete: firstPerm.canDelete ?? false,
        canApprove: firstPerm.canApprove ?? false,
        canExport: firstPerm.canExport ?? true
      }
    });
    setRoleModalOpen(true);
  };

  const handleToggleModule = (moduleId) => {
    setRoleForm(prev => {
      const exists = prev.selectedModules.includes(moduleId);
      const newModules = exists 
        ? prev.selectedModules.filter(m => m !== moduleId)
        : [...prev.selectedModules, moduleId];

      const newSubmodules = { ...prev.selectedSubmodules };
      if (!exists) {
        // Automatically select all submodules of this module by default
        const modDef = SYSTEM_MODULES_CATALOG.find(m => m.id === moduleId);
        if (modDef) {
          newSubmodules[moduleId] = modDef.submodules.map(s => s.id);
        }
      } else {
        delete newSubmodules[moduleId];
      }

      return {
        ...prev,
        selectedModules: newModules,
        selectedSubmodules: newSubmodules
      };
    });
  };

  const handleToggleSubmodule = (moduleId, submoduleId) => {
    setRoleForm(prev => {
      const currentList = prev.selectedSubmodules[moduleId] || [];
      const exists = currentList.includes(submoduleId);
      const updated = exists 
        ? currentList.filter(s => s !== submoduleId)
        : [...currentList, submoduleId];

      const newSelectedModules = [...prev.selectedModules];
      if (updated.length > 0 && !newSelectedModules.includes(moduleId)) {
        newSelectedModules.push(moduleId);
      }

      return {
        ...prev,
        selectedModules: newSelectedModules,
        selectedSubmodules: {
          ...prev.selectedSubmodules,
          [moduleId]: updated
        }
      };
    });
  };

  const handleSelectAllSubmodulesForModule = (moduleId) => {
    const modDef = SYSTEM_MODULES_CATALOG.find(m => m.id === moduleId);
    if (!modDef) return;
    setRoleForm(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId) ? prev.selectedModules : [...prev.selectedModules, moduleId],
      selectedSubmodules: {
        ...prev.selectedSubmodules,
        [moduleId]: modDef.submodules.map(s => s.id)
      }
    }));
  };

  const handleClearSubmodulesForModule = (moduleId) => {
    setRoleForm(prev => ({
      ...prev,
      selectedSubmodules: {
        ...prev.selectedSubmodules,
        [moduleId]: []
      }
    }));
  };

  const handleApplyPreset = (presetKey) => {
    if (presetKey === 'ALL') {
      const allMods = SYSTEM_MODULES_CATALOG.map(m => m.id);
      const allSub = {};
      SYSTEM_MODULES_CATALOG.forEach(m => {
        allSub[m.id] = m.submodules.map(s => s.id);
      });
      setRoleForm(prev => ({
        ...prev,
        selectedModules: allMods,
        selectedSubmodules: allSub,
        actions: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canExport: true }
      }));
    } else if (presetKey === 'CLEAR') {
      setRoleForm(prev => ({
        ...prev,
        selectedModules: [],
        selectedSubmodules: {},
        actions: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canExport: false }
      }));
    } else if (presetKey === 'PROJECTS') {
      const mods = ['PROJECTS', 'DOCUMENTS'];
      const allSub = {};
      mods.forEach(id => {
        const def = SYSTEM_MODULES_CATALOG.find(m => m.id === id);
        if (def) allSub[id] = def.submodules.map(s => s.id);
      });
      setRoleForm(prev => ({
        ...prev,
        name: prev.name || 'Project Site Engineer',
        selectedModules: mods,
        selectedSubmodules: allSub,
        actions: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canExport: true }
      }));
    } else if (presetKey === 'FINANCE') {
      const mods = ['INVOICES', 'PAYMENTS', 'EXPENSES', 'TREASURY', 'REPORTS'];
      const allSub = {};
      mods.forEach(id => {
        const def = SYSTEM_MODULES_CATALOG.find(m => m.id === id);
        if (def) allSub[id] = def.submodules.map(s => s.id);
      });
      setRoleForm(prev => ({
        ...prev,
        name: prev.name || 'Accounts & Billing Specialist',
        selectedModules: mods,
        selectedSubmodules: allSub,
        actions: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canExport: true }
      }));
    } else if (presetKey === 'SALES') {
      const mods = ['QUOTATIONS', 'CLIENTS', 'LEADS'];
      const allSub = {};
      mods.forEach(id => {
        const def = SYSTEM_MODULES_CATALOG.find(m => m.id === id);
        if (def) allSub[id] = def.submodules.map(s => s.id);
      });
      setRoleForm(prev => ({
        ...prev,
        name: prev.name || 'Sales & Quotations Executive',
        selectedModules: mods,
        selectedSubmodules: allSub,
        actions: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canExport: true }
      }));
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      notify.error('Role name is required');
      return;
    }
    if (roleForm.selectedModules.length === 0) {
      notify.error('Please select at least one module for this role');
      return;
    }

    try {
      setSubmitting(true);
      const permissions = roleForm.selectedModules.map(modId => ({
        module: modId,
        canView: Boolean(roleForm.actions.canView),
        canCreate: Boolean(roleForm.actions.canCreate),
        canEdit: Boolean(roleForm.actions.canEdit),
        canSubmit: Boolean(roleForm.actions.canCreate),
        canApprove: Boolean(roleForm.actions.canApprove),
        canReject: Boolean(roleForm.actions.canApprove),
        canDelete: Boolean(roleForm.actions.canDelete),
        canExport: Boolean(roleForm.actions.canExport),
        scope: roleForm.scope
      }));

      const payload = {
        name: roleForm.name.trim(),
        description: roleForm.description || '',
        submodules: roleForm.selectedSubmodules,
        permissions
      };

      if (editingRoleId) {
        await orgApi.updateRole(editingRoleId, payload);
        notify.success(`Custom role "${roleForm.name}" updated successfully!`);
      } else {
        await orgApi.createCustomRole(payload);
        notify.success(`Custom role "${roleForm.name}" created successfully!`);
      }

      setRoleModalOpen(false);
      fetchData();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to permanently delete custom role "${roleName}"?`)) return;
    try {
      await orgApi.deleteRole(roleId);
      notify.success(`Role "${roleName}" deleted successfully`);
      setRoles(prev => prev.filter(r => r.id !== roleId));
    } catch (err) {
      notify.error('Failed to delete role: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleClearAllRoles = async () => {
    if (!window.confirm('Are you sure you want to remove ALL role entries? This action cannot be undone.')) return;
    try {
      await orgApi.clearAllRoles();
      notify.success('All role entries removed successfully!');
      setRoles([]);
    } catch (err) {
      notify.error('Failed to clear roles: ' + (err.response?.data?.message || err.message));
    }
  };

  // --- USER CREATION WITH DOB PASSWORD (d-m-y) ---

  const handleOpenCreateUser = () => {
    setUserForm({
      name: '',
      dob: '',
      email: '',
      roleId: roles[0]?.id || '',
      roleTitle: roles[0]?.name || 'Staff Member',
      departmentId: '',
      branchId: ''
    });
    setCreatedCredentialsPreview(null);
    setUserModalOpen(true);
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.name.trim()) {
      notify.error('User Name is required');
      return;
    }
    if (!userForm.dob.trim()) {
      notify.error('Date of Birth (DOB) is required to generate (d-m-y) password');
      return;
    }

    try {
      setSubmitting(true);
      const res = await orgApi.createDirectMember({
        name: userForm.name.trim(),
        dob: userForm.dob.trim(),
        email: userForm.email.trim(),
        roleId: userForm.roleId || null,
        roleTitle: userForm.roleTitle || 'Staff Member'
      });

      const creds = res.data?.data?.credentials || res.data?.credentials;
      if (creds) {
        setCreatedCredentialsPreview(creds);
      }
      notify.success(`User "${userForm.name}" created with password as Date of Birth!`);
      fetchData();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePassword = (userId) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopyCredentials = (username, dobPassword) => {
    const text = `Username: ${username}\nPassword (DOB): ${dobPassword}`;
    navigator.clipboard.writeText(text);
    notify.success(`Credentials copied for ${username}!`);
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove user "${memberName || 'Staff'}"?`)) return;
    try {
      await orgApi.removeMember(memberId);
      notify.success('User removed successfully');
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      notify.error('Failed to remove user: ' + (err.response?.data?.message || err.message));
    }
  };

  // Compute stats
  const totalSubmodulesCount = SYSTEM_MODULES_CATALOG.reduce((acc, m) => acc + m.submodules.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>
                Custom Roles, Submodules & User DOB Governance
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                End-users configure exact modules, required submodules, and generate user accounts with DOB (d-m-y) passwords.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {roles.length > 0 && (
            <button
              onClick={handleClearAllRoles}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
              title="Remove all configured role entries"
            >
              <Trash2 size={14} />
              <span>Clear All Roles</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateUser}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 700, borderColor: '#bfdbfe', backgroundColor: '#eff6ff', color: 'var(--primary)' }}
          >
            <KeyRound size={16} />
            <span>+ Create User (DOB Password)</span>
          </button>

          <button
            onClick={handleOpenCreateRole}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 700 }}
          >
            <Plus size={16} />
            <span>+ Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('roles')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'roles' ? 'var(--primary)' : '#f1f5f9',
            color: activeTab === 'roles' ? '#ffffff' : 'var(--text-main)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Layers size={16} />
          <span>Custom Roles & Module Matrices ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'users' ? 'var(--primary)' : '#f1f5f9',
            color: activeTab === 'users' ? '#ffffff' : 'var(--text-main)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <KeyRound size={16} />
          <span>Users & DOB Credentials (d-m-y) ({members.length})</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Configured Roles
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
            {roles.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {roles.length === 0 ? 'No default roles active' : 'User-created custom definitions'}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Modules & Submodules
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            {SYSTEM_MODULES_CATALOG.length} / {totalSubmodulesCount}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            Granular selectable capabilities
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Core Access Scopes
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>
            {CORE_ACCESS_SCOPES.length}
          </div>
          <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px' }}>
            Workspace, Projects, Dept, Own
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            DOB Password Users
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>
            {members.length}
          </div>
          <div style={{ fontSize: '12px', color: '#d97706', marginTop: '4px' }}>
            Login via Name & DOB (d-m-y)
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CUSTOM ROLES & SUBMODULES MATRICES                 */}
      {/* ======================================================== */}
      {activeTab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Roles Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Active Custom Roles
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  End-user configured roles defining exact module and submodule boundaries.
                </p>
              </div>

              {roles.length > 0 && (
                <button
                  onClick={handleOpenCreateRole}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={14} />
                  <span>Add Another Role</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                <div>Loading custom security roles...</div>
              </div>
            ) : roles.length === 0 ? (
              <div className="card" style={{ padding: '50px 24px', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Shield size={30} color="#94a3b8" />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                  All Default Role Entries Removed
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                  The workspace is now clean. You can create your own custom roles from scratch and pick exactly what modules, submodules, and action capabilities should be assigned.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    onClick={handleOpenCreateRole}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '13px', fontWeight: 700 }}
                  >
                    <Plus size={16} />
                    <span>Create Your First Custom Role</span>
                  </button>
                  <button
                    onClick={handleOpenCreateUser}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '13px', fontWeight: 700 }}
                  >
                    <KeyRound size={16} />
                    <span>Create User with DOB Password</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {roles.map(role => {
                  let submodulesMap = {};
                  if (role.description) {
                    try {
                      const parsed = JSON.parse(role.description);
                      if (parsed?.submodules) submodulesMap = parsed.submodules;
                    } catch (e) {}
                  }

                  const permissions = role.permissions || [];
                  const scope = permissions[0]?.scope || 'ORGANIZATION';
                  const scopeLabel = CORE_ACCESS_SCOPES.find(s => s.key === scope)?.label || scope;

                  return (
                    <div
                      key={role.id}
                      className="card"
                      style={{
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px',
                        position: 'relative',
                        borderTop: '4px solid var(--primary)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                              {role.name}
                            </h3>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                              Scope: {scopeLabel}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              onClick={() => handleOpenEditRole(role)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '5px 8px' }}
                              title="Edit Role & Permissions"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id, role.name)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '5px 8px', color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
                              title="Delete Role"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
                          {role.description?.startsWith('{') ? 'Custom module and submodule access profile.' : (role.description || 'Custom module permissions.')}
                        </p>

                        {/* Enabled Modules Badge List */}
                        <div style={{ marginTop: '14px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                            Assigned Modules ({permissions.length})
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {permissions.map((p, idx) => {
                              const modDef = SYSTEM_MODULES_CATALOG.find(m => m.id === p.module);
                              const subCount = submodulesMap[p.module]?.length || 0;
                              return (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '11px',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: '#eff6ff',
                                    color: '#1d4ed8',
                                    border: '1px solid #bfdbfe',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <span>{modDef?.name || p.module}</span>
                                  {subCount > 0 && (
                                    <span style={{ fontSize: '10px', backgroundColor: '#dbeafe', padding: '1px 4px', borderRadius: 4 }}>
                                      {subCount} subs
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {role._count?.memberships || 0} users assigned
                        </span>
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} /> Active Custom Policy
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Granular System Modules & Submodules Catalog Explorer */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--primary)" />
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  System Modules & Required Submodules Reference Matrix
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                All modules and required submodules available for end-user delegation and granular authorization.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              {SYSTEM_MODULES_CATALOG.map((mod) => (
                <div
                  key={mod.id}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '16px',
                    backgroundColor: '#fafbfc'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)' }}>
                        {mod.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                        {mod.category}
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: 4, backgroundColor: '#f1f5f9', color: mod.color, border: `1px solid ${mod.color}33` }}>
                      {mod.badge}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Required Submodules ({mod.submodules.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {mod.submodules.map((sub) => (
                      <div
                        key={sub.id}
                        style={{
                          fontSize: '12px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#334155' }}>
                          ✓ {sub.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {sub.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: USERS & DOB CREDENTIALS (d-m-y)                  */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Concept Banner */}
          <div
            className="card"
            style={{
              padding: '18px 22px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              borderRadius: '12px'
            }}
          >
            <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px', color: 'var(--primary)' }}>
              <KeyRound size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                User Name & Date of Birth (d-m-y) Credential Concept
              </h3>
              <p style={{ fontSize: '13px', color: '#1e40af', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                End-users are created directly with their <strong>User Name</strong> and <strong>Date of Birth (DOB)</strong>. The system automatically sets their login password as their Date of Birth in <strong>(d-m-y)</strong> format (e.g. <code>15-08-1995</code>).
                Administrators can toggle password visibility, view the DOB password, and copy credentials anytime to onboard staff instantly.
              </p>
            </div>
            <button
              onClick={handleOpenCreateUser}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', flexShrink: 0 }}
            >
              <Plus size={15} />
              <span>Create User (DOB)</span>
            </button>
          </div>

          {/* Members Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Staff Members & Credentials Directory
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Showing User Name, Date of Birth (DOB), visible (d-m-y) password, and assigned role access.
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                <div>Loading team members...</div>
              </div>
            ) : members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <div style={{ fontWeight: 700, fontSize: '15px' }}>No staff members registered yet</div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>
                  Click "Create User (DOB Password)" to add a user with their name and birth date.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                        User Name & Email
                      </th>
                      <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                        Date of Birth (DOB)
                      </th>
                      <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                        Password Concept (d-m-y)
                      </th>
                      <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                        Assigned Role / Modules
                      </th>
                      <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                        Status
                      </th>
                      <th style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(member => {
                      const name = member.user?.name || member.name || 'User';
                      const email = member.user?.email || member.email;
                      const rawDob = member.dob || member.user?.dob;
                      const dobFormatted = rawDob ? formatDobToDmy(rawDob) : 'Not Specified';
                      const isPwdVisible = visiblePasswords[member.id];

                      return (
                        <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          {/* Name & Email */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '14px' }}>
                              {name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                              {email}
                            </div>
                          </td>

                          {/* Date of Birth (DOB) */}
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#f5f3ff',
                                color: '#6d28d9',
                                fontWeight: 700,
                                fontSize: '12px',
                                border: '1px solid #ddd6fe'
                              }}
                            >
                              <Calendar size={13} />
                              <span>{dobFormatted}</span>
                            </span>
                          </td>

                          {/* Password (d-m-y) Concept */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  padding: '4px 9px',
                                  borderRadius: '6px',
                                  backgroundColor: isPwdVisible ? '#f0fdf4' : '#f1f5f9',
                                  color: isPwdVisible ? '#15803d' : '#475569',
                                  border: `1px solid ${isPwdVisible ? '#bbf7d0' : '#e2e8f0'}`,
                                  minWidth: 100,
                                  textAlign: 'center'
                                }}
                              >
                                {isPwdVisible ? dobFormatted : '••••••••••'}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleTogglePassword(member.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 7px' }}
                                title={isPwdVisible ? 'Hide Password' : 'View Password (d-m-y)'}
                              >
                                {isPwdVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyCredentials(name, dobFormatted)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 7px' }}
                                title="Copy Username and Password"
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                          </td>

                          {/* Assigned Role / Modules */}
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '3px 9px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 700,
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe'
                              }}
                            >
                              <Shield size={12} />
                              <span>{member.role?.name || member.roleTitle || 'Custom Scoped Access'}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontSize: '11px',
                                fontWeight: 800,
                                backgroundColor: member.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                                color: member.status === 'ACTIVE' ? '#047857' : '#b91c1c'
                              }}
                            >
                              {member.status || 'ACTIVE'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            {!member.isOwner && (
                              <button
                                onClick={() => handleDeleteMember(member.id, name)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '5px 8px', color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
                                title="Remove User"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE / EDIT CUSTOM ROLE WITH SUBMODULES       */}
      {/* ======================================================== */}
      {roleModalOpen && (
        <Modal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          title={editingRoleId ? 'Edit Custom Role & Submodule Policies' : 'Create Custom Role & Assign Modules'}
          maxWidth={780}
        >
          <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Presets Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                Quick Presets:
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('ALL')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  ✓ All Modules
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('PROJECTS')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  Project Site Lead
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('FINANCE')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  Finance & Billing
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('SALES')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  Sales & Quotes
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('CLEAR')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px', fontSize: '11px', color: '#dc2626' }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>
                  Role Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Senior Project Engineer, Billing Auditor"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>
                  Core Access Scope
                </label>
                <select
                  className="form-control"
                  value={roleForm.scope}
                  onChange={(e) => setRoleForm({ ...roleForm, scope: e.target.value })}
                >
                  {CORE_ACCESS_SCOPES.map(s => (
                    <option key={s.key} value={s.key}>
                      {s.label} ({s.description})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>
                Description
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Brief summary of duties and authorized scope"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              />
            </div>

            {/* Core Concept Actions Checklist */}
            <div style={{ padding: '14px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: 8 }}>
                Core Action Capabilities:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                {CORE_ACCESS_ACTIONS.map(action => (
                  <label
                    key={action.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: roleForm.actions[action.key] ? 'var(--primary)' : '#475569'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(roleForm.actions[action.key])}
                      onChange={(e) => setRoleForm({
                        ...roleForm,
                        actions: { ...roleForm.actions, [action.key]: e.target.checked }
                      })}
                    />
                    <span>{action.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Modules and Required Submodules Matrix */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '13px', margin: 0 }}>
                  Select Modules & Required Submodules:
                </label>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {roleForm.selectedModules.length} of {SYSTEM_MODULES_CATALOG.length} modules selected
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                {SYSTEM_MODULES_CATALOG.map(mod => {
                  const isModSelected = roleForm.selectedModules.includes(mod.id);
                  const activeSubList = roleForm.selectedSubmodules[mod.id] || [];

                  return (
                    <div
                      key={mod.id}
                      style={{
                        border: `1.5px solid ${isModSelected ? 'var(--primary)' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        padding: '12px 14px',
                        backgroundColor: isModSelected ? '#f8faff' : '#ffffff',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Module Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '14px',
                            color: isModSelected ? 'var(--primary)' : 'var(--text-main)',
                            margin: 0
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isModSelected}
                            onChange={() => handleToggleModule(mod.id)}
                            style={{ width: 16, height: 16 }}
                          />
                          <span>{mod.name}</span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                            ({mod.category})
                          </span>
                        </label>

                        {isModSelected && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => handleSelectAllSubmodulesForModule(mod.id)}
                              style={{ fontSize: '10px', padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
                            >
                              All Submodules
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClearSubmodulesForModule(mod.id)}
                              style={{ fontSize: '10px', padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#dc2626' }}
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Submodules Checklist */}
                      {isModSelected && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                          {mod.submodules.map(sub => {
                            const isSubSelected = activeSubList.includes(sub.id);
                            return (
                              <label
                                key={sub.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 8,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: isSubSelected ? '#eff6ff' : '#ffffff',
                                  border: `1px solid ${isSubSelected ? '#bfdbfe' : '#f1f5f9'}`,
                                  color: isSubSelected ? '#1e40af' : '#475569',
                                  fontWeight: isSubSelected ? 700 : 500
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSubSelected}
                                  onChange={() => handleToggleSubmodule(mod.id, sub.id)}
                                  style={{ marginTop: 2 }}
                                />
                                <div>
                                  <div>{sub.name}</div>
                                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}>
                                    {sub.description}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={16} />
                <span>{editingRoleId ? 'Update Custom Role' : 'Save Custom Role'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CREATE USER WITH DOB PASSWORD (d-m-y)           */}
      {/* ======================================================== */}
      {userModalOpen && (
        <Modal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          title="Create User Account with DOB Password (d-m-y)"
          maxWidth={540}
        >
          {createdCredentialsPreview ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                User Account Activated!
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Credentials generated using User Name and Date of Birth (d-m-y) format:
              </p>

              {/* Credentials Box */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Login User Name:</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{createdCredentialsPreview.username}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Date of Birth (DOB):</span>
                  <strong style={{ fontSize: '13px', color: '#6d28d9' }}>{createdCredentialsPreview.dob}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Password (d-m-y):</span>
                  <strong style={{ fontSize: '14px', color: '#059669', fontFamily: 'var(--font-mono)' }}>{createdCredentialsPreview.password}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Email Address:</span>
                  <span style={{ fontSize: '13px', color: '#475569' }}>{createdCredentialsPreview.email}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => handleCopyCredentials(createdCredentialsPreview.username, createdCredentialsPreview.password)}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Copy size={15} />
                  <span>Copy Credentials</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedCredentialsPreview(null);
                    setUserModalOpen(false);
                  }}
                  className="btn btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>
                  User Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ramesh Kumar, Priya Sharma"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
                  This will be used as their login identity (or they can use their email).
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>
                  Date of Birth (DOB) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={userForm.dob}
                  onChange={(e) => setUserForm({ ...userForm, dob: e.target.value })}
                  required
                />
                <span style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 600, marginTop: 4, display: 'block' }}>
                  🔑 The login password will be set strictly to this DOB in <strong>(d-m-y)</strong> format!
                </span>
              </div>

              {/* Real-time Credentials Preview Card */}
              {userForm.dob && (
                <div
                  style={{
                    backgroundColor: '#f5f3ff',
                    border: '1.5px solid #ddd6fe',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <KeyRound size={14} />
                    <span>Generated Credential Preview (Visible to Admin):</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                    <span>Username:</span>
                    <strong>{userForm.name || '(enter name above)'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                    <span>Password (d-m-y):</span>
                    <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
                      {showDobPasswordInModal ? formatDobToDmy(userForm.dob) : '••••••••••'}
                    </strong>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>
                  Assign Role / Module Access
                </label>
                <select
                  className="form-control"
                  value={userForm.roleId}
                  onChange={(e) => {
                    const r = roles.find(item => item.id === e.target.value);
                    setUserForm({
                      ...userForm,
                      roleId: e.target.value,
                      roleTitle: r?.name || 'Staff Member'
                    });
                  }}
                >
                  {roles.length === 0 ? (
                    <option value="">No roles defined yet (Custom general staff access)</option>
                  ) : (
                    roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Optional (auto-generated if left blank)"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={16} />
                  <span>Create User & Generate Credentials</span>
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
