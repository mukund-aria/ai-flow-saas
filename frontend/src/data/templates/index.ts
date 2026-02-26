/**
 * Template Gallery Data
 *
 * 93 pre-built process templates organized by 13 categories.
 * Each template can be imported into an org as a draft template.
 */

export type { GalleryTemplateStep, GalleryTemplate, TemplateCategory } from './types';
import type { TemplateCategory, GalleryTemplate } from './types';

import { CLIENT_ONBOARDING_TEMPLATES } from './client-onboarding';
import { VENDOR_PARTNER_TEMPLATES } from './vendor-partner';
import { HR_EMPLOYEE_TEMPLATES } from './hr-employee';
import { BANKING_FINANCIAL_TEMPLATES } from './banking-financial';
import { SALES_EVALUATION_TEMPLATES } from './sales-evaluation';
import { ACCOUNT_MANAGEMENT_TEMPLATES } from './account-management';
import { PROFESSIONAL_SERVICES_TEMPLATES } from './professional-services';
import { INSURANCE_CLAIMS_TEMPLATES } from './insurance-claims';
import { HEALTHCARE_TEMPLATES } from './healthcare';
import { LEGAL_GOVERNANCE_TEMPLATES } from './legal-governance';
import { AUDIT_COMPLIANCE_TEMPLATES } from './audit-compliance';
import { CONSTRUCTION_REALESTATE_TEMPLATES } from './construction-realestate';
import { ORDER_SUPPLY_CHAIN_TEMPLATES } from './order-supply-chain';

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
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

export const GALLERY_TEMPLATES: GalleryTemplate[] = [
  ...CLIENT_ONBOARDING_TEMPLATES,
  ...VENDOR_PARTNER_TEMPLATES,
  ...HR_EMPLOYEE_TEMPLATES,
  ...BANKING_FINANCIAL_TEMPLATES,
  ...SALES_EVALUATION_TEMPLATES,
  ...ACCOUNT_MANAGEMENT_TEMPLATES,
  ...PROFESSIONAL_SERVICES_TEMPLATES,
  ...INSURANCE_CLAIMS_TEMPLATES,
  ...HEALTHCARE_TEMPLATES,
  ...LEGAL_GOVERNANCE_TEMPLATES,
  ...AUDIT_COMPLIANCE_TEMPLATES,
  ...CONSTRUCTION_REALESTATE_TEMPLATES,
  ...ORDER_SUPPLY_CHAIN_TEMPLATES,
];
