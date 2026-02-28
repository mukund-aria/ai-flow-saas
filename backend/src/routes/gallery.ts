/**
 * Template Gallery API Routes
 *
 * Browse and import curated workflow templates from the gallery.
 * GET endpoints are public-ish (no org scope needed for browsing).
 * POST /import requires auth + org scope.
 */

import { Router } from 'express';
import { db, flows, users, organizations } from '../db/index.js';
import { asyncHandler } from '../middleware/async-handler.js';
import {
  GALLERY_TEMPLATES,
  GALLERY_CATEGORIES,
  type GalleryTemplate,
  type GalleryTemplateStep,
} from '../data/template-gallery.js';

const router = Router();

// ============================================================================
// GET /api/gallery - List all gallery templates (full data for frontend)
// ============================================================================

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { q, category } = _req.query as { q?: string; category?: string };

    let templates = GALLERY_TEMPLATES;

    // Filter by category
    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    // Filter by search query (name + description + tags)
    if (q && q.trim()) {
      const query = q.toLowerCase().trim();
      templates = templates.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          (t.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Return full template data so the frontend can render everything
    // (categories, steps, roles, useCases, etc.)
    res.json({
      success: true,
      data: {
        categories: GALLERY_CATEGORIES,
        templates,
      },
    });
  })
);

// ============================================================================
// GET /api/gallery/:id - Get single gallery template detail
// ============================================================================

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;

    const template = GALLERY_TEMPLATES.find(t => t.id === id);

    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Gallery template not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: template,
    });
  })
);

// ============================================================================
// Helpers for import conversion
// ============================================================================

function generateStepId(index: number): string {
  return `step-${crypto.randomUUID().slice(0, 8)}-${index}`;
}

function generatePlaceholderId(index: number): string {
  return `role-${crypto.randomUUID().slice(0, 8)}-${index}`;
}

/**
 * Convert a single gallery step into a step config object for the flow definition.
 */
function convertStepConfig(step: GalleryTemplateStep): Record<string, unknown> {
  const config: Record<string, unknown> = {
    name: step.name,
    assignee: step.assigneeRole,
    ...(step.sampleDescription ? { description: step.sampleDescription } : {}),
  };

  if (step.skipSequentialOrder) {
    config.skipSequentialOrder = true;
  }

  if (step.type === 'FORM') {
    config.formFields = step.sampleFormFields || [];
  } else if (step.type === 'QUESTIONNAIRE') {
    config.questionnaire = { questions: [] };
  } else if (step.type === 'ESIGN') {
    config.esign = {
      signingOrder: 'SEQUENTIAL',
      ...(step.sampleDocumentRef ? { documentName: step.sampleDocumentRef } : {}),
    };
  } else if (step.type === 'PDF_FORM') {
    config.pdfForm = {
      fields: [],
      ...(step.sampleDocumentRef ? { documentDescription: step.sampleDocumentRef } : {}),
    };
  } else if (step.type === 'FILE_REQUEST') {
    config.fileRequest = { maxFiles: 5 };
  } else if (step.type === 'SINGLE_CHOICE_BRANCH' || step.type === 'PARALLEL_BRANCH') {
    config.paths = (step.samplePaths || [{ label: 'Path A' }, { label: 'Path B' }]).map((p, pi) => ({
      pathId: `path-${crypto.randomUUID().slice(0, 8)}-${pi}`,
      label: p.label,
      steps: (p.steps || []).map((nested, ni) => ({
        stepId: `step-${crypto.randomUUID().slice(0, 8)}-nested-${pi}-${ni}`,
        type: nested.type === 'MILESTONE' ? 'TODO' : nested.type,
        order: ni,
        config: convertStepConfig(nested),
      })),
    }));
  } else if (step.type === 'DECISION') {
    config.outcomes = [
      { outcomeId: `outcome-${crypto.randomUUID().slice(0, 8)}-0`, label: 'Approved', steps: [] },
      { outcomeId: `outcome-${crypto.randomUUID().slice(0, 8)}-1`, label: 'Rejected', steps: [] },
    ];
  }

  return config;
}

/**
 * Convert a rich gallery template into a full flow definition for saving as DRAFT.
 */
function galleryTemplateToDefinition(template: GalleryTemplate) {
  // Create assignee placeholders from roles
  const assigneePlaceholders = template.roles.map((roleName, i) => ({
    placeholderId: generatePlaceholderId(i),
    roleName,
    resolutionType: 'CONTACT_TBD' as const,
  }));

  // Track milestones and real steps separately
  const milestones: Array<{ milestoneId: string; name: string; afterStepId: string }> = [];
  const stepEntries: Array<{ stepId: string; isMilestone: boolean; original: GalleryTemplateStep }> = [];
  let stepOrder = 0;

  for (const entry of template.steps) {
    if (entry.type === 'MILESTONE') {
      const lastRealStep = stepEntries.filter(e => !e.isMilestone).at(-1);
      milestones.push({
        milestoneId: `milestone-${crypto.randomUUID().slice(0, 8)}`,
        name: entry.name,
        afterStepId: lastRealStep ? lastRealStep.stepId : '',
      });
      stepEntries.push({ stepId: '', isMilestone: true, original: entry });
    } else {
      const stepId = generateStepId(stepOrder);
      stepEntries.push({ stepId, isMilestone: false, original: entry });
      stepOrder++;
    }
  }

  // Build a map from destinationLabel -> stepId for GOTO linking
  const destinationLabelToStepId = new Map<string, string>();
  for (const entry of stepEntries) {
    if (!entry.isMilestone && entry.original.type === 'GOTO_DESTINATION' && entry.original.destinationLabel) {
      destinationLabelToStepId.set(entry.original.destinationLabel, entry.stepId);
    }
  }

  // Convert non-milestone steps
  let order = 0;
  const steps = stepEntries
    .filter(e => !e.isMilestone)
    .map(({ stepId, original: step }) => {
      const config = convertStepConfig(step);

      // Resolve GOTO_DESTINATION name from label
      if (step.type === 'GOTO_DESTINATION' && step.destinationLabel) {
        config.name = `Point ${step.destinationLabel}`;
      }

      // Resolve GOTO target from label
      if (step.type === 'GOTO' && step.targetDestinationLabel) {
        const targetId = destinationLabelToStepId.get(step.targetDestinationLabel);
        if (targetId) {
          config.targetStepId = targetId;
        }
      }

      return {
        stepId,
        type: step.type,
        order: order++,
        config,
      };
    });

  // Also resolve GOTO targets inside nested branch/path steps
  for (const step of steps) {
    const paths = (step.config.paths || step.config.outcomes) as
      | Array<{ steps?: Array<{ config: Record<string, unknown>; type: string }> }>
      | undefined;
    if (paths) {
      for (const path of paths) {
        for (const nested of path.steps || []) {
          if (nested.type === 'GOTO') {
            const originalStep = template.steps.find(s => s.name === step.config.name);
            if (originalStep?.samplePaths) {
              for (const origPath of originalStep.samplePaths) {
                for (const origNested of origPath.steps || []) {
                  if (origNested.type === 'GOTO' && origNested.targetDestinationLabel) {
                    const targetId = destinationLabelToStepId.get(origNested.targetDestinationLabel);
                    if (targetId) {
                      nested.config.targetStepId = targetId;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    steps,
    milestones,
    assigneePlaceholders,
    kickoff: {},
    parameters: [],
    sourceGalleryId: template.id,
    ...(template.setupInstructions ? { setupInstructions: template.setupInstructions } : {}),
  };
}

// ============================================================================
// POST /api/gallery/:id/import - Import gallery template as a DRAFT flow
// ============================================================================

router.post(
  '/:id/import',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;

    const template = GALLERY_TEMPLATES.find(t => t.id === id);

    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Gallery template not found' },
      });
      return;
    }

    // Resolve user and org context
    let userId = req.user?.id;
    let orgId = req.organizationId;

    // Dev fallback
    if (!userId || !orgId) {
      let defaultOrg = await db.query.organizations.findFirst();
      if (!defaultOrg) {
        const [newOrg] = await db
          .insert(organizations)
          .values({ name: 'Default Organization', slug: 'default' })
          .returning();
        defaultOrg = newOrg;
      }
      let defaultUser = await db.query.users.findFirst();
      if (!defaultUser) {
        const [newUser] = await db
          .insert(users)
          .values({ email: 'dev@localhost', name: 'Developer', activeOrganizationId: defaultOrg.id })
          .returning();
        defaultUser = newUser;
      }
      userId = defaultUser.id;
      orgId = defaultOrg.id;
    }

    // Build a full flow definition from the rich gallery template
    const definition = galleryTemplateToDefinition(template);

    // Create the flow as DRAFT
    const [newFlow] = await db
      .insert(flows)
      .values({
        name: template.name,
        description: template.description,
        definition: definition as Record<string, unknown>,
        status: 'DRAFT',
        createdById: userId,
        organizationId: orgId,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newFlow,
    });
  })
);

export default router;
