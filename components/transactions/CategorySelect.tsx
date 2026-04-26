'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, X, Check, Loader2, Trash2, ChevronDown } from 'lucide-react'
import { createCategory, deleteCategory } from '@/actions/categories'
import type { Category } from '@/types'

const PRESET_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6b7280',
]

interface CategorySelectProps {
  categories: Category[]
  defaultValue?: string | null
}

export default function CategorySelect({ categories: initial, defaultValue }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>(initial)
  const [selectedId, setSelectedId] = useState<string>(defaultValue ?? '')
  const [isAdding, setIsAdding] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const nameRef = useRef<HTMLInputElement>(null)

  const selectedCategory = categories.find((c) => c.id === selectedId)

  function openAddForm() {
    setIsAdding(true)
    setIsManaging(false)
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
      setCategories((prev) =>
        [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name))
      )
      setSelectedId(newCat.id)
      setIsAdding(false)
      setError(null)
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteCategory(id)
      if (result.error) {
        setError(result.error)
        setDeletingId(null)
        return
      }
      setCategories((prev) => prev.filter((c) => c.id !== id))
      if (selectedId === id) setSelectedId('')
      setDeletingId(null)
    })
  }

  return (
    <div className="space-y-2">
      {/* Hidden input carries the value for the parent <form> */}
      <input type="hidden" name="category_id" value={selectedId} />

      {/* Custom select trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setIsManaging((v) => !v); setIsAdding(false); setError(null) }}
          className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        >
          {selectedCategory ? (
            <span className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: selectedCategory.color }}
              >
                {selectedCategory.icon} {selectedCategory.name}
              </span>
            </span>
          ) : (
            <span className="text-gray-400">Select category </span>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isManaging ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isManaging && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* None option */}
            <button
              type="button"
              onClick={() => { setSelectedId(''); setIsManaging(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedId === '' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-500'}`}
            >
              <span>None</span>
              {selectedId === '' && <Check className="h-3.5 w-3.5 ml-auto" />}
            </button>

            {categories.length > 0 && <div className="border-t border-gray-100" />}

            {/* Category rows */}
            <ul className="max-h-52 overflow-y-auto">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center group">
                  <button
                    type="button"
                    onClick={() => { setSelectedId(c.id); setIsManaging(false) }}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedId === c.id ? 'bg-indigo-50' : ''}`}
                  >
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white shrink-0"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.icon} {c.name}
                    </span>
                    {selectedId === c.id && <Check className="h-3.5 w-3.5 text-indigo-600 ml-auto" />}
                  </button>
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    title={`Delete "${c.name}"`}
                    className="px-2.5 py-2.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-all"
                  >
                    {deletingId === c.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </button>
                </li>
              ))}
            </ul>

            {/* Add new trigger inside dropdown */}
            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={openAddForm}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-indigo-600 hover:bg-indigo-50 font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add new category
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add new category inline form */}
      {!isAdding && !isManaging && (
        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add new category
        </button>
      )}

      {isAdding && (
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

          <div className="flex gap-2">
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="icon"
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

          <div className="flex items-center justify-between pt-1">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {icon || ''} {name || 'Preview'}
            </span>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {isPending ? 'Savingâ€¦' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
