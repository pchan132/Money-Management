'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Category, Transaction, Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentMonthRange, getLastNMonths, getMonthRange } from '@/lib/utils'
import type {
  ActionState,
  CategoryExpense,
  Currency,
  DashboardSummary,
  MonthlyData,
  TransactionFilters,
  TransactionWithCategory,
} from '@/types'

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function getAuthUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

// ─── Mapping helper ──────────────────────────────────────────────────────────
// Converts Prisma model (Decimal + Date) to our plain TypeScript types.

type PrismaTransactionWithCategory = Transaction & { categories: Category | null }

function mapTransaction(t: PrismaTransactionWithCategory): TransactionWithCategory {
  return {
    id: t.id,
    user_id: t.user_id,
    type: t.type as 'income' | 'expense' | 'investment',
    amount: Number(t.amount),
    currency: (t.currency as Currency) ?? 'THB',
    exchange_rate: t.exchange_rate !== null ? Number(t.exchange_rate) : null,
    amount_thb: Number(t.amount_thb),
    category_id: t.category_id,
    subscription_id: t.subscription_id,
    note: t.note,
    created_at: t.created_at.toISOString(),
    categories: t.categories
      ? {
          id: t.categories.id,
          user_id: t.categories.user_id,
          name: t.categories.name,
          icon: t.categories.icon,
          color: t.categories.color,
          created_at: t.categories.created_at.toISOString(),
        }
      : null,
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getTransactions(
  filters?: TransactionFilters
): Promise<{ data: TransactionWithCategory[] | null; error: string | null }> {
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  try {
    const where: Prisma.TransactionWhereInput = {
      user_id: userId,
      ...(filters?.type && filters.type !== 'all' ? { type: filters.type } : {}),
      ...(filters?.category_id ? { category_id: filters.category_id } : {}),
      ...(filters?.startDate || filters?.endDate
        ? {
            created_at: {
              ...(filters.startDate ? { gte: new Date(filters.startDate + 'T00:00:00') } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate + 'T23:59:59') } : {}),
            },
          }
        : {}),
    }

    const rows = await prisma.transaction.findMany({
      where,
      include: { categories: true },
      orderBy: { created_at: 'desc' },
    })

    return { data: rows.map(mapTransaction), error: null }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
}

export async function getTransactionById(
  id: string
): Promise<{ data: TransactionWithCategory | null; error: string | null }> {
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  try {
    const row = await prisma.transaction.findFirst({
      where: { id, user_id: userId },
      include: { categories: true },
    })

    return { data: row ? mapTransaction(row) : null, error: null }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
}

export async function getDashboardSummary(): Promise<{
  data: DashboardSummary | null
  error: string | null
}> {
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  const { startDate, endDate } = getCurrentMonthRange()
  const monthStart = new Date(startDate + 'T00:00:00')
  const monthEnd = new Date(endDate + 'T23:59:59')

  try {
    const [
      totalIncomeAgg,
      totalExpenseAgg,
      totalInvestmentAgg,
      monthIncomeAgg,
      monthExpenseAgg,
      monthInvestmentAgg,
      activeSubscriptions,
      paidSubscriptionTxs,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { user_id: userId, type: 'income' },
        _sum: { amount_thb: true },
      }),
      prisma.transaction.aggregate({
        where: { user_id: userId, type: 'expense' },
        _sum: { amount_thb: true },
      }),
      prisma.transaction.aggregate({
        where: { user_id: userId, type: 'investment' },
        _sum: { amount_thb: true },
      }),
      prisma.transaction.aggregate({
        where: {
          user_id: userId,
          type: 'income',
          created_at: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount_thb: true },
      }),
      prisma.transaction.aggregate({
        where: {
          user_id: userId,
          type: 'expense',
          created_at: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount_thb: true },
      }),
      prisma.transaction.aggregate({
        where: {
          user_id: userId,
          type: 'investment',
          created_at: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount_thb: true },
      }),
      // All active subscriptions (master amounts)
      prisma.subscription.findMany({
        where: { user_id: userId, is_active: true },
        select: { id: true, amount_thb: true },
      }),
      // Transactions this month that are subscription payments
      prisma.transaction.findMany({
        where: {
          user_id: userId,
          subscription_id: { not: null },
          created_at: { gte: monthStart, lte: monthEnd },
        },
        select: { subscription_id: true },
      }),
    ])

    const totalIncome = Number(totalIncomeAgg._sum.amount_thb ?? 0)
    const totalExpense = Number(totalExpenseAgg._sum.amount_thb ?? 0)
    const totalInvestment = Number(totalInvestmentAgg._sum.amount_thb ?? 0)
    const monthlyIncome = Number(monthIncomeAgg._sum.amount_thb ?? 0)
    const monthlyExpense = Number(monthExpenseAgg._sum.amount_thb ?? 0)
    const monthlyInvestment = Number(monthInvestmentAgg._sum.amount_thb ?? 0)

    // Subscription paid/unpaid calculation (no double-counting)
    // Paid = subscriptions whose ID appears in a payment transaction this month
    const paidIds = new Set(paidSubscriptionTxs.map((t) => t.subscription_id))
    const totalSubscriptions = activeSubscriptions.reduce((s, r) => s + Number(r.amount_thb), 0)
    const paidSubscriptions = activeSubscriptions
      .filter((r) => paidIds.has(r.id))
      .reduce((s, r) => s + Number(r.amount_thb), 0)
    const unpaidSubscriptions = totalSubscriptions - paidSubscriptions

    const baseBalance = totalIncome - totalExpense
    const balance = baseBalance === 0 ? 0 : baseBalance - totalInvestment
    // Actual available = balance already accounts for paid subscriptions (they are in expenses)
    // We only subtract what's STILL UNPAID this month
    const actualAvailableBalance = balance - unpaidSubscriptions

    return {
      data: {
        totalIncome,
        totalExpense,
        totalInvestment,
        balance,
        monthlyIncome,
        monthlyExpense,
        monthlyInvestment,
        totalSubscriptions,
        paidSubscriptions,
        unpaidSubscriptions,
        actualAvailableBalance,
      },
      error: null,
    }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
}

export async function getMonthlyReport(): Promise<{
  data: MonthlyData[] | null
  error: string | null
}> {
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  const months = getLastNMonths(6)
  const monthlyData: MonthlyData[] = []

  try {
    for (const { year, month, label } of months) {
      const { startDate, endDate } = getMonthRange(year, month)
      const gte = new Date(startDate + 'T00:00:00')
      const lte = new Date(endDate + 'T23:59:59')

      const [incomeAgg, expenseAgg, investmentAgg] = await Promise.all([
        prisma.transaction.aggregate({
          where: { user_id: userId, type: 'income', created_at: { gte, lte } },
          _sum: { amount_thb: true },
        }),
        prisma.transaction.aggregate({
          where: { user_id: userId, type: 'expense', created_at: { gte, lte } },
          _sum: { amount_thb: true },
        }),
        prisma.transaction.aggregate({
          where: { user_id: userId, type: 'investment', created_at: { gte, lte } },
          _sum: { amount_thb: true },
        }),
      ])

      monthlyData.push({
        month: label,
        income: Number(incomeAgg._sum.amount_thb ?? 0),
        expense: Number(expenseAgg._sum.amount_thb ?? 0),
        investment: Number(investmentAgg._sum.amount_thb ?? 0),
      })
    }

    return { data: monthlyData, error: null }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
}

export async function getCategoryExpenses(
  startDate: string,
  endDate: string
): Promise<{ data: CategoryExpense[] | null; error: string | null }> {
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  try {
    const rows = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: 'expense',
        category_id: { not: null },
        created_at: {
          gte: new Date(startDate + 'T00:00:00'),
          lte: new Date(endDate + 'T23:59:59'),
        },
      },
      include: { categories: true },
    })

    const map = new Map<string, CategoryExpense>()

    for (const t of rows) {
      if (!t.categories) continue
      const cat = t.categories
      const amount = Number(t.amount_thb)
      const existing = map.get(cat.id)
      if (existing) {
        existing.total += amount
      } else {
        map.set(cat.id, { id: cat.id, name: cat.name, icon: cat.icon, color: cat.color, total: amount, percentage: 0 })
      }
    }

    const categories = Array.from(map.values())
    const grandTotal = categories.reduce((s, c) => s + c.total, 0)
    categories.forEach((c) => {
      c.percentage = grandTotal > 0 ? (c.total / grandTotal) * 100 : 0
    })

    return { data: categories.sort((a, b) => b.total - a.total), error: null }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createTransaction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
  const userId = await getAuthUserId()
  if (!userId) return { error: 'Unauthorized' }

  const type = formData.get('type') as string
  const amountRaw = formData.get('amount') as string
  const currency = (formData.get('currency') as string) || 'THB'
  const exchangeRateRaw = formData.get('exchange_rate') as string
  const category_id = (formData.get('category_id') as string) || null
  const note = (formData.get('note') as string) || null
  const dateRaw = formData.get('created_at') as string

  if (type !== 'income' && type !== 'expense' && type !== 'investment') return { error: 'Invalid type.' }
  if (currency !== 'THB' && currency !== 'USD') return { error: 'Invalid currency.' }

  const amount = parseFloat(amountRaw)
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number.' }

  let exchange_rate: number | null = null
  let amount_thb: number

  if (currency === 'USD') {
    const rate = parseFloat(exchangeRateRaw)
    if (isNaN(rate) || rate <= 0) return { error: 'Exchange rate must be a positive number.' }
    exchange_rate = rate
    amount_thb = amount * rate
  } else {
    amount_thb = amount
  }

  const created_at = dateRaw ? new Date(dateRaw) : new Date()

  try {
    await prisma.transaction.create({
      data: {
        user_id: userId,
        type,
        amount,
        currency,
        exchange_rate,
        amount_thb,
        category_id,
        note,
        created_at,
      },
    })
  } catch (e) {
    return { error: (e as Error).message }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  redirect('/transactions')
}

export async function updateTransaction(
  id: string,
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
  const userId = await getAuthUserId()
  if (!userId) return { error: 'Unauthorized' }

  const type = formData.get('type') as string
  const amountRaw = formData.get('amount') as string
  const currency = (formData.get('currency') as string) || 'THB'
  const exchangeRateRaw = formData.get('exchange_rate') as string
  const category_id = (formData.get('category_id') as string) || null
  const note = (formData.get('note') as string) || null
  const dateRaw = formData.get('created_at') as string

  if (type !== 'income' && type !== 'expense' && type !== 'investment') return { error: 'Invalid type.' }
  if (currency !== 'THB' && currency !== 'USD') return { error: 'Invalid currency.' }

  const amount = parseFloat(amountRaw)
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number.' }

  let exchange_rate: number | null = null
  let amount_thb: number

  if (currency === 'USD') {
    const rate = parseFloat(exchangeRateRaw)
    if (isNaN(rate) || rate <= 0) return { error: 'Exchange rate must be a positive number.' }
    exchange_rate = rate
    amount_thb = amount * rate
  } else {
    amount_thb = amount
  }

  const created_at = dateRaw ? new Date(dateRaw) : undefined

  try {
    const result = await prisma.transaction.updateMany({
      where: { id, user_id: userId },
      data: {
        type,
        amount,
        currency,
        exchange_rate,
        amount_thb,
        category_id,
        note,
        ...(created_at ? { created_at } : {}),
      },
    })
    if (result.count === 0) return { error: 'Transaction not found.' }
  } catch (e) {
    return { error: (e as Error).message }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  redirect('/transactions')
}

export async function deleteTransaction(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const userId = await getAuthUserId()
  if (!userId) return { error: 'Unauthorized' }

  try {
    await prisma.transaction.deleteMany({
      where: { id, user_id: userId }, // user_id prevents unauthorized deletes
    })
  } catch (e) {
    return { error: (e as Error).message }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  return { success: true }
}
