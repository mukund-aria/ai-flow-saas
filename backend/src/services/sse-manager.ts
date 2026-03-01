/**
 * SSE Manager
 *
 * Manages Server-Sent Events connections for real-time updates.
 * Each connection is scoped to an organization so events only reach
 * users within the same org.
 */

import type { Response } from 'express';

export interface SSEEvent {
  type: 'run.updated' | 'step.completed' | 'step.failed' | 'run.started' | 'run.completed' | 'attention.changed';
  data: Record<string, unknown>;
}

class SSEManager {
  private connections: Map<string, Set<Response>> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Register a client connection for an organization.
   */
  addClient(orgId: string, res: Response): void {
    if (!this.connections.has(orgId)) {
      this.connections.set(orgId, new Set());
    }
    this.connections.get(orgId)!.add(res);

    // Start heartbeat if this is the first connection
    if (!this.heartbeatInterval) {
      this.startHeartbeat();
    }
  }

  /**
   * Remove a client connection when it disconnects.
   */
  removeClient(orgId: string, res: Response): void {
    const clients = this.connections.get(orgId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        this.connections.delete(orgId);
      }
    }

    // Stop heartbeat if no connections remain
    if (this.connections.size === 0 && this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Emit an SSE event to all clients in an organization.
   */
  emit(orgId: string, event: SSEEvent): void {
    const clients = this.connections.get(orgId);
    if (!clients || clients.size === 0) return;

    const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;

    for (const res of clients) {
      try {
        res.write(payload);
      } catch {
        // Client disconnected — will be cleaned up on 'close' event
      }
    }
  }

  /**
   * Send heartbeat comments every 30 seconds to keep connections alive.
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [, clients] of this.connections) {
        for (const res of clients) {
          try {
            res.write(':heartbeat\n\n');
          } catch {
            // Client disconnected
          }
        }
      }
    }, 30_000);
  }
}

export const sseManager = new SSEManager();
