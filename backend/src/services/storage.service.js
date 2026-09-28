import { prisma } from '../config/prisma.js';
import crypto from 'crypto';

// Disallowed dangerous file extensions to block malware execution
const DANGEROUS_EXTENSIONS = ['.exe', '.sh', '.bat', '.cmd', '.vbs', '.msi', '.ps1', '.php', '.phtml', '.cgi'];

/**
 * Tenant-Isolated Document Storage Manager
 */
export async function reserveStorage(organizationId, fileSizeBytes) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { storageQuotaMB: true, storageUsedBytes: true },
  });

  if (!org) throw new Error('Organization not found');

  const quotaBytes = org.storageQuotaMB * 1024 * 1024;
  const projectedUsage = org.storageUsedBytes + fileSizeBytes;

  if (projectedUsage > quotaBytes) {
    const quotaGB = (org.storageQuotaMB / 1024).toFixed(1);
    throw new Error(`Storage Quota Exceeded: Your organization storage quota of ${quotaGB} GB has been reached. Please upgrade your storage allocation.`);
  }

  const reservationKey = `res_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minute reservation window

  await prisma.storageReservation.create({
    data: {
      organizationId,
      reservationKey,
      bytesReserved: fileSizeBytes,
      expiresAt,
    },
  });

  return reservationKey;
}

/**
 * Confirm upload and register document in isolated namespace
 */
export async function registerTenantDocument({
  organizationId,
  projectId = null,
  title,
  docType,
  fileName,
  fileSizeBytes,
  mimeType,
  reservationKey = null,
  uploadedBy = null,
}) {
  // Validate file extension
  const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(`.${ext}`)) {
    throw new Error(`Security Violation: File extension .${ext} is prohibited for security reasons.`);
  }

  const documentId = crypto.randomUUID();
  const projectScope = projectId ? `projects/${projectId}/` : '';
  const fileKey = `organizations/${organizationId}/${projectScope}documents/${documentId}_${encodeURIComponent(fileName)}`;

  return await prisma.$transaction(async (tx) => {
    // Release reservation if provided
    if (reservationKey) {
      await tx.storageReservation.deleteMany({
        where: { reservationKey, organizationId },
      });
    }

    // Create Document record
    const doc = await tx.document.create({
      data: {
        id: documentId,
        organizationId,
        projectId,
        title: title || fileName,
        docType: docType || 'OTHER',
        fileKey,
        fileName,
        fileSizeBytes,
        mimeType: mimeType || 'application/octet-stream',
        storageNamespace: `org_${organizationId}`,
        uploadedBy,
        versions: {
          create: {
            versionNumber: 1,
            fileKey,
            fileSizeBytes,
            uploadedBy,
            changeSummary: 'Initial document upload',
          },
        },
      },
    });

    // Update organization storage consumption
    await tx.organization.update({
      where: { id: organizationId },
      data: {
        storageUsedBytes: { increment: fileSizeBytes },
      },
    });

    // Update or create StorageUsage entry
    await tx.storageUsage.upsert({
      where: { organizationId },
      update: {
        totalUsedBytes: { increment: fileSizeBytes },
        documentsCount: { increment: 1 },
        lastCalculatedAt: new Date(),
      },
      create: {
        organizationId,
        totalUsedBytes: fileSizeBytes,
        totalAllocatedBytes: 5368709120,
        documentsCount: 1,
      },
    });

    return doc;
  });
}

/**
 * List documents for an organization with optional project filter
 */
export async function listOrganizationDocuments(organizationId, { projectId = null, docType = null } = {}) {
  const where = {
    organizationId,
    isDeleted: false,
    ...(projectId && { projectId }),
    ...(docType && { docType }),
  };

  return await prisma.document.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      project: { select: { id: true, name: true, projectCode: true } },
      versions: { orderBy: { versionNumber: 'desc' } },
    },
  });
}
