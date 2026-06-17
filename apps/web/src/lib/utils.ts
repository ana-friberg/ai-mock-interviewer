import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function scoreTone(score: number): 'success' | 'primary' | 'warning' | 'danger' {
  if (score >= 8) return 'success';
  if (score >= 6) return 'primary';
  if (score >= 4) return 'warning';
  return 'danger';
}
