import { Router } from 'express';
import * as orgCtrl from './organization.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireTenant, requirePermission } from '../../middleware/tenant.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Workspace & Company Profile
router.get('/current', orgCtrl.getCurrentOrganization);
router.put('/current', requirePermission('SETTINGS', 'canEdit'), orgCtrl.updateCurrentOrganization);

// Team & User Invitations
router.get('/members', requirePermission('TEAM', 'canView'), orgCtrl.listOrganizationMembers);
router.post('/invitations', requirePermission('TEAM', 'canCreate'), orgCtrl.inviteOrganizationMember);
router.post('/members/direct', requirePermission('TEAM', 'canCreate'), orgCtrl.createDirectOrganizationMember);
router.patch('/members/:id/status', requirePermission('TEAM', 'canEdit'), orgCtrl.updateMemberStatus);
router.patch('/members/:id/dob', requirePermission('TEAM', 'canEdit'), orgCtrl.updateMemberDob);
router.delete('/members/:id', requirePermission('TEAM', 'canDelete'), orgCtrl.removeOrganizationMember);

// Roles & Custom Permissions
router.get('/roles', requirePermission('TEAM', 'canView'), orgCtrl.listOrganizationRoles);
router.post('/roles', requirePermission('TEAM', 'canCreate'), orgCtrl.createCustomRole);
router.put('/roles/:id', requirePermission('TEAM', 'canEdit'), orgCtrl.updateOrganizationRole);
router.delete('/roles/all', requirePermission('TEAM', 'canDelete'), orgCtrl.clearAllOrganizationRoles);
router.delete('/roles/:id', requirePermission('TEAM', 'canDelete'), orgCtrl.deleteOrganizationRole);

// SaaS Subscription & Resource Entitlements
router.get('/subscription', orgCtrl.getOrganizationSubscription);
router.post('/subscription/upgrade', requirePermission('SETTINGS', 'canEdit'), orgCtrl.upgradeOrganizationSubscription);

// Isolated Storage & Documents
router.get('/storage', requirePermission('DOCUMENTS', 'canView'), orgCtrl.getStorageOverview);
router.get('/documents', requirePermission('DOCUMENTS', 'canView'), orgCtrl.listTenantDocuments);
router.post('/documents', requirePermission('DOCUMENTS', 'canCreate'), orgCtrl.uploadTenantDocument);
router.delete('/documents/:id', requirePermission('DOCUMENTS', 'canDelete'), orgCtrl.deleteTenantDocument);

// Financial Journal Ledger (Double-Entry Immutability)
router.get('/journals', requirePermission('TREASURY', 'canView'), orgCtrl.listJournals);
router.post('/journals/reverse/:id', requirePermission('TREASURY', 'canApprove'), orgCtrl.reverseJournal);

// Customer Security Center
router.get('/security', requirePermission('SETTINGS', 'canView'), orgCtrl.getOrganizationSecurity);
router.post('/security/mfa', requirePermission('SETTINGS', 'canEdit'), orgCtrl.toggleOrganizationMfa);

export default router;
