/**
 * Flows Page
 *
 * Lists all workflow templates with card grid layout matching Moxo Action Hub design.
 * Users can create, edit, and start flow runs from here.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  FileText,
  MoreVertical,
  Play,
  Loader2,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowUpDown,
  Pencil,
  Copy,
  Trash2,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { listTemplates, deleteTemplate, duplicateTemplate, type Template } from '@/lib/api';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { CreateFlowDialog } from '@/components/workflow/CreateFlowDialog';
import { ExecuteFlowDialog } from '@/components/workflow/ExecuteFlowDialog';
import { TemplateGalleryDialog } from '@/components/workflow/TemplateGalleryDialog';

type SortOption = 'lastModified' | 'name' | 'created' | 'steps';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'lastModified', label: 'Last modified' },
  { value: 'name', label: 'Name' },
  { value: 'created', label: 'Date created' },
  { value: 'steps', label: 'Step count' },
];

function formatRelativeDate(dateString?: string): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  return date.toLocaleDateString();
}

function FlowIcon() {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
      <Layers className="w-6 h-6 text-white" strokeWidth={2.5} />
    </div>
  );
}

interface FlowCardProps {
  flow: Template;
  onEdit: () => void;
  onStartRun: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isStarting: boolean;
  onClick?: () => void;
}

function FlowCard({ flow, onEdit, onStartRun, onDelete, onDuplicate, isStarting, onClick }: FlowCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick || onEdit}
    >
      {/* Top row: Badges and menu */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
              flow.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                : flow.status === 'DRAFT'
                ? 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20'
                : 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20'
            }`}
          >
            {flow.status === 'ACTIVE' ? 'Active' : flow.status === 'DRAFT' ? 'Draft' : 'Archived'}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
            V{flow.version || '1'}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit();
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDuplicate();
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  Duplicate
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Icon and name row */}
      <div className="flex items-start gap-4 mb-4">
        <FlowIcon />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate mb-1">
            {flow.name}
          </h3>
          {flow.createdBy && (
            <p className="text-sm text-gray-500">By {flow.createdBy.name}</p>
          )}
        </div>
      </div>

      {/* Description (optional) */}
      {flow.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {flow.description}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4 text-gray-400" />
          <span>{flow.stepCount || 0} steps</span>
        </div>
        <span>Last modified {formatRelativeDate(flow.updatedAt)}</span>
      </div>

      {/* Start Flow Run button */}
      <Button
        size="sm"
        className="w-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        disabled={isStarting || flow.status !== 'ACTIVE'}
        onClick={(e) => {
          e.stopPropagation();
          onStartRun();
        }}
      >
        {isStarting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Start Flow
          </>
        )}
      </Button>
    </div>
  );
}

function EmptyState({ onCreateFlow, onBrowseGallery }: { onCreateFlow: () => void; onBrowseGallery: () => void }) {
  return (
    <div className="text-center py-20 px-6">
      {/* Illustration */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        {/* Background circles */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-50 to-white" />
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-200/50 transform -rotate-6">
            <Layers className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-amber-500" />
        </div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-100" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        Create your first template
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
        Templates are reusable workflow blueprints. Create one with AI or from scratch
        to define the steps your team will follow.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          onClick={onCreateFlow}
          size="lg"
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200/50"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create your first template
        </Button>
        <Button variant="outline" size="lg" className="text-gray-600" onClick={onBrowseGallery}>
          <LayoutGrid className="w-5 h-5 mr-2" />
          Browse Gallery
        </Button>
      </div>
    </div>
  );
}

export function FlowsPage() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('lastModified');
  const [startingFlowId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [executeTemplate, setExecuteTemplate] = useState<Template | null>(null);

  // Handler to open the execute dialog
  const handleStartFlow = (template: Template) => {
    setExecuteTemplate(template);
  };

  // Handler when flow is actually started from the dialog
  const handleFlowStarted = (run: { id: string }) => {
    useOnboardingStore.getState().completeStartFlow();
    setExecuteTemplate(null);
    navigate(`/flows/${run.id}`);
  };

  // Handler to delete (archive) a template
  const handleDeleteFlow = async (flowId: string) => {
    if (!window.confirm('Are you sure you want to archive this template?')) return;
    try {
      await deleteTemplate(flowId);
      setFlows(prev => prev.filter(f => f.id !== flowId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  // Handler to duplicate a template
  const handleDuplicateFlow = async (flowId: string) => {
    try {
      const dup = await duplicateTemplate(flowId);
      setFlows(prev => [dup as unknown as Template, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate template');
    }
  };

  // Handler when a gallery template is imported
  const handleGalleryImported = (templateId: string) => {
    setShowGallery(false);
    navigate(`/templates/${templateId}`);
  };

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setIsLoading(true);
        const data = await listTemplates();
        setFlows(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  // Filter and sort flows
  const filteredFlows = flows
    .filter((flow) => {
      const matchesSearch = flow.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || flow.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'steps':
          return (b.stepCount || 0) - (a.stepCount || 0);
        case 'lastModified':
        default:
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
    });

  const handleCreateFlow = () => setShowCreateDialog(true);
  const handleEditFlow = (flowId: string) => navigate(`/templates/${flowId}`);
  const handleViewDetail = (flowId: string) => navigate(`/templates/${flowId}/detail`);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading templates...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading templates</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <CreateFlowDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      <TemplateGalleryDialog
        open={showGallery}
        onOpenChange={setShowGallery}
        onTemplateImported={handleGalleryImported}
      />
      {executeTemplate && (
        <ExecuteFlowDialog
          open={!!executeTemplate}
          onOpenChange={(open) => { if (!open) setExecuteTemplate(null); }}
          template={executeTemplate}
          onFlowStarted={handleFlowStarted}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <Badge variant="secondary" className="text-sm font-medium">
            {flows.length}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowGallery(true)}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Browse Gallery
          </Button>
          <Button
            onClick={handleCreateFlow}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-200/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <div className="flex items-center">
              <ArrowUpDown className="w-4 h-4 text-gray-400 mr-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-0 pr-8 py-2 bg-transparent border-0 text-sm text-gray-600 focus:outline-none focus:ring-0 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Flow Grid or Empty State */}
      {flows.length === 0 ? (
        <EmptyState onCreateFlow={handleCreateFlow} onBrowseGallery={() => setShowGallery(true)} />
      ) : filteredFlows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlows.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              onEdit={() => handleEditFlow(flow.id)}
              onStartRun={() => handleStartFlow(flow)}
              onDelete={() => handleDeleteFlow(flow.id)}
              onDuplicate={() => handleDuplicateFlow(flow.id)}
              isStarting={startingFlowId === flow.id}
              onClick={() => handleViewDetail(flow.id)}
            />
          ))}
        </div>
      ) : (
        /* No results for filter */
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No templates found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
