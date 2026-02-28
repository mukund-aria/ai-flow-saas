/**
 * Template Gallery Data
 *
 * Canonical source of truth for all 93 pre-built workflow templates,
 * organized by 13 categories. Each template contains a complete flow
 * definition with steps, roles, and rich metadata for one-click import.
 *
 * Template data lives in gallery-templates.json (the same data that
 * powers the frontend gallery and the AI copilot's template lookup).
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// ============================================================================
// Types
// ============================================================================

export interface GalleryTemplateStep {
  name: string;
  type: string;
  assigneeRole: string;
  sampleFormFields?: Array<{
    fieldId: string;
    label: string;
    type: string;
    required?: boolean;
    options?: Array<{ label: string; value: string }>;
  }>;
  sampleDocumentRef?: string;
  sampleDescription?: string;
  samplePaths?: Array<{ label: string; steps?: GalleryTemplateStep[] }>;
  skipSequentialOrder?: boolean;
  destinationLabel?: string;
  targetDestinationLabel?: string;
}

export interface GalleryTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  complexity: string;
  tags?: string[];
  trigger: string;
  roles: string[];
  steps: GalleryTemplateStep[];
  setupInstructions?: string;
  useCases?: string[];
  requirements?: string[];
  recommendations?: string[];
}

export interface GalleryCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// ============================================================================
// Categories
// ============================================================================

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: 'client-onboarding', name: 'Client Onboarding', description: 'Client intake, setup, and onboarding workflows', icon: 'UserPlus' },
  { id: 'vendor-partner', name: 'Vendor & Partner Management', description: 'Vendor onboarding, security assessments, and partner enablement', icon: 'Handshake' },
  { id: 'hr-employee', name: 'HR & Employee Lifecycle', description: 'Hiring, onboarding, transfers, and offboarding', icon: 'Users' },
  { id: 'banking-financial', name: 'Banking & Financial Services', description: 'KYC, account opening, loan processing, and financial compliance', icon: 'Landmark' },
  { id: 'sales-evaluation', name: 'Sales & Evaluation', description: 'RFP responses, deal approvals, and sales processes', icon: 'TrendingUp' },
  { id: 'account-management', name: 'Account Management', description: 'QBR, service requests, and client relationship management', icon: 'UserCheck' },
  { id: 'professional-services', name: 'Professional Services & Delivery', description: 'Engagement management, proposals, and service delivery', icon: 'Briefcase' },
  { id: 'insurance-claims', name: 'Insurance & Claims', description: 'Policy applications, claims processing, and underwriting', icon: 'ShieldCheck' },
  { id: 'healthcare', name: 'Healthcare', description: 'Patient coordination, credentialing, and clinical workflows', icon: 'Heart' },
  { id: 'legal-governance', name: 'Legal & Corporate Governance', description: 'Contract execution, board resolutions, and corporate governance', icon: 'Scale' },
  { id: 'audit-compliance', name: 'Audit & Compliance', description: 'Audit coordination, evidence collection, and regulatory compliance', icon: 'Shield' },
  { id: 'construction-realestate', name: 'Construction & Real Estate', description: 'Permits, inspections, property transactions, and construction', icon: 'Building2' },
  { id: 'order-supply-chain', name: 'Order & Supply Chain', description: 'Order management, procurement, and supply chain coordination', icon: 'Truck' },
];

// ============================================================================
// Templates (loaded from canonical JSON)
// ============================================================================

export const GALLERY_TEMPLATES: GalleryTemplate[] = require('./gallery-templates.json');
