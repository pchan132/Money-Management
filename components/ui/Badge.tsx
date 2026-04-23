import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'income' | 'expense' | 'neutral'
  className?: string
}

export default function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variants = {
    income: 'bg-emerald-100 text-emerald-700',
    expense: 'bg-red-100 text-red-700',
    neutral: 'bg-gray-100 text-gray-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
