import type { Metadata } from 'next'
import { getSubscriptions, getMonthlySubscriptionTotal } from '@/actions/subscriptions'
import { getCategories } from '@/actions/categories'
import SubscriptionList from '@/components/subscriptions/SubscriptionList'

export const metadata: Metadata = { title: 'Subscriptions' }

export default async function SubscriptionsPage() {
  const [subscriptionsResult, categoriesResult, totalResult] = await Promise.all([
    getSubscriptions(),
    getCategories(),
    getMonthlySubscriptionTotal(),
  ])

  const subscriptions = subscriptionsResult.data ?? []
  const categories = categoriesResult.data ?? []
  const monthlyTotal = totalResult.data ?? 0

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage recurring monthly fees — deducted from your balance as fixed costs
        </p>
      </div>

      <SubscriptionList
        subscriptions={subscriptions}
        categories={categories}
        monthlyTotal={monthlyTotal}
      />
    </div>
  )
}
