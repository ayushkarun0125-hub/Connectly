import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** shadcn-style class merge — use in TypeScript UI components */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
