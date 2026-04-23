'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { CategoryExpense } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CategoryPieChartProps {
  data: CategoryExpense[]
}

const FALLBACK_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
]

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No expense data for this period
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="total"
            nameKey="name"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.id}
                fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
              fontSize: '13px',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => <span className="text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category breakdown list */}
      <div className="space-y-2">
        {data.map((cat, index) => (
          <div key={cat.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: cat.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                }}
              />
              <span className="text-sm text-gray-700 truncate">
                {cat.icon} {cat.name}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-gray-400">{cat.percentage.toFixed(1)}%</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(cat.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
