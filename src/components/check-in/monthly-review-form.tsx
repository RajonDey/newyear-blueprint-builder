"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { EmptyState } from "@/components/shared/empty-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarDays,
  Loader2,
  Sparkles,
  Trophy,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

const MONTHS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
]

interface FormData {
  plan: { id: string; year: number }
  goals: { id: string; title: string; category: string; status: string }[]
  reviews: { month: number; year: number; summary: string | null; winsText: string | null; challengesText: string | null; adjustments: string | null; completedAt: Date | string }[]
}

export function MonthlyReviewForm({ data }: { data: FormData }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  
  // Default to current month based on JS local time
  const currentJsMonth = new Date().getMonth() + 1
  const [activeMonth, setActiveMonth] = useState(currentJsMonth.toString())

  const [formState, setFormState] = useState<Record<string, { summary: string; wins: string; challenges: string; adjustments: string }>>(
    () => {
      const init: Record<string, { summary: string; wins: string; challenges: string; adjustments: string }> = {}
      for (const m of MONTHS) {
        const r = data.reviews.find((x) => x.month === m.value)
        init[m.value.toString()] = {
          summary: r?.summary ?? "",
          wins: r?.winsText ?? "",
          challenges: r?.challengesText ?? "",
          adjustments: r?.adjustments ?? "",
        }
      }
      return init
    }
  )

  async function handleSubmit(monthStr: string) {
    const month = parseInt(monthStr, 10)
    const state = formState[monthStr]
    if (!state) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: data.plan.id,
          month,
          year: data.plan.year,
          summary: state.summary.trim() || undefined,
          winsText: state.wins.trim() || undefined,
          challengesText: state.challenges.trim() || undefined,
          adjustments: state.adjustments.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success(`Month ${month} review saved!`)
      router.refresh()
    } catch {
      toast.error("Failed to save")
    } finally {
      setSubmitting(false)
    }
  }

  if (data.goals.length === 0) {
    return (
      <div className="relative">
        <MandalaWatermark position="top-right" size="sm" />
        <EmptyState
          icon={CalendarDays}
          title="No plan yet"
          description="Create your yearly plan first. Monthly reviews analyze exactly how your weeks rolled up."
          action={
            <Button asChild>
              <a href="/plan/new">
                <Sparkles className="mr-2 h-4 w-4" /> Create Your Plan
              </a>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="relative w-full space-y-6">
      <MandalaWatermark position="top-right" size="sm" />

      <div>
        <h1 className="font-display text-2xl font-semibold">
          Monthly Review
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A tactical zoom-out. Look back at the last 4 weeks and reset before the quarter closes.
        </p>
      </div>

      <Tabs value={activeMonth} onValueChange={setActiveMonth}>
        <TabsList className="flex flex-wrap h-auto w-full gap-1 p-1 bg-muted/50 justify-start">
          {MONTHS.map((m) => (
            <TabsTrigger key={m.value} value={m.value.toString()} className="min-w-16">
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {MONTHS.map((m) => {
          const monthStr = m.value.toString()
          const state = formState[monthStr]
          const existing = data.reviews.find((r) => r.month === m.value)
          return (
            <TabsContent key={monthStr} value={monthStr} className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-accent" />{" "}
                    {m.label} {data.plan.year}
                  </CardTitle>
                  {existing && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5" /> Reviewed on {new Date(existing.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Summary</label>
                    <RichTextEditor
                      value={state.summary}
                      onChange={(val) =>
                        setFormState((prev) => ({
                          ...prev,
                          [monthStr]: { ...state, summary: val },
                        }))
                      }
                      placeholder="What was the dominant theme of this month?"
                      rows={2}
                      className="bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5 text-accent" /> Wins
                    </label>
                    <RichTextEditor
                      value={state.wins}
                      onChange={(val) =>
                        setFormState((prev) => ({
                          ...prev,
                          [monthStr]: { ...state, wins: val },
                        }))
                      }
                      placeholder="Celebrate the best executions of the last 4 weeks..."
                      rows={3}
                      className="bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-accent" />{" "}
                      Challenges
                    </label>
                    <RichTextEditor
                      value={state.challenges}
                      onChange={(val) =>
                        setFormState((prev) => ({
                          ...prev,
                          [monthStr]: { ...state, challenges: val },
                        }))
                      }
                      placeholder="What friction consistently showed up?"
                      rows={3}
                      className="bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5 text-accent" />{" "}
                      Adjustments
                    </label>
                    <RichTextEditor
                      value={state.adjustments}
                      onChange={(val) =>
                        setFormState((prev) => ({
                          ...prev,
                          [monthStr]: { ...state, adjustments: val },
                        }))
                      }
                      placeholder="How will you adjust heading into the next month?"
                      rows={3}
                      className="bg-card"
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit(monthStr)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trophy className="mr-2 h-4 w-4" />
                    )}
                    Save {m.label} Review
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
