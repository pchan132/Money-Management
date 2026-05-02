import { TrendingUp, TrendingDown, Wallet, LineChart, CreditCard, ShieldCheck } from 'lucide-react'
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
      title: 'Actual Available',
      value: formatCurrency(summary.actualAvailableBalance),
      subtitle: `After ${formatCurrency(summary.unpaidSubscriptions)} unpaid subs`,
      Icon: ShieldCheck,
      iconBg: summary.actualAvailableBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100',
      iconColor: summary.actualAvailableBalance >= 0 ? 'text-emerald-600' : 'text-red-500',
      valueColor: summary.actualAvailableBalance >= 0 ? 'text-emerald-600' : 'text-red-600',
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
    {
      title: 'Subscriptions',
      value: formatCurrency(summary.unpaidSubscriptions),
      subtitle: `${formatCurrency(summary.paidSubscriptions)} paid / ${formatCurrency(summary.totalSubscriptions)} total`,
      Icon: CreditCard,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
      valueColor: summary.unpaidSubscriptions > 0 ? 'text-orange-500' : 'text-emerald-600',
    },
    {
      title: 'ลงทุน',
      value: formatCurrency(summary.monthlyInvestment),
      subtitle: currentMonth,
      Icon: LineChart,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      valueColor: 'text-violet-600',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Actual Available — full width highlight card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600">Actual Available Balance</p>
          <p className={`text-3xl font-bold mt-1 ${summary.actualAvailableBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(summary.actualAvailableBalance)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Balance {formatCurrency(summary.balance)} − Unpaid subs {formatCurrency(summary.unpaidSubscriptions)}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${summary.actualAvailableBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
          <ShieldCheck className={`h-6 w-6 ${summary.actualAvailableBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`} />
        </div>
      </div>

      {/* Other cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.filter(c => c.title !== 'Actual Available').map(({ title, value, subtitle, Icon, iconBg, iconColor, valueColor }) => (
          <div
            key={title}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
              <p className={`text-lg font-bold mt-1 ${valueColor}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
