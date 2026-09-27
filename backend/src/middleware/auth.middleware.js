import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { apiError } from '../utils/response.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiError(res, 'Authentication required. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return apiError(res, 'Token has expired. Please log in again.', 401);
      }
      return apiError(res, 'Invalid authentication token.', 401);
    }

    // Verify user still exists in database and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return apiError(res, 'User account is inactive or not found.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return apiError(res, 'Authentication verification failed.', 500);
  }
}
