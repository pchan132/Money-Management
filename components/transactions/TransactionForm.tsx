'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createTransaction, updateTransaction } from '@/actions/transactions'
import CategorySelect from '@/components/transactions/CategorySelect'
import type { Category, Currency, TransactionWithCategory } from '@/types'
import { getTodayInputValue, formatCurrency, formatTHB } from '@/lib/utils'

const CURRENCIES: { value: Currency; label: string; flag: string }[] = [
  { value: 'THB', label: 'THB – Thai Baht', flag: '🇹🇭' },
  { value: 'USD', label: 'USD – US Dollar', flag: '🇺🇸' },
]

const DEFAULT_EXCHANGE_RATE = 35.5

interface TransactionFormProps {
  categories: Category[]
  transaction?: TransactionWithCategory
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

  const [currency, setCurrency] = useState<Currency>(
    (transaction?.currency as Currency) ?? 'THB'
  )
  const [amount, setAmount] = useState<string>(
    transaction?.amount !== undefined ? String(transaction.amount) : ''
  )
  const [exchangeRate, setExchangeRate] = useState<string>(
    transaction?.exchange_rate ? String(transaction.exchange_rate) : String(DEFAULT_EXCHANGE_RATE)
  )
  const [isFetchingRate, setIsFetchingRate] = useState(false)

  const isUSD = currency === 'USD'
  const amountNum = parseFloat(amount)
  const rateNum = parseFloat(exchangeRate)
  const convertedTHB =
    isUSD && !isNaN(amountNum) && !isNaN(rateNum) && amountNum > 0 && rateNum > 0
      ? amountNum * rateNum
      : null

  async function handleFetchRate() {
    setIsFetchingRate(true)
    try {
      const res = await fetch(
        'https://api.frankfurter.app/latest?from=USD&to=THB'
      )
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      const rate: number = data?.rates?.THB
      if (rate && rate > 0) {
        setExchangeRate(rate.toFixed(4))
      }
    } catch {
      // silently keep the current value if fetch fails
    } finally {
      setIsFetchingRate(false)
    }
  }

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

      {/* Currency + Amount row */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
        <div className="flex gap-2">
          {/* Currency dropdown */}
          <div className="relative">
            <select
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="h-full appearance-none pl-3 pr-8 py-2.5 border border-gray-300 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.flag} {c.value}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
          </div>

          {/* Amount input */}
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Exchange rate — only shown when USD is selected */}
      {isUSD && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="exchange_rate"
              className="text-sm font-medium text-amber-900"
            >
              Exchange rate <span className="font-normal text-amber-700">(1 USD = ? THB)</span>
            </label>
            <button
              type="button"
              onClick={handleFetchRate}
              disabled={isFetchingRate}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 disabled:opacity-50 transition-colors"
            >
              {isFetchingRate ? (
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {isFetchingRate ? 'Fetching…' : 'Fetch live rate'}
            </button>
          </div>

          <input
            id="exchange_rate"
            name="exchange_rate"
            type="number"
            step="0.0001"
            min="0.0001"
            required={isUSD}
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            placeholder="35.5000"
            className="w-full px-3 py-2.5 border border-amber-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />

          {/* Preview */}
          {convertedTHB !== null && (
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs text-amber-700">≈</span>
              <span className="text-sm font-semibold text-amber-900">
                {formatTHB(convertedTHB)}
              </span>
              <span className="text-xs text-amber-600">THB (base amount stored)</span>
            </div>
          )}
        </div>
      )}

      {/* Hidden field — keeps exchange_rate out of form when THB */}
      {!isUSD && (
        <input type="hidden" name="exchange_rate" value="" />
      )}

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
