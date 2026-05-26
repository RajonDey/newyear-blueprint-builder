"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Archive,
  ArrowRight,
  Calendar,
  Loader2,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { YearlyPlanSettingsData } from "@/lib/queries/yearly-plan"

const THEME_SUGGESTIONS = [
  "Momentum",
  "Foundations",
  "Depth",
  "Lightness",
  "Return",
  "Build",
]

type YearSettingsSectionProps = {
  data: YearlyPlanSettingsData
}

export function YearSettingsSection({ data }: YearSettingsSectionProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [theme, setTheme] = useState(data.activePlan?.theme ?? "")
  const [savingTheme, setSavingTheme] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [newYearOpen, setNewYearOpen] = useState(false)
  const [newYear, setNewYear] = useState(String(new Date().getFullYear() + 1))
  const [newTheme, setNewTheme] = useState("")
  const [creating, setCreating] = useState(false)

  const isPro = data.planTier === "PRO"
  const active = data.activePlan

  async function saveTheme() {
    if (!active) return
    const trimmed = theme.trim()
    if (!trimmed) {
      toast.error("Theme can't be empty")
      return
    }
    setSavingTheme(true)
    try {
      const res = await fetch(`/api/yearly-plan/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: trimmed }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Failed to save theme")
      }
      toast.success("Year theme updated")
      startTransition(() => router.refresh())
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save theme")
    } finally {
      setSavingTheme(false)
    }
  }

  async function archiveYear() {
    if (!active) return
    setArchiving(true)
    try {
      const res = await fetch("/api/yearly-plan/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: active.id }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || json.message || "Failed to archive")
      }
      toast.success(`${active.year} archived — your data is safe in Wrapped`)
      setArchiveOpen(false)
      startTransition(() => router.refresh())
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to archive")
    } finally {
      setArchiving(false)
    }
  }

  async function startNewYear() {
    const yearNum = parseInt(newYear, 10)
    const trimmedTheme = newTheme.trim()
    if (!Number.isFinite(yearNum) || yearNum < 2000) {
      toast.error("Enter a valid year")
      return
    }
    if (!trimmedTheme) {
      toast.error("Pick a theme word for the new year")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/yearly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: yearNum, theme: trimmedTheme }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.status === 402) {
        toast.error(json.message || "Upgrade to start another year")
        return
      }
      if (!res.ok) {
        throw new Error(json.message || json.error || "Failed to create year")
      }
      toast.success(`${yearNum} is live — theme: ${trimmedTheme}`)
      setNewYearOpen(false)
      startTransition(() => {
        router.push("/dashboard")
        router.refresh()
      })
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create year")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-5">
      {active ? (
        <>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Active year
                </div>
                <div className="font-display text-3xl tabular-nums tracking-tight mt-1">
                  {active.year}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {active.activeProjectCount === 0
                    ? "No open projects — a clean slate or time to archive."
                    : `${active.activeProjectCount} open project${
                        active.activeProjectCount === 1 ? "" : "s"
                      } on this plan.`}
                </p>
              </div>
              <Link
                href="/wrapped"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View Wrapped
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="year-theme"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Theme word
                </Label>
                <Input
                  id="year-theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="One word for the year"
                  maxLength={50}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {THEME_SUGGESTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
                      theme === t
                        ? "border-amber/50 bg-amber/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-amber/30"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={saveTheme}
                disabled={savingTheme || theme.trim() === (active.theme ?? "")}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {savingTheme && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save theme
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-5">
            <h3 className="text-sm font-medium">Archive this year</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Marks {active.year} as read-only. Your projects, check-ins, and
              Wrapped stay available. You&apos;ll need to start a new year to
              plan again.
            </p>
            {active.activeProjectCount > 0 && (
              <p className="text-xs text-amber mt-2">
                You still have {active.activeProjectCount} open project
                {active.activeProjectCount === 1 ? "" : "s"} — finish or pause
                them before archiving if you want a clean close.
              </p>
            )}
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              <Archive className="h-3.5 w-3.5" />
              Archive {active.year}
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-5">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            No active year
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Your previous year is archived. Open Wrapped to revisit it, or start
            a new year when you&apos;re ready.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/wrapped"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              View Wrapped
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {data.canCreateNewYear ? (
              <button
                type="button"
                onClick={() => {
                  setNewTheme("")
                  setNewYear(String(new Date().getFullYear()))
                  setNewYearOpen(true)
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Calendar className="h-3.5 w-3.5" />
                Start new year
              </button>
            ) : (
              <ProPlanLimitNote isPro={isPro} maxPlans={data.maxPlans} />
            )}
          </div>
        </div>
      )}

      {data.archivedPlans.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card/30 p-4">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
            Past years
          </div>
          <ul className="space-y-1.5 text-sm">
            {data.archivedPlans.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 text-muted-foreground"
              >
                <span>
                  {p.year}
                  {p.theme ? (
                    <span className="text-muted-foreground/70"> · {p.theme}</span>
                  ) : null}
                </span>
                <Link
                  href="/wrapped"
                  className="text-xs hover:text-foreground transition-colors"
                >
                  Wrapped
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Archive {active?.year}?</DialogTitle>
            <DialogDescription className="text-left pt-1">
              This closes your active year. You won&apos;t be able to add projects
              or check-ins until you start a new year. All data stays in Wrapped.
            </DialogDescription>
          </DialogHeader>
          {active && active.activeProjectCount > 0 && (
            <p className="text-xs text-amber">
              {active.activeProjectCount} open project
              {active.activeProjectCount === 1 ? "" : "s"} will remain on the
              archived plan.
            </p>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setArchiveOpen(false)}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={archiving}
              onClick={archiveYear}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              {archiving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Archive year
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newYearOpen} onOpenChange={setNewYearOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start a new year</DialogTitle>
            <DialogDescription className="text-left pt-1">
              Light setup — no full onboarding. Pick a year and theme word; your
              areas and vision carry over.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-year">Year</Label>
              <Input
                id="new-year"
                type="number"
                min={2000}
                max={2100}
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-theme">Theme word</Label>
              <Input
                id="new-theme"
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                placeholder="One word for the year"
                maxLength={50}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {THEME_SUGGESTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewTheme(t)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                      newTheme === t
                        ? "border-amber/50 bg-amber/10"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setNewYearOpen(false)}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={startNewYear}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Start year
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProPlanLimitNote({
  isPro,
  maxPlans,
}: {
  isPro: boolean
  maxPlans: number
}) {
  if (isPro) {
    return (
      <p className="text-xs text-muted-foreground">
        You&apos;ve used all {maxPlans} year slots. Archive isn&apos;t reversible
        — contact support if you need help.
      </p>
    )
  }

  return (
    <div className="rounded-xl border border-amber/30 bg-amber/[0.04] p-4 flex-1 min-w-[240px]">
      <div className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase text-amber">
        <Sparkles className="h-3 w-3" />
        Pro
      </div>
      <p className="text-sm mt-1.5 leading-relaxed">
        Free includes one year plan. Upgrade to Pro to archive and start fresh
        years while keeping your history.
      </p>
      <Link
        href="/pricing"
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium hover:underline"
      >
        See Pro plans
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
