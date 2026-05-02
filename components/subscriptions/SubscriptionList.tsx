'use client'

import { useState } from 'react'
import { PlusCircle, CreditCard } from 'lucide-react'
import SubscriptionItem from '@/components/subscriptions/SubscriptionItem'
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm'
import type { Category, SubscriptionWithCategory } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface SubscriptionListProps {
  subscriptions: SubscriptionWithCategory[]
  categories: Category[]
  monthlyTotal: number
}

export default function SubscriptionList({
  subscriptions,
  categories,
  monthlyTotal,
}: SubscriptionListProps) {
  const [showForm, setShowForm] = useState(false)

  const active = subscriptions.filter((s) => s.is_active)
  const paused = subscriptions.filter((s) => !s.is_active)

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <CreditCard className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total fixed monthly cost</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(monthlyTotal)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {active.length} active subscription{active.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Add subscription</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">New subscription</h3>
          <SubscriptionForm
            categories={categories}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Active subscriptions */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Active ({active.length})
          </h3>
          {active.map((sub) => (
            <SubscriptionItem key={sub.id} subscription={sub} categories={categories} />
          ))}
        </div>
      )}

      {/* Paused subscriptions */}
      {paused.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Paused ({paused.length})
          </h3>
          {paused.map((sub) => (
            <SubscriptionItem key={sub.id} subscription={sub} categories={categories} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {subscriptions.length === 0 && !showForm && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CreditCard className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No subscriptions yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add recurring monthly fees like Netflix, Spotify, or gym memberships.
          </p>
        </div>
      )}
    </div>
  )
}
