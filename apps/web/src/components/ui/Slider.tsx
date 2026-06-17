import { cn } from '../../lib/utils';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}

export function Slider({ min, max, value, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="relative">
        <div
          className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-primary pointer-events-none"
          style={{ width: `calc(${pct}%)` }}
        />
        <input
          type="range"
          className="mi-range relative"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ background: 'transparent' }}
        />
        <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full bg-muted -z-10" />
      </div>
      <div className="mt-3 flex justify-between px-0.5">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn('font-mono text-[11px] tabular-nums transition-colors', n === value ? 'text-primary font-medium' : 'text-muted-foreground/70 hover:text-foreground')}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
