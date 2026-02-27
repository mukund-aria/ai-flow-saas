/**
 * Template Lookup Service
 *
 * Provides fuzzy matching to find gallery templates by name and optional category.
 * Used by the AI copilot's lookup_template tool to retrieve full template definitions.
 *
 * Source data: gallery-templates.json (generated from frontend/src/data/templates/)
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
  tags: string[];
  trigger: string;
  roles: string[];
  steps: GalleryTemplateStep[];
  useCases: string[];
  requirements: string[];
  recommendations: string[];
  setupInstructions?: string;
}

// ============================================================================
// Data Loading
// ============================================================================

// Load the gallery templates JSON using require (works with resolveJsonModule)
const galleryTemplates: GalleryTemplate[] = require('./gallery-templates.json');

// ============================================================================
// Lookup Function
// ============================================================================

/**
 * Look up a gallery template by name with fuzzy matching.
 *
 * Matching strategy (in priority order):
 * 1. Exact match (case-insensitive)
 * 2. Name starts with the search term
 * 3. Name contains the search term
 * 4. Search term words all appear in the name
 *
 * @param name - Template name to search for (partial match supported)
 * @param category - Optional category to narrow the search
 * @returns The best matching template, or null if no match found
 */
export function lookupGalleryTemplate(
  name: string,
  category?: string
): GalleryTemplate | null {
  const searchName = name.toLowerCase().trim();
  const searchCategory = category?.toLowerCase().trim();

  // Filter by category first if provided
  let candidates = galleryTemplates;
  if (searchCategory) {
    candidates = candidates.filter(
      (t) => t.category.toLowerCase() === searchCategory
    );
  }

  if (candidates.length === 0) {
    // If category filter yielded nothing, fall back to full list
    candidates = galleryTemplates;
  }

  // Priority 1: Exact match
  const exact = candidates.find(
    (t) => t.name.toLowerCase() === searchName
  );
  if (exact) return exact;

  // Priority 2: Name starts with search term
  const startsWith = candidates.find(
    (t) => t.name.toLowerCase().startsWith(searchName)
  );
  if (startsWith) return startsWith;

  // Priority 3: Name contains search term
  const contains = candidates.filter(
    (t) => t.name.toLowerCase().includes(searchName)
  );
  if (contains.length === 1) return contains[0];
  if (contains.length > 1) {
    // Return the shortest name (most specific match)
    return contains.sort((a, b) => a.name.length - b.name.length)[0];
  }

  // Priority 4: All search words appear in name or description
  const searchWords = searchName.split(/\s+/).filter((w) => w.length > 2);
  if (searchWords.length > 0) {
    const wordMatch = candidates.filter((t) => {
      const text = `${t.name} ${t.description}`.toLowerCase();
      return searchWords.every((word) => text.includes(word));
    });
    if (wordMatch.length > 0) {
      // Prefer matches where words appear in the name
      const nameWordMatch = wordMatch.filter((t) => {
        const nameText = t.name.toLowerCase();
        return searchWords.some((word) => nameText.includes(word));
      });
      if (nameWordMatch.length > 0) {
        return nameWordMatch.sort((a, b) => a.name.length - b.name.length)[0];
      }
      return wordMatch[0];
    }
  }

  // Priority 5: ID-based matching
  const searchId = searchName.replace(/\s+/g, '-');
  const idMatch = candidates.find(
    (t) => t.id.includes(searchId) || searchId.includes(t.id)
  );
  if (idMatch) return idMatch;

  return null;
}

/**
 * List all available template names and categories.
 * Useful for debugging or providing suggestions.
 */
export function listTemplates(): Array<{ name: string; category: string; id: string }> {
  return galleryTemplates.map((t) => ({
    name: t.name,
    category: t.category,
    id: t.id,
  }));
}
