import type { Metadata } from 'next'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { getDashboardSummary, getTransactions, getMonthlyReport } from '@/actions/transactions'
import SummaryCards from '@/components/dashboard/SummaryCards'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import MonthlyChart from '@/components/dashboard/MonthlyChart'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const [summaryResult, transactionsResult, chartResult] = await Promise.all([
    getDashboardSummary(),
    getTransactions(),
    getMonthlyReport(),
  ])

  const summary = summaryResult.data ?? {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
  }

  const recentTransactions = (transactionsResult.data ?? []).slice(0, 8)
  const chartData = chartResult.data ?? []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your financial overview</p>
        </div>
        <Link
          href="/transactions/new"
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add Transaction
        </Link>
      </div>

      {/* Summary cards */}
      <SummaryCards summary={summary} />

      {/* Monthly chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Income vs Expenses (6 months)</h2>
        <MonthlyChart data={chartData} />
      </div>

      {/* Recent transactions */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  )
}
