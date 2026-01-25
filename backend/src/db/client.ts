/**
 * Database Client
 *
 * Supports SQLite for development and PostgreSQL for production.
 * The database driver is selected based on the DATABASE_URL environment variable.
 */

import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';

// SQLite database for development
const sqliteDb = new Database(process.env.DATABASE_URL || 'data/local.db');

// Enable WAL mode for better concurrent access
sqliteDb.pragma('journal_mode = WAL');

// Create the Drizzle client
export const db = drizzleSqlite(sqliteDb, { schema });

// Export schema for type inference
export * from './schema.js';

// Type helper for database transactions
export type DbClient = typeof db;
