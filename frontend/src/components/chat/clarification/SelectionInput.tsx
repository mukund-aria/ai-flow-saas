import { SelectionCard } from './SelectionCard';
import type { SelectionOption } from '@/types';

interface SelectionInputProps {
  options: SelectionOption[];
  selectedOptionId: string | undefined;
  onSelectOption: (optionId: string) => void;
  conditionalValues: Record<string, string>;
  onConditionalChange: (fieldId: string, value: string) => void;
}

export function SelectionInput({
  options,
  selectedOptionId,
  onSelectOption,
  conditionalValues,
  onConditionalChange,
}: SelectionInputProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <SelectionCard
          key={option.optionId}
          option={option}
          isSelected={selectedOptionId === option.optionId}
          onSelect={() => onSelectOption(option.optionId)}
          conditionalValues={conditionalValues}
          onConditionalChange={onConditionalChange}
        />
      ))}
    </div>
  );
}
