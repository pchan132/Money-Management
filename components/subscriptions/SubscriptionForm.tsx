'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createSubscription, updateSubscription } from '@/actions/subscriptions'
import CategorySelect from '@/components/transactions/CategorySelect'
import type { Category, Currency, SubscriptionWithCategory } from '@/types'

const CURRENCIES: { value: Currency; label: string; flag: string }[] = [
  { value: 'THB', label: 'THB – Thai Baht', flag: '🇹🇭' },
  { value: 'USD', label: 'USD – US Dollar', flag: '🇺🇸' },
]

const DEFAULT_EXCHANGE_RATE = 35.5

interface SubscriptionFormProps {
  categories: Category[]
  subscription?: SubscriptionWithCategory
  onSuccess?: () => void
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
      {pending ? 'Saving…' : isEdit ? 'Update subscription' : 'Add subscription'}
    </button>
  )
}

export default function SubscriptionForm({
  categories,
  subscription,
  onSuccess,
}: SubscriptionFormProps) {
  const isEdit = !!subscription

  const action = isEdit
    ? updateSubscription.bind(null, subscription!.id)
    : createSubscription

  const [state, formAction] = useActionState(
    async (prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await action(prev, formData)
      if (result.success) onSuccess?.()
      return result
    },
    null
  )

  const [currency, setCurrency] = useState<Currency>(
    (subscription?.currency as Currency) ?? 'THB'
  )

  return (
    <form action={formAction} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          type="text"
          required
          placeholder="e.g. Netflix, Spotify, ChatGPT"
          defaultValue={subscription?.name ?? ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Currency + Amount */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            {CURRENCIES.map(({ value, label, flag }) => (
              <option key={value} value={value}>
                {flag} {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly amount <span className="text-red-500">*</span>
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            defaultValue={subscription?.amount !== undefined ? String(subscription.amount) : ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Exchange rate (USD only) */}
      {currency === 'USD' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exchange rate (1 USD = ? THB)
          </label>
          <input
            name="exchange_rate"
            type="number"
            step="0.0001"
            min="0.0001"
            defaultValue={DEFAULT_EXCHANGE_RATE}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Billing date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Billing day of month <span className="text-red-500">*</span>
        </label>
        <input
          name="billing_date"
          type="number"
          min="1"
          max="31"
          required
          placeholder="e.g. 1, 15, 28"
          defaultValue={subscription?.billing_date ?? 1}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1">Day of month when this subscription renews</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <CategorySelect
          categories={categories}
          defaultValue={subscription?.category_id ?? ''}
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <input
          name="note"
          type="text"
          placeholder="Optional note"
          defaultValue={subscription?.note ?? ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}

      <div className="flex justify-end pt-1">
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  )
}
