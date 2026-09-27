import rateLimit from 'express-rate-limit';

/**
 * Dedicated rate limiter for Authentication endpoints
 * Protects against credential stuffing, brute force, and dictionary attacks.
 * Only failed requests count towards the limit so legitimate users aren't locked out.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 failed login attempts per IP
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Security Alert: Too many failed login attempts detected. Access is temporarily restricted for 15 minutes to protect account security.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Dedicated rate limiter for Digital Signature PIN verification
 * Prevents automated enumeration of 4-digit PIN codes (0000 - 9999).
 */
export const signaturePinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Security Alert: Too many incorrect digital signature PIN attempts. Digital signing is temporarily locked to prevent unauthorized authorization.',
    code: 'PIN_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Dedicated rate limiter for Public Inquiries & Demo Request forms
 * Prevents spam bots, lead flooding, and resource exhaustion.
 */
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions detected from this network. Please wait a few minutes before submitting again.',
    code: 'FORM_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Sanitize a single string value to prevent XSS, HTML tag injections, and null bytes.
 */
function sanitizeString(val) {
  if (typeof val !== 'string') return val;

  return val
    // Remove null bytes
    .replace(/\0/g, '')
    // Strip malicious script and iframe tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Neutralize dangerous inline javascript / vbscript pseudo-protocols
    .replace(/javascript\s*:/gi, 'blocked-script:')
    .replace(/vbscript\s*:/gi, 'blocked-script:')
    .replace(/data\s*:\s*text\/html/gi, 'blocked-data:')
    // Completely strip malicious inline event handlers (onerror=, onload=, onclick=, etc.)
    .replace(/(\s+)(on\w+)\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .trim();
}

/**
 * Recursively deep sanitize an object or array.
 * Also neutralizes Prototype Pollution payloads (__proto__, constructor, prototype).
 */
export function deepSanitize(target) {
  if (target === null || typeof target !== 'object') {
    return typeof target === 'string' ? sanitizeString(target) : target;
  }

  if (Array.isArray(target)) {
    return target.map((item) => deepSanitize(item));
  }

  const cleanObj = {};
  for (const [key, value] of Object.entries(target)) {
    // Guard against prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    cleanObj[key] = deepSanitize(value);
  }

  return cleanObj;
}

/**
 * Global input sanitization middleware
 * Cleanses req.body, req.query, and req.params before reaching controllers.
 */
export function sanitizeInputs(req, res, next) {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = deepSanitize(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = deepSanitize(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = deepSanitize(req.params);
    }
    next();
  } catch (err) {
    console.error('Security Sanitization Error:', err);
    next();
  }
}

/**
 * Enterprise Security Headers Middleware
 * Augments Helmet with custom defenses.
 */
export function customSecurityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
}
