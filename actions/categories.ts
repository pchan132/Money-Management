'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { Category } from '@/types'

async function getAuthUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function getCategories(): Promise<{
  data: Category[] | null
  error: string | null
}> {
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  try {
    const rows = await prisma.category.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' },
    })
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
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  const trimmedName = name.trim()
  if (!trimmedName) return { data: null, error: 'Category name is required.' }

  try {
    const row = await prisma.category.create({
      data: {
        user_id: userId,
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

export async function updateCategory(
  id: string,
  name: string,
  icon: string,
  color: string
): Promise<{ data: Category | null; error: string | null }> {
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  const trimmedName = name.trim()
  if (!trimmedName) return { data: null, error: 'Category name is required.' }

  try {
    const category = await prisma.category.findFirst({ where: { id, user_id: userId } })
    if (!category) return { data: null, error: 'Category not found.' }

    const row = await prisma.category.update({
      where: { id },
      data: { name: trimmedName, icon: icon.trim(), color: color || '#6366f1' },
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
  const userId = await getAuthUserId()
  if (!userId) return { error: 'Unauthorized' }

  if (!id) return { error: 'Category ID is required.' }

  try {
    // Verify ownership before deleting
    const category = await prisma.category.findFirst({ where: { id, user_id: userId } })
    if (!category) return { error: 'Category not found.' }

    // Unlink transactions before deleting (set category_id to null)
    await prisma.transaction.updateMany({
      where: { category_id: id, user_id: userId },
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
