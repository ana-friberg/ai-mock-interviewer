import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from '../Icon';

type SelectOption = string | { value: string; label: string; icon?: string };

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const inputCls = 'w-full h-10 rounded-lg border border-input bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring/40';

export function Select({ options, value, onChange, placeholder = 'Select…', className = '' }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const current = options.find((o) => (typeof o === 'object' ? o.value : o) === value);
  const currentLabel = current ? (typeof current === 'object' ? current.label : current) : null;
  const currentIcon = current && typeof current === 'object' ? current.icon : undefined;

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(inputCls, 'flex items-center justify-between text-left', open && 'ring-2 ring-ring border-ring/40')}
      >
        <span className={cn('flex items-center gap-2', !current && 'text-muted-foreground')}>
          {currentIcon && <Icon name={currentIcon} size={15} className="text-muted-foreground" />}
          {currentLabel ?? placeholder}
        </span>
        <Icon name="ChevronDown" size={16} className={cn('text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1.5 w-full rounded-lg border border-border bg-popover p-1 shadow-pop animate-fade-in">
          {options.map((o) => {
            const v = typeof o === 'object' ? o.value : o;
            const lbl = typeof o === 'object' ? o.label : o;
            const ic = typeof o === 'object' ? o.icon : undefined;
            const sel = v === value;
            return (
              <button
                key={v}
                onClick={() => { onChange(v); setOpen(false); }}
                className={cn('flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-left transition-colors', sel ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted')}
              >
                {ic && <Icon name={ic} size={15} className="opacity-70" />}
                <span className="flex-1">{lbl}</span>
                {sel && <Icon name="Check" size={15} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
