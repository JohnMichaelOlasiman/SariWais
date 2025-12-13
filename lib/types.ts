export interface User {
  id: number
  username: string
  store_name: string
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: number
  user_id: number
  name: string
  category: string
  quantity: number
  cost_price: number
  selling_price: number
  reorder_level: number
  barcode?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  user_id: number
  transaction_type: "sale" | "expense"
  total_amount: number
  payment_method?: string
  notes?: string
  created_at: string
}

export interface TransactionItem {
  id: number
  transaction_id: number
  inventory_item_id?: number
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface SalesReport {
  total_sales: number
  total_expenses: number
  gross_profit: number
  net_profit: number
  total_transactions: number
  period_start: string
  period_end: string
}
