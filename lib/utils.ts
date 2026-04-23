import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy')
}

export function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date()
  return {
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  }
}

export function getMonthRange(
  year: number,
  month: number
): { startDate: string; endDate: string } {
  const date = new Date(year, month - 1, 1)
  return {
    startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export function getLastNMonths(
  n: number
): Array<{ year: number; month: number; label: string }> {
  const months = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const date = subMonths(now, i)
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: format(date, 'MMM yy'),
    })
  }
  return months
}

export function getTodayInputValue(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
