"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Check,
  Circle,
  ListChecks,
  Sparkles,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { WeekOneChecklistData } from "@/lib/queries/week-one-checklist"

function shortcutLabel() {
  if (typeof navigator !== "undefined" && /Mac/i.test(navigator.platform)) {
    return "⌘K"
  }
  return "Ctrl+K"
}

export function WeekOneChecklistCard({
  initial,
}: {
  initial: WeekOneChecklistData
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [hidden, setHidden] = useState(!initial.show)
  const [dismissing, setDismissing] = useState(false)

  if (hidden || !initial.show || initial.steps.length === 0) return null

  const { steps, completedCount, totalCount } = initial
  const allDone = completedCount === totalCount

  async function dismiss() {
    setDismissing(true)
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismissWeekOneChecklist: true }),
      })
      if (!res.ok) throw new Error("Failed")
      setHidden(true)
      toast.success("Checklist hidden — you're in the flow.")
      startTransition(() => router.refresh())
    } catch {
      toast.error("Could not hide checklist. Try again.")
      setDismissing(false)
    }
  }

  function openQuickCapture() {
    window.dispatchEvent(new CustomEvent("yir:quick-capture:open"))
  }

  return (
    <section className="rounded-2xl border border-amber/25 bg-gradient-to-br from-amber/[0.06] to-card p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber mb-1.5">
            <Sparkles className="h-3 w-3" />
            Your first week
          </div>
          <h2 className="font-display text-xl md:text-2xl tracking-tight">
            {allDone ? "Week-one path complete" : "Start with Today — the rest can wait"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {allDone
              ? "You've touched the main surfaces. Dismiss when you're ready to fly solo."
              : "Onboarding gave you one project and a daily move. These five steps open the rest without overwhelm."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void dismiss()}
          disabled={dismissing}
          aria-label="Dismiss checklist"
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-amber transition-all duration-300"
            style={{
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground shrink-0">
          {completedCount}/{totalCount}
        </span>
      </div>

      <ul className="space-y-2">
        {steps.map((step) => {
          const rowClass = cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
            step.done
              ? "border-border/60 bg-background/40 opacity-80"
              : "border-border bg-background/60 hover:bg-muted/30",
          )

          const icon = step.done ? (
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber text-background">
              <Check className="h-3 w-3" />
            </span>
          ) : (
            <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40 mt-0.5" />
          )

          const body = (
            <>
              {icon}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-medium",
                    step.done && "line-through decoration-muted-foreground/50",
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {step.id === "captureThought" && !step.done
                    ? step.hint.replace("⌘K (Ctrl+K)", shortcutLabel())
                    : step.hint}
                </p>
                {step.progress && !step.done ? (
                  <p className="text-[11px] text-amber mt-1 tabular-nums">
                    {step.progress}
                  </p>
                ) : null}
              </div>
              {!step.done && (
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              )}
            </>
          )

          if (step.action === "quickCapture" && !step.done) {
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={openQuickCapture}
                  className={cn(rowClass, "w-full text-left")}
                >
                  {body}
                </button>
              </li>
            )
          }

          if (step.href && !step.done) {
            return (
              <li key={step.id}>
                <Link href={step.href} className={rowClass}>
                  {body}
                </Link>
              </li>
            )
          }

          return (
            <li key={step.id} className={rowClass}>
              {body}
            </li>
          )
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5" />
          Auto-checks as you go — no manual ticking
        </span>
        <button
          type="button"
          onClick={() => void dismiss()}
          disabled={dismissing}
          className="hover:text-foreground transition-colors"
        >
          Dismiss checklist
        </button>
      </div>
    </section>
  )
}
