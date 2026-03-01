/**
 * Coordinator API Helper
 *
 * Typed fetch wrapper for coordinator API calls.
 * Uses the session cookie from the test seed for authentication.
 */

const API_BASE = 'http://localhost:3001/api';

export class CoordinatorAPI {
  private cookie: string;

  constructor(cookie: string) {
    this.cookie = cookie;
  }

  private async request(method: string, path: string, body?: unknown) {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Cookie: this.cookie,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        `API ${method} ${path} failed (${res.status}): ${JSON.stringify(data)}`
      );
    }
    return data;
  }

  async createTemplate(name: string, definition: unknown) {
    return this.request('POST', '/templates', {
      name,
      definition,
      status: 'ACTIVE',
    });
  }

  async createContact(name: string, email: string) {
    return this.request('POST', '/contacts', { name, email });
  }

  async startFlowRun(
    templateId: string,
    options: {
      roleAssignments?: Record<string, string>;
      isTest?: boolean;
      name?: string;
    }
  ) {
    return this.request('POST', `/templates/${templateId}/flows`, options);
  }

  async completeStep(
    runId: string,
    stepId: string,
    resultData: Record<string, unknown>
  ) {
    return this.request('POST', `/flows/${runId}/steps/${stepId}/complete`, {
      resultData,
    });
  }

  async getFlowRun(runId: string) {
    return this.request('GET', `/flows/${runId}`);
  }
}
