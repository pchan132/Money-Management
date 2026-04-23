import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import type { DashboardSummary } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface SummaryCardsProps {
  summary: DashboardSummary
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const currentMonth = format(new Date(), 'MMMM yyyy')

  const cards = [
    {
      title: 'Total Balance',
      value: formatCurrency(summary.balance),
      subtitle: 'All time',
      Icon: Wallet,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: summary.balance >= 0 ? 'text-gray-900' : 'text-red-600',
    },
    {
      title: 'Income',
      value: formatCurrency(summary.monthlyIncome),
      subtitle: currentMonth,
      Icon: TrendingUp,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
    },
    {
      title: 'Expenses',
      value: formatCurrency(summary.monthlyExpense),
      subtitle: currentMonth,
      Icon: TrendingDown,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      valueColor: 'text-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ title, value, subtitle, Icon, iconBg, iconColor, valueColor }) => (
        <div
          key={title}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between gap-4"
        >
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
