import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function firstNameFromEmail(email: string | null | undefined): string {
  if (!email) return ''
  const local = email.split('@')[0]?.split(/[._]/)[0] ?? ''
  if (!local || /^\d+$/.test(local)) return ''
  return local[0].toUpperCase() + local.slice(1).toLowerCase()
}
