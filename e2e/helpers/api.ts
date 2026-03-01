/**
 * Coordinator API Helper
 *
 * Typed fetch wrapper for coordinator API calls.
 * Uses the session cookie from the test seed for authentication.
 */

const API_BASE = 'http://localhost:3002/api';

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

  async startFlow(
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

  async getFlow(flowId: string) {
    return this.request('GET', `/flows/${flowId}`);
  }

  // ---- Accounts ----

  async listAccounts() {
    return this.request('GET', '/accounts');
  }

  async createAccount(name: string, domain?: string) {
    return this.request('POST', '/accounts', { name, domain });
  }

  async getAccount(id: string) {
    return this.request('GET', `/accounts/${id}`);
  }

  async updateAccount(id: string, body: { name?: string; domain?: string }) {
    return this.request('PUT', `/accounts/${id}`, body);
  }

  async deleteAccount(id: string) {
    return this.request('DELETE', `/accounts/${id}`);
  }

  async getAccountContacts(id: string) {
    return this.request('GET', `/accounts/${id}/contacts`);
  }

  async getAccountFlows(id: string) {
    return this.request('GET', `/accounts/${id}/flows`);
  }
}
