/**
 * AI Flow Copilot Backend
 *
 * Express server providing:
 * - Chat endpoint with SSE streaming for real-time AI responses
 * - Session management for conversation state
 * - Workflow export/import
 * - Google OAuth authentication
 */

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/index.js';
import { passport, configurePassport, authRoutes, requireAuth } from './auth/index.js';
import publicChatRouter, { publicChatLimiter } from './routes/public-chat.js';
import publicTaskRouter from './routes/public-task.js';
import { initScheduler } from './services/scheduler.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// ============================================================================
// Production environment variable validation
// ============================================================================

if (isProduction) {
  const required = ['DATABASE_URL', 'SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'ANTHROPIC_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// Redis session store (optional - uses in-memory if REDIS_URL not set)
let sessionStore: session.Store | undefined;
if (process.env.REDIS_URL) {
  try {
    const { RedisStore } = await import('connect-redis');
    const { Redis } = await import('ioredis');
    const redisClient = new Redis(process.env.REDIS_URL);
    sessionStore = new RedisStore({ client: redisClient });
    console.log('Redis session store configured');
  } catch (err) {
    console.warn('Failed to configure Redis session store, using in-memory:', err);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Health check endpoint (before middleware for faster response)
app.get('/ping', (_req, res) => {
  res.send('pong');
});

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Middleware
// ============================================================================

// CORS for frontend (development mode)
if (!isProduction) {
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    credentials: true,
  }));
}

// JSON body parser with size limit
app.use(express.json({ limit: '2mb' }));

// ============================================================================
// Session & Authentication
// ============================================================================

// Trust proxy in production (Railway runs behind a proxy)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Session configuration
app.use(session({
  ...(sessionStore ? { store: sessionStore } : {}),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax', // Must be 'lax' for OAuth redirects to work
  },
}));

// Initialize Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Auth routes (no authentication required)
app.use('/auth', authRoutes);

// ============================================================================
// Health Endpoint (minimal info, no auth required for uptime monitoring)
// ============================================================================

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// Static Files & SPA Fallback (Production)
// MUST be before API routes so frontend is served for /
// ============================================================================

if (isProduction) {
  const publicPath = path.join(__dirname, '..', 'public');

  // Serve frontend static files from 'public' directory
  app.use(express.static(publicPath));

  // SPA fallback - serve index.html for all non-API routes
  // Uses middleware instead of app.get('*') for path-to-regexp v8 compatibility
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path === '/health' || req.path === '/ping') {
      return next();
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// ============================================================================
// Public Chat API (unauthenticated, rate-limited)
// ============================================================================

app.use('/api/public/chat', publicChatRouter);
app.use('/api/public/task', publicTaskRouter);

// ============================================================================
// API Routes (protected in production)
// ============================================================================

if (isProduction) {
  // Auth required for all API routes; org-scope applied per-route in routes/index.ts
  // (organizations route must skip org-scope since it's used before an org exists)
  app.use('/api', requireAuth, apiRoutes);
} else {
  app.use('/api', apiRoutes);

  // Development only: API info at root (in production, frontend serves /)
  app.get('/', (_req, res) => {
    res.json({
      name: 'AI Flow Copilot API (Development)',
      version: '1.0.0',
      frontend: 'http://localhost:5174',
      endpoints: {
        health: 'GET /health',
        chat: 'POST /api/chat',
        sessions: '/api/sessions',
      },
    });
  });
}

// ============================================================================
// Error Handling
// ============================================================================

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================================
// Server Startup
// ============================================================================

// Initialize notification scheduler (BullMQ + Redis)
initScheduler().catch((err) => {
  console.warn('[Scheduler] Failed to start:', err);
});

app.listen(Number(PORT), '0.0.0.0', () => {
  const authStatus = process.env.GOOGLE_CLIENT_ID ? 'Google OAuth enabled' : 'Auth disabled (dev mode)';
  const modeStr = isProduction ? 'PRODUCTION' : 'DEVELOPMENT';

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           AI Flow Copilot Backend                         ║
╠═══════════════════════════════════════════════════════════╣
║  Mode:       ${modeStr.padEnd(43)}║
║  Server:     http://localhost:${PORT}                        ║
║  Health:     http://localhost:${PORT}/health                 ║
║  API:        http://localhost:${PORT}/api                    ║
║  Auth:       ${authStatus.padEnd(43)}║
╠═══════════════════════════════════════════════════════════╣
║  Chat:       POST /api/chat (SSE streaming)               ║
║  Sessions:   /api/sessions                                ║
║  Login:      GET /auth/google                             ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
