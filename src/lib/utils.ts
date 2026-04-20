import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export function formatTime(date: Date) {
  return date.toTimeString().split(' ')[0];
}
