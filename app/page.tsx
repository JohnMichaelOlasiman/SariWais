import { Button } from "@/components/ui/button"
import { Store, BarChart3, Package, Receipt } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 animate-scale-in">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-balance">SariWais Store Management</h1>
          <p className="text-xl text-muted-foreground max-w-2xl text-pretty">
            The complete solution for managing your Sari-Sari store. Track inventory, record sales, and grow your
            business with ease.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24 animate-fade-in-up">
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg bg-card border">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Inventory Management</h3>
            <p className="text-muted-foreground">
              Track stock levels, set reorder points, and never run out of popular items.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg bg-card border">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10">
              <Receipt className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Sales Recording</h3>
            <p className="text-muted-foreground">
              Record transactions quickly and accurately with an intuitive interface.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg bg-card border">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Analytics & Reports</h3>
            <p className="text-muted-foreground">
              Get insights into your business with detailed sales reports and profit analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
