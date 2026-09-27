import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';
import apiRouter from './routes.js';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware.js';
import { sanitizeInputs, customSecurityHeaders } from '../middleware/security.middleware.js';

const app = express();

// Disable express identification banner
app.disable('x-powered-by');

// Enterprise Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'http://localhost:*', 'https://*.dasatech.in', 'https://*.supabase.co'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'sameorigin' },
    noSniff: true,
  })
);

// Apply custom security headers (Permissions-Policy, X-XSS-Protection, Referrer-Policy)
app.use(customSecurityHeaders);

// Enterprise CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  ENV.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === origin) return true;
        // Allow any localhost port in development
        if (ENV.NODE_ENV !== 'production' && origin.includes('localhost')) return true;
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: Access from origin ${origin} is denied.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'Content-Range'],
    maxAge: 86400, // 24 hours preflight caching
  })
);

// General API Rate Limiter (300 requests per 15 minutes)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this network. Please try again after 15 minutes.',
    code: 'GENERAL_RATE_LIMIT_EXCEEDED',
  },
});
app.use('/api', generalLimiter);

// Parse JSON request bodies with safety limits against memory exhaustion
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global input sanitization against XSS, prototype pollution, and script injection
app.use(sanitizeInputs);

// Mount Modular API Routes
app.use('/api', apiRouter);

// 404 Route Catch-all
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
