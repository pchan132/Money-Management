import type { Metadata } from 'next'
import { getSubscriptionsWithPaidStatus } from '@/actions/subscriptions'
import { getCategories } from '@/actions/categories'
import SubscriptionList from '@/components/subscriptions/SubscriptionList'

export const metadata: Metadata = { title: 'Subscriptions' }

export default async function SubscriptionsPage() {
  const [subscriptionsResult, categoriesResult] = await Promise.all([
    getSubscriptionsWithPaidStatus(),
    getCategories(),
  ])

  const data = subscriptionsResult.data ?? {
    subscriptions: [],
    totalSubscriptions: 0,
    paidSubscriptions: 0,
    unpaidSubscriptions: 0,
  }
  const categories = categoriesResult.data ?? []

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage recurring monthly fees. Unpaid ones are deducted from your Actual Available Balance.
        </p>
      </div>

      <SubscriptionList
        subscriptions={data.subscriptions}
        categories={categories}
        totalSubscriptions={data.totalSubscriptions}
        paidSubscriptions={data.paidSubscriptions}
        unpaidSubscriptions={data.unpaidSubscriptions}
      />
    </div>
  )
}
