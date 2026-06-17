import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...p }: DivProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-card', className)} {...p}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: DivProps) {
  return <div className={cn('px-6 pt-6 pb-4', className)}>{children}</div>;
}

export function CardTitle({ className = '', children }: DivProps) {
  return <h3 className={cn('text-lg font-semibold tracking-tight', className)}>{children}</h3>;
}

export function CardDescription({ className = '', children }: DivProps) {
  return <p className={cn('text-sm text-muted-foreground mt-1', className)}>{children}</p>;
}

export function CardContent({ className = '', children }: DivProps) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>;
}

export function CardFooter({ className = '', children }: DivProps) {
  return <div className={cn('px-6 py-4 border-t border-border flex items-center', className)}>{children}</div>;
}
