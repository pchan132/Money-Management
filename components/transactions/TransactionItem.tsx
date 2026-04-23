'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { deleteTransaction } from '@/actions/transactions'
import type { TransactionWithCategory } from '@/types'

interface TransactionItemProps {
  transaction: TransactionWithCategory
  showActions?: boolean
}

export default function TransactionItem({
  transaction,
  showActions = true,
}: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const isIncome = transaction.type === 'income'
  const category = transaction.categories

  async function handleDelete() {
    if (!confirm('Delete this transaction? This cannot be undone.')) return
    setIsDeleting(true)
    const result = await deleteTransaction(transaction.id)
    if (result.error) {
      alert(result.error)
      setIsDeleting(false)
    }
    // On success, revalidatePath in the action refreshes the list automatically
  }

  // Derive a display color from the category hex or fallback
  const bgHex = category?.color ?? (isIncome ? '#10b981' : '#ef4444')
  const iconBg = bgHex + '20' // 12% opacity tint

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors',
        isDeleting && 'opacity-40 pointer-events-none'
      )}
    >
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {category?.icon ?? (isIncome ? '💰' : '💸')}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {category?.name ?? (isIncome ? 'Income' : 'Expense')}
        </p>
        {transaction.note && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{transaction.note}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(transaction.created_at)}</p>
      </div>

      {/* Amount */}
      <span
        className={cn(
          'text-sm font-semibold shrink-0',
          isIncome ? 'text-emerald-600' : 'text-red-500'
        )}
      >
        {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
      </span>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <Link
            href={`/transactions/${transaction.id}/edit`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
