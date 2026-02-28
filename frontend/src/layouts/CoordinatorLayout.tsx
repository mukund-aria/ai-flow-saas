/**
 * Coordinator Layout
 *
 * Main layout for the Coordinator Portal with sidebar navigation.
 * Used for authenticated users managing flows, runs, contacts, etc.
 */

import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/nav/Sidebar';
import { CommandPalette } from '@/components/CommandPalette';

export function CoordinatorLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette />
    </div>
  );
}
