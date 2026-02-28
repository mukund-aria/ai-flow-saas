/**
 * Template Gallery Dialog
 *
 * Full-screen dialog for browsing and importing pre-built templates.
 * All template data is fetched from the backend /api/gallery endpoint
 * (single source of truth). Organized by categories with preview
 * and one-click import as draft.
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  ChevronRight,
  ChevronDown,
  Loader2,
  Shield,
  UserPlus,
  Briefcase,
  Heart,
  Building2,
  Building,
  Truck,
  Users,
  Scale,
  ShieldCheck,
  FileText,
  CheckSquare,
  FileUp,
  ThumbsUp,
  Eye,
  PenTool,
  ListChecks,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Handshake,
  TrendingUp,
  UserCheck,
  Landmark,
  Flag,
  GitBranch,
  IterationCw,
  IterationCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types (mirroring backend GalleryTemplate shape)
// ============================================================================

interface GalleryTemplateStep {
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

interface GalleryTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  complexity?: string;
  tags?: string[];
  trigger?: string;
  roles: string[];
  steps: GalleryTemplateStep[];
  setupInstructions?: string;
  useCases?: string[];
  requirements?: string[];
  recommendations?: string[];
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// ============================================================================
// Icon maps
// ============================================================================

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Shield,
  UserPlus,
  Search: Search,
  Scale,
  Briefcase,
  ShieldCheck,
  Heart,
  Building2,
  Building,
  Truck,
  Users,
  Handshake,
  TrendingUp,
  UserCheck,
  Landmark,
};

const STEP_TYPE_ICONS: Record<string, React.ElementType> = {
  FORM: FileText,
  QUESTIONNAIRE: ListChecks,
  FILE_REQUEST: FileUp,
  TODO: CheckSquare,
  APPROVAL: ThumbsUp,
  ACKNOWLEDGEMENT: Eye,
  ESIGN: PenTool,
  DECISION: ArrowRight,
  PDF_FORM: FileText,
  CUSTOM_ACTION: CheckSquare,
  WEB_APP: LayoutGrid,
  MILESTONE: Flag,
  SINGLE_CHOICE_BRANCH: GitBranch,
  PARALLEL_BRANCH: GitBranch,
  GOTO: IterationCw,
  GOTO_DESTINATION: IterationCcw,
};

const STEP_TYPE_COLORS: Record<string, string> = {
  FORM: 'bg-green-100 text-green-600',
  QUESTIONNAIRE: 'bg-green-100 text-green-600',
  FILE_REQUEST: 'bg-blue-100 text-blue-600',
  TODO: 'bg-gray-100 text-gray-600',
  APPROVAL: 'bg-amber-100 text-amber-600',
  ACKNOWLEDGEMENT: 'bg-pink-100 text-pink-600',
  ESIGN: 'bg-violet-100 text-violet-600',
  DECISION: 'bg-orange-100 text-orange-600',
  PDF_FORM: 'bg-teal-100 text-teal-600',
  CUSTOM_ACTION: 'bg-indigo-100 text-indigo-600',
  WEB_APP: 'bg-cyan-100 text-cyan-600',
  SINGLE_CHOICE_BRANCH: 'bg-amber-100 text-amber-600',
  PARALLEL_BRANCH: 'bg-green-100 text-green-600',
  GOTO: 'bg-amber-100 text-amber-600',
  GOTO_DESTINATION: 'bg-amber-100 text-amber-600',
};

// ============================================================================
// Component
// ============================================================================

interface TemplateGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateImported?: (templateId: string) => void;
}

export function TemplateGalleryDialog({ open, onOpenChange, onTemplateImported }: TemplateGalleryDialogProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<GalleryTemplate | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showStepDetails, setShowStepDetails] = useState(false);

  // Gallery data fetched from backend
  const [allTemplates, setAllTemplates] = useState<GalleryTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch gallery data from backend when dialog opens
  useEffect(() => {
    if (!open) return;
    if (allTemplates.length > 0) return; // Already loaded

    const fetchGallery = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const API_BASE = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${API_BASE}/gallery`, {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch gallery: ${res.status}`);
        }
        const json = await res.json();
        if (json.success && json.data) {
          setAllTemplates(json.data.templates || []);
          setCategories(json.data.categories || []);
        } else {
          throw new Error('Invalid gallery response');
        }
      } catch (err) {
        console.error('Failed to load template gallery:', err);
        setLoadError('Failed to load templates. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, [open, allTemplates.length]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let templates = allTemplates;

    if (selectedCategory) {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }

    return templates;
  }, [allTemplates, selectedCategory, searchQuery]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const source = searchQuery.trim()
      ? allTemplates.filter(t => {
          const q = searchQuery.toLowerCase();
          return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
        })
      : allTemplates;

    source.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [allTemplates, searchQuery]);

  const handleImport = async (template: GalleryTemplate) => {
    setIsImporting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${API_BASE}/gallery/${template.id}/import`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onOpenChange(false);
        if (onTemplateImported) {
          onTemplateImported(data.data.id);
        } else {
          navigate(`/templates/${data.data.id}`);
        }
        return;
      }
      throw new Error(data.error?.message || 'Import failed');
    } catch (err) {
      console.error('Failed to import template:', err);
    } finally {
      setIsImporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />

      {/* Dialog */}
      <div className="relative flex flex-col w-full h-full bg-white m-4 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Template Gallery</h2>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Loading...' : `${allTemplates.length} pre-built templates across ${categories.length} categories`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading / Error states */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Loading templates...</p>
            </div>
          </div>
        )}

        {loadError && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 font-medium mb-2">{loadError}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setAllTemplates([]);
                  setLoadError(null);
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !loadError && (
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Categories */}
            <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50 shrink-0">
              <div className="p-3">
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedTemplate(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-white text-violet-700 shadow-sm border border-violet-200'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">All Templates</span>
                  <span className="text-xs text-gray-400">{searchQuery ? filteredTemplates.length : allTemplates.length}</span>
                </button>

                <div className="mt-2 space-y-0.5">
                  {categories.map(cat => {
                    const IconComponent = CATEGORY_ICONS[cat.icon] || FileText;
                    const count = categoryCounts[cat.id] || 0;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); setSelectedTemplate(null); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-white text-violet-700 shadow-sm border border-violet-200'
                            : 'text-gray-600 hover:bg-white hover:text-gray-900'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 shrink-0" />
                        <span className="flex-1 text-left truncate">{cat.name}</span>
                        <span className="text-xs text-gray-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Center: Template Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Category Header */}
              {selectedCategory && (
                <div className="mb-6">
                  {(() => {
                    const cat = categories.find(c => c.id === selectedCategory);
                    if (!cat) return null;
                    const IconComponent = CATEGORY_ICONS[cat.icon] || FileText;
                    return (
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                          <p className="text-sm text-gray-500">{cat.description}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {filteredTemplates.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No templates found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term or category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => { setSelectedTemplate(template); setShowStepDetails(false); }}
                      className={`text-left bg-white rounded-xl border p-4 hover:shadow-md transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-violet-400 ring-2 ring-violet-100 shadow-md'
                          : 'border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{template.name}</h4>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <FileText className="w-3 h-3" />
                          {template.steps.filter(s => s.type !== 'MILESTONE').length} steps
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Users className="w-3 h-3" />
                          {template.roles.length} roles
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Template Detail Modal */}
            {selectedTemplate && (
              <>
                <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setSelectedTemplate(null)} />
                <div className="fixed inset-6 z-[60] flex">
                  <div className="relative flex flex-col w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Top Header Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                          <LayoutGrid className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-gray-900 truncate">{selectedTemplate.name}</h2>
                          <p className="text-sm text-gray-400">{selectedTemplate.steps.filter(s => s.type !== 'MILESTONE').length} steps</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-10 text-sm gap-2 px-5"
                          onClick={() => handleImport(selectedTemplate)}
                          disabled={isImporting}
                        >
                          {isImporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ArrowRight className="w-4 h-4" />
                          )}
                          Use this flow
                        </Button>
                        <button
                          onClick={() => setSelectedTemplate(null)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                    {/* Left: Step Flow Visualization */}
                    <div className="w-72 border-r border-gray-100 bg-gray-50/50 overflow-y-auto shrink-0">
                      <div className="p-5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Flow Preview</p>
                        <div className="space-y-0">
                          {selectedTemplate.steps.map((step, i) => {
                            if (step.type === 'MILESTONE') {
                              return (
                                <div key={i} className="py-1.5">
                                  <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 rounded-md">
                                    <Flag className="w-3 h-3 text-gray-500 shrink-0" />
                                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider truncate">{step.name}</span>
                                  </div>
                                </div>
                              );
                            }
                            // GoTo Destination -- compact gold circle marker
                            if (step.type === 'GOTO_DESTINATION') {
                              const nextNonMilestone2 = selectedTemplate.steps.slice(i + 1).find(s => s.type !== 'MILESTONE');
                              const isLast2 = !nextNonMilestone2;
                              return (
                                <div key={i}>
                                  <div className="flex items-start gap-2.5">
                                    <div className="flex flex-col items-center">
                                      <div className="w-7 h-7 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
                                        {step.destinationLabel || '?'}
                                      </div>
                                      {!isLast2 && (
                                        <div className="w-px h-6 bg-gray-200 my-0.5" />
                                      )}
                                    </div>
                                    <div className="min-w-0 pt-1 pb-2">
                                      <p className="text-xs font-medium text-amber-700 leading-tight truncate">{step.name}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            const StepIcon = STEP_TYPE_ICONS[step.type] || FileText;
                            const nextNonMilestone = selectedTemplate.steps.slice(i + 1).find(s => s.type !== 'MILESTONE');
                            const isLast = !nextNonMilestone && !selectedTemplate.steps.slice(i + 1).some(s => s.type !== 'MILESTONE');
                            const hasPaths = (step.type === 'PARALLEL_BRANCH' || step.type === 'SINGLE_CHOICE_BRANCH') && step.samplePaths && step.samplePaths.length > 0;
                            return (
                              <div key={i}>
                                <div className="flex items-start gap-2.5">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${STEP_TYPE_COLORS[step.type] || 'bg-gray-100 text-gray-600'}`}>
                                      <StepIcon className="w-3.5 h-3.5" />
                                    </div>
                                    {(!isLast || hasPaths) && (
                                      <div className="w-px h-6 bg-gray-200 my-0.5" />
                                    )}
                                  </div>
                                  <div className="min-w-0 pt-1 pb-2">
                                    <p className="text-xs font-medium text-gray-700 leading-tight truncate">{step.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{step.assigneeRole}</p>
                                  </div>
                                </div>
                                {hasPaths && step.samplePaths && (
                                  <div className="ml-3 pl-3 border-l-2 border-gray-200 space-y-1 mb-2">
                                    {step.samplePaths.map((p, pi) => {
                                      const hasGoto = p.steps?.some(s => s.type === 'GOTO');
                                      return (
                                      <div key={pi} className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${step.type === 'PARALLEL_BRANCH' ? 'bg-green-400' : 'bg-amber-400'}`} />
                                        <span className="text-[10px] text-gray-500 truncate">
                                          {p.label}{hasGoto ? '' : p.steps && p.steps.length > 0 ? ` (${p.steps.length})` : ''}
                                        </span>
                                        {hasGoto && (
                                          <span className="text-[10px] text-amber-600 font-medium">&#8617;</span>
                                        )}
                                      </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Center: Main Content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="max-w-2xl mx-auto px-8 py-8">
                        {/* Description */}
                        <div className="mb-8">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                          <p className="text-sm text-gray-700 leading-relaxed">{selectedTemplate.description}</p>
                        </div>

                        {/* Use Cases */}
                        {selectedTemplate.useCases && selectedTemplate.useCases.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Use cases</h3>
                            <ul className="space-y-2">
                              {selectedTemplate.useCases.map((useCase, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                                  <span className="text-violet-400 mt-0.5 shrink-0">&#8226;</span>
                                  {useCase}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Assignee Roles */}
                        <div className="mb-8">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Assignee roles</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedTemplate.roles.map(role => (
                              <span key={role} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* How it works */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">How it works</h3>
                            <button
                              onClick={() => setShowStepDetails(!showStepDetails)}
                              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors"
                            >
                              {showStepDetails ? 'Hide' : 'Show'} details
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStepDetails ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                          <div className={showStepDetails ? 'space-y-4' : 'space-y-1.5'}>
                            {(() => {
                              let stepNum = 0;
                              return selectedTemplate.steps.map((step, i) => {
                                if (step.type === 'MILESTONE') {
                                  return (
                                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg mt-3 first:mt-0">
                                      <Flag className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{step.name}</span>
                                    </div>
                                  );
                                }
                                stepNum++;
                                const StepIcon = STEP_TYPE_ICONS[step.type] || FileText;
                                return (
                                  <div key={i} className="flex items-start gap-3">
                                    <span className="text-sm font-semibold text-gray-300 mt-0.5 w-5 text-right shrink-0">{stepNum}</span>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${STEP_TYPE_COLORS[step.type] || 'bg-gray-100 text-gray-600'}`}>
                                      <StepIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900">{step.name}</p>
                                      {showStepDetails && step.sampleDescription && (
                                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.sampleDescription}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>

                        {/* Requirements */}
                        {selectedTemplate.requirements && selectedTemplate.requirements.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">How do you set this up?</h3>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <ul className="space-y-2">
                                {selectedTemplate.requirements.map((req, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-sm text-amber-800">
                                    <CheckSquare className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Setup Instructions */}
                        {selectedTemplate.setupInstructions && (
                          <div className="mb-8">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Step-by-step instructions</h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm text-blue-800 leading-relaxed">{selectedTemplate.setupInstructions}</p>
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {selectedTemplate.recommendations && selectedTemplate.recommendations.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recommendations</h3>
                            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                              <ul className="space-y-2">
                                {selectedTemplate.recommendations.map((rec, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-sm text-violet-800">
                                    <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-violet-500" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Metadata Sidebar */}
                    <div className="w-64 border-l border-gray-100 bg-white overflow-y-auto shrink-0">
                      <div className="p-5 space-y-6">
                        {/* When to start */}
                        {selectedTemplate.trigger && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1.5">When to start</p>
                            <p className="text-sm text-gray-700">{selectedTemplate.trigger}</p>
                          </div>
                        )}

                        {/* Category */}
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Category</p>
                          {(() => {
                            const cat = categories.find(c => c.id === selectedTemplate.category);
                            if (!cat) return null;
                            const CatIcon = CATEGORY_ICONS[cat.icon] || FileText;
                            return (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg">
                                <CatIcon className="w-3 h-3" />
                                {cat.name}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Tags */}
                        {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedTemplate.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Step types used */}
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Step types</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from(new Set(selectedTemplate.steps.filter(s => s.type !== 'MILESTONE').map(s => s.type))).map(type => {
                              const StepIcon = STEP_TYPE_ICONS[type] || FileText;
                              return (
                                <span key={type} className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded ${STEP_TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'}`}>
                                  <StepIcon className="w-2.5 h-2.5" />
                                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
