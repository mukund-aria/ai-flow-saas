import { type ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './Header';
import { GripVertical } from 'lucide-react';

interface AppLayoutProps {
  chatPanel: ReactNode;
  workflowPanel: ReactNode;
  onNewChat: () => void;
}

const MIN_CHAT_WIDTH = 320; // Minimum chat panel width in pixels
const MAX_CHAT_WIDTH_PERCENT = 60; // Maximum chat panel width as percentage

export function AppLayout({ chatPanel, workflowPanel, onNewChat }: AppLayoutProps) {
  // Default to ~33% for chat panel
  const [chatWidthPercent, setChatWidthPercent] = useState(33);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;

      // Calculate new width based on mouse position
      const newWidth = e.clientX - containerRect.left;
      const newPercent = (newWidth / containerWidth) * 100;

      // Enforce min/max constraints
      const minPercent = (MIN_CHAT_WIDTH / containerWidth) * 100;
      const clampedPercent = Math.min(
        MAX_CHAT_WIDTH_PERCENT,
        Math.max(minPercent, newPercent)
      );

      setChatWidthPercent(clampedPercent);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global mouse listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onNewChat={onNewChat} />

      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Left Side (1/3 default, resizable) */}
        <div
          className="bg-white flex flex-col shrink-0"
          style={{ width: `${chatWidthPercent}%` }}
        >
          {chatPanel}
        </div>

        {/* Resize Handle */}
        <div
          className={`relative w-1 bg-gray-200 hover:bg-violet-400 cursor-col-resize flex items-center justify-center transition-colors group ${
            isDragging ? 'bg-violet-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div
            className={`absolute w-4 h-10 rounded flex items-center justify-center ${
              isDragging
                ? 'bg-violet-500 text-white'
                : 'bg-gray-200 text-gray-400 group-hover:bg-violet-400 group-hover:text-white'
            } transition-colors`}
          >
            <GripVertical className="w-3 h-3" />
          </div>
        </div>

        {/* Workflow Panel - Right Side (2/3 default) */}
        <div className="flex-1 bg-dotted-grid flex flex-col overflow-hidden min-w-0">
          {workflowPanel}
        </div>
      </div>
    </div>
  );
}
