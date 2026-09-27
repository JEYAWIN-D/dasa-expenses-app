import { prisma } from '../config/prisma.js';

/**
 * Creates an audit log entry
 * @param {Object} params
 * @param {string} [params.userId]
 * @param {string} [params.userEmail]
 * @param {string} params.module - AUTH, CLIENT, QUOTATION, INVOICE, PAYMENT, EXPENSE, VENDOR, SETTINGS
 * @param {string} params.action - LOGIN, LOGOUT, CREATE, UPDATE, DELETE, SIGN, CONVERT, NEGOTIATE, SETTINGS_CHANGE
 * @param {string} [params.entityId]
 * @param {string} [params.entityType]
 * @param {string} [params.ipAddress]
 * @param {string|Object} [params.details]
 */
export async function logAudit({
  userId = null,
  userEmail = null,
  module,
  action,
  entityId = null,
  entityType = null,
  ipAddress = null,
  details = null,
}) {
  try {
    const detailsString = typeof details === 'object' && details !== null ? JSON.stringify(details) : details;

    await prisma.auditLog.create({
      data: {
        userId,
        userEmail,
        module,
        action,
        entityId,
        entityType,
        ipAddress,
        details: detailsString,
      },
    });
  } catch (error) {
    // Non-blocking log failure
    console.error('Audit log failed:', error.message);
  }
}
