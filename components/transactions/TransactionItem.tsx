'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { cn, formatCurrency, formatDate, formatTHB } from '@/lib/utils'
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
  const isInvestment = transaction.type === 'investment'
  const category = transaction.categories
  const isUSD = transaction.currency === 'USD'

  async function handleDelete() {
    if (!confirm('Delete this transaction? This cannot be undone.')) return
    setIsDeleting(true)
    const result = await deleteTransaction(transaction.id)
    if (result.error) {
      alert(result.error)
      setIsDeleting(false)
    }
  }

  const bgHex = category?.color ?? (isIncome ? '#10b981' : isInvestment ? '#8b5cf6' : '#ef4444')
  const iconBg = bgHex + '20'

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
        {category?.icon ?? (isIncome ? '💰' : isInvestment ? '📈' : '💸')}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {category?.name ?? (isIncome ? 'Income' : isInvestment ? 'ลงทุน' : 'Expense')}
        </p>
        {transaction.note && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{transaction.note}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(transaction.created_at)}</p>
      </div>

      {/* Amount */}
      <div className="flex flex-col items-end shrink-0">
        <span
          className={cn(
            'text-sm font-semibold',
            isIncome ? 'text-emerald-600' : isInvestment ? 'text-violet-600' : 'text-red-500'
          )}
        >
          {isIncome ? '+' : isInvestment ? '📈' : '−'}{formatCurrency(transaction.amount, transaction.currency)}
        </span>
        {isUSD && (
          <span className="text-xs text-gray-400 mt-0.5">
            ≈ {formatTHB(transaction.amount_thb)}
          </span>
        )}
      </div>

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
