import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TopItem {
  name: string
  quantity: number
  revenue: number
}

interface TopItemsTableProps {
  items: TopItem[]
}

export function TopItemsTable({ items }: TopItemsTableProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Top Selling Items</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Best performing products in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <Table className="min-w-[400px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Item</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Qty Sold</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground text-xs sm:text-sm">
                    No sales data available
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-xs sm:text-sm">{item.name}</TableCell>
                    <TableCell className="text-right text-xs sm:text-sm">{item.quantity}</TableCell>
                    <TableCell className="text-right text-xs sm:text-sm">₱{item.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
