import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface Props {
  value: number;
  suffix?: string;
  invertColor?: boolean;
}

export function TrendIndicator({ value, suffix = '%', invertColor = false }: Props) {
  if (value === 0) {
    return (
      <span className="flex items-center gap-1 text-sm text-gray-400">
        <Minus className="w-3.5 h-3.5" />
        <span>0{suffix}</span>
      </span>
    );
  }

  const isPositive = value > 0;
  const isGood = invertColor ? !isPositive : isPositive;

  return (
    <span className={`flex items-center gap-1 text-sm font-medium ${isGood ? 'text-emerald-600' : 'text-red-500'}`}>
      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      <span>{isPositive ? '+' : ''}{value}{suffix}</span>
    </span>
  );
}
