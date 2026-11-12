import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Laptop,
  Briefcase,
  ChevronRight,
  Eye,
  Building,
  RefreshCw,
  Sparkles,
  Calculator,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import employeeService from '../../services/employee.service.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';

export default function EmployeesListPage() {
  const [employees, setEmployees] = useState([]);
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    preBoarding: 0,
    submittedForReview: 0,
    bgvInProgress: 0,
    activeProbation: 0,
    confirmedActive: 0,
    relieved: 0,
    pendingKycCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [calculatorModalOpen, setCalculatorModalOpen] = useState(false);
  const [calcCtcInput, setCalcCtcInput] = useState(1800000);
  const [calcBreakdown, setCalcBreakdown] = useState(null);

  const notify = useNotification();
  const navigate = useNavigate();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await employeeService.getEmployees({
        search,
        status: statusFilter,
        department: deptFilter,
        limit: 50,
      });

      if (res?.data) {
        setEmployees(res.data);
      }
      if (res?.meta?.metrics) {
        setMetrics(res.meta.metrics);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to load employees directory');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, deptFilter, notify]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // Compute live CTC calculation
  const handleCalculateCtc = async (ctcVal) => {
    try {
      setCalcCtcInput(ctcVal);
      const res = await employeeService.calculateCtc(ctcVal);
      if (res?.data) {
        setCalcBreakdown(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED_ACTIVE':
        return { label: 'Confirmed Active', bg: 'var(--success-light)', color: 'var(--success-text)', border: 'var(--success-border)' };
      case 'ACTIVE_PROBATION':
        return { label: 'Active Probation', bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'BGV_IN_PROGRESS':
        return { label: 'BGV In Progress', bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe' };
      case 'SUBMITTED_FOR_VERIFICATION':
        return { label: 'KYC Review Pending', bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' };
      case 'PRE_BOARDING':
        return { label: 'Pre-Boarding', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case 'RELIEVED':
        return { label: 'Relieved / Alum', bg: 'var(--bg-muted)', color: 'var(--text-muted)', border: 'var(--border-subtle)' };
      default:
        return { label: status, bg: 'var(--bg-muted)', color: 'var(--text-main)', border: 'var(--border-subtle)' };
    }
  };

  const getBgvBadge = (status) => {
    switch (status) {
      case 'CLEARED':
        return { label: 'BGV Cleared', color: 'var(--success)', icon: <ShieldCheck size={13} /> };
      case 'IN_PROGRESS':
        return { label: 'BGV Running', color: '#8b5cf6', icon: <Clock size={13} /> };
      case 'DISCREPANCY':
        return { label: 'Flagged', color: 'var(--danger)', icon: <ShieldAlert size={13} /> };
      default:
        return { label: 'Not Started', color: 'var(--text-subtle)', icon: <Clock size={13} /> };
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                HR Staff & Document Automation Desk
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Enterprise onboarding, automated KYC verification desk, legal document generator, and IT asset governance.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              setCalculatorModalOpen(true);
              handleCalculateCtc(calcCtcInput);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Calculator size={16} color="var(--primary)" />
            <span>Statutory CTC Calculator</span>
          </button>

          <Link
            to="/employees/onboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              transition: 'background-color 0.15s',
            }}
          >
            <UserPlus size={16} />
            <span>Onboard New Candidate</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Headcount
            </span>
            <Users size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', marginTop: '8px' }}>
            {metrics.totalEmployees}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active roster & alumni</span>
        </div>

        <div
          onClick={() => setStatusFilter('PRE_BOARDING')}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: statusFilter === 'PRE_BOARDING' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#0369a1', textTransform: 'uppercase' }}>
              Pre-Boarding Queue
            </span>
            <Clock size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0284c7', marginTop: '8px' }}>
            {metrics.preBoarding}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Offers accepted / Wizard in progress</span>
        </div>

        <div
          onClick={() => setStatusFilter('SUBMITTED_FOR_VERIFICATION')}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: statusFilter === 'SUBMITTED_FOR_VERIFICATION' ? '2px solid #ea580c' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#c2410c', textTransform: 'uppercase' }}>
              KYC Review Desk
            </span>
            <FileCheck2 size={16} color="#ea580c" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#ea580c', marginTop: '8px' }}>
            {metrics.submittedForReview}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {metrics.pendingKycCount} documents awaiting HR review
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('BGV_IN_PROGRESS')}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: statusFilter === 'BGV_IN_PROGRESS' ? '2px solid #7c3aed' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6d28d9', textTransform: 'uppercase' }}>
              BGV Pipeline
            </span>
            <ShieldAlert size={16} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#7c3aed', marginTop: '8px' }}>
            {metrics.bgvInProgress}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Under third-party verification</span>
        </div>

        <div
          onClick={() => setStatusFilter('CONFIRMED_ACTIVE')}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: statusFilter === 'CONFIRMED_ACTIVE' ? '2px solid var(--success)' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-text)', textTransform: 'uppercase' }}>
              Active Confirmed
            </span>
            <CheckCircle2 size={16} color="var(--success)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--success)', marginTop: '8px' }}>
            {metrics.confirmedActive}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>On active projects</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by candidate name, code, email, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              borderRadius: '8px',
              border: '1px solid var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering & Cloud</option>
            <option value="DevOps">DevOps & SRE</option>
            <option value="Quality">Quality & Testing</option>
            <option value="Design">Product Design</option>
            <option value="Backend">Backend Engineering</option>
          </select>
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'ALL', label: 'All Roster' },
            { id: 'PRE_BOARDING', label: 'Pre-Boarding' },
            { id: 'SUBMITTED_FOR_VERIFICATION', label: 'KYC Review' },
            { id: 'BGV_IN_PROGRESS', label: 'BGV Checks' },
            { id: 'ACTIVE_PROBATION', label: 'Probation' },
            { id: 'CONFIRMED_ACTIVE', label: 'Active' },
            { id: 'RELIEVED', label: 'Relieved' },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: active ? '700' : '500',
                  border: active ? '1px solid var(--primary)' : '1px solid transparent',
                  backgroundColor: active ? 'var(--primary-light)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Employees Data Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--bg-muted)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '14px 20px', fontWeight: '700' }}>Candidate / Employee</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>Designation & Band</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>Lifecycle Stage</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>KYC Verification</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>BGV Status</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>Annual CTC</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Loading staff directory...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No employees matching current filter criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const statusBadge = getStatusBadge(emp.employmentStatus);
                  const bgvBadge = getBgvBadge(emp.bgv?.overallStatus);
                  const kycDocsCount = emp.kycDocuments?.length || 0;
                  const verifiedKycCount = emp.kycDocuments?.filter((d) => d.verificationStatus === 'VERIFIED').length || 0;
                  const hasPendingKyc = emp.kycDocuments?.some((d) => d.verificationStatus === 'UNDER_REVIEW' || d.verificationStatus === 'PENDING');

                  return (
                    <tr
                      key={emp.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.12s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={emp.profilePhotoUrl}
                            alt={emp.fullName}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid var(--border-strong)',
                            }}
                          />
                          <div>
                            <Link
                              to={`/employees/${emp.id}`}
                              style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: 'var(--text-main)',
                                textDecoration: 'none',
                                display: 'block',
                              }}
                            >
                              {emp.fullName}
                            </Link>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{emp.employeeCode}</span>
                              <span>•</span>
                              <span>{emp.officialEmail}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{emp.designation}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {emp.department} • <span style={{ color: 'var(--text-subtle)' }}>{emp.gradeLevel}</span>
                        </div>
                      </td>

                      {/* Lifecycle Stage */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.color,
                            border: `1px solid ${statusBadge.border}`,
                          }}
                        >
                          {statusBadge.label}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Joined: {emp.joiningDate}
                        </div>
                      </td>

                      {/* KYC Verification Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: '700',
                              color: hasPendingKyc ? '#ea580c' : verifiedKycCount === kycDocsCount && kycDocsCount > 0 ? 'var(--success)' : 'var(--text-muted)',
                            }}
                          >
                            {verifiedKycCount}/{kycDocsCount} Verified
                          </span>
                        </div>
                        {hasPendingKyc && (
                          <span
                            style={{
                              fontSize: '10px',
                              backgroundColor: '#fff7ed',
                              color: '#c2410c',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #fed7aa',
                              display: 'inline-block',
                              marginTop: '2px',
                              fontWeight: '600',
                            }}
                          >
                            Review Needed
                          </span>
                        )}
                      </td>

                      {/* BGV Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: bgvBadge.color, fontSize: '12px', fontWeight: '700' }}>
                          {bgvBadge.icon}
                          <span>{bgvBadge.label}</span>
                        </div>
                        {emp.bgv?.agency && (
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{emp.bgv.agency}</div>
                        )}
                      </td>

                      {/* Annual CTC */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                          ₹{emp.annualCtc?.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          ~₹{Math.round(emp.annualCtc / 12)?.toLocaleString('en-IN')}/mo
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link
                            to={`/employees/${emp.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              textDecoration: 'none',
                              border: '1px solid var(--primary-border)',
                            }}
                          >
                            <Eye size={13} />
                            <span>Desk</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTC Calculator Modal */}
      {calculatorModalOpen && (
        <Modal
          isOpen={calculatorModalOpen}
          onClose={() => setCalculatorModalOpen(false)}
          title="Indian Statutory CTC Breakdown Calculator"
          maxWidth="700px"
        >
          <div style={{ padding: '4px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Computes standard Indian IT salary annexure components including Basic (45%), HRA (50% of Basic), Special Allowance, PF Employer/Employee (12%), Gratuity, Professional Tax (PT), and Estimated New Regime TDS.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                Annual Cost to Company (CTC in INR):
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  step="50000"
                  value={calcCtcInput}
                  onChange={(e) => handleCalculateCtc(Number(e.target.value))}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    fontFamily: 'var(--font-mono)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-strong)',
                  }}
                />
                <button
                  onClick={() => handleCalculateCtc(1200000)}
                  style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                >
                  12 LPA
                </button>
                <button
                  onClick={() => handleCalculateCtc(2400000)}
                  style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                >
                  24 LPA
                </button>
                <button
                  onClick={() => handleCalculateCtc(3600000)}
                  style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                >
                  36 LPA
                </button>
              </div>
            </div>

            {calcBreakdown && (
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Component</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Monthly (₹)</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Annual (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px 12px', fontWeight: '600' }}>Basic Salary (45%)</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.basicMonthly?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.basicAnnual?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px' }}>House Rent Allowance (HRA - 50%)</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.hraMonthly?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.hraAnnual?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px' }}>Special Allowance</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.specialAllowanceMonthly?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.specialAllowanceAnnual?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--bg-app)', fontWeight: '700' }}>
                      <td style={{ padding: '6px 12px' }}>Gross Cash Earnings (A)</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.grossMonthly?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.grossAnnual?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>Employer PF (12% capped)</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.employerPfMonthly?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.employerPfAnnual?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>Gratuity Accrual (4.81%)</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.gratuityMonthly?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.gratuityAnnual?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#e0f2fe', fontWeight: '800', color: '#0369a1' }}>
                      <td style={{ padding: '8px 12px' }}>Total Cost to Company (CTC)</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.monthlyCtc?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.annualCtc?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#ecfdf5', fontWeight: '800', color: '#065f46' }}>
                      <td style={{ padding: '8px 12px' }}>Estimated Take-Home (Net in Hand)</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.netTakeHomeMonthly?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{calcBreakdown.netTakeHomeAnnual?.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
