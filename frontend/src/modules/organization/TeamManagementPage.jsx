import React, { useState, useEffect } from 'react';
import { orgApi } from '../../services/organization.service';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { 
  Users, UserPlus, Mail, Shield, Building, 
  CheckCircle2, AlertTriangle, RefreshCw, X, Check, Search, Trash2, 
  KeyRound, Calendar, Eye, EyeOff, Copy, Sparkles
} from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { formatDobToDmy } from '../../services/modulesCatalog.js';
import { Link } from 'react-router-dom';

export default function TeamManagementPage() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Direct User Creation Modal (Name + DOB password concept)
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    dob: '',
    email: '',
    roleId: '',
    department: '',
    branch: ''
  });
  const [createdCredentialsPreview, setCreatedCredentialsPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const notify = useNotification();

  useEffect(() => {
    fetchTeamAndRoles();
  }, []);

  const fetchTeamAndRoles = async () => {
    try {
      setLoading(true);
      const [membersRes, rolesRes] = await Promise.all([
        orgApi.getTeamMembers(),
        orgApi.getRoles()
      ]);

      const memList = membersRes.data?.members || membersRes.data?.data?.members || membersRes.data?.data || (Array.isArray(membersRes.data) ? membersRes.data : []);
      setMembers(Array.isArray(memList) ? memList : []);

      const rolesList = Array.isArray(rolesRes?.data)
        ? rolesRes.data
        : (Array.isArray(rolesRes?.data?.data) ? rolesRes.data.data : (Array.isArray(rolesRes) ? rolesRes : []));
      setRoles(rolesList);

      if (rolesList.length > 0 && !userData.roleId) {
        setUserData(prev => ({ ...prev, roleId: rolesList[0].id }));
      }
    } catch (err) {
      notify.error('Failed to load team data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateUser = () => {
    setUserData({
      name: '',
      dob: '',
      email: '',
      roleId: roles[0]?.id || '',
      department: '',
      branch: ''
    });
    setCreatedCredentialsPreview(null);
    setUserModalOpen(true);
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!userData.name.trim()) {
      notify.error('User Name is required');
      return;
    }
    if (!userData.dob.trim()) {
      notify.error('Date of Birth (DOB) is required to generate (d-m-y) password');
      return;
    }

    try {
      setSubmitting(true);
      const selectedRole = roles.find(r => r.id === userData.roleId);
      const res = await orgApi.createDirectMember({
        name: userData.name.trim(),
        dob: userData.dob.trim(),
        email: userData.email.trim(),
        roleId: userData.roleId || null,
        roleTitle: selectedRole?.name || 'Staff Member',
        departmentId: userData.department || null,
        branchId: userData.branch || null
      });

      const creds = res.data?.data?.credentials || res.data?.credentials;
      if (creds) {
        setCreatedCredentialsPreview(creds);
      }
      notify.success(`Staff member "${userData.name}" registered with DOB password!`);
      fetchTeamAndRoles();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to create staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePassword = (memberId) => {
    setVisiblePasswords(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const handleCopyCredentials = (username, dobPassword) => {
    const text = `Username: ${username}\nPassword (DOB): ${dobPassword}`;
    navigator.clipboard.writeText(text);
    notify.success(`Credentials copied for ${username}!`);
  };

  const handleStatusChange = async (memberId, newStatus) => {
    try {
      const res = await orgApi.updateMemberStatus(memberId, newStatus);
      if (res.data?.success) {
        notify.success(`Member status updated to ${newStatus}`);
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: newStatus } : m));
      }
    } catch (err) {
      notify.error('Failed to update member status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName || 'this member'} from the organization?`)) return;

    try {
      const res = await orgApi.removeMember(memberId);
      if (res.data?.success) {
        notify.success('Member removed from organization');
        setMembers(prev => prev.filter(m => m.id !== memberId));
      }
    } catch (err) {
      notify.error('Failed to remove member: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredMembers = members.filter(m => {
    const nameMatch = (m.user?.name || m.name || '').toLowerCase().includes(search.toLowerCase());
    const emailMatch = (m.user?.email || m.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesSearch = !search || nameMatch || emailMatch;
    const matchesRole = !roleFilter || (m.role?.id === roleFilter || m.role?.code === roleFilter);
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = members.filter(m => m.status === 'ACTIVE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <Users size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>
                Team & Staff Credentials Directory
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                User accounts configured with User Name and Date of Birth (d-m-y) passwords.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchTeamAndRoles}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/roles"
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Shield size={15} />
            <span>Configure Custom Roles</span>
          </Link>
          <button
            onClick={handleOpenCreateUser}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 700 }}
          >
            <UserPlus size={16} />
            <span>Create User (DOB Password)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Staff Members
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
            {members.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Workspace accounts
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Verified Seats
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            Login via Name & DOB
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Custom Roles Defined
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>
            {roles.length}
          </div>
          <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px' }}>
            {roles.length === 0 ? 'No roles configured' : 'Active RBAC policies'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        {roles.length > 0 && (
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
              minWidth: 160,
            }}
          >
            <option value="">All Custom Roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            fontSize: '13px',
            backgroundColor: '#ffffff',
            minWidth: 140,
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      {/* Main Members Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
            <div>Loading organization staff members...</div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Users size={28} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              No Staff Members Found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 16px' }}>
              {search || roleFilter || statusFilter
                ? 'No staff members match the selected filters.'
                : 'Create user accounts with Name and Date of Birth (DOB) to start collaborating.'}
            </p>
            <button
              onClick={handleOpenCreateUser}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '13px' }}
            >
              <UserPlus size={15} />
              <span>Create User (DOB Password)</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Staff Member
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Date of Birth (DOB)
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Password Concept (d-m-y)
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Assigned Role
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Access Status
                  </th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => {
                  const name = member.user?.name || member.name || 'Staff User';
                  const email = member.user?.email || member.email;
                  const rawDob = member.dob || member.user?.dob;
                  const dobFormatted = rawDob ? formatDobToDmy(rawDob) : 'Not Specified';
                  const isPwdVisible = visiblePasswords[member.id];
                  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

                  return (
                    <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: '#eff6ff',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '13px',
                              border: '1.5px solid #bfdbfe',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>
                              {name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <Mail size={12} />
                              <span>{email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* DOB */}
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

                      {/* Password Concept (d-m-y) */}
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
                              minWidth: 95,
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
                            title="Copy Login Credentials"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>

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
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          <Shield size={12} color="#2563eb" />
                          <span>{member.role?.name || member.roleTitle || 'Custom Role'}</span>
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <select
                          value={member.status}
                          onChange={(e) => handleStatusChange(member.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 800,
                            border: '1px solid transparent',
                            backgroundColor: member.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                            color: member.status === 'ACTIVE' ? '#047857' : '#b91c1c',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {!member.isOwner && (
                          <button
                            onClick={() => handleRemoveMember(member.id, name)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px', color: '#ef4444', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
                            title="Remove member"
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

      {/* Direct User Creation Modal (DOB Password Concept) */}
      {userModalOpen && (
        <Modal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          title="Create Staff Member with DOB Password (d-m-y)"
          maxWidth={520}
        >
          {createdCredentialsPreview ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Staff Member Activated!
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Password automatically configured as Date of Birth in (d-m-y) format:
              </p>

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
            <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  User Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar, Priya Sharma"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Date of Birth (DOB) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={userData.dob}
                  onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 600, marginTop: 4, display: 'block' }}>
                  🔑 Password is strictly this Date of Birth formatted as (d-m-y)!
                </span>
              </div>

              {userData.dob && (
                <div
                  style={{
                    backgroundColor: '#f5f3ff',
                    border: '1.5px solid #ddd6fe',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <KeyRound size={13} />
                    <span>Generated Login Credentials:</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                    <span>Username:</span>
                    <strong>{userData.name || '(enter name above)'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                    <span>Password (d-m-y):</span>
                    <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
                      {formatDobToDmy(userData.dob)}
                    </strong>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Assigned Custom Role
                </label>
                <select
                  value={userData.roleId}
                  onChange={(e) => setUserData({ ...userData, roleId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {roles.length === 0 ? (
                    <option value="">No custom roles created yet (Standard staff access)</option>
                  ) : (
                    roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))
                  )}
                </select>
                {roles.length === 0 && (
                  <span style={{ fontSize: '11px', color: 'var(--primary)', marginTop: 4, display: 'block' }}>
                    <Link to="/roles" style={{ textDecoration: 'underline' }}>Click here to create a custom role</Link> with specific modules and submodules.
                  </span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="Optional (auto-generated if left blank)"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {submitting ? 'Generating Account...' : 'Create User & Activate'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
