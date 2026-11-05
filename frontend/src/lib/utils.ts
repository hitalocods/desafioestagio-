import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDateBR(isoDateString: string): string {
  if (!isoDateString) return '';
  const parts = isoDateString.split('-');
  if (parts.length !== 3) return isoDateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

