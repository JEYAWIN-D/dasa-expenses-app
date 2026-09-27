import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { logAudit } from '../../utils/audit.service.js';

/**
 * Public company profile for branding on login, marketing, and client viewports.
 * Excludes banking credentials, PAN, GST, and internal administrative signatures.
 */
export async function getPublicCompanyProfile() {
  const company = await prisma.companyProfile.findFirst({
    select: {
      companyName: true,
      tagline: true,
      logoUrl: true,
      sealUrl: true,
      address: true,
      city: true,
      state: true,
      country: true,
      phone: true,
      email: true,
      website: true,
      currency: true,
    },
  });
  return company;
}

export async function getCompanyProfile() {
  const company = await prisma.companyProfile.findFirst({
    include: {
      assets: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!company) {
    return null;
  }

  // Never expose PIN hash to frontend
  const { signaturePinHash, ...safeProfile } = company;
  return safeProfile;
}

export async function getCompanyAssets(type = null) {
  const where = type ? { type } : {};
  return await prisma.companyAsset.findMany({
    where,
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function createCompanyAsset(data, user) {
  const { type, name, url, isPrimary = false } = data;

  return await prisma.$transaction(async (tx) => {
    let company = await tx.companyProfile.findFirst();
    if (!company) {
      const defaultPinHash = await bcrypt.hash('1234', 10);
      company = await tx.companyProfile.create({
        data: {
          companyName: 'My Software Company',
          address: 'Main St',
          city: 'City',
          state: 'State',
          phone: '+91 90000 00000',
          email: 'info@company.com',
          signaturePinHash: defaultPinHash,
        },
      });
    }

    // Check how many existing assets exist for this type
    const existingCount = await tx.companyAsset.count({
      where: { type },
    });

    // If marked isPrimary or it's the very first asset of this type, make it primary
    const shouldBePrimary = isPrimary || existingCount === 0;

    if (shouldBePrimary) {
      // Demote any current primary assets of this type
      await tx.companyAsset.updateMany({
        where: { type, isPrimary: true },
        data: { isPrimary: false },
      });

      // Update primary logoUrl or sealUrl on company profile
      if (type === 'LOGO') {
        await tx.companyProfile.update({
          where: { id: company.id },
          data: { logoUrl: url },
        });
      } else if (type === 'SEAL') {
        await tx.companyProfile.update({
          where: { id: company.id },
          data: { sealUrl: url },
        });
      }
    }

    const asset = await tx.companyAsset.create({
      data: {
        companyId: company.id,
        type,
        name,
        url,
        isPrimary: shouldBePrimary,
      },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'SETTINGS',
      action: 'CREATE',
      details: `Uploaded new ${type.toLowerCase()} asset: "${name}"${shouldBePrimary ? ' (set as Primary)' : ''}`,
    });

    return asset;
  });
}

export async function setPrimaryCompanyAsset(assetId, user) {
  return await prisma.$transaction(async (tx) => {
    const asset = await tx.companyAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    // Demote existing primary assets of this type
    await tx.companyAsset.updateMany({
      where: { type: asset.type, isPrimary: true },
      data: { isPrimary: false },
    });

    // Promote this asset
    const updated = await tx.companyAsset.update({
      where: { id: assetId },
      data: { isPrimary: true },
    });

    // Update CompanyProfile
    const company = await tx.companyProfile.findFirst();
    if (company) {
      if (asset.type === 'LOGO') {
        await tx.companyProfile.update({
          where: { id: company.id },
          data: { logoUrl: asset.url },
        });
      } else if (asset.type === 'SEAL') {
        await tx.companyProfile.update({
          where: { id: company.id },
          data: { sealUrl: asset.url },
        });
      }
    }

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'SETTINGS',
      action: 'UPDATE',
      details: `Set ${asset.type.toLowerCase()} "${asset.name}" as the primary active document asset`,
    });

    return updated;
  });
}

export async function deleteCompanyAsset(assetId, user) {
  return await prisma.$transaction(async (tx) => {
    const asset = await tx.companyAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    await tx.companyAsset.delete({
      where: { id: assetId },
    });

    // If it was primary, pick the latest remaining asset of this type to become primary
    if (asset.isPrimary) {
      const remaining = await tx.companyAsset.findFirst({
        where: { type: asset.type },
        orderBy: { createdAt: 'desc' },
      });

      const company = await tx.companyProfile.findFirst();

      if (remaining) {
        await tx.companyAsset.update({
          where: { id: remaining.id },
          data: { isPrimary: true },
        });
        if (company) {
          if (asset.type === 'LOGO') {
            await tx.companyProfile.update({ where: { id: company.id }, data: { logoUrl: remaining.url } });
          } else if (asset.type === 'SEAL') {
            await tx.companyProfile.update({ where: { id: company.id }, data: { sealUrl: remaining.url } });
          }
        }
      } else {
        if (company) {
          if (asset.type === 'LOGO') {
            await tx.companyProfile.update({ where: { id: company.id }, data: { logoUrl: null } });
          } else if (asset.type === 'SEAL') {
            await tx.companyProfile.update({ where: { id: company.id }, data: { sealUrl: null } });
          }
        }
      }
    }

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'SETTINGS',
      action: 'DELETE',
      details: `Deleted ${asset.type.toLowerCase()} asset "${asset.name}"`,
    });

    return { message: 'Asset deleted successfully' };
  });
}

export async function updateCompanyProfile(data, user) {
  const existing = await prisma.companyProfile.findFirst();

  let updated;
  if (existing) {
    updated = await prisma.companyProfile.update({
      where: { id: existing.id },
      data,
    });
  } else {
    // Default PIN 1234 if newly created
    const defaultPinHash = await bcrypt.hash('1234', 10);
    updated = await prisma.companyProfile.create({
      data: {
        ...data,
        signaturePinHash: defaultPinHash,
      },
    });
  }

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'SETTINGS',
    action: 'SETTINGS_CHANGE',
    details: 'Updated company profile information and banking details',
  });

  const { signaturePinHash, ...safeProfile } = updated;
  return safeProfile;
}

export async function changeSignaturePin({ currentPin, newPin }, user) {
  const company = await prisma.companyProfile.findFirst();
  if (!company) {
    throw new Error('Company profile not initialized');
  }

  const isMatch = await bcrypt.compare(currentPin, company.signaturePinHash);
  if (!isMatch) {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'SETTINGS',
      action: 'PIN_CHANGE_FAILED',
      details: `Security Alert: Failed attempt to change digital signature PIN by ${user.email} (incorrect current PIN)`,
    });
    throw new Error('Current 4-digit PIN is incorrect');
  }

  const newPinHash = await bcrypt.hash(newPin, 10);
  await prisma.companyProfile.update({
    where: { id: company.id },
    data: { signaturePinHash: newPinHash },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'SETTINGS',
    action: 'SETTINGS_CHANGE',
    details: 'Changed 4-digit digital signature authorization PIN',
  });

  return { message: 'Digital signature PIN changed successfully' };
}

export async function getDocumentTemplates() {
  return await prisma.documentTemplate.findMany({
    orderBy: { type: 'asc' },
  });
}

export async function updateDocumentTemplate(id, data, user) {
  const updated = await prisma.documentTemplate.update({
    where: { id },
    data,
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'SETTINGS',
    action: 'SETTINGS_CHANGE',
    details: `Updated ${updated.type} document template styling and terms`,
  });

  return updated;
}

export async function getNumberingConfigs() {
  return await prisma.numberingConfig.findMany({
    orderBy: { documentType: 'asc' },
  });
}

export async function updateNumberingConfig(id, data, user) {
  const updated = await prisma.numberingConfig.update({
    where: { id },
    data,
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'SETTINGS',
    action: 'SETTINGS_CHANGE',
    details: `Updated sequence configuration for ${updated.documentType} (Prefix: ${updated.prefix})`,
  });

  return updated;
}

export async function getAuditLogsList({ page = 1, limit = 20, module = '', action = '' }) {
  const skip = (page - 1) * limit;

  const where = {
    ...(module && { module }),
    ...(action && { action }),
  };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return { logs, total, page, limit };
}

export async function getUsersList() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      phone: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createUser(data, adminUser) {
  // Only SUPER_ADMIN can create another SUPER_ADMIN
  if (data.role === 'SUPER_ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Only a Super Admin can create accounts with the Super Admin role');
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (existing) {
    throw new Error('A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      passwordHash,
      name: data.name,
      role: data.role,
      phone: data.phone,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      phone: true,
      createdAt: true,
    },
  });

  await logAudit({
    userId: adminUser.id,
    userEmail: adminUser.email,
    module: 'SETTINGS',
    action: 'CREATE',
    details: `Added new staff user ${user.name} (${user.email}) with role ${user.role}`,
  });

  return user;
}

export async function updateUser(id, data, adminUser) {
  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('User not found');
  }

  // Privilege Escalation Protection: Only SUPER_ADMIN can assign SUPER_ADMIN role
  if (data.role === 'SUPER_ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Only a Super Admin can assign the Super Admin role');
  }

  // Non-superadmin cannot modify a SUPER_ADMIN account
  if (existing.role === 'SUPER_ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Only a Super Admin can modify a Super Admin account');
  }

  // Prevent user from changing their own role (privilege tampering)
  if (id === adminUser.id && data.role && data.role !== adminUser.role) {
    throw new Error('Security Restriction: You cannot alter your own role');
  }

  // Prevent user from deactivating themselves
  if (id === adminUser.id && data.status && data.status !== 'ACTIVE') {
    throw new Error('Security Restriction: You cannot deactivate your own account');
  }

  // Prevent email duplicate if email changed
  if (data.email && data.email.toLowerCase().trim() !== existing.email.toLowerCase()) {
    const emailConflict = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (emailConflict) {
      throw new Error('Another user with this email already exists');
    }
  }

  const updatePayload = {};
  if (data.name) updatePayload.name = data.name.trim();
  if (data.email) updatePayload.email = data.email.toLowerCase().trim();
  if (data.phone !== undefined) updatePayload.phone = data.phone;
  if (data.role) updatePayload.role = data.role;
  if (data.status) updatePayload.status = data.status;

  // If password provided and not blank, hash and update
  if (data.password && data.password.trim().length >= 6) {
    updatePayload.passwordHash = await bcrypt.hash(data.password.trim(), 10);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updatePayload,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      phone: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logAudit({
    userId: adminUser.id,
    userEmail: adminUser.email,
    module: 'SETTINGS',
    action: 'UPDATE',
    details: `Updated staff user ${updated.name} (${updated.email})${data.password ? ' (password reset)' : ''}`,
  });

  return updated;
}

export async function deleteUser(id, adminUser) {
  if (id === adminUser.id) {
    throw new Error('You cannot delete your own account while logged in');
  }

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('User not found');
  }

  // Non-superadmin cannot delete a Super Admin
  if (existing.role === 'SUPER_ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Only a Super Admin can delete a Super Admin account');
  }

  // Prevent deleting the last Super Admin
  if (existing.role === 'SUPER_ADMIN') {
    const superAdminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' },
    });
    if (superAdminCount <= 1) {
      throw new Error('Cannot delete the only Super Admin account in the system');
    }
  }

  // Unlink any audit logs before deleting so audit trail history is kept and foreign key doesn't block deletion
  await prisma.auditLog.updateMany({
    where: { userId: id },
    data: { userId: null },
  });

  await prisma.user.delete({
    where: { id },
  });

  await logAudit({
    userId: adminUser.id,
    userEmail: adminUser.email,
    module: 'SETTINGS',
    action: 'DELETE',
    details: `Deleted staff user ${existing.name} (${existing.email})`,
  });

  return { id, message: 'User deleted successfully' };
}

