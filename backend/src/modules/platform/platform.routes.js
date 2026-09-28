import { Router } from 'express';
import * as platformCtrl from './platform.controller.js';
import { authenticatePlatform, requirePlatformRole } from '../../middleware/platformAuth.middleware.js';
import { authLimiter } from '../../middleware/security.middleware.js';

const router = Router();

// Public Platform Login endpoint with brute-force rate limiter
router.post('/auth/login', authLimiter, platformCtrl.platformLogin);

// Protected Platform Routes
router.use(authenticatePlatform);

router.get('/auth/me', platformCtrl.getPlatformMe);

// Overview Dashboard & MRR/ARR
router.get('/dashboard/overview', platformCtrl.getPlatformOverview);

// SaaS Organizations Management
router.get('/organizations', platformCtrl.listPlatformOrganizations);
router.get('/organizations/:id', platformCtrl.getPlatformOrganizationDetails);
router.patch('/organizations/:id/status', requirePlatformRole('PLATFORM_OWNER', 'PLATFORM_ADMIN', 'SECURITY_ADMIN'), platformCtrl.updateOrganizationStatus);
router.post('/organizations/:id/subscription', requirePlatformRole('PLATFORM_OWNER', 'PLATFORM_ADMIN', 'FINANCE_ADMIN'), platformCtrl.updateOrganizationSubscription);
router.post('/organizations/:id/overrides', requirePlatformRole('PLATFORM_OWNER', 'PLATFORM_ADMIN'), platformCtrl.grantFeatureOverride);

// Subscription Plans & Commercial Pricing
router.get('/subscriptions/plans', platformCtrl.getSubscriptionPlans);
router.put('/subscriptions/plans/:id', requirePlatformRole('PLATFORM_OWNER', 'PLATFORM_ADMIN', 'FINANCE_ADMIN'), platformCtrl.updateSubscriptionPlan);

// Demo Requests Pipeline & 1-Click Workspace Conversion
router.get('/demo-requests', platformCtrl.listDemoRequests);
router.post('/demo-requests/:id/convert', requirePlatformRole('PLATFORM_OWNER', 'PLATFORM_ADMIN'), platformCtrl.convertDemoLeadToOrganization);

// Platform Security Operations Center (SOC)
router.get('/security/soc', requirePlatformRole('PLATFORM_OWNER', 'PLATFORM_ADMIN', 'SECURITY_ADMIN'), platformCtrl.getPlatformSecurityEvents);
router.patch('/security/events/:id', requirePlatformRole('PLATFORM_OWNER', 'PLATFORM_ADMIN', 'SECURITY_ADMIN'), platformCtrl.updateSecurityEventStatus);

// Platform Audit Logs & Infrastructure Health
router.get('/audit-logs', requirePlatformRole('PLATFORM_OWNER', 'PLATFORM_ADMIN', 'READONLY_AUDITOR'), platformCtrl.getPlatformAuditLogs);
router.get('/system-health', requirePlatformRole('PLATFORM_OWNER', 'PLATFORM_ADMIN', 'INFRA_ADMIN'), platformCtrl.getSystemHealth);

export default router;
