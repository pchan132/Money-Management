'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { Category } from '@/types'

interface FilterBarProps {
  categories: Category[]
}

export default function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
          <select
            value={searchParams.get('type') ?? 'all'}
            onChange={(e) => updateFilter('type', e.target.value === 'all' ? '' : e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="investment">📈 ลงทุน</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
          <select
            value={searchParams.get('category_id') ?? ''}
            onChange={(e) => updateFilter('category_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start date */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">From</label>
          <input
            type="date"
            value={searchParams.get('startDate') ?? ''}
            onChange={(e) => updateFilter('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* End date */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
          <input
            type="date"
            value={searchParams.get('endDate') ?? ''}
            onChange={(e) => updateFilter('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Clear filters */}
      {(searchParams.get('type') ||
        searchParams.get('category_id') ||
        searchParams.get('startDate') ||
        searchParams.get('endDate')) && (
        <button
          onClick={() => router.push(pathname)}
          className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
