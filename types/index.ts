export type TransactionType = 'income' | 'expense' | 'investment'
export type Currency = 'THB' | 'USD'

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  currency: Currency
  exchange_rate: number | null
  amount_thb: number
  category_id: string | null
  subscription_id: string | null
  note: string | null
  created_at: string
}

export interface TransactionWithCategory extends Transaction {
  categories: Category | null
}

export interface TransactionFilters {
  type?: TransactionType | 'all'
  category_id?: string
  startDate?: string
  endDate?: string
}

export interface Subscription {
  id: string
  user_id: string
  name: string
  amount: number
  currency: Currency
  amount_thb: number
  billing_date: number
  category_id: string | null
  is_active: boolean
  note: string | null
  created_at: string
}

export interface SubscriptionWithCategory extends Subscription {
  category: Category | null
}

export interface SubscriptionWithPaidStatus extends SubscriptionWithCategory {
  /** transactionId of the payment recorded this month, or null if not yet paid */
  paidTransactionId: string | null
}

export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  totalInvestment: number
  balance: number
  monthlyIncome: number
  monthlyExpense: number
  monthlyInvestment: number
  totalSubscriptions: number
  paidSubscriptions: number
  unpaidSubscriptions: number
  actualAvailableBalance: number
}

export interface MonthlyData {
  month: string
  income: number
  expense: number
  investment: number
}

export interface CategoryExpense {
  id: string
  name: string
  icon: string
  color: string
  total: number
  percentage: number
}

export interface ActionState {
  error?: string
  success?: boolean
}
