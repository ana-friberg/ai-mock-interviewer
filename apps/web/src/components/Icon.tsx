import { icons, type LucideProps } from 'lucide-react';
import { createElement } from 'react';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

export function Icon({ name, size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) {
    return <span style={{ display: 'inline-block', width: size, height: size }} aria-hidden="true" />;
  }
  return createElement(LucideIcon, { size, strokeWidth, className, ...props });
}
