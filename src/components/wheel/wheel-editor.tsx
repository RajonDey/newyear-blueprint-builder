"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { ChartContainer } from "@/components/charts/chart-container"
import { ArrowDownRight, ArrowUpRight, Minus, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import type { LifeCategory } from "@prisma/client"
import {
  lifeCategoryHints,
  lifeCategoryLabels,
  lifeCategoryOrder,
} from "@/lib/level-styles"
import {
  axisDefaults,
  chartColors,
  gridDefaults,
} from "@/lib/charts-theme"
import { cn } from "@/lib/utils"
import type { WheelSnapshot } from "@/lib/queries/wheel"

interface WheelEditorProps {
  planId: string
  planYear: number
  latest: WheelSnapshot | null
  previous: WheelSnapshot | null
  history: WheelSnapshot[]
}

const STARTER_SCORES: Record<LifeCategory, number> = {
  HEALTH: 5,
  CAREER: 5,
  FINANCE: 5,
  RELATIONSHIPS: 5,
  SPIRITUALITY: 5,
  PASSION: 5,
}

export function WheelEditor({
  planId,
  planYear,
  latest,
  previous,
  history,
}: WheelEditorProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [scores, setScores] = useState<Record<LifeCategory, number>>(
    latest?.scores && latest.average > 0 ? latest.scores : STARTER_SCORES,
  )
  const [saving, setSaving] = useState(false)

  const previousScores = previous?.scores ?? null

  const chartData = useMemo(
    () =>
      lifeCategoryOrder.map((c) => ({
        category: lifeCategoryLabels[c],
        current: scores[c],
        previous: previousScores?.[c] ?? 0,
      })),
    [scores, previousScores],
  )

  const avg = useMemo(() => {
    const total = lifeCategoryOrder.reduce((s, c) => s + scores[c], 0)
    return Math.round((total / lifeCategoryOrder.length) * 10) / 10
  }, [scores])

  const highest = useMemo(
    () =>
      lifeCategoryOrder.reduce((a, b) => (scores[a] >= scores[b] ? a : b)),
    [scores],
  )
  const lowest = useMemo(
    () =>
      lifeCategoryOrder.reduce((a, b) => (scores[a] <= scores[b] ? a : b)),
    [scores],
  )

  const dirty = useMemo(() => {
    if (!latest) return true
    return lifeCategoryOrder.some((c) => latest.scores[c] !== scores[c])
  }, [latest, scores])

  async function save(mode: "create" | "update" = "create") {
    if (saving) return
    setSaving(true)
    try {
      const method = mode === "update" ? "PATCH" : "POST"
      const res = await fetch("/api/wheel", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          entries: lifeCategoryOrder.map((c) => ({
            category: c,
            rating: scores[c],
          })),
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.error || "Could not save snapshot.")
        return
      }
      startTransition(() => router.refresh())
    } catch (err) {
      console.error(err)
      toast.error("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    if (latest) {
      setScores(latest.scores)
    } else {
      setScores(STARTER_SCORES)
    }
  }

  return (
    <>
      <section className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 border border-border p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl tracking-tight">
              Current vs previous snapshot
            </h2>
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber" /> Current
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-foreground/30" />
                {previous ? "Previous" : "—"}
              </span>
            </div>
          </div>
          <ChartContainer height={320}>
            <RadarChart data={chartData} outerRadius="78%">
                <PolarGrid {...gridDefaults} />
                <PolarAngleAxis
                  dataKey="category"
                  tick={axisDefaults.tick}
                  tickLine={false}
                />
                <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                {previousScores && (
                  <Radar
                    dataKey="previous"
                    stroke={chartColors.ink}
                    fill={chartColors.ink}
                    fillOpacity={0.06}
                    strokeOpacity={0.35}
                    strokeWidth={1.5}
                  />
                )}
                <Radar
                  dataKey="current"
                  stroke={chartColors.amber}
                  fill={chartColors.amber}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
            </RadarChart>
          </ChartContainer>
        </div>

        <aside className="lg:col-span-2 grid gap-0 border border-border divide-y divide-border lg:self-start">
          <SnapshotCard
            label="Average"
            value={avg.toFixed(1)}
            hint={`${planYear} · ${lifeCategoryOrder.length} categories`}
          />
          <SnapshotCard
            label="Strongest"
            value={lifeCategoryLabels[highest]}
            hint={`${scores[highest]}/10 — keep feeding it`}
            tone="up"
          />
          <SnapshotCard
            label="Quietest"
            value={lifeCategoryLabels[lowest]}
            hint={`${scores[lowest]}/10 — likely your highest-leverage move`}
            tone="down"
          />
        </aside>
      </section>

      <section className="border border-border p-6">
        <div className="mb-5">
          <h2 className="font-display text-xl tracking-tight">
            Re-rate each category
          </h2>
          <p className="text-sm text-muted-foreground">
            Slide. Don&apos;t overthink. Each category maps to a life Area in{" "}
            <Link
              href="/areas"
              className="text-foreground underline-offset-2 hover:underline"
            >
              Plan
            </Link>
            — honest beats clever.
          </p>
        </div>
        <ul className="grid md:grid-cols-2 gap-x-8 gap-y-5">
          {lifeCategoryOrder.map((c) => {
            const meta = lifeCategoryHints[c]
            const previousValue = previousScores?.[c] ?? null
            const delta = previousValue !== null ? scores[c] - previousValue : null
            return (
              <li key={c}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <div>
                    <div className="text-sm font-medium">
                      {lifeCategoryLabels[c]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {meta.hint}
                    </div>
                  </div>
                  <div className="text-sm tabular-nums">
                    <span className="font-semibold">{scores[c]}</span>
                    <span className="text-muted-foreground">/10</span>
                    {delta !== null && <DeltaBadge delta={delta} />}
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={scores[c]}
                  onChange={(e) =>
                    setScores((s) => ({ ...s, [c]: Number(e.target.value) }))
                  }
                  className="w-full accent-amber"
                />
                <div className="text-[11px] text-muted-foreground mt-1">
                  {meta.example}
                </div>
              </li>
            )
          })}
        </ul>
        <div className="flex flex-wrap items-center justify-end gap-3 pt-5 mt-5 border-t border-border">
          <button
            onClick={reset}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {latest ? "Reset to last snapshot" : "Reset to 5/10"}
          </button>
          {latest && (
            <button
              onClick={() => save("update")}
              disabled={saving || !dirty}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline-offset-2 hover:underline"
              title={`Overwrite the snapshot from ${format(latest.recordedAt, "MMM d, yyyy")}`}
            >
              Update last snapshot
            </button>
          )}
          <button
            onClick={() => save("create")}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Sparkles className="h-4 w-4" />{" "}
            {saving ? "Saving…" : "Save snapshot"}
          </button>
        </div>
      </section>

      <section className="border border-border p-6">
        <h2 className="font-display text-xl mb-1 tracking-tight">History</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Each row is a snapshot you saved. The bar fills with the rating.
        </p>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No history yet — your first snapshot will land here.
          </p>
        ) : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-36">
                    Snapshot
                  </th>
                  {lifeCategoryOrder.map((c) => (
                    <th
                      key={c}
                      className="px-2 py-2.5 text-center text-xs font-medium text-muted-foreground"
                    >
                      {lifeCategoryLabels[c].slice(0, 4)}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground w-16">
                    Avg
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...history].reverse().map((h) => (
                  <tr key={h.bucketKey}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {format(h.recordedAt, "MMM d, yyyy")}
                      </div>
                      {h.note && (
                        <div className="text-xs text-muted-foreground italic line-clamp-1">
                          {h.note}
                        </div>
                      )}
                    </td>
                    {lifeCategoryOrder.map((c) => (
                      <td key={c} className="px-2 py-3">
                        <ScoreBar value={h.scores[c]} />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {h.average.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

function SnapshotCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone?: "up" | "down"
}) {
  return (
    <div className="p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-1.5 leading-tight tracking-tight">
        {value}
      </div>
      {hint && (
        <div
          className={cn(
            "text-xs mt-2",
            tone === "up"
              ? "text-status-positive"
              : tone === "down"
                ? "text-amber"
                : "text-muted-foreground",
          )}
        >
          {hint}
        </div>
      )}
    </div>
  )
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="ml-2 inline-flex items-center text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
      </span>
    )
  }
  const up = delta > 0
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center text-xs",
        up ? "text-status-positive" : "text-status-risk",
      )}
    >
      {up ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(delta)}
    </span>
  )
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-amber"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground w-5 text-right">
        {value}
      </span>
    </div>
  )
}
