import type { ReactNode } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';

interface FeatureTooltipProps {
  content: string | ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  children: ReactNode;
}

export function FeatureTooltip({ content, side = 'top', align = 'center', children }: FeatureTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <span className="inline-flex items-center gap-1">
          {children}
          <Tooltip.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center shrink-0 text-gray-400 hover:text-gray-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
        </span>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            align={align}
            sideOffset={6}
            className="z-[100] max-w-xs rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-gray-100 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          >
            {content}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
