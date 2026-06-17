import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-accent text-accent-foreground border-transparent',
  success: 'bg-success-soft text-success-ink border-transparent',
  warning: 'bg-warning-soft text-warning-ink border-transparent',
  outline: 'bg-transparent text-foreground border-border',
};

export function Badge({ tone = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium', tones[tone], className)} {...props}>
      {children}
    </span>
  );
}
