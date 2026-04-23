'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, X, Check, Loader2 } from 'lucide-react'
import { createCategory } from '@/actions/categories'
import type { Category } from '@/types'

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#6b7280', // gray
]

interface CategorySelectProps {
  categories: Category[]
  defaultValue?: string | null
}

export default function CategorySelect({ categories: initial, defaultValue }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>(initial)
  const [selectedId, setSelectedId] = useState<string>(defaultValue ?? '')
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const nameRef = useRef<HTMLInputElement>(null)

  function openAddForm() {
    setIsAdding(true)
    setName('')
    setIcon('')
    setColor(PRESET_COLORS[0])
    setError(null)
    setTimeout(() => nameRef.current?.focus(), 50)
  }

  function closeAddForm() {
    setIsAdding(false)
    setError(null)
  }

  function handleCreate() {
    if (!name.trim()) {
      setError('Please enter a category name.')
      return
    }
    startTransition(async () => {
      const result = await createCategory(name, icon, color)
      if (result.error || !result.data) {
        setError(result.error ?? 'Failed to create category.')
        return
      }
      const newCat = result.data
      // Insert alphabetically
      setCategories((prev) =>
        [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name))
      )
      setSelectedId(newCat.id)
      setIsAdding(false)
      setError(null)
    })
  }

  return (
    <div className="space-y-2">
      {/* Hidden input carries the value for the parent <form> */}
      <input type="hidden" name="category_id" value={selectedId} />

      {/* Select */}
      <select
        id="category_id"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">— Select category —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon} {c.name}
          </option>
        ))}
      </select>

      {/* Add new category inline form */}
      {!isAdding ? (
        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add new category
        </button>
      ) : (
        <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
              New Category
            </span>
            <button
              type="button"
              onClick={closeAddForm}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Name */}
          <div className="flex gap-2">
            {/* Icon (emoji) */}
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🏷️"
              maxLength={2}
              className="w-14 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreate())}
              placeholder="Category name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Color swatches */}
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
              >
                {color === c && (
                  <Check className="h-3.5 w-3.5 text-white mx-auto" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>

          {/* Preview + Save */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: color }}
              >
                {icon || '🏷️'} {name || 'Preview'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
