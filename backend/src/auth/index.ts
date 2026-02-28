/**
 * Auth Module Exports
 */

export { default as passport, configurePassport, type AuthUser } from './passport.js';
export { default as authRoutes } from './routes.js';
export { requireAuth, optionalAuth } from './requireAuth.js';
export { isEmailAllowed } from './email-whitelist.js';
