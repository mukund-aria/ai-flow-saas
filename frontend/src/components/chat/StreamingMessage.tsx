import { Sparkles } from 'lucide-react';
import React from 'react';

interface StreamingMessageProps {
  content: string;
}

// Simple markdown rendering for bold text
// Uses a unique prefix to avoid key collisions when called multiple times
let streamingMarkdownCount = 0;
function renderMarkdown(text: string): React.ReactNode {
  const prefix = `stream-md-${++streamingMarkdownCount}`;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${prefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Filter out JSON code blocks from streaming content
function getDisplayContent(content: string): string {
  // Remove markdown code blocks (```json...``` or ```...```)
  const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '').trim();

  // If content starts with { it's pure JSON, don't show it
  if (content.trim().startsWith('{')) {
    return '';
  }

  // Remove any trailing partial JSON that's being streamed
  const jsonStart = withoutCodeBlocks.indexOf('```');
  if (jsonStart > 0) {
    return withoutCodeBlocks.substring(0, jsonStart).trim();
  }

  // Also check for raw JSON starting without code block
  const rawJsonStart = withoutCodeBlocks.search(/\{[\s]*"mode"/);
  if (rawJsonStart > 0) {
    return withoutCodeBlocks.substring(0, rawJsonStart).trim();
  }

  return withoutCodeBlocks;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  const displayContent = getDisplayContent(content);

  // Don't render if we've filtered everything out (pure JSON stream)
  if (!displayContent) {
    return null;
  }

  return (
    <div className="flex gap-3 py-4">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
        <Sparkles className="w-4 h-4" />
      </div>

      {/* Streaming content */}
      <div className="flex-1 max-w-[85%]">
        <div className="inline-block px-4 py-2 bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md">
          <p className="text-base whitespace-pre-wrap">
            {renderMarkdown(displayContent)}
            <span className="inline-block w-1 h-5 ml-0.5 bg-violet-400 animate-pulse" />
          </p>
        </div>
      </div>
    </div>
  );
}
