/**
 * Assignee Authentication Middleware
 *
 * Validates Bearer token from assigneeSessions table.
 */

import { Request, Response, NextFunction } from 'express';
import { db, assigneeSessions, contacts } from '../db/index.js';
import { eq, and, gt } from 'drizzle-orm';

declare global {
  namespace Express {
    interface Request {
      assigneeContact?: {
        id: string;
        name: string;
        email: string;
      };
      assigneeOrgId?: string;
      assigneePortalId?: string;
    }
  }
}

export async function assigneeAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization token' } });
    return;
  }

  const token = authHeader.slice(7);

  const session = await db.query.assigneeSessions.findFirst({
    where: and(
      eq(assigneeSessions.token, token),
      gt(assigneeSessions.expiresAt, new Date())
    ),
    with: { contact: true },
  });

  if (!session) {
    res.status(401).json({ success: false, error: { code: 'SESSION_EXPIRED', message: 'Session expired or invalid' } });
    return;
  }

  // Update lastAccessedAt
  await db.update(assigneeSessions)
    .set({ lastAccessedAt: new Date() })
    .where(eq(assigneeSessions.id, session.id));

  const contact = session.contact as any;
  req.assigneeContact = { id: contact.id, name: contact.name, email: contact.email };
  req.assigneeOrgId = session.organizationId;
  req.assigneePortalId = session.portalId;

  next();
}
