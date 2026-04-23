'use server'

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
