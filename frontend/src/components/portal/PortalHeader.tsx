/**
 * Portal Header
 *
 * Branded header for the assignee portal with logo, name, and contact info.
 */

import { LogOut, Layers } from 'lucide-react';
import { useAssigneeAuth } from '@/contexts/AssigneeAuthContext';

export function PortalHeader() {
  const { contact, portal, logout } = useAssigneeAuth();

  const primaryColor = portal?.branding?.primaryColor || '#7c3aed';
  const logoUrl = portal?.branding?.logoUrl;
  const companyName = portal?.branding?.companyName || portal?.name || 'Portal';

  return (
    <header
      className="px-4 sm:px-6 py-3 flex items-center justify-between bg-white border-b"
      style={{ borderBottomColor: primaryColor }}
    >
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} className="w-8 h-8 object-contain" />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Layers className="w-4 h-4 text-white" />
          </div>
        )}
        <span className="text-sm font-semibold text-gray-900">{companyName}</span>
      </div>

      {contact && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{contact.name}</p>
            <p className="text-xs text-gray-500">{contact.email}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm font-semibold">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
