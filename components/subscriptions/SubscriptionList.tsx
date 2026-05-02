'use client'

import { useState } from 'react'
import { PlusCircle, CreditCard, Info, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import SubscriptionItem from '@/components/subscriptions/SubscriptionItem'
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm'
import type { Category, SubscriptionWithPaidStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface SubscriptionListProps {
  subscriptions: SubscriptionWithPaidStatus[]
  categories: Category[]
  totalSubscriptions: number
  paidSubscriptions: number
  unpaidSubscriptions: number
}

export default function SubscriptionList({
  subscriptions,
  categories,
  totalSubscriptions,
  paidSubscriptions,
  unpaidSubscriptions,
}: SubscriptionListProps) {
  const [showForm, setShowForm] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const currentMonth = format(new Date(), 'MMMM yyyy')

  const active = subscriptions.filter((s) => s.is_active)
  const paused = subscriptions.filter((s) => !s.is_active)
  const paidCount = active.filter((s) => s.paidTransactionId !== null).length
  const paidPct = totalSubscriptions > 0 ? (paidSubscriptions / totalSubscriptions) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Fixed monthly cost · {currentMonth}
              </p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSubscriptions)}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {active.length} active · {paidCount}/{active.length} paid this month
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Add subscription</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Paid vs Unpaid progress bar */}
        {active.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Paid: {formatCurrency(paidSubscriptions)}
              </span>
              <span className="flex items-center gap-1.5 text-orange-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                Unpaid: {formatCurrency(unpaidSubscriptions)}
              </span>
            </div>
            <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${paidPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="border border-blue-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowGuide((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-blue-700">
            <Info className="h-4 w-4 shrink-0" />
            วิธีการใช้งาน (How it works)
          </span>
          <ChevronDown
            className={`h-4 w-4 text-blue-500 transition-transform duration-200 ${
              showGuide ? 'rotate-180' : ''
            }`}
          />
        </button>
        {showGuide && (
          <div className="px-4 py-4 bg-blue-50/50 space-y-3 text-xs text-gray-700">
            <div className="space-y-2">
              <p className="font-semibold text-gray-800">💳 Subscription คืออะไร?</p>
              <p>
                Subscription คือค่าใช้จ่ายรายเดือนที่เกิดซ้ำ เช่น Netflix, Spotify, ค่า
                Gym — ระบบจะหักยอดเหล่านี้ออกจากยอดคงเหลือเป็น{' '}
                <span className="font-medium text-orange-600">"ค่าที่ยังไม่ได้จ่าย (Unpaid)"</span>{' '}
                เพื่อให้รู้ว่าเงินที่ใช้ได้จริงเหลือเท่าไร
              </p>
            </div>
            <hr className="border-blue-100" />
            <div className="space-y-1.5">
              <p className="font-semibold text-gray-800">🟢 กดปุ่ม Pay</p>
              <p>
                เมื่อกด <span className="font-medium text-emerald-700">Pay</span> ระบบจะสร้าง
                รายการ Expense ในเดือนนั้นทันที และยอด Unpaid จะลดลง —
                แสดงว่าคุณจ่ายค่า Subscription นั้นแล้ว
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-gray-800">↩️ กดปุ่ม Undo</p>
              <p>
                สามารถกด <span className="font-medium text-emerald-700">Undo</span> ได้{' '}
                <span className="font-medium text-red-600">เฉพาะในเดือนเดียวกัน</span>{' '}
                กับที่กด Pay เท่านั้น — ระบบจะลบรายการ Expense นั้นออก
              </p>
              <p className="text-gray-500">
                ถ้าพ้นเดือนไปแล้ว ปุ่ม Undo จะถูกล็อก (🔒) และ Expense
                ของเดือนนั้นจะยังคงอยู่ใน Transaction ตามปกติ
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-gray-800">📊 Actual Available Balance</p>
              <p>
                ยอดนี้บน Dashboard = ยอดคงเหลือ (Balance) −{' '}
                <span className="font-medium text-orange-600">ค่า Subscription ที่ยังไม่ได้จ่าย</span>{' '}
                เพื่อให้รู้ว่าเงินที่ใช้ได้จริงมีเท่าไร
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">New subscription</h3>
          <SubscriptionForm
            categories={categories}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Active subscriptions */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Active ({active.length})
          </h3>
          {active.map((sub) => (
            <SubscriptionItem key={sub.id} subscription={sub} categories={categories} />
          ))}
        </div>
      )}

      {/* Paused subscriptions */}
      {paused.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Paused ({paused.length})
          </h3>
          {paused.map((sub) => (
            <SubscriptionItem key={sub.id} subscription={sub} categories={categories} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {subscriptions.length === 0 && !showForm && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CreditCard className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No subscriptions yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add recurring monthly fees like Netflix, Spotify, or gym memberships.
          </p>
        </div>
      )}
    </div>
  )
}
