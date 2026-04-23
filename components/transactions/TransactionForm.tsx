'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createTransaction, updateTransaction } from '@/actions/transactions'
import CategorySelect from '@/components/transactions/CategorySelect'
import type { Category, TransactionWithCategory } from '@/types'
import { getTodayInputValue } from '@/lib/utils'

interface TransactionFormProps {
  categories: Category[]
  transaction?: TransactionWithCategory // present when editing
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {pending && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {pending ? 'Saving…' : isEdit ? 'Update transaction' : 'Add transaction'}
    </button>
  )
}

export default function TransactionForm({ categories, transaction }: TransactionFormProps) {
  const isEdit = !!transaction
  const router = useRouter()

  const action = isEdit
    ? updateTransaction.bind(null, transaction!.id)
    : createTransaction

  const [state, formAction] = useActionState(action, null)

  // Default date: existing transaction date or today
  const defaultDate = transaction
    ? new Date(transaction.created_at).toISOString().split('T')[0]
    : getTodayInputValue()

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <div className="grid grid-cols-2 gap-3">
          {(['expense', 'income'] as const).map((t) => (
            <label
              key={t}
              className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 transition-colors"
            >
              <input
                type="radio"
                name="type"
                value={t}
                defaultChecked={transaction ? transaction.type === t : t === 'expense'}
                className="accent-indigo-600"
              />
              <span className="text-sm font-medium capitalize text-gray-700">
                {t === 'income' ? '💰 Income' : '💸 Expense'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1.5">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            $
          </span>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={transaction?.amount}
            placeholder="0.00"
            className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1.5">
          Category <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <CategorySelect
          categories={categories}
          defaultValue={transaction?.category_id}
        />
      </div>

      {/* Date */}
      <div>
        <label htmlFor="created_at" className="block text-sm font-medium text-gray-700 mb-1.5">
          Date
        </label>
        <input
          id="created_at"
          name="created_at"
          type="date"
          required
          defaultValue={defaultDate}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Note */}
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1.5">
          Note <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          defaultValue={transaction?.note ?? ''}
          placeholder="e.g. Grocery shopping at Whole Foods"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <SubmitButton isEdit={isEdit} />
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
