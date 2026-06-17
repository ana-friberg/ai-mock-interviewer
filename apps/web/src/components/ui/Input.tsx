import { type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from '../Icon';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
}

const inputCls = 'w-full h-10 rounded-lg border border-input bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring/40';

export function Input({ icon, className = '', ...p }: InputProps) {
  if (icon) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Icon name={icon} size={16} />
        </span>
        <input className={cn(inputCls, 'pl-9', className)} {...p} />
      </div>
    );
  }
  return <input className={cn(inputCls, className)} {...p} />;
}

export const Textarea = ({ className = '', ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn('w-full rounded-xl border border-input bg-card px-4 py-3.5 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground transition-all duration-150 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring/40 mi-scroll', className)}
    {...p}
  />
);

export const Label = ({ className = '', children, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('text-sm font-medium text-foreground leading-none', className)} {...p}>{children}</label>
);
