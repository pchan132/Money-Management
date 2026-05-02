'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2, ToggleLeft, ToggleRight, CalendarDays, CheckCircle2, Undo2 } from 'lucide-react'
import {
  deleteSubscription,
  toggleSubscriptionActive,
  markSubscriptionPaid,
  unmarkSubscriptionPaid,
} from '@/actions/subscriptions'
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm'
import type { Category, SubscriptionWithPaidStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface SubscriptionItemProps {
  subscription: SubscriptionWithPaidStatus
  categories: Category[]
}

export default function SubscriptionItem({ subscription, categories }: SubscriptionItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  // isPaid reflects only THIS month — getSubscriptionsWithPaidStatus filters to current month,
  // so this resets automatically each new month. The old expense stays in Transactions.
  const isPaid = subscription.paidTransactionId !== null

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

  function handleMarkPaid() {
    startTransition(async () => {
      await markSubscriptionPaid(subscription.id)
    })
  }

  function handleUndo() {
    if (!subscription.paidTransactionId) return
    startTransition(async () => {
      await unmarkSubscriptionPaid(subscription.paidTransactionId!)
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
      className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 transition-all ${
        !subscription.is_active
          ? 'opacity-50 border-gray-100'
          : isPaid
          ? 'border-emerald-200 bg-emerald-50/40'
          : 'border-gray-100'
      }`}
    >
      {/* Category color / icon */}
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
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{subscription.name}</p>
          {isPaid && (
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              Paid
            </span>
          )}
          {!subscription.is_active && (
            <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              Paused
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span
            className={`text-sm font-bold ${
              isPaid ? 'text-emerald-600 line-through decoration-emerald-400/60' : 'text-red-500'
            }`}
          >
            {amountDisplay}
          </span>
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
        {subscription.is_active &&
          (isPaid ? (
            <button
              onClick={handleUndo}
              disabled={isPending}
              title="Undo payment"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors disabled:opacity-40"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </button>
          ) : (
            <button
              onClick={handleMarkPaid}
              disabled={isPending}
              title="Mark as paid this month"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Pay
            </button>
          ))}

        <button
          onClick={handleToggle}
          disabled={isPending}
          title={subscription.is_active ? 'Pause' : 'Resume'}
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
