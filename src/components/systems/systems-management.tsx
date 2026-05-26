"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Archive,
  ArchiveRestore,
  ArrowRightLeft,
  Check,
  Flame,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import type { Frequency } from "@prisma/client"
import { cn } from "@/lib/utils"
import { DAILY_HOME_LINK } from "@/lib/app-routes"
import { areaHue, areaIcon } from "@/lib/level-styles"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SystemRow, SystemsManagementData } from "@/lib/queries/systems"

interface SystemsManagementProps {
  data: SystemsManagementData
  /** Projects that can host a new system (active plan, not at cap). */
  projectOptions: { id: string; title: string }[]
  /**
   * Full project list used by the per-row "Move to project…" picker. The
   * server enforces the per-project cap on PATCH, so any project here is a
   * valid target — we just toast on rejection.
   */
  allProjects: { id: string; title: string }[]
}

type View = "list" | "grid"

const FREQUENCY_LABEL: Record<Frequency, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
}

export function SystemsManagement({
  data,
  projectOptions,
  allProjects,
}: SystemsManagementProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [view, setView] = useState<View>("list")
  const [areaFilter, setAreaFilter] = useState<string | "all">("all")
  const [showArchived, setShowArchived] = useState(false)
  const [adding, setAdding] = useState(false)

  const areas = useMemo(() => {
    const map = new Map<string, string>()
    for (const row of [...data.active, ...data.archived]) {
      if (row.project.areaId && row.project.areaName) {
        map.set(row.project.areaId, row.project.areaName)
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [data])

  const visible = useMemo(() => {
    const base = showArchived ? data.archived : data.active
    if (areaFilter === "all") return base
    return base.filter((s) => s.project.areaId === areaFilter)
  }, [data, areaFilter, showArchived])

  async function toggleArchive(row: SystemRow) {
    try {
      const res = await fetch(`/api/systems/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !row.isActive }),
      })
      if (!res.ok) {
        toast.error("Could not update system.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      toast.error("Network error.")
    }
  }

  async function destroy(row: SystemRow) {
    if (!confirm(`Delete "${row.description}"? This also clears its history.`)) {
      return
    }
    try {
      const res = await fetch(`/api/systems/${row.id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Could not delete system.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      toast.error("Network error.")
    }
  }

  async function moveToProject(row: SystemRow, projectId: string) {
    if (projectId === row.project.id) return
    try {
      const res = await fetch(`/api/systems/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        toast.error(body?.message || body?.error || "Could not move system.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      toast.error("Network error.")
    }
  }

  return (
    <>
      {(data.insights.driftingCount > 0 || data.insights.mostConsistent) && (
        <section className="grid gap-0 border border-border divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
          {data.insights.driftingCount > 0 && (
            <Insight
              tone="warn"
              text={`${data.insights.driftingCount} system${data.insights.driftingCount === 1 ? " is" : "s are"} under 50% this period.`}
            />
          )}
          {data.insights.mostConsistent && (
            <Insight
              tone="up"
              text={`${data.insights.mostConsistent.description} is your most consistent — ${data.insights.mostConsistent.pct}% recent completion.`}
            />
          )}
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <ViewBtn
            active={view === "list"}
            onClick={() => setView("list")}
            icon={<List className="h-3.5 w-3.5" />}
          >
            List
          </ViewBtn>
          <ViewBtn
            active={view === "grid"}
            onClick={() => setView("grid")}
            icon={<LayoutGrid className="h-3.5 w-3.5" />}
          >
            Grid
          </ViewBtn>
        </div>

        {areas.length > 0 && (
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="rounded-lg border border-border bg-background/60 px-2.5 py-1 text-xs"
          >
            <option value="all">All areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}

        <label className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="accent-foreground"
          />
          Show archived ({data.archived.length})
        </label>

        <button
          onClick={() => setAdding(true)}
          disabled={projectOptions.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" /> Add system
        </button>
      </div>

      {adding && (
        <AddSystemRow
          projects={projectOptions}
          onClose={() => setAdding(false)}
          onCreated={() => {
            setAdding(false)
            startTransition(() => router.refresh())
          }}
        />
      )}

      {visible.length === 0 ? (
        <div className="border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {showArchived
              ? "No archived systems."
              : "No systems here yet. Add one above — small, repeatable practices work best."}
          </p>
        </div>
      ) : view === "list" ? (
        <ListView
          rows={visible}
          allProjects={allProjects}
          onArchive={toggleArchive}
          onDelete={destroy}
          onMoveToProject={moveToProject}
        />
      ) : (
        <GridView
          rows={visible}
          allProjects={allProjects}
          onArchive={toggleArchive}
          onDelete={destroy}
          onMoveToProject={moveToProject}
        />
      )}

      <p className="text-xs text-muted-foreground">
        Systems power your{" "}
        <Link
          href={DAILY_HOME_LINK}
          className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          Dashboard Today
        </Link>{" "}
        card. Open a project to manage its systems in context.
      </p>
    </>
  )
}

function Insight({ tone, text }: { tone: "up" | "warn"; text: string }) {
  const dot = tone === "up" ? "bg-status-positive" : "bg-amber"
  return (
    <div className="flex items-start gap-3 p-4">
      <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", dot)} />
      <span className="text-sm leading-relaxed">{text}</span>
    </div>
  )
}

function ViewBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  )
}

/* ----------------------------- List view ----------------------------- */

function ListView({
  rows,
  allProjects,
  onArchive,
  onDelete,
  onMoveToProject,
}: {
  rows: SystemRow[]
  allProjects: { id: string; title: string }[]
  onArchive: (row: SystemRow) => void
  onDelete: (row: SystemRow) => void
  onMoveToProject: (row: SystemRow, projectId: string) => void
}) {
  return (
    <div className="border border-border overflow-hidden">
      {rows.map((s, i) => {
        const Icon = areaIcon[s.project.category]
        return (
          <div
            key={s.id}
            className={cn(
              "grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3",
              i > 0 && "border-t border-border",
              !s.isActive && "opacity-60",
            )}
            style={{
              borderLeft: `3px solid hsl(${areaHue[s.project.category]} / 0.55)`,
            }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Icon
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: `hsl(${areaHue[s.project.category]})` }}
                />
                <span className="text-sm font-medium truncate">
                  {s.description}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {s.project.areaName ?? s.project.category} ·{" "}
                <Link
                  href={`/projects/${s.project.id}`}
                  className="hover:text-foreground transition-colors"
                >
                  {s.project.title}
                </Link>{" "}
                · {FREQUENCY_LABEL[s.frequency]}
              </div>
            </div>

            <div className="text-right tabular-nums text-xs text-muted-foreground w-12">
              {s.consistencyPct}%
            </div>

            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground w-12 justify-end">
              {s.currentStreak > 0 && (
                <>
                  <Flame className="h-3 w-3 text-amber" />
                  <span className="tabular-nums">{s.currentStreak}</span>
                </>
              )}
            </div>

            <RowActions
              row={s}
              allProjects={allProjects}
              onArchive={() => onArchive(s)}
              onDelete={() => onDelete(s)}
              onMoveToProject={(projectId) => onMoveToProject(s, projectId)}
            />
          </div>
        )
      })}
    </div>
  )
}

/* ----------------------------- Grid view ----------------------------- */

function GridView({
  rows,
  allProjects,
  onArchive,
  onDelete,
  onMoveToProject,
}: {
  rows: SystemRow[]
  allProjects: { id: string; title: string }[]
  onArchive: (row: SystemRow) => void
  onDelete: (row: SystemRow) => void
  onMoveToProject: (row: SystemRow, projectId: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((s) => {
        const Icon = areaIcon[s.project.category]
        return (
          <article
            key={s.id}
            className={cn(
              "border border-border p-5 transition-colors hover:bg-muted/30",
              !s.isActive && "opacity-60",
            )}
            style={{
              boxShadow: `inset 3px 0 0 hsl(${areaHue[s.project.category]} / 0.55)`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `hsl(${areaHue[s.project.category]} / 0.12)`,
                  color: `hsl(${areaHue[s.project.category]})`,
                }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <RowActions
                row={s}
                allProjects={allProjects}
                onArchive={() => onArchive(s)}
                onDelete={() => onDelete(s)}
                onMoveToProject={(projectId) => onMoveToProject(s, projectId)}
              />
            </div>
            <h3 className="font-medium text-sm mt-3 leading-snug">
              {s.description}
            </h3>
            <div className="mt-1 text-xs text-muted-foreground">
              <Link
                href={`/projects/${s.project.id}`}
                className="hover:text-foreground transition-colors"
              >
                {s.project.title}
              </Link>{" "}
              · {FREQUENCY_LABEL[s.frequency]}
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="tabular-nums text-muted-foreground">
                {s.consistencyPct}% recent
              </span>
              {s.currentStreak > 0 && (
                <span className="inline-flex items-center gap-1 text-amber">
                  <Flame className="h-3 w-3" />
                  <span className="tabular-nums">{s.currentStreak}</span>
                </span>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function RowActions({
  row,
  allProjects,
  onArchive,
  onDelete,
  onMoveToProject,
}: {
  row: SystemRow
  allProjects: { id: string; title: string }[]
  onArchive: () => void
  onDelete: () => void
  onMoveToProject: (projectId: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        aria-label={row.isActive ? "Archive" : "Restore"}
        onClick={onArchive}
        className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/60 transition-colors"
      >
        {row.isActive ? (
          <Archive className="h-3.5 w-3.5" />
        ) : (
          <ArchiveRestore className="h-3.5 w-3.5" />
        )}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="More actions"
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/60 transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {allProjects.length > 1 && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Move to project…
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground">
                    Move to
                  </DropdownMenuLabel>
                  {allProjects.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onSelect={() => onMoveToProject(p.id)}
                      disabled={p.id === row.project.id}
                      className="gap-2"
                    >
                      {p.id === row.project.id ? (
                        <Check className="h-3.5 w-3.5 text-amber" />
                      ) : (
                        <span className="h-3.5 w-3.5" />
                      )}
                      <span className="truncate">{p.title}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onSelect={onDelete}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/* ----------------------------- Add row ----------------------------- */

function AddSystemRow({
  projects,
  onClose,
  onCreated,
}: {
  projects: { id: string; title: string }[]
  onClose: () => void
  onCreated: () => void
}) {
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "")
  const [frequency, setFrequency] = useState<Frequency>("DAILY")
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    const trimmed = description.trim()
    if (!trimmed || !projectId || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          description: trimmed,
          frequency,
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Could not create system.")
        return
      }
      onCreated()
    } catch (err) {
      console.error(err)
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
            if (e.key === "Escape") onClose()
          }}
          placeholder="New system (e.g. Walk 20 min)"
          className="flex-1 min-w-[200px] rounded-lg border border-border bg-background/60 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
        />
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-lg border border-border bg-background/60 px-2 py-1.5 text-sm"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
          className="rounded-lg border border-border bg-background/60 px-2 py-1.5 text-sm"
        >
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
        <button
          onClick={submit}
          disabled={!description.trim() || !projectId || submitting}
          className="rounded-lg bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
