/**
 * Need Help Button
 *
 * Fixed-position floating button that opens the chat panel.
 */

import { HelpCircle } from 'lucide-react';
import { useFlowChatStore } from '@/stores/flowChatStore';

export function NeedHelpButton() {
  const { isOpen, toggle } = useFlowChatStore();

  if (isOpen) return null;

  return (
    <button
      onClick={toggle}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl hover:border-violet-300 transition-all text-sm font-medium text-gray-700 hover:text-violet-700"
    >
      <HelpCircle className="w-4 h-4" />
      Need Help?
    </button>
  );
}
