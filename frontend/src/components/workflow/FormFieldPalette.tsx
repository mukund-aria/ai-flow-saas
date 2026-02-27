/**
 * FormFieldPalette
 *
 * Categorized element palette for the Form Builder.
 * Renders form field types from FORM_FIELD_TYPES grouped into collapsible categories.
 */

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ChevronDownCircle,
  Upload,
  ListFilter,
  Calendar,
  Hash,
  Mail,
  Phone,
  DollarSign,
  User,
  MapPin,
  PenTool,
  Heading,
  FileText,
  Image,
  SeparatorHorizontal,
  Minus,
} from 'lucide-react';
import { FORM_FIELD_TYPES } from '@/types';
import type { FormFieldType } from '@/types';

// Icon mapping for form field types
const FIELD_TYPE_ICONS: Record<FormFieldType, React.ElementType> = {
  TEXT_SINGLE_LINE: Type,
  TEXT_MULTI_LINE: AlignLeft,
  SINGLE_SELECT: CircleDot,
  MULTI_SELECT: CheckSquare,
  DROPDOWN: ChevronDownCircle,
  DYNAMIC_DROPDOWN: ListFilter,
  FILE_UPLOAD: Upload,
  DATE: Calendar,
  NUMBER: Hash,
  EMAIL: Mail,
  PHONE: Phone,
  CURRENCY: DollarSign,
  NAME: User,
  ADDRESS: MapPin,
  SIGNATURE: PenTool,
  HEADING: Heading,
  PARAGRAPH: FileText,
  IMAGE: Image,
  PAGE_BREAK: SeparatorHorizontal,
  LINE_SEPARATOR: Minus,
};

const CATEGORY_META: Record<string, { label: string; defaultOpen: boolean }> = {
  basic: { label: 'Basic', defaultOpen: true },
  predefined: { label: 'Predefined', defaultOpen: true },
  layout: { label: 'Layout', defaultOpen: true },
};

interface FormFieldPaletteProps {
  onAddField: (type: FormFieldType) => void;
}

export function FormFieldPalette({ onAddField }: FormFieldPaletteProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  // Group field types by category
  const grouped = FORM_FIELD_TYPES.reduce<Record<string, typeof FORM_FIELD_TYPES>>((acc, ft) => {
    if (!acc[ft.category]) acc[ft.category] = [];
    acc[ft.category].push(ft);
    return acc;
  }, {});

  const categoryOrder = ['basic', 'predefined', 'layout'];

  return (
    <div className="w-[280px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Form Elements</h3>
        <p className="text-xs text-gray-500 mt-0.5">Click to add to form</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {categoryOrder.map((cat) => {
          const items = grouped[cat];
          if (!items) return null;
          const meta = CATEGORY_META[cat] || { label: cat, defaultOpen: true };
          const isCollapsed = collapsedCategories.has(cat);

          return (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="flex items-center gap-1.5 w-full text-left mb-2 group"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {meta.label}
                </span>
              </button>
              {!isCollapsed && (
                <div className="grid grid-cols-2 gap-1.5">
                  {items.map((ft) => {
                    const Icon = FIELD_TYPE_ICONS[ft.value] || Type;
                    return (
                      <button
                        key={ft.value}
                        onClick={() => onAddField(ft.value)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-gray-150 bg-gray-50 hover:bg-violet-50 hover:border-violet-200 text-gray-700 hover:text-violet-700 transition-colors text-left group"
                      >
                        <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-500 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{ft.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
