import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'accent' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base = 'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.985]';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover',
  secondary: 'bg-card text-foreground border border-border shadow-soft hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
  subtle: 'bg-muted text-foreground hover:bg-border/60',
  accent: 'bg-accent text-accent-foreground hover:brightness-[0.97]',
  danger: 'bg-card text-danger border border-border hover:bg-danger hover:text-white hover:border-danger',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
  icon: 'h-9 w-9',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
