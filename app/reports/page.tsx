"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Download } from "lucide-react"
import type { User, SalesReport } from "@/lib/types"
import { ReportSummary } from "@/components/reports/report-summary"
import { CategoryChart } from "@/components/reports/category-chart"
import { PaymentChart } from "@/components/reports/payment-chart"
import * as XLSX from "xlsx"

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<SalesReport | null>(null)
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [paymentData, setPaymentData] = useState<any[]>([])
  const [topSelling, setTopSelling] = useState<any[]>([])

  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0])

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      generateReport()
    }
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Fetch user error:", error)
    }
  }

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates")
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(`${endDate}T23:59:59`).toISOString(),
      })

      const [reportRes, categoryRes, paymentRes, topSellingRes] = await Promise.all([
        fetch(`/api/reports/sales?${params}`),
        fetch(`/api/reports/category-sales?${params}`),
        fetch(`/api/reports/payment-methods?${params}`),
        fetch(`/api/reports/top-selling-items?${params}`),
      ])

      if (reportRes.ok) {
        setReport(await reportRes.json())
      }
      if (categoryRes.ok) {
        setCategoryData(await categoryRes.json())
      }
      if (paymentRes.ok) {
        setPaymentData(await paymentRes.json())
      }
      if (topSellingRes.ok) {
        setTopSelling(await topSellingRes.json())
      }
    } catch (error) {
      console.error("Generate report error:", error)
      alert("An error occurred while generating the report.")
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!report) return

    // Create a new workbook
    const wb = XLSX.utils.book_new()
    
    // Currency format for peso
    const currencyFormat = '₱#,##0.00'
    
    // Build single sheet with all sections
    let currentRow = 0
    const sheetData: any[][] = []
    
    // === HEADER SECTION ===
    sheetData.push(['SALES REPORT'])
    sheetData.push([])
    sheetData.push(['Report Period:', `${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}`])
    sheetData.push(['Generated On:', new Date().toLocaleString()])
    sheetData.push([])
    sheetData.push([])
    
    // === SUMMARY SECTION ===
    const summaryStartRow = sheetData.length
    sheetData.push(['SUMMARY'])
    sheetData.push([])
    sheetData.push(['Metric', 'Amount'])
    sheetData.push(['Total Sales', report.total_sales])
    sheetData.push(['Gross Profit', report.gross_profit])
    sheetData.push(['Net Profit', report.net_profit])
    sheetData.push(['Total Transactions', report.total_transactions])
    sheetData.push([])
    sheetData.push([])
    
    // === TOP SELLING ITEMS SECTION ===
    const topSellingStartRow = sheetData.length
    sheetData.push(['TOP SELLING ITEMS'])
    sheetData.push([])
    sheetData.push(['Item Name', 'Quantity Sold', 'Revenue'])
    const topSellingDataStartRow = sheetData.length
    topSelling.forEach((item) => {
      sheetData.push([
        item.name,
        Number(item.total_quantity),
        Number(item.total_revenue)
      ])
    })
    if (topSelling.length === 0) {
      sheetData.push(['No data available', '', ''])
    }
    sheetData.push([])
    sheetData.push([])
    
    // === CATEGORY SALES SECTION ===
    const categoryStartRow = sheetData.length
    sheetData.push(['SALES BY CATEGORY'])
    sheetData.push([])
    sheetData.push(['Category', 'Quantity', 'Revenue'])
    const categoryDataStartRow = sheetData.length
    categoryData.forEach((item) => {
      sheetData.push([
        item.category,
        Number(item.total_quantity),
        Number(item.total_revenue)
      ])
    })
    if (categoryData.length === 0) {
      sheetData.push(['No data available', '', ''])
    }
    sheetData.push([])
    sheetData.push([])
    
    // === PAYMENT METHODS SECTION ===
    const paymentStartRow = sheetData.length
    sheetData.push(['PAYMENT METHODS'])
    sheetData.push([])
    sheetData.push(['Payment Method', 'Transactions', 'Amount'])
    const paymentDataStartRow = sheetData.length
    paymentData.forEach((item) => {
      sheetData.push([
        (item.payment_method || 'N/A').toUpperCase(),
        Number(item.transaction_count),
        Number(item.total_amount)
      ])
    })
    if (paymentData.length === 0) {
      sheetData.push(['No data available', '', ''])
    }
    
    // Create worksheet from data
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    
    // Set column widths for proper alignment
    ws['!cols'] = [
      { wch: 30 }, // Column A - Labels/Names
      { wch: 18 }, // Column B - Quantities/Amounts
      { wch: 18 }, // Column C - Revenue/Amount
    ]
    
    // Apply currency formatting to Summary section (Amount column)
    const summaryAmountRows = [summaryStartRow + 3, summaryStartRow + 4, summaryStartRow + 5] // Total Sales, Gross Profit, Net Profit
    summaryAmountRows.forEach(row => {
      const cellRef = `B${row + 1}`
      if (ws[cellRef]) ws[cellRef].z = currencyFormat
    })
    
    // Apply currency formatting to Top Selling Items (Revenue column C)
    topSelling.forEach((_, index) => {
      const cellRef = `C${topSellingDataStartRow + index + 1}`
      if (ws[cellRef]) ws[cellRef].z = currencyFormat
    })
    
    // Apply currency formatting to Category Sales (Revenue column C)
    categoryData.forEach((_, index) => {
      const cellRef = `C${categoryDataStartRow + index + 1}`
      if (ws[cellRef]) ws[cellRef].z = currencyFormat
    })
    
    // Apply currency formatting to Payment Methods (Amount column C)
    paymentData.forEach((_, index) => {
      const cellRef = `C${paymentDataStartRow + index + 1}`
      if (ws[cellRef]) ws[cellRef].z = currencyFormat
    })
    
    // Add the sheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report')

    // Generate and download the file
    XLSX.writeFile(wb, `sales-report-${startDate}-to-${endDate}.xlsx`)
  }

  if (!user) return null

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Sales Reports</h1>
                <p className="text-gray-600 text-sm lg:text-base mt-1">
                  Analyze your sales performance and view your top-selling items.
                </p>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Generate Report</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Select a date range to view detailed sales analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="flex items-end gap-2 flex-wrap">
                  <Button onClick={generateReport} disabled={loading} className="h-11 bg-emerald-600 hover:bg-emerald-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    {loading ? "Generating..." : "Generate"}
                  </Button>
                  {report && (
                    <Button
                      variant="outline"
                      onClick={exportReport}
                      className="h-11 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Summary & Charts */}
          {report && (
            <>
              <ReportSummary report={report} />

              {/* Top Selling Items */}
              {topSelling.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Top Selling Items</CardTitle>
                    <CardDescription>Most sold products for the selected date range.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left border border-gray-200">
                        <thead className="bg-gray-100 text-gray-700">
                          <tr>
                            <th className="px-4 py-2 border-b">Product</th>
                            <th className="px-4 py-2 border-b">Quantity Sold</th>
                            <th className="px-4 py-2 border-b">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topSelling.map((item, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{item.name}</td>
                              <td className="px-4 py-2">{item.total_quantity}</td>
                              <td className="px-4 py-2 text-emerald-600 font-medium">
                                ₱{Number(item.total_revenue).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <CategoryChart data={categoryData} />
                <PaymentChart data={paymentData} />
              </div>
            </>
          )}

          {/* Empty State */}
          {!report && !loading && (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-base">Select a date range and click “Generate” to view your sales report.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </SidebarProvider>
  )
}
