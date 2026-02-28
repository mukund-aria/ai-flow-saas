/**
 * Email Whitelist
 *
 * Shared email/domain whitelist check used by both Google OAuth and OTP auth.
 * Parses ALLOWED_EMAILS env var (comma-separated).
 * Supports full emails (user@example.com) or domains (@example.com).
 */

const ALLOWED_LIST = (process.env.ALLOWED_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(e => e.length > 0);

const ALLOWED_DOMAINS = ALLOWED_LIST.filter(e => e.startsWith('@')).map(e => e.slice(1));
const ALLOWED_EMAILS = ALLOWED_LIST.filter(e => !e.startsWith('@'));

export function isEmailAllowed(email: string): boolean {
  if (ALLOWED_LIST.length === 0) return true; // No whitelist = all allowed
  const domain = email.split('@')[1];
  return ALLOWED_EMAILS.includes(email.toLowerCase()) || ALLOWED_DOMAINS.includes(domain);
}
