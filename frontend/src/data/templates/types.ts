/**
 * Template Gallery Types
 *
 * Shared interfaces for the 93-template gallery organized by 13 categories.
 */

export interface GalleryTemplateStep {
  name: string;
  type: 'FORM' | 'QUESTIONNAIRE' | 'FILE_REQUEST' | 'TODO' | 'APPROVAL' | 'ACKNOWLEDGEMENT' | 'ESIGN' | 'DECISION' | 'PDF_FORM' | 'CUSTOM_ACTION' | 'WEB_APP' | 'MILESTONE' | 'SINGLE_CHOICE_BRANCH';
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
  samplePaths?: Array<{ label: string }>;
}

export interface GalleryTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  complexity: 'Simple' | 'Standard' | 'Complex';
  tags?: string[];
  trigger: string;
  roles: string[];
  steps: GalleryTemplateStep[];
  setupInstructions?: string;
  useCases?: string[];
  requirements?: string[];
  recommendations?: string[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}
