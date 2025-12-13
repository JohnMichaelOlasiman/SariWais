import { sql } from "./db"
import type { SalesReport } from "./types"

export async function getDashboardStats(userId: number, days = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get total sales
    const salesResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales, COUNT(*) as transaction_count
      FROM transactions
      WHERE user_id = ${userId} 
        AND transaction_type = 'sale'
        AND created_at >= ${startDate.toISOString()}
    `

    // Get COGS (Cost of Goods Sold) for gross profit
    const cogsResult = await sql`
      SELECT COALESCE(SUM(ti.quantity * ii.cost_price), 0) as cogs
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      LEFT JOIN inventory_items ii ON ti.inventory_item_id = ii.id
      WHERE t.user_id = ${userId} 
        AND t.transaction_type = 'sale'
        AND t.created_at >= ${startDate.toISOString()}
    `

    // Get low stock items count
    const lowStockResult = await sql`
      SELECT COUNT(*) as low_stock_count
      FROM inventory_items
      WHERE user_id = ${userId} AND quantity <= reorder_level
    `

    // Get total inventory value
    const inventoryValueResult = await sql`
      SELECT COALESCE(SUM(quantity * selling_price), 0) as inventory_value
      FROM inventory_items
      WHERE user_id = ${userId}
    `

    // Get daily sales for chart
    const dailySalesResult = await sql`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total_amount), 0) as amount
      FROM transactions
      WHERE user_id = ${userId} 
        AND transaction_type = 'sale'
        AND created_at >= ${startDate.toISOString()}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get top selling items
    const topItemsResult = await sql`
      SELECT 
        ti.item_name,
        SUM(ti.quantity) as total_quantity,
        SUM(ti.subtotal) as total_revenue
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.user_id = ${userId} 
        AND t.transaction_type = 'sale'
        AND t.created_at >= ${startDate.toISOString()}
      GROUP BY ti.item_name
      ORDER BY total_revenue DESC
      LIMIT 5
    `

    const totalSales = Number(salesResult[0].total_sales)
    const cogs = Number(cogsResult[0].cogs)
    const grossProfit = totalSales - cogs

    return {
      totalSales,
      cogs,
      grossProfit,
      transactionCount: Number(salesResult[0].transaction_count),
      lowStockCount: Number(lowStockResult[0].low_stock_count),
      inventoryValue: Number(inventoryValueResult[0].inventory_value),
      dailySales: dailySalesResult.map((row) => ({
        date: row.date,
        amount: Number(row.amount),
      })),
      topItems: topItemsResult.map((row) => ({
        name: row.item_name,
        quantity: Number(row.total_quantity),
        revenue: Number(row.total_revenue),
      })),
    }
  } catch (error) {
    console.error("[v0] Error getting dashboard stats:", error)
    throw error
  }
}

export async function getSalesReport(userId: number, startDate: Date, endDate: Date): Promise<SalesReport> {
  try {
    // Get sales data
    const salesResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales, COUNT(*) as transaction_count
      FROM transactions
      WHERE user_id = ${userId} 
        AND transaction_type = 'sale'
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
    `

    // Get expenses data
    const expensesResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total_expenses
      FROM transactions
      WHERE user_id = ${userId} 
        AND transaction_type = 'expense'
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
    `

    // Get COGS (Cost of Goods Sold)
    const cogsResult = await sql`
      SELECT COALESCE(SUM(ti.quantity * ii.cost_price), 0) as cogs
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      LEFT JOIN inventory_items ii ON ti.inventory_item_id = ii.id
      WHERE t.user_id = ${userId} 
        AND t.transaction_type = 'sale'
        AND t.created_at >= ${startDate.toISOString()}
        AND t.created_at <= ${endDate.toISOString()}
    `

    const totalSales = Number(salesResult[0].total_sales)
    const totalExpenses = Number(expensesResult[0].total_expenses)
    const cogs = Number(cogsResult[0].cogs)
    const grossProfit = totalSales - cogs
    const netProfit = grossProfit - totalExpenses

    return {
      total_sales: totalSales,
      total_expenses: totalExpenses,
      gross_profit: grossProfit,
      net_profit: netProfit,
      total_transactions: Number(salesResult[0].transaction_count),
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
    }
  } catch (error) {
    console.error("[v0] Error getting sales report:", error)
    throw error
  }
}
