export type TransactionType = 'income' | 'expense'
export type Currency = 'THB' | 'USD'

export interface Category {
  id: string
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

export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  monthlyIncome: number
  monthlyExpense: number
}

export interface MonthlyData {
  month: string
  income: number
  expense: number
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
