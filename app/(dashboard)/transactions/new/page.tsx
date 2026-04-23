import type { Metadata } from 'next'
import { getCategories } from '@/actions/categories'
import TransactionForm from '@/components/transactions/TransactionForm'

export const metadata: Metadata = { title: 'Add Transaction' }

export default async function NewTransactionPage() {
  const { data: categories, error } = await getCategories()

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        Failed to load categories: {error}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
        <p className="text-sm text-gray-500 mt-0.5">Record a new income or expense</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <TransactionForm categories={categories ?? []} />
      </div>
    </div>
  )
}
