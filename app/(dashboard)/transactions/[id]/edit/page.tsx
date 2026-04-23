import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTransactionById } from '@/actions/transactions'
import { getCategories } from '@/actions/categories'
import TransactionForm from '@/components/transactions/TransactionForm'

export const metadata: Metadata = { title: 'Edit Transaction' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: PageProps) {
  const { id } = await params

  const [{ data: transaction, error: txError }, { data: categories, error: catError }] =
    await Promise.all([getTransactionById(id), getCategories()])

  if (txError || !transaction) notFound()

  if (catError) {
    return (
      <div className="max-w-lg mx-auto p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        Failed to load categories: {catError}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Transaction</h1>
        <p className="text-sm text-gray-500 mt-0.5">Update the details below</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <TransactionForm categories={categories ?? []} transaction={transaction} />
      </div>
    </div>
  )
}
