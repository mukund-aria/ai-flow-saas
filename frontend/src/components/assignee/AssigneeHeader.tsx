/**
 * Assignee Header
 *
 * Top bar showing flow name, run name, chat toggle, and assignee avatar.
 * Supports white-label branding (logo, colors, company name).
 */

import { Layers, MessageSquare } from 'lucide-react';
import { getInitials } from './utils';

interface BrandingConfig {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  companyName?: string;
}

interface AssigneeHeaderProps {
  runName: string;
  flowName: string;
  contactName: string;
  onToggleChat: () => void;
  branding?: BrandingConfig;
}

export function AssigneeHeader({ runName, flowName, contactName, onToggleChat, branding }: AssigneeHeaderProps) {
  const primaryColor = branding?.primaryColor || '#7c3aed';
  const accentColor = branding?.accentColor || '#4f46e5';
  const displayName = branding?.companyName || runName;

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.companyName || 'Logo'}
              className="w-8 h-8 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex items-center gap-2">
            {branding?.companyName ? (
              <>
                <span className="text-sm font-semibold text-gray-900">{branding.companyName}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">{runName}</span>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold text-gray-900">{runName}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">{flowName}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleChat}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
            style={{ '--tw-text-opacity': 1 } as React.CSSProperties}
            title="Chat & updates"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
            {getInitials(contactName)}
          </div>
        </div>
      </div>
    </header>
  );
}
