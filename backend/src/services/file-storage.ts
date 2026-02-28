/**
 * File Storage Service
 *
 * Abstract file storage with Supabase Storage and local filesystem fallback.
 * If SUPABASE_URL and SUPABASE_SERVICE_KEY are set, uses Supabase Storage.
 * Otherwise, stores files in backend/uploads/ directory.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

const BUCKET_NAME = 'flow-files';
const SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

interface UploadMetadata {
  fileName: string;
  mimeType: string;
  orgId: string;
  flowRunId?: string;
  stepId?: string;
}

interface FileStorageService {
  upload(file: Buffer, metadata: UploadMetadata): Promise<{ storageKey: string }>;
  getSignedUrl(storageKey: string): Promise<string>;
  delete(storageKey: string): Promise<void>;
}

function buildStorageKey(metadata: UploadMetadata): string {
  const parts = [metadata.orgId];
  if (metadata.flowRunId) parts.push(metadata.flowRunId);
  if (metadata.stepId) parts.push(metadata.stepId);
  parts.push(`${randomUUID()}-${metadata.fileName}`);
  return parts.join('/');
}

// ============================================================================
// Supabase Storage Implementation
// ============================================================================

class SupabaseStorageService implements FileStorageService {
  private client: SupabaseClient;

  constructor(url: string, serviceKey: string) {
    this.client = createClient(url, serviceKey);
  }

  async upload(file: Buffer, metadata: UploadMetadata): Promise<{ storageKey: string }> {
    const storageKey = buildStorageKey(metadata);
    const { error } = await this.client.storage
      .from(BUCKET_NAME)
      .upload(storageKey, file, {
        contentType: metadata.mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    return { storageKey };
  }

  async getSignedUrl(storageKey: string): Promise<string> {
    const { data, error } = await this.client.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storageKey, SIGNED_URL_EXPIRY);

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to create signed URL: ${error?.message || 'Unknown error'}`);
    }

    return data.signedUrl;
  }

  async delete(storageKey: string): Promise<void> {
    const { error } = await this.client.storage
      .from(BUCKET_NAME)
      .remove([storageKey]);

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
  }
}

// ============================================================================
// Local Filesystem Fallback
// ============================================================================

class LocalStorageService implements FileStorageService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = UPLOADS_DIR;
  }

  private async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  async upload(file: Buffer, metadata: UploadMetadata): Promise<{ storageKey: string }> {
    const storageKey = buildStorageKey(metadata);
    const filePath = path.join(this.uploadsDir, storageKey);
    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, file);
    return { storageKey };
  }

  async getSignedUrl(storageKey: string): Promise<string> {
    // For local storage, return a relative API path that will be served by the files route
    return `/api/files/local/${encodeURIComponent(storageKey)}`;
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, storageKey);
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

function createStorageService(): FileStorageService {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (supabaseUrl && supabaseKey) {
    console.log('[file-storage] Using Supabase Storage');
    return new SupabaseStorageService(supabaseUrl, supabaseKey);
  }

  console.log('[file-storage] Using local filesystem fallback (uploads/)');
  return new LocalStorageService();
}

export const fileStorage = createStorageService();
export { UPLOADS_DIR };
export type { FileStorageService, UploadMetadata };
