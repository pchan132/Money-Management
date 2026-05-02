'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2, ToggleLeft, ToggleRight, CalendarDays } from 'lucide-react'
import { deleteSubscription, toggleSubscriptionActive } from '@/actions/subscriptions'
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm'
import type { Category, SubscriptionWithCategory } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface SubscriptionItemProps {
  subscription: SubscriptionWithCategory
  categories: Category[]
}

export default function SubscriptionItem({ subscription, categories }: SubscriptionItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await toggleSubscriptionActive(subscription.id, !subscription.is_active)
    })
  }

  function handleDelete() {
    if (!confirm(`Delete "${subscription.name}"?`)) return
    startTransition(async () => {
      await deleteSubscription(subscription.id)
    })
  }

  const amountDisplay =
    subscription.currency === 'USD'
      ? `$${subscription.amount.toFixed(2)} ≈ ${formatCurrency(subscription.amount_thb)}`
      : formatCurrency(subscription.amount_thb)

  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Edit subscription</h3>
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
        <SubscriptionForm
          categories={categories}
          subscription={subscription}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 transition-opacity ${
        !subscription.is_active ? 'opacity-50' : 'border-gray-100'
      }`}
    >
      {/* Category color dot / icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base"
        style={{
          backgroundColor: subscription.category
            ? subscription.category.color + '22'
            : '#6366f122',
        }}
      >
        {subscription.category?.icon || '💳'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{subscription.name}</p>
          {!subscription.is_active && (
            <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              Paused
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-sm font-bold text-red-500">{amountDisplay}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {ordinal(subscription.billing_date)} each month
          </span>
        </div>
        {subscription.category && (
          <p className="text-xs text-gray-400 mt-0.5">{subscription.category.name}</p>
        )}
        {subscription.note && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{subscription.note}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleToggle}
          disabled={isPending}
          title={subscription.is_active ? 'Pause subscription' : 'Resume subscription'}
          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-40"
        >
          {subscription.is_active ? (
            <ToggleRight className="h-5 w-5 text-indigo-600" />
          ) : (
            <ToggleLeft className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={() => setIsEditing(true)}
          title="Edit"
          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          title="Delete"
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
