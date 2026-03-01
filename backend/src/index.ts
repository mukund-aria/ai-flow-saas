/**
 * ServiceFlow Backend
 *
 * Express server providing:
 * - Chat endpoint with SSE streaming for real-time AI responses
 * - Session management for conversation state
 * - Workflow export/import
 * - Google OAuth authentication
 */

// Side-effect import: loads .env before any other modules evaluate
// (DB client reads DATABASE_URL at import time)
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/index.js';
import { passport, configurePassport, authRoutes, requireAuth } from './auth/index.js';
import { requireSysadmin } from './middleware/sysadmin.js';
import adminRouter from './routes/admin.js';
import publicChatRouter, { publicChatLimiter } from './routes/public-chat.js';
import publicTaskRouter from './routes/public-task.js';
import publicStartRouter from './routes/public-start.js';
import webhooksRouter from './routes/webhooks.js';
import publicEmbedRouter from './routes/public-embed.js';
import publicPortalRouter from './routes/public-portal.js';
import publicSandboxRouter from './routes/public-sandbox.js';
import testSeedRouter from './routes/test-seed.js';
import { initScheduler } from './services/scheduler.js';
import { initFlowScheduler } from './services/flow-scheduler.js';
import { ensureSandboxInfrastructure, startSandboxCleanup } from './services/sandbox.js';

const isProduction = process.env.NODE_ENV === 'production';

// ============================================================================
// Production environment variable validation
// ============================================================================

if (isProduction) {
  const required = ['DATABASE_URL', 'SESSION_SECRET', 'ANTHROPIC_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// Persistent session store: Redis > PostgreSQL > in-memory
let sessionStore: session.Store | undefined;
if (process.env.REDIS_URL) {
  try {
    const { RedisStore } = await import('connect-redis');
    const { Redis } = await import('ioredis');
    const redisClient = new Redis(process.env.REDIS_URL);
    sessionStore = new RedisStore({ client: redisClient });
    console.log('Session store: Redis');
  } catch (err) {
    console.warn('Failed to configure Redis session store:', err);
  }
}
if (!sessionStore && process.env.DATABASE_URL) {
  try {
    const pgSessionModule = await import('connect-pg-simple');
    const pgSession = pgSessionModule.default ?? pgSessionModule;
    const pgModule = await import('pg');
    const Pool = pgModule.default?.Pool ?? pgModule.Pool;
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    });
    sessionStore = new (pgSession(session))({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    });
    console.log('Session store: PostgreSQL');
  } catch (err) {
    console.warn('Failed to configure PostgreSQL session store:', err);
  }
}
if (!sessionStore) {
  console.warn('Session store: in-memory (sessions will be lost on restart)');
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

// URL-encoded body parser (required for SAML POST callbacks)
app.use(express.urlencoded({ extended: true }));

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
// Admin Routes (sysadmin only)
// ============================================================================

if (isProduction) {
  app.use('/api/admin', requireAuth, requireSysadmin, adminRouter);
} else {
  app.use('/api/admin', adminRouter);
}

// ============================================================================
// Test Seed Endpoint (development only)
// ============================================================================

if (!isProduction) {
  app.use('/api/test', testSeedRouter);
}

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
// Static File Serving (uploaded PDFs, etc.)
// ============================================================================

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ============================================================================
// Public Chat API (unauthenticated, rate-limited)
// ============================================================================

app.use('/api/public/chat', publicChatRouter);
app.use('/api/public/task', publicTaskRouter);
app.use('/api/public/start', publicStartRouter);
app.use('/api/webhooks/flows', webhooksRouter);

// Public embed API (embedded flow start pages)
app.use('/api/public/embed', publicEmbedRouter);
app.use('/api/public/portal', publicPortalRouter);
app.use('/api/public/sandbox', publicSandboxRouter);

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
      name: 'ServiceFlow API (Development)',
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

// Initialize flow scheduler (BullMQ + Redis)
initFlowScheduler().catch((err) => {
  console.warn('[FlowScheduler] Failed to start:', err);
});

// Initialize sandbox infrastructure + cleanup
ensureSandboxInfrastructure().catch((err) => {
  console.warn('[Sandbox] Failed to bootstrap:', err);
});
startSandboxCleanup();

app.listen(Number(PORT), '0.0.0.0', () => {
  const authStatus = process.env.GOOGLE_CLIENT_ID ? 'Google OAuth enabled' : 'Auth disabled (dev mode)';
  const modeStr = isProduction ? 'PRODUCTION' : 'DEVELOPMENT';

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           ServiceFlow Backend                              ║
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
