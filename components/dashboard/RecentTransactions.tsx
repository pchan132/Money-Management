import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { TransactionWithCategory } from '@/types'
import TransactionItem from '@/components/transactions/TransactionItem'
import EmptyState from '@/components/ui/EmptyState'

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Start by adding your first income or expense."
          actionLabel="Add transaction"
          actionHref="/transactions/new"
        />
      ) : (
        <div className="divide-y divide-gray-50">
          {transactions.map((t) => (
            <TransactionItem key={t.id} transaction={t} />
          ))}
        </div>
      )}
    </div>
  )
}
