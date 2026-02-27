import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  MousePointerClick,
  Zap,
  FileText,
  Check,
} from 'lucide-react';
import type { SelectionOption, ConditionalField } from '@/types';

// Icon mapping for selection cards
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MousePointerClick,
  Zap,
  FileText,
};

interface ConditionalFieldInputProps {
  field: ConditionalField;
  value: string;
  onChange: (value: string) => void;
}

function ConditionalFieldInput({ field, value, onChange }: ConditionalFieldInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow for textarea
  useEffect(() => {
    if (field.type === 'textarea' && ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 100)}px`;
    }
  }, [value, field.type]);

  // Stop keyboard events from reaching the parent button
  // This prevents space from triggering button click while typing
  const stopKeyboardPropagation = (e: React.KeyboardEvent) => {
    // Always stop propagation so parent button doesn't get the event
    e.stopPropagation();
  };

  if (field.type === 'textarea') {
    return (
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={stopKeyboardPropagation}
        onKeyUp={stopKeyboardPropagation}
        onKeyPress={stopKeyboardPropagation}
        placeholder={field.placeholder}
        className="min-h-[36px] max-h-[100px] resize-none bg-white text-sm"
        rows={1}
      />
    );
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={stopKeyboardPropagation}
      onKeyUp={stopKeyboardPropagation}
      onKeyPress={stopKeyboardPropagation}
      placeholder={field.placeholder}
      className="bg-white text-sm h-9"
    />
  );
}

interface SelectionCardProps {
  option: SelectionOption;
  isSelected: boolean;
  onSelect: () => void;
  conditionalValues: Record<string, string>;
  onConditionalChange: (fieldId: string, value: string) => void;
}

export function SelectionCard({
  option,
  isSelected,
  onSelect,
  conditionalValues,
  onConditionalChange,
}: SelectionCardProps) {
  const IconComponent = option.icon ? ICON_MAP[option.icon] : null;
  const hasConditionalFields = option.conditionalFields && option.conditionalFields.length > 0;

  // Only trigger selection if not already selected (prevents re-selection from clearing inputs)
  const handleClick = () => {
    if (!isSelected) {
      onSelect();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full text-left rounded-lg border-2 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1',
        isSelected
          ? 'border-violet-500 bg-violet-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      )}
    >
      <div className="px-3 py-2.5">
        <div className="flex items-start gap-2.5">
          {/* Icon */}
          {IconComponent && (
            <div
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5',
                isSelected ? 'bg-violet-100' : 'bg-gray-100'
              )}
            >
              <IconComponent
                className={cn(
                  'w-4 h-4',
                  isSelected ? 'text-violet-600' : 'text-gray-500'
                )}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'font-medium text-base',
                  isSelected ? 'text-violet-900' : 'text-gray-900'
                )}
              >
                {option.label}
              </span>

              {/* Selection indicator */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                  isSelected
                    ? 'border-violet-500 bg-violet-500'
                    : 'border-gray-300'
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>

            {option.description && (
              <p
                className={cn(
                  'text-sm mt-0.5',
                  isSelected ? 'text-violet-700' : 'text-gray-500'
                )}
              >
                {option.description}
              </p>
            )}
          </div>
        </div>

        {/* Conditional fields (animate in when selected) */}
        {hasConditionalFields && (
          <div
            className={cn(
              'overflow-hidden transition-all duration-200',
              isSelected ? 'max-h-[200px] opacity-100 mt-3' : 'max-h-0 opacity-0'
            )}
            // Stop propagation to prevent button activation when typing in inputs
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="border-t border-violet-200 pt-3 space-y-4">
              {option.conditionalFields!.map((field) => (
                <div key={field.fieldId} className="space-y-2">
                  <label className="text-sm font-medium text-violet-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <ConditionalFieldInput
                    field={field}
                    value={conditionalValues[field.fieldId] || ''}
                    onChange={(value) => onConditionalChange(field.fieldId, value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
