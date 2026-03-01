/**
 * Condition Editor Component
 *
 * Allows configuring a condition for a multi-choice branch path.
 * Provides a source field (DDR token), operator dropdown, and value field.
 */

import type { BranchCondition } from '@/types';

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'not_empty', label: 'Is not empty' },
  { value: 'in', label: 'Is in list' },
  { value: 'not_in', label: 'Is not in list' },
] as const;

const UNARY_OPERATORS = new Set(['is_empty', 'not_empty']);

interface ConditionEditorProps {
  condition: BranchCondition;
  onChange: (condition: BranchCondition) => void;
}

export function ConditionEditor({ condition, onChange }: ConditionEditorProps) {
  const isUnary = UNARY_OPERATORS.has(condition.operator);

  return (
    <div className="space-y-2">
      {/* Source (DDR token) */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Source (DDR reference)
        </label>
        <input
          type="text"
          value={condition.source}
          onChange={(e) => onChange({ ...condition, source: e.target.value })}
          placeholder="{Kickoff / Country}"
          className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
        />
      </div>

      {/* Operator */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Operator
        </label>
        <select
          value={condition.operator}
          onChange={(e) => {
            const newOp = e.target.value;
            const updated: BranchCondition = { ...condition, operator: newOp };
            // Clear value for unary operators
            if (UNARY_OPERATORS.has(newOp)) {
              delete updated.value;
            }
            onChange(updated);
          }}
          className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white"
        >
          {OPERATORS.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {/* Value (hidden for unary operators) */}
      {!isUnary && (
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Value
          </label>
          <input
            type="text"
            value={condition.value ?? ''}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            placeholder={
              condition.operator === 'in' || condition.operator === 'not_in'
                ? 'Comma-separated values'
                : 'Enter value'
            }
            className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      )}
    </div>
  );
}
