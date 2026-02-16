import { useNavigate } from 'react-router-dom';
import { Sparkles, PenLine, X } from 'lucide-react';

interface CreateFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFlowDialog({ open, onOpenChange }: CreateFlowDialogProps) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleSelect = (mode: 'ai' | 'manual') => {
    onOpenChange(false);
    navigate(`/templates/new?mode=${mode}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Create New Template
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose how you'd like to build your workflow
        </p>

        {/* Mode Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* AI Mode */}
          <button
            onClick={() => handleSelect('ai')}
            className="group text-left p-5 rounded-xl border-2 border-gray-200 hover:border-violet-400 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">AI Mode</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Describe your workflow and AI builds it
            </p>
          </button>

          {/* Manual Mode */}
          <button
            onClick={() => handleSelect('manual')}
            className="group text-left p-5 rounded-xl border-2 border-gray-200 hover:border-violet-400 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PenLine className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Manual Mode</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Add steps one by one with a visual editor
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
