/**
 * Email Whitelist
 *
 * DB-backed email/domain whitelist with 60s cache, falling back to ALLOWED_EMAILS env var.
 * Supports full emails (user@example.com) or domains (@example.com).
 */

import { db } from '../db/client.js';
import { systemConfig } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// ============================================================================
// Cache
// ============================================================================

let cachedList: string[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

// ============================================================================
// Load allowed list from DB, fallback to env var
// ============================================================================

async function loadAllowedList(): Promise<string[]> {
  try {
    const row = await db.query.systemConfig.findFirst({
      where: eq(systemConfig.id, 'global'),
    });

    if (row?.allowedEmails) {
      return row.allowedEmails
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);
    }
  } catch {
    // DB not ready yet (e.g. during migrations) — fall through to env var
  }

  // Fallback to env var
  return (process.env.ALLOWED_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0);
}

// ============================================================================
// Public API
// ============================================================================

export async function isEmailAllowed(email: string): Promise<boolean> {
  const now = Date.now();
  if (!cachedList || now > cacheExpiry) {
    cachedList = await loadAllowedList();
    cacheExpiry = now + CACHE_TTL_MS;
  }

  if (cachedList.length === 0) return true; // No whitelist = all allowed

  const normalizedEmail = email.toLowerCase();
  const domain = normalizedEmail.split('@')[1];

  const allowedDomains = cachedList.filter(e => e.startsWith('@')).map(e => e.slice(1));
  const allowedEmails = cachedList.filter(e => !e.startsWith('@'));

  return allowedEmails.includes(normalizedEmail) || allowedDomains.includes(domain);
}

export function invalidateEmailWhitelistCache(): void {
  cachedList = null;
  cacheExpiry = 0;
}
