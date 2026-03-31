"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Loader2, Plus, Zap } from "lucide-react"
import { toast } from "sonner"
import type { LifeCategory } from "@prisma/client"

export function QuickStartGoal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<LifeCategory>("HEALTH")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/goals/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), category }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Failed to create goal")
      }

      const json = await res.json()
      toast.success("Goal created!")
      router.push(`/goals/${json.data.goalId}`)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-accent/30 p-6 text-center transition-colors hover:border-accent/60 hover:bg-accent/5"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <p className="text-sm font-semibold">Quick-start a goal</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Skip the full wizard. Create one goal now and add details later.
          </p>
        </div>
      </button>
    )
  }

  return (
    <Card className="border-accent/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          Quick-start a goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="qs-title" className="text-sm font-medium">
              What do you want to achieve this year?
            </label>
            <Input
              id="qs-title"
              placeholder='e.g. "Run a half marathon" or "Read 24 books"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={500}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Life area</label>
            <div className="grid grid-cols-3 gap-2">
              {LIFE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition-colors ${
                    category === cat.id
                      ? "border-accent bg-accent/10 font-medium"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <cat.icon className="h-4 w-4 shrink-0" style={{ color: cat.color }} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={submitting || !title.trim()} className="gap-1.5">
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><Plus className="h-4 w-4" /> Create goal</>
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
