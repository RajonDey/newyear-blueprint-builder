import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

export function IcebreakerUpsell() {
  return (
    <Card className="h-full border-dashed bg-muted/30 flex flex-col justify-center items-center text-center p-8 min-h-[400px]">
      <div className="h-16 w-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
        <Sparkles className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-display font-semibold mb-2">Great start on your baseline!</h3>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Now that you know where you stand, let's set some goals to improve your lowest scores and design your year.
      </p>
      <Button asChild size="lg" className="px-8 shadow-sm group">
        <Link href="/plan/new">
          Complete Your Yearly Plan
          <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </Card>
  )
}
