import { useState, useEffect, useRef } from 'react';
import { HelpCircle, X, ExternalLink, BookOpen } from 'lucide-react';

interface HelpWidgetProps {
  articles?: { title: string; href: string }[];
}

const DEFAULT_ARTICLES = [
  { title: 'Getting Started with Flow Builder', href: '#' },
  { title: 'Understanding Step Types', href: '#' },
  { title: 'Managing Assignees', href: '#' },
  { title: 'Publishing & Running Flows', href: '#' },
];

export function HelpWidget({ articles = DEFAULT_ARTICLES }: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50">
      {/* Expanded Popover */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 rounded-xl shadow-2xl border border-gray-200 bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Support Center</h3>
              <p className="text-xs text-gray-500 mt-0.5">Find answers and get help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CTA Card */}
          <div className="mx-4 my-3">
            <div className="bg-violet-600 rounded-lg text-white p-4">
              <p className="text-sm font-semibold">Need help?</p>
              <p className="text-xs text-violet-200 mt-1">
                Browse our guides or reach out to our team for assistance with building and managing your flows.
              </p>
            </div>
          </div>

          {/* Articles List */}
          <div className="px-4 pb-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Popular Articles
            </p>
            <ul className="space-y-1">
              {articles.map((article, index) => (
                <li key={index}>
                  <a
                    href={article.href}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-violet-700 transition-colors group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-500 shrink-0" />
                    <span className="flex-1 truncate">{article.title}</span>
                    <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-violet-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100">
            <a
              href="#"
              className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              View all articles &rarr;
            </a>
          </div>
        </div>
      )}

      {/* Collapsed Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full bg-gray-800 text-white shadow-lg flex items-center justify-center hover:bg-gray-700 hover:shadow-xl transition-all ${
          isOpen ? 'ring-2 ring-violet-400 ring-offset-2' : ''
        }`}
        title="Help & Support"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    </div>
  );
}
