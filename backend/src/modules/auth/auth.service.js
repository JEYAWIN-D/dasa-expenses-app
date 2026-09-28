import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';
import { ENV } from '../../config/env.js';
import { logAudit } from '../../utils/audit.service.js';

export async function loginUser(email, password, rememberMe = false, ipAddress = null) {
  const identifier = (email || '').trim();

  // Search by email or user name (case-insensitive)
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: identifier, mode: 'insensitive' } },
        { name: { equals: identifier, mode: 'insensitive' } },
      ],
    },
  });

  if (!user) {
    await logAudit({
      userEmail: identifier,
      module: 'AUTH',
      action: 'LOGIN_FAILED',
      ipAddress,
      details: `Security Alert: Failed login attempt for non-existent account: ${identifier}`,
    });
    throw new Error('Invalid user name / email or password');
  }

  if (user.status !== 'ACTIVE') {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'AUTH',
      action: 'LOGIN_BLOCKED',
      ipAddress,
      details: `Security Alert: Deactivated user ${user.email} attempted login`,
    });
    throw new Error('This account has been deactivated. Please contact administrator.');
  }

  let isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  // If standard bcrypt comparison failed, check if password matches user's DOB format
  if (!isPasswordValid && user.avatar?.startsWith('dob:')) {
    const rawDob = user.avatar.replace('dob:', '').trim(); // e.g. "15-08-1995"
    const cleanInput = (password || '').replace(/[-/._ ]/g, '');
    const cleanDob = rawDob.replace(/[-/._ ]/g, '');
    if (cleanInput && cleanInput === cleanDob) {
      isPasswordValid = true;
    }
  }

  if (!isPasswordValid) {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'AUTH',
      action: 'LOGIN_FAILED',
      ipAddress,
      details: `Security Alert: Failed login attempt for ${user.email}: incorrect password entered`,
    });
    throw new Error('Invalid user name / email or password');
  }

  // Update last login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate JWT token
  const expiresIn = rememberMe ? '7d' : ENV.JWT_EXPIRES_IN;
  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    ENV.JWT_SECRET,
    { expiresIn }
  );

  // Log audit
  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'AUTH',
    action: 'LOGIN',
    ipAddress,
    details: `User ${user.email} successfully logged in`,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    },
  };
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatar: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export async function getSetupStatus() {
  const userCount = await prisma.user.count();
  return {
    isSetupRequired: userCount === 0,
    userCount,
  };
}

export async function setupInitialAdmin(data, ipAddress = null) {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    throw new Error('System is already initialized with an active Administrator account');
  }

  const { name, email, password, phone, signaturePin } = data;

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      phone: phone || null,
      lastLoginAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatar: true,
    },
  });

  // If a digital signature PIN was specified, update company profile signature PIN
  if (signaturePin && signaturePin.length === 4) {
    const pinHash = await bcrypt.hash(signaturePin, 10);
    const company = await prisma.companyProfile.findFirst();
    if (company) {
      await prisma.companyProfile.update({
        where: { id: company.id },
        data: {
          signaturePinHash: pinHash,
          authorizedPerson: name.trim(),
        },
      });
    }
  }

  // Issue JWT token immediately
  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'AUTH',
    action: 'CREATE',
    ipAddress,
    details: `Initial system setup completed. Master Super Admin account created for ${user.name} (${user.email})`,
  });

  return {
    token,
    user,
    message: 'System successfully initialized! Welcome to DASA TECH Finance ERP.',
  };
}
