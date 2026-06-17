import { useState, useEffect } from 'react';
import { cn, scoreTone } from '../../lib/utils';

interface ScoreDotsProps {
  score: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function ScoreDots({ score, max = 10, size = 'md' }: ScoreDotsProps) {
  const tone = scoreTone(score);
  const fill = { success: 'bg-success', primary: 'bg-primary', warning: 'bg-warning', danger: 'bg-danger' }[tone];
  const dim = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={cn('rounded-full transition-colors', dim, i < score ? fill : 'bg-border')} />
      ))}
    </div>
  );
}

interface ScoreBarProps {
  score: number;
  max?: number;
  animate?: boolean;
}

export function ScoreBar({ score, max = 10, animate = true }: ScoreBarProps) {
  const tone = scoreTone(score);
  const fill = { success: 'bg-success', primary: 'bg-primary', warning: 'bg-warning', danger: 'bg-danger' }[tone];
  const [w, setW] = useState(animate ? 0 : (score / max) * 100);
  useEffect(() => {
    const t = setTimeout(() => setW((score / max) * 100), 60);
    return () => clearTimeout(t);
  }, [score, max]);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', fill)} style={{ width: `${w}%` }} />
    </div>
  );
}

interface CircularScoreProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}

export function CircularScore({ value, size = 168, stroke = 12, label }: CircularScoreProps) {
  const tone = value >= 80 ? 'success' : value >= 60 ? 'primary' : value >= 40 ? 'warning' : 'danger';
  const color = { success: 'var(--success)', primary: 'var(--primary)', warning: 'var(--warning)', danger: 'var(--danger)' }[tone];
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setDash(circ * (1 - value / 100)), 80);
    return () => clearTimeout(t);
  }, [value, circ]);
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={dash}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[44px] font-semibold leading-none tracking-tight tabular-nums">{value}</div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
