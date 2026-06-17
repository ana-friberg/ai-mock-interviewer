import { cn } from '../../lib/utils';
import { Icon } from '../Icon';

type Option = string | { value: string; label: string; icon?: string };

interface SegmentedProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
}

export function Segmented({ options, value, onChange, size = 'md' }: SegmentedProps) {
  const pad = size === 'sm' ? 'h-8 text-[13px]' : 'h-10 text-sm';
  return (
    <div className="inline-flex w-full items-center gap-1 rounded-lg bg-muted p-1">
      {options.map((opt) => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const ic = typeof opt === 'object' ? opt.icon : undefined;
        const active = v === value;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 font-medium transition-all duration-150', pad,
              active ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {ic && <Icon name={ic} size={15} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
