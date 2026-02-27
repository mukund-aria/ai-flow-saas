import { useState, useCallback, useEffect, useRef } from 'react';
import { Minus, Plus, Maximize2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowHeader } from './WorkflowHeader';
import { FlowStartCard } from './FlowStartCard';
import { StepList } from './StepList';
import { StepConnector } from './StepConnector';
import { EmptyWorkflow } from './EmptyWorkflow';
import { useWorkflowStore } from '@/stores/workflowStore';

interface WorkflowPanelProps {
  editMode?: boolean;
  onStartConfigClick?: () => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

export function WorkflowPanel({ editMode = false, onStartConfigClick }: WorkflowPanelProps) {
  const workflow = useWorkflowStore((state) => state.workflow);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(MAX_ZOOM, Math.round((prev + ZOOM_STEP) * 10) / 10));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(MIN_ZOOM, Math.round((prev - ZOOM_STEP) * 10) / 10));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1.0);
  }, []);

  const fitToView = useCallback(() => {
    setZoomLevel(1.0);
    // Scroll to top of the scroll container
    const container = containerRef.current;
    if (container) {
      const scrollEl = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollEl) {
        scrollEl.scrollTop = 0;
        scrollEl.scrollLeft = 0;
      }
    }
  }, []);

  // Get the scroll viewport element
  const getScrollViewport = useCallback((): HTMLElement | null => {
    const container = containerRef.current;
    if (!container) return null;
    return container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
  }, []);

  // Pan handlers — click-drag on canvas background or middle-mouse
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const isMiddleButton = e.button === 1;
    const target = e.target as HTMLElement;
    const isBackground = target.hasAttribute('data-canvas-bg') || target === e.currentTarget;

    if (isMiddleButton || (e.button === 0 && isBackground)) {
      const scrollEl = getScrollViewport();
      if (!scrollEl) return;
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: scrollEl.scrollLeft,
        scrollTop: scrollEl.scrollTop,
      };
    }
  }, [getScrollViewport]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !panStartRef.current) return;
    const scrollEl = getScrollViewport();
    if (!scrollEl) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    scrollEl.scrollLeft = panStartRef.current.scrollLeft - dx;
    scrollEl.scrollTop = panStartRef.current.scrollTop - dy;
  }, [isPanning, getScrollViewport]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  // Ctrl/Cmd + scroll wheel for zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setZoomLevel((prev) => Math.min(MAX_ZOOM, Math.round((prev + ZOOM_STEP) * 10) / 10));
        } else {
          setZoomLevel((prev) => Math.max(MIN_ZOOM, Math.round((prev - ZOOM_STEP) * 10) / 10));
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const zoomPercent = Math.round(zoomLevel * 100);

  const zoomControls = (
    <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-200 px-2 py-1 flex items-center gap-1">
      <button
        onClick={zoomOut}
        disabled={zoomLevel <= MIN_ZOOM}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
        title="Zoom out"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={resetZoom}
        className="px-2 h-7 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors min-w-[3rem] text-center"
        title="Reset to 100%"
      >
        {zoomPercent}%
      </button>
      <button
        onClick={zoomIn}
        disabled={zoomLevel >= MAX_ZOOM}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
        title="Zoom in"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-0.5" />
      <button
        onClick={fitToView}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 transition-colors"
        title="Fit to view"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  if (!workflow) {
    return <EmptyWorkflow editMode={editMode} />;
  }

  // In edit mode, AssigneeManager and header are rendered at the page level
  // so the canvas is just the step content
  if (editMode) {
    return (
      <div
        ref={containerRef}
        className="flex flex-col h-full relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isPanning ? 'grabbing' : undefined }}
      >
        <ScrollArea className="flex-1 bg-dotted-grid min-h-full overflow-x-auto">
          <div
            data-canvas-bg
            className="p-6 flex flex-col items-center min-w-fit"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          >
            {workflow.steps.length === 0 ? (
              <EmptyWorkflow editMode={editMode} />
            ) : (
              <>
                {/* Flow Start Card */}
                <FlowStartCard
                  workflow={workflow}
                  editMode
                  onConfigClick={onStartConfigClick}
                />

                {/* Connector */}
                <StepConnector />

                {/* Step List */}
                <StepList workflow={workflow} editMode={editMode} />
              </>
            )}
          </div>
        </ScrollArea>
        {zoomControls}
      </div>
    );
  }

  // Read-only mode (AI chat preview) -- keep header for context
  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isPanning ? 'grabbing' : undefined }}
    >
      <WorkflowHeader workflow={workflow} editMode={false} />
      <ScrollArea className="flex-1 bg-dotted-grid min-h-full overflow-x-auto">
        <div
          data-canvas-bg
          className="p-4 flex flex-col items-center min-w-fit"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        >
          {/* Flow Start Card */}
          <FlowStartCard workflow={workflow} />

          {/* Connector */}
          <StepConnector />

          {/* Step List */}
          <StepList workflow={workflow} editMode={false} />
        </div>
      </ScrollArea>
      {zoomControls}
    </div>
  );
}
