/**
 * DDR Text Input
 *
 * A text input (or textarea) that supports Dynamic Data Reference (DDR) token
 * insertion. Displays a {+} button to open the DDR picker popover, and inserts
 * selected tokens at the cursor position. DDR tokens in the value are visually
 * distinguished via a colored overlay preview.
 */

import { useState, useRef, useCallback } from 'react';
import { DDRPicker } from './DDRPicker';
import type { Flow } from '@/types';

interface DDRTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  /** Whether this is a multiline input */
  multiline?: boolean;
  /** The workflow for DDR context */
  workflow: Flow;
  /** Current step index for DDR context */
  currentStepIndex?: number;
  className?: string;
}

export function DDRTextInput({
  value,
  onChange,
  placeholder,
  label,
  multiline = false,
  workflow,
  currentStepIndex,
  className = '',
}: DDRTextInputProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track cursor position for insertion
  const cursorPositionRef = useRef<number | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    // Save cursor position on blur so we can insert at that position later
    if (inputRef.current) {
      cursorPositionRef.current = inputRef.current.selectionStart;
    }
  }, []);

  const handleInsertToken = useCallback(
    (token: string) => {
      const cursorPos = cursorPositionRef.current;

      if (cursorPos !== null && cursorPos >= 0 && cursorPos <= value.length) {
        // Insert at cursor position
        const before = value.slice(0, cursorPos);
        const after = value.slice(cursorPos);
        // Add a space before the token if the previous character isn't whitespace or empty
        const needsSpaceBefore = before.length > 0 && !/\s$/.test(before);
        // Add a space after the token if the next character isn't whitespace or empty
        const needsSpaceAfter = after.length > 0 && !/^\s/.test(after);
        const newValue =
          before +
          (needsSpaceBefore ? ' ' : '') +
          token +
          (needsSpaceAfter ? ' ' : '') +
          after;
        onChange(newValue);

        // Move cursor after the inserted token
        const newCursorPos =
          before.length +
          (needsSpaceBefore ? 1 : 0) +
          token.length +
          (needsSpaceAfter ? 1 : 0);
        cursorPositionRef.current = newCursorPos;

        // Restore focus and set cursor
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        });
      } else {
        // Append to end
        const needsSpace = value.length > 0 && !/\s$/.test(value);
        const newValue = value + (needsSpace ? ' ' : '') + token;
        onChange(newValue);

        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            const endPos = newValue.length;
            inputRef.current.setSelectionRange(endPos, endPos);
          }
        });
      }
    },
    [value, onChange]
  );

  const openPicker = useCallback(() => {
    // Save cursor position before opening picker
    if (inputRef.current) {
      cursorPositionRef.current = inputRef.current.selectionStart;
    }
    setPickerOpen(true);
  }, []);

  const hasTokens = /\{[^}]+\}/.test(value);

  const sharedInputClasses =
    'w-full pr-10 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent' +
    (hasTokens ? ' text-violet-600' : '');

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Input / Textarea */}
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={3}
            className={`${sharedInputClasses} resize-none`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={sharedInputClasses}
          />
        )}

        {/* {+} Button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={openPicker}
          title="Insert dynamic data reference"
          className={`absolute right-2 ${
            multiline ? 'top-2' : 'top-1/2 -translate-y-1/2'
          } w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${
            pickerOpen
              ? 'bg-violet-100 text-violet-700'
              : 'bg-gray-100 text-gray-500 hover:bg-violet-100 hover:text-violet-600'
          }`}
        >
          {'{+}'}
        </button>

        {/* DDR Picker Popover */}
        <div className="relative">
          <DDRPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onInsert={handleInsertToken}
            workflow={workflow}
            currentStepIndex={currentStepIndex}
            anchorRef={triggerRef}
          />
        </div>
      </div>

      {/* Helper hint */}
      {hasTokens && (
        <p className="mt-1 text-xs text-gray-400">
          Contains dynamic references that will resolve at runtime
        </p>
      )}
    </div>
  );
}
