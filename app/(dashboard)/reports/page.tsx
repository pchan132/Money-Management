import type { Metadata } from 'next'
import { getMonthlyReport, getCategoryExpenses } from '@/actions/transactions'
import { getCurrentMonthRange, formatCurrency } from '@/lib/utils'
import MonthlyBarChart from '@/components/reports/MonthlyBarChart'
import CategoryPieChart from '@/components/reports/CategoryPieChart'
import { format } from 'date-fns'

export const metadata: Metadata = { title: 'Reports' }

export default async function ReportsPage() {
  const { startDate, endDate } = getCurrentMonthRange()
  const currentMonth = format(new Date(), 'MMMM yyyy')

  const [{ data: monthlyData }, { data: categoryData }] = await Promise.all([
    getMonthlyReport(),
    getCategoryExpenses(startDate, endDate),
  ])

  const totalIncome = (monthlyData ?? []).reduce((s, m) => s + m.income, 0)
  const totalExpense = (monthlyData ?? []).reduce((s, m) => s + m.expense, 0)
  const currentMonthData = (monthlyData ?? []).at(-1)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Insights into your financial habits</p>
      </div>

      {/* 6-month summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Income (6 mo)',
            value: formatCurrency(totalIncome),
            color: 'text-emerald-600',
          },
          {
            label: 'Total Expenses (6 mo)',
            value: formatCurrency(totalExpense),
            color: 'text-red-500',
          },
          {
            label: 'Net Savings (6 mo)',
            value: formatCurrency(totalIncome - totalExpense),
            color: totalIncome - totalExpense >= 0 ? 'text-indigo-600' : 'text-red-600',
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly trend chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Monthly Trend (6 months)</h2>
        <MonthlyBarChart data={monthlyData ?? []} />
      </div>

      {/* Current month expense breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Expense by Category
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {currentMonth}
          </span>
        </div>
        <CategoryPieChart data={categoryData ?? []} />
      </div>

      {/* Monthly table */}
      {(monthlyData?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Month-by-Month Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Month
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                    Income
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-red-500 uppercase tracking-wide">
                    Expense
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(monthlyData ?? []).map((row) => {
                  const net = row.income - row.expense
                  return (
                    <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{row.month}</td>
                      <td className="px-6 py-3 text-right text-emerald-600">
                        {formatCurrency(row.income)}
                      </td>
                      <td className="px-6 py-3 text-right text-red-500">
                        {formatCurrency(row.expense)}
                      </td>
                      <td
                        className={`px-6 py-3 text-right font-semibold ${
                          net >= 0 ? 'text-indigo-600' : 'text-red-600'
                        }`}
                      >
                        {net >= 0 ? '+' : ''}
                        {formatCurrency(net)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
