'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Category } from '@/types'

// Categories are shared (no user scope), so no auth check needed here.
export async function getCategories(): Promise<{
  data: Category[] | null
  error: string | null
}> {
  try {
    const rows = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return {
      data: rows.map((c) => ({ ...c, created_at: c.created_at.toISOString() })),
      error: null,
    }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
}

export async function createCategory(
  name: string,
  icon: string,
  color: string
): Promise<{ data: Category | null; error: string | null }> {
  const trimmedName = name.trim()
  if (!trimmedName) return { data: null, error: 'Category name is required.' }

  try {
    const row = await prisma.category.create({
      data: {
        name: trimmedName,
        icon: icon.trim(),
        color: color || '#6366f1',
      },
    })
    revalidatePath('/transactions')
    revalidatePath('/transactions/new')
    return { data: { ...row, created_at: row.created_at.toISOString() }, error: null }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
}

export async function deleteCategory(
  id: string
): Promise<{ error: string | null }> {
  if (!id) return { error: 'Category ID is required.' }

  try {
    // Unlink transactions before deleting (set category_id to null)
    await prisma.transaction.updateMany({
      where: { category_id: id },
      data: { category_id: null },
    })
    await prisma.category.delete({ where: { id } })
    revalidatePath('/transactions')
    revalidatePath('/transactions/new')
    return { error: null }
  } catch (e) {
    return { error: (e as Error).message }
  }
}
