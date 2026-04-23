import type { Metadata } from 'next'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { Suspense } from 'react'
import { getTransactions } from '@/actions/transactions'
import { getCategories } from '@/actions/categories'
import TransactionList from '@/components/transactions/TransactionList'
import FilterBar from '@/components/transactions/FilterBar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { TransactionFilters } from '@/types'

export const metadata: Metadata = { title: 'Transactions' }

interface PageProps {
  searchParams: Promise<{
    type?: string
    category_id?: string
    startDate?: string
    endDate?: string
  }>
}

async function TransactionsContent({ filters }: { filters: TransactionFilters }) {
  const { data: transactions, error } = await getTransactions(filters)

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        Failed to load transactions: {error}
      </div>
    )
  }

  return <TransactionList transactions={transactions ?? []} />
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { data: categories } = await getCategories()

  const filters: TransactionFilters = {
    type: (params.type as TransactionFilters['type']) ?? 'all',
    category_id: params.category_id,
    startDate: params.startDate,
    endDate: params.endDate,
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">All your income and expenses</p>
        </div>
        <Link
          href="/transactions/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Link>
      </div>

      {/* Filters */}
      <Suspense>
        <FilterBar categories={categories ?? []} />
      </Suspense>

      {/* List */}
      <Suspense fallback={<LoadingSpinner />}>
        <TransactionsContent filters={filters} />
      </Suspense>
    </div>
  )
}
