import type { TransactionWithCategory } from '@/types'
import TransactionItem from './TransactionItem'
import EmptyState from '@/components/ui/EmptyState'

interface TransactionListProps {
  transactions: TransactionWithCategory[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions found"
        description="Try adjusting your filters or add a new transaction."
        actionLabel="Add transaction"
        actionHref="/transactions/new"
      />
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} />
      ))}
    </div>
  )
}
