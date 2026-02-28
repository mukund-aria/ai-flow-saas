/**
 * Database Client
 *
 * PostgreSQL via postgres.js driver and Drizzle ORM.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/serviceflow';

// Create postgres.js connection
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create the Drizzle client
export const db = drizzle(client, { schema });

// Export schema for type inference
export * from './schema.js';

// Type helper for database transactions
export type DbClient = typeof db;

// Export raw client for migrations
export { client };
