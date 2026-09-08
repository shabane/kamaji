import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(1)
  const paddedMins = mins.toString().padStart(2, '0')
  const paddedSecs = secs.padStart(4, '0')
  return `${paddedMins}:${paddedSecs}s`
}
