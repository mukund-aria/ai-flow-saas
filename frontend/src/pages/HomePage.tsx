/**
 * Home Page
 *
 * Landing page for the Coordinator Portal.
 * Features the AI prompt bar for quick flow creation.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, FileText, PlayCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QUICK_PROMPTS = [
  'Create a client onboarding workflow',
  'Build an approval process for invoices',
  'Design an employee offboarding flow',
];

export function HomePage() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Navigate to flow builder with the prompt
      navigate('/flows/new', { state: { prompt: prompt.trim() } });
    }
  };

  const handleQuickPrompt = (text: string) => {
    navigate('/flows/new', { state: { prompt: text } });
  };

  return (
    <div className="min-h-full">
      {/* Hero Section with AI Prompt */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-3">
              What process would you like to automate?
            </h1>
            <p className="text-violet-200">
              Describe your workflow and our AI will design it for you
            </p>
          </div>

          {/* AI Prompt Input */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a client onboarding workflow with document collection..."
              className="w-full px-6 py-4 pr-14 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map((text, i) => (
              <button
                key={i}
                onClick={() => handleQuickPrompt(text)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Recent Activity
        </h2>

        {/* Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Flows Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Flow Templates</h3>
                <p className="text-sm text-gray-500">0 templates</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Create your first flow template to get started.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/flows')}
              className="w-full"
            >
              View Templates
            </Button>
          </div>

          {/* Active Runs Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Flows</h3>
                <p className="text-sm text-gray-500">0 active</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              No active flows. Start one from your flow templates.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/runs')}
              className="w-full"
            >
              View Flows
            </Button>
          </div>

          {/* Recent Tasks Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Your Tasks</h3>
                <p className="text-sm text-gray-500">0 pending</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              No tasks assigned to you. Tasks appear when flows run.
            </p>
            <Button variant="outline" size="sm" className="w-full" disabled>
              No Tasks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
