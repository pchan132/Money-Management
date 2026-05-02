'use server'

import { revalidatePath } from 'next/cache'
import type { Category, Subscription } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentMonthRange } from '@/lib/utils'
import type { ActionState, Currency, SubscriptionWithCategory, SubscriptionWithPaidStatus } from '@/types'

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function getAuthUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

// ─── Mapping helper ───────────────────────────────────────────────────────────

type PrismaSubscriptionWithCategory = Subscription & { category: Category | null }

function mapSubscription(s: PrismaSubscriptionWithCategory): SubscriptionWithCategory {
  return {
    id: s.id,
    user_id: s.user_id,
    name: s.name,
    amount: Number(s.amount),
    currency: (s.currency as Currency) ?? 'THB',
    amount_thb: Number(s.amount_thb),
    billing_date: s.billing_date,
    category_id: s.category_id,
    is_active: s.is_active,
    note: s.note,
    created_at: s.created_at.toISOString(),
    category: s.category
      ? {
          id: s.category.id,
          user_id: s.category.user_id,
          name: s.category.name,
          icon: s.category.icon,
          color: s.category.color,
          created_at: s.category.created_at.toISOString(),
        }
      : null,
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSubscriptions(): Promise<{
  data: SubscriptionWithCategory[] | null
  error: string | null
}> {
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  try {
    const rows = await prisma.subscription.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { created_at: 'asc' },
    })
    return { data: rows.map(mapSubscription), error: null }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
}

export async function getMonthlySubscriptionTotal(): Promise<{
  data: number | null
  error: string | null
}> {
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  try {
    const agg = await prisma.subscription.aggregate({
      where: { user_id: userId, is_active: true },
      _sum: { amount_thb: true },
    })
    return { data: Number(agg._sum.amount_thb ?? 0), error: null }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createSubscription(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const userId = await getAuthUserId()
  if (!userId) return { error: 'Unauthorized' }

  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const currency = (formData.get('currency') as string) || 'THB'
  const amountRaw = formData.get('amount') as string
  const exchangeRateRaw = formData.get('exchange_rate') as string
  const billingDateRaw = formData.get('billing_date') as string
  const categoryId = (formData.get('category_id') as string | null) || null
  const note = (formData.get('note') as string | null)?.trim() || null

  if (!name) return { error: 'Name is required' }

  const amount = parseFloat(amountRaw)
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number' }

  const billingDate = parseInt(billingDateRaw, 10)
  if (isNaN(billingDate) || billingDate < 1 || billingDate > 31)
    return { error: 'Billing date must be between 1 and 31' }

  const exchangeRate = currency === 'USD' ? parseFloat(exchangeRateRaw) || 35.5 : null
  const amountThb = currency === 'USD' ? amount * (exchangeRate ?? 35.5) : amount

  try {
    await prisma.subscription.create({
      data: {
        user_id: userId,
        name,
        amount,
        currency,
        amount_thb: amountThb,
        billing_date: billingDate,
        category_id: categoryId || null,
        is_active: true,
        note,
      },
    })

    revalidatePath('/subscriptions')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateSubscription(
  id: string,
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const userId = await getAuthUserId()
  if (!userId) return { error: 'Unauthorized' }

  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const currency = (formData.get('currency') as string) || 'THB'
  const amountRaw = formData.get('amount') as string
  const exchangeRateRaw = formData.get('exchange_rate') as string
  const billingDateRaw = formData.get('billing_date') as string
  const categoryId = (formData.get('category_id') as string | null) || null
  const note = (formData.get('note') as string | null)?.trim() || null

  if (!name) return { error: 'Name is required' }

  const amount = parseFloat(amountRaw)
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number' }

  const billingDate = parseInt(billingDateRaw, 10)
  if (isNaN(billingDate) || billingDate < 1 || billingDate > 31)
    return { error: 'Billing date must be between 1 and 31' }

  const exchangeRate = currency === 'USD' ? parseFloat(exchangeRateRaw) || 35.5 : null
  const amountThb = currency === 'USD' ? amount * (exchangeRate ?? 35.5) : amount

  try {
    await prisma.subscription.updateMany({
      where: { id, user_id: userId },
      data: {
        name,
        amount,
        currency,
        amount_thb: amountThb,
        billing_date: billingDate,
        category_id: categoryId || null,
        note,
      },
    })

    revalidatePath('/subscriptions')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ─── Toggle active ────────────────────────────────────────────────────────────

export async function toggleSubscriptionActive(
  id: string,
  isActive: boolean
): Promise<ActionState> {
  const userId = await getAuthUserId()
  if (!userId) return { error: 'Unauthorized' }

  try {
    await prisma.subscription.updateMany({
      where: { id, user_id: userId },
      data: { is_active: isActive },
    })

    revalidatePath('/subscriptions')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ─── Get subscriptions with this-month paid status ────────────────────────────

export async function getSubscriptionsWithPaidStatus(): Promise<{
  data: {
    subscriptions: SubscriptionWithPaidStatus[]
    totalSubscriptions: number
    paidSubscriptions: number
    unpaidSubscriptions: number
  } | null
  error: string | null
}> {
  const userId = await getAuthUserId()
  if (!userId) return { data: null, error: 'Unauthorized' }

  const { startDate, endDate } = getCurrentMonthRange()
  const monthStart = new Date(startDate + 'T00:00:00')
  const monthEnd = new Date(endDate + 'T23:59:59')

  try {
    const [rows, paidTxs] = await Promise.all([
      prisma.subscription.findMany({
        where: { user_id: userId },
        include: { category: true },
        orderBy: { created_at: 'asc' },
      }),
      prisma.transaction.findMany({
        where: {
          user_id: userId,
          subscription_id: { not: null },
          created_at: { gte: monthStart, lte: monthEnd },
        },
        select: { id: true, subscription_id: true },
      }),
    ])

    // subscriptionId → transactionId (first payment this month wins)
    const paidMap = new Map<string, string>()
    for (const tx of paidTxs) {
      if (tx.subscription_id && !paidMap.has(tx.subscription_id)) {
        paidMap.set(tx.subscription_id, tx.id)
      }
    }

    const subscriptions: SubscriptionWithPaidStatus[] = rows.map((s) => ({
      ...mapSubscription(s),
      paidTransactionId: paidMap.get(s.id) ?? null,
    }))

    const active = subscriptions.filter((s) => s.is_active)
    const totalSubscriptions = active.reduce((sum, s) => sum + s.amount_thb, 0)
    const paidSubscriptions = active
      .filter((s) => s.paidTransactionId !== null)
      .reduce((sum, s) => sum + s.amount_thb, 0)
    const unpaidSubscriptions = totalSubscriptions - paidSubscriptions

    return {
      data: { subscriptions, totalSubscriptions, paidSubscriptions, unpaidSubscriptions },
      error: null,
    }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
}

// ─── Mark subscription as paid (creates linked expense transaction) ───────────

export async function markSubscriptionPaid(subscriptionId: string): Promise<ActionState> {
  const userId = await getAuthUserId()
  if (!userId) return { error: 'Unauthorized' }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, user_id: userId, is_active: true },
    })
    if (!subscription) return { error: 'Subscription not found' }

    // Prevent duplicate payment in same month
    const { startDate, endDate } = getCurrentMonthRange()
    const existing = await prisma.transaction.findFirst({
      where: {
        user_id: userId,
        subscription_id: subscriptionId,
        created_at: {
          gte: new Date(startDate + 'T00:00:00'),
          lte: new Date(endDate + 'T23:59:59'),
        },
      },
    })
    if (existing) return { error: 'Already marked as paid this month' }

    await prisma.transaction.create({
      data: {
        user_id: userId,
        type: 'expense',
        amount: subscription.amount,
        currency: subscription.currency,
        amount_thb: subscription.amount_thb,
        category_id: subscription.category_id,
        note: `Subscription: ${subscription.name}`,
        subscription_id: subscriptionId,
      },
    })

    revalidatePath('/subscriptions')
    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ─── Unmark (delete the linked payment transaction — current month only) ────────

export async function unmarkSubscriptionPaid(transactionId: string): Promise<ActionState> {
  const userId = await getAuthUserId()
  if (!userId) return { error: 'Unauthorized' }

  try {
    const { startDate, endDate } = getCurrentMonthRange()
    const monthStart = new Date(startDate + 'T00:00:00')
    const monthEnd = new Date(endDate + 'T23:59:59')

    // Only allow undo if the payment was recorded THIS month
    const tx = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        user_id: userId,
        subscription_id: { not: null },
        created_at: { gte: monthStart, lte: monthEnd },
      },
    })

    if (!tx) {
      return {
        error:
          'Cannot undo — this payment was recorded in a previous month and is already counted in that month\'s expenses.',
      }
    }

    await prisma.transaction.delete({ where: { id: transactionId } })

    revalidatePath('/subscriptions')
    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteSubscription(id: string): Promise<ActionState> {
  const userId = await getAuthUserId()
  if (!userId) return { error: 'Unauthorized' }

  try {
    await prisma.subscription.deleteMany({
      where: { id, user_id: userId },
    })

    revalidatePath('/subscriptions')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}
