import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { CompanyProvider } from './contexts/CompanyContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { DashboardLayout } from './components/layout/DashboardLayout.jsx';

// Public Marketing Website Pages
const HomePage = lazy(() => import('./modules/marketing/HomePage.jsx'));
const FeaturesPage = lazy(() => import('./modules/marketing/FeaturesPage.jsx'));
const HowItWorksPage = lazy(() => import('./modules/marketing/HowItWorksPage.jsx'));
const ProductTourPage = lazy(() => import('./modules/marketing/ProductTourPage.jsx'));
const SolutionsPage = lazy(() => import('./modules/marketing/SolutionsPage.jsx'));
const PricingPage = lazy(() => import('./modules/marketing/PricingPage.jsx'));
const RequestDemoPage = lazy(() => import('./modules/marketing/RequestDemoPage.jsx'));
const AboutPage = lazy(() => import('./modules/marketing/AboutPage.jsx'));
const SecurityPage = lazy(() => import('./modules/marketing/SecurityPage.jsx'));
const FaqPage = lazy(() => import('./modules/marketing/FaqPage.jsx'));
const ContactPage = lazy(() => import('./modules/marketing/ContactPage.jsx'));
const StartTrialPage = lazy(() => import('./modules/marketing/StartTrialPage.jsx'));
const PrivacyPage = lazy(() => import('./modules/marketing/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./modules/marketing/TermsPage.jsx'));

// Authentication & App
const LoginPage = lazy(() => import('./modules/auth/LoginPage.jsx'));

// Platform Super-Admin Modules
const PlatformLoginPage = lazy(() => import('./modules/platform/PlatformLoginPage.jsx'));
const PlatformLayout = lazy(() => import('./modules/platform/PlatformLayout.jsx'));
const PlatformDashboardPage = lazy(() => import('./modules/platform/PlatformDashboardPage.jsx'));
const PlatformOrganizationsPage = lazy(() => import('./modules/platform/PlatformOrganizationsPage.jsx'));
const PlatformPlansPage = lazy(() => import('./modules/platform/PlatformPlansPage.jsx'));
const PlatformDemoRequestsPage = lazy(() => import('./modules/platform/PlatformDemoRequestsPage.jsx'));
const PlatformSocPage = lazy(() => import('./modules/platform/PlatformSocPage.jsx'));
const PlatformAuditLogsPage = lazy(() => import('./modules/platform/PlatformAuditLogsPage.jsx'));
const PlatformHealthPage = lazy(() => import('./modules/platform/PlatformHealthPage.jsx'));

// Customer Tenant SaaS Workspace Modules
const TeamManagementPage = lazy(() => import('./modules/organization/TeamManagementPage.jsx'));
const RolesPermissionsPage = lazy(() => import('./modules/organization/RolesPermissionsPage.jsx'));
const SubscriptionBillingPage = lazy(() => import('./modules/organization/SubscriptionBillingPage.jsx'));
const TenantStoragePage = lazy(() => import('./modules/organization/TenantStoragePage.jsx'));
const FinancialJournalsPage = lazy(() => import('./modules/organization/FinancialJournalsPage.jsx'));
const CustomerSecurityPage = lazy(() => import('./modules/organization/CustomerSecurityPage.jsx'));

// In-App Protected Business Modules
const DashboardPage = lazy(() => import('./modules/dashboard/DashboardPage.jsx'));
const ClientsListPage = lazy(() => import('./modules/clients/ClientsListPage.jsx'));
const ClientDetailsPage = lazy(() => import('./modules/clients/ClientDetailsPage.jsx'));
const QuotationsListPage = lazy(() => import('./modules/quotations/QuotationsListPage.jsx'));
const QuotationCreatePage = lazy(() => import('./modules/quotations/QuotationCreatePage.jsx'));
const QuotationDetailsPage = lazy(() => import('./modules/quotations/QuotationDetailsPage.jsx'));
const ProjectsListPage = lazy(() => import('./modules/projects/ProjectsListPage.jsx'));
const ProjectDetailsPage = lazy(() => import('./modules/projects/ProjectDetailsPage.jsx'));
const InvoicesListPage = lazy(() => import('./modules/invoices/InvoicesListPage.jsx'));
const InvoiceCreatePage = lazy(() => import('./modules/invoices/InvoiceCreatePage.jsx'));
const InvoiceDetailsPage = lazy(() => import('./modules/invoices/InvoiceDetailsPage.jsx'));
const PaymentsListPage = lazy(() => import('./modules/payments/PaymentsListPage.jsx'));
const ExpensesListPage = lazy(() => import('./modules/expenses/ExpensesListPage.jsx'));
const CashBankPage = lazy(() => import('./modules/accounts/CashBankPage.jsx'));
const CashflowPage = lazy(() => import('./modules/expenses/CashflowPage.jsx'));
const VendorsListPage = lazy(() => import('./modules/vendors/VendorsListPage.jsx'));
const ReportsPage = lazy(() => import('./modules/reports/ReportsPage.jsx'));
const SettingsPage = lazy(() => import('./modules/settings/SettingsPage.jsx'));
const LeadsListPage = lazy(() => import('./modules/leads/LeadsListPage.jsx'));

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
          <div style={{ width: 24, height: 24, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <CompanyProvider>
              <Suspense
                fallback={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-app)' }}>
                    <div style={{ width: 28, height: 28, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                }
              >
                <Routes>
                  {/* Public Marketing Website Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/product-tour" element={<ProductTourPage />} />
                  <Route path="/solutions" element={<SolutionsPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/request-demo" element={<RequestDemoPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/start-trial" element={<StartTrialPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  {/* Public Authentication Route */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* DASA TECH Platform Super-Admin Routes */}
                  <Route path="/platform-admin/login" element={<PlatformLoginPage />} />
                  <Route path="/platform-admin" element={<PlatformLayout />}>
                    <Route index element={<Navigate to="/platform-admin/dashboard" replace />} />
                    <Route path="dashboard" element={<PlatformDashboardPage />} />
                    <Route path="organizations" element={<PlatformOrganizationsPage />} />
                    <Route path="plans" element={<PlatformPlansPage />} />
                    <Route path="demo-requests" element={<PlatformDemoRequestsPage />} />
                    <Route path="soc" element={<PlatformSocPage />} />
                    <Route path="security" element={<PlatformSocPage />} />
                    <Route path="audit-logs" element={<PlatformAuditLogsPage />} />
                    <Route path="health" element={<PlatformHealthPage />} />
                    <Route path="system-health" element={<PlatformHealthPage />} />
                  </Route>

                  {/* Protected Customer SaaS Organization Workspace Routes */}
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="projects" element={<ProjectsListPage />} />
                    <Route path="projects/:id" element={<ProjectDetailsPage />} />
                    <Route path="quotations" element={<QuotationsListPage />} />
                    <Route path="quotations/new" element={<QuotationCreatePage />} />
                    <Route path="quotations/:id" element={<QuotationDetailsPage />} />
                    <Route path="clients" element={<ClientsListPage />} />
                    <Route path="clients/:id" element={<ClientDetailsPage />} />
                    <Route path="invoices" element={<InvoicesListPage />} />
                    <Route path="payments" element={<PaymentsListPage />} />
                    <Route path="expenses" element={<ExpensesListPage />} />
                    <Route path="cash-bank" element={<CashBankPage />} />
                    <Route path="team" element={<TeamManagementPage />} />
                    <Route path="roles" element={<RolesPermissionsPage />} />
                    <Route path="subscription" element={<SubscriptionBillingPage />} />
                    <Route path="storage" element={<TenantStoragePage />} />
                    <Route path="journals" element={<FinancialJournalsPage />} />
                    <Route path="security" element={<CustomerSecurityPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  <Route
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* SaaS Multi-Tenant Workspace & Governance */}
                    <Route path="/team" element={<TeamManagementPage />} />
                    <Route path="/roles" element={<RolesPermissionsPage />} />
                    <Route path="/subscription" element={<SubscriptionBillingPage />} />
                    <Route path="/storage" element={<TenantStoragePage />} />
                    <Route path="/journals" element={<FinancialJournalsPage />} />
                    <Route path="/security-settings" element={<CustomerSecurityPage />} />

                    {/* Projects & Governance */}
                    <Route path="/projects" element={<ProjectsListPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailsPage />} />

                    {/* Clients */}
                    <Route path="/clients" element={<ClientsListPage />} />
                    <Route path="/clients/:id" element={<ClientDetailsPage />} />

                    {/* Quotations */}
                    <Route path="/quotations" element={<QuotationsListPage />} />
                    <Route path="/quotations/new" element={<QuotationCreatePage />} />
                    <Route path="/quotations/:id" element={<QuotationDetailsPage />} />

                    {/* Invoices */}
                    <Route path="/invoices" element={<InvoicesListPage />} />
                    <Route path="/invoices/new" element={<InvoiceCreatePage />} />
                    <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />

                    {/* Payments & Multi-Method Split Receipts */}
                    <Route path="/payments" element={<PaymentsListPage />} />

                    {/* Finance & Cash / Bank Management */}
                    <Route path="/cash-bank" element={<CashBankPage />} />
                    <Route path="/expenses" element={<ExpensesListPage />} />
                    <Route path="/vendors" element={<VendorsListPage />} />
                    <Route path="/cashflow" element={<CashflowPage />} />

                    {/* Demo Leads & Inquiries Management */}
                    <Route path="/leads" element={<LeadsListPage />} />

                    {/* Reports & Analytics */}
                    <Route path="/reports" element={<ReportsPage />} />

                    {/* Settings & Branding */}
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>

                  {/* Catch-all redirect to Home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </CompanyProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
