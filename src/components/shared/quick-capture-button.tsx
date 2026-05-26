"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createProjectTask } from "@/lib/tasks/create-task"
import {
  ArrowRight,
  Ban,
  BarChart3,
  Brain,
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  Compass,
  ExternalLink,
  FileText,
  Gift,
  Inbox,
  Layers,
  LayoutDashboard,
  ListChecks,
  Loader2,
  Plus,
  Repeat,
  Search,
  Settings,
  Sparkle,
  Target,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DAILY_HOME_HREF } from "@/lib/app-routes"
import type { SearchResponse, SearchResultItem } from "@/lib/queries/search"

const DRAFT_KEY = "yir.quick-capture.draft"

type Area = { id: string; name: string; category: string }
type Project = { id: string; title: string; category: string; areaId: string | null }
type RecentDrift = { id: string; content: string; createdAt: string }
type Ctx = { areas: Area[]; projects: Project[]; recentDrifts: RecentDrift[] }
type DialogMode = "capture" | "palette" | "search"

/**
 * ⌘K Quick Capture — hybrid capture + command palette.
 *
 * Two surfaces in one dialog:
 *
 * 1. **Capture mode (default)** — textarea modal. Type a thought, Enter
 *    or ⌘Enter saves it to the Drift inbox. Drafts persist in localStorage
 *    so a refresh doesn't lose work-in-progress.
 *
 * 2. **Palette mode (`/` from the textarea, or button)** — cmdk command
 *    palette with "Jump to" (areas / projects / drifts / pages) and
 *    "Create" (new task in project) groups, ported from the YIR design.
 *    Switching modes never destroys the capture draft.
 *
 * Triggered by:
 *   - Clicking the "Quick capture" pill in the topbar
 *   - Keyboard shortcut: ⌘K / Ctrl+K (capture by default;
 *     ⌘⇧K / Ctrl+Shift+K jumps straight into palette mode)
 *   - `window.dispatchEvent(new CustomEvent("yir:quick-capture:open"))`
 *   - `window.dispatchEvent(new CustomEvent("yir:search:open"))` — global search
 *
 * After save (capture mode):
 *   - Drift inbox count updates via `router.refresh()` so the dashboard
 *     pill re-renders without a full reload.
 */
export function QuickCaptureButton() {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<DialogMode>("capture")
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [ctx, setCtx] = useState<Ctx | null>(null)
  const [ctxLoaded, setCtxLoaded] = useState(false)
  const [taskPickerOpen, setTaskPickerOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    function onSearchOpen() {
      setSearchQuery("")
      setSearchResults(null)
      setMode("search")
      setOpen(true)
    }
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const inField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      const k = e.key.toLowerCase()
      if (k === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setMode(e.shiftKey ? "palette" : "capture")
        setOpen(true)
        return
      }
      if (e.key === "/" && !inField && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        onSearchOpen()
      }
    }
    function onOpen(ev: Event) {
      const detail = (ev as CustomEvent<{ mode?: "capture" | "palette" }>).detail
      setMode(detail?.mode === "palette" ? "palette" : "capture")
      setOpen(true)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("yir:quick-capture:open", onOpen)
    window.addEventListener("yir:search:open", onSearchOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("yir:quick-capture:open", onOpen)
      window.removeEventListener("yir:search:open", onSearchOpen)
    }
  }, [])

  useEffect(() => {
    if (!open || mode !== "search") return

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`,
          { signal: controller.signal },
        )
        const body = await res.json().catch(() => null)
        if (!res.ok) {
          if (res.status === 429) {
            toast.error("Search is moving too fast — pause a moment.")
          }
          return
        }
        if (body?.data) setSearchResults(body.data as SearchResponse)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
      } finally {
        setSearchLoading(false)
      }
    }, 250)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [open, mode, searchQuery])

  useEffect(() => {
    if (!open || mode !== "capture") return
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) setDraft(saved)
    } catch {
      // localStorage unavailable; silent fallback
    }
  }, [open, mode])

  const ensureCtx = useCallback(async () => {
    if (ctxLoaded) return
    try {
      const res = await fetch("/api/quick-capture/context")
      const body = await res.json().catch(() => null)
      if (res.ok && body?.data) setCtx(body.data as Ctx)
    } catch {
      // best-effort — palette still works for "Jump to pages"
    } finally {
      setCtxLoaded(true)
    }
  }, [ctxLoaded])

  useEffect(() => {
    if (open && mode === "palette") {
      void ensureCtx()
    }
  }, [open, mode, ensureCtx])

  function persistDraft(next: string) {
    setDraft(next)
    try {
      localStorage.setItem(DRAFT_KEY, next)
    } catch {
      // ignore
    }
  }

  function closeAll() {
    setOpen(false)
    setTaskPickerOpen(false)
  }

  function go(path: string) {
    closeAll()
    router.push(path)
  }

  async function saveCapture() {
    const trimmed = draft.trim()
    if (!trimmed) {
      closeAll()
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/drifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        toast.error(body?.message || body?.error || "Could not save.")
        return
      }
      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        // ignore
      }
      setDraft("")
      closeAll()
      toast.success("Captured", {
        description: "Find it in your Drift inbox to organise later.",
      })
      startTransition(() => router.refresh())
    } catch (err) {
      console.error(err)
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMode("capture")
          setOpen(true)
        }}
        aria-label="Open quick capture (Cmd+K)"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-md border border-border/70 bg-background/40 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground md:h-auto md:w-auto md:px-2.5 md:py-1"
      >
        <Brain className="h-4 w-4 md:hidden" />
        <span className="hidden md:inline">Quick capture</span>
        <kbd className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wider md:inline">
          ⌘K
        </kbd>
      </button>

      {/* ── CAPTURE MODE ─────────────────────────────────────────────── */}
      <Dialog
        open={open && mode === "capture"}
        onOpenChange={(o) => (o ? setOpen(true) : closeAll())}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Brain className="h-4 w-4 text-amber" />
              Quick capture
            </DialogTitle>
            <DialogDescription>
              Park a thought, win, or worry. It lands in your Drift inbox — promote it
              later. Type{" "}
              <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                /
              </kbd>{" "}
              to jump or run a command instead.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            autoFocus
            value={draft}
            onChange={(e) => {
              const next = e.target.value
              if (next.startsWith("/") && !next.includes("\n")) {
                setMode("palette")
                return
              }
              persistDraft(next)
            }}
            placeholder="What needs out of your head?  ( / to jump )"
            className="min-h-[140px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                saveCapture()
              }
            }}
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMode("palette")}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Switch to palette
              <ArrowRight className="h-3 w-3" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                ⌘ Enter to save
              </span>
              <Button variant="ghost" onClick={closeAll}>
                Cancel
              </Button>
              <Button onClick={saveCapture} disabled={!draft.trim() || submitting}>
                {submitting ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── PALETTE MODE ─────────────────────────────────────────────── */}
      <CommandDialog
        open={open && mode === "palette"}
        onOpenChange={(o) => (o ? setOpen(true) : closeAll())}
        title="Quick capture palette"
        description="Search areas, projects, drifts, and pages. Run commands like 'new task'. Use arrow keys to navigate, Enter to select, Escape to close."
      >
        <CommandInput placeholder="Jump to area, project, drift — or type to search…" />
        <CommandList>
          <CommandEmpty>Nothing matches. Press Esc and use ⌘K to capture.</CommandEmpty>

          <CommandGroup heading="Create">
            <CommandItem
              value="new task project"
              onSelect={() => {
                setTaskPickerOpen(true)
              }}
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              New task in project…
            </CommandItem>
            <CommandItem
              value="new drift thought capture"
              onSelect={() => setMode("capture")}
            >
              <Brain className="h-3.5 w-3.5 text-muted-foreground" />
              Capture a thought (Drift)
            </CommandItem>
            <CommandItem
              value="search notes knowledge"
              onSelect={() => {
                setSearchQuery("")
                setSearchResults(null)
                setMode("search")
              }}
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Search notes…
            </CommandItem>
            <CommandItem
              value="open inbox drifts"
              onSelect={() => go("/drifts")}
            >
              <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
              Open Drift inbox
            </CommandItem>
          </CommandGroup>

          {ctx && ctx.areas.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Areas">
                {ctx.areas.slice(0, 12).map((a) => (
                  <CommandItem
                    key={a.id}
                    value={`area ${a.name}`}
                    onSelect={() => go(`/areas/${a.id}`)}
                  >
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    {a.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {ctx && ctx.projects.length > 0 && (
            <CommandGroup heading="Projects">
              {ctx.projects.slice(0, 12).map((p) => {
                const area = ctx.areas.find((a) => a.id === p.areaId)
                return (
                  <CommandItem
                    key={p.id}
                    value={`project ${p.title} ${area?.name ?? ""}`}
                    onSelect={() => go(`/projects/${p.id}`)}
                  >
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{p.title}</span>
                    {area?.name && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {area.name}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}

          {ctx && ctx.recentDrifts.length > 0 && (
            <CommandGroup heading="Recent drifts">
              {ctx.recentDrifts.map((d) => (
                <CommandItem
                  key={d.id}
                  value={`drift ${d.content}`}
                  onSelect={() => go(`/drifts?focus=${d.id}`)}
                >
                  <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{d.content.slice(0, 80)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading="Pages">
            <PageRow icon={LayoutDashboard} label="Dashboard" href="/dashboard" go={go} />
            <PageRow icon={Compass} label="Wheel of Life" href="/wheel" go={go} />
            <PageRow icon={Sparkle} label="Vision" href="/vision" go={go} />
            <PageRow icon={Layers} label="Areas" href="/areas" go={go} />
            <PageRow icon={Target} label="Projects" href="/projects" go={go} />
            <PageRow icon={CheckSquare} label="Tasks" href="/tasks" go={go} />
            <PageRow icon={Repeat} label="Systems" href="/systems" go={go} />
            <PageRow icon={Ban} label="Anti-goals" href="/anti-goals" go={go} />
            <PageRow icon={Inbox} label="Drift inbox" href="/drifts" go={go} />
            <PageRow icon={FileText} label="All notes" href="/knowledge/notes" go={go} />
            <PageRow icon={ExternalLink} label="All resources" href="/knowledge/resources" go={go} />
            <PageRow icon={ListChecks} label="Today" href={DAILY_HOME_HREF} go={go} />
            <PageRow icon={CalendarCheck} label="Weekly review" href="/rhythm/weekly" go={go} />
            <PageRow icon={CalendarDays} label="Monthly review" href="/rhythm/monthly" go={go} />
            <PageRow icon={BarChart3} label="Analytics" href="/analytics" go={go} />
            <PageRow icon={Gift} label="Wrapped" href="/wrapped" go={go} />
            <PageRow icon={Settings} label="Settings" href="/settings" go={go} />
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* ── SEARCH MODE ──────────────────────────────────────────────── */}
      <CommandDialog
        open={open && mode === "search"}
        onOpenChange={(o) => (o ? setOpen(true) : closeAll())}
        shouldFilter={false}
        commandValue={searchQuery}
        onCommandValueChange={setSearchQuery}
        title="Search your year"
        description="Find projects, tasks, notes, drifts, and areas across your plan."
      >
        <CommandInput placeholder="Search projects, tasks, notes…" />
        <CommandList>
          {searchLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          ) : (
            <>
              {!searchQuery.trim() && (
                <>
                  <CommandGroup heading="Quick actions">
                    <CommandItem
                      value="action capture thought"
                      onSelect={() => setMode("capture")}
                    >
                      <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                      Capture a thought (Drift)
                    </CommandItem>
                    <CommandItem
                      value="action weekly plan"
                      onSelect={() => go("/rhythm/weekly?tab=plan")}
                    >
                      <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      Set this week&apos;s plan
                    </CommandItem>
                    <CommandItem
                      value="action browse notes index"
                      onSelect={() => go("/knowledge/notes")}
                    >
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      Browse all notes
                    </CommandItem>
                    <CommandItem
                      value="action browse resources index"
                      onSelect={() => go("/knowledge/resources")}
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      Browse all resources
                    </CommandItem>
                    <CommandItem
                      value="action open palette"
                      onSelect={() => setMode("palette")}
                    >
                      <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                      Open command palette
                    </CommandItem>
                  </CommandGroup>
                  {searchResults?.groups.map((group) => (
                    <SearchResultGroup
                      key={group.type}
                      group={group}
                      go={go}
                    />
                  ))}
                </>
              )}

              {searchQuery.trim() &&
                searchResults?.groups.map((group) => (
                  <SearchResultGroup key={group.type} group={group} go={go} />
                ))}

              {searchQuery.trim() &&
                !searchLoading &&
                (searchResults?.groups.length ?? 0) === 0 && (
                  <CommandEmpty>
                    No matches for &ldquo;{searchQuery.trim()}&rdquo;.
                  </CommandEmpty>
                )}
            </>
          )}
        </CommandList>
      </CommandDialog>

      {/* ── INLINE: pick a project for the "new task" flow ───────────── */}
      {taskPickerOpen && ctx && (
        <NewTaskDialog
          projects={ctx.projects}
          areas={ctx.areas}
          onClose={() => setTaskPickerOpen(false)}
          onCreated={(projectId) => {
            setTaskPickerOpen(false)
            closeAll()
            startTransition(() => router.refresh())
            toast.success("Task added", {
              description: "Find it on the project page.",
              action: {
                label: "Open project",
                onClick: () => router.push(`/projects/${projectId}`),
              },
            })
          }}
        />
      )}
    </>
  )
}

/** Topbar trigger for global search (opens the shared cmdk search dialog). */
export function GlobalSearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("yir:search:open"))}
      aria-label="Search your plan"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-md border border-border/70 bg-background/40 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground md:h-auto md:w-auto md:px-2.5 md:py-1"
    >
      <Search className="h-4 w-4" />
      <span className="hidden md:inline">Search</span>
      <kbd className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wider md:inline">
        /
      </kbd>
    </button>
  )
}

function SearchResultGroup({
  group,
  go,
}: {
  group: SearchResponse["groups"][number]
  go: (path: string) => void
}) {
  if (group.items.length === 0) return null
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading={group.label}>
        {group.items.map((item) => (
          <SearchResultRow key={`${item.type}-${item.id}`} item={item} go={go} />
        ))}
      </CommandGroup>
    </>
  )
}

function SearchResultRow({
  item,
  go,
}: {
  item: SearchResultItem
  go: (path: string) => void
}) {
  const Icon =
    item.type === "project"
      ? Target
      : item.type === "task"
        ? CheckSquare
        : item.type === "note"
          ? FileText
          : item.type === "drift"
            ? Brain
            : Layers

  return (
    <CommandItem
      value={`${item.type} ${item.title} ${item.subtitle ?? ""}`}
      onSelect={() => go(item.href)}
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{item.title}</p>
        {item.subtitle ? (
          <p className="truncate text-[10px] text-muted-foreground">{item.subtitle}</p>
        ) : null}
      </div>
    </CommandItem>
  )
}

function PageRow({
  icon: Icon,
  label,
  href,
  go,
}: {
  icon: typeof LayoutDashboard
  label: string
  href: string
  go: (p: string) => void
}) {
  return (
    <CommandItem value={`page ${label.toLowerCase()}`} onSelect={() => go(href)}>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span>{label}</span>
      <span className="ml-auto text-[10px] text-muted-foreground">{href}</span>
    </CommandItem>
  )
}

/**
 * Two-step "new task" flow inside the palette: pick a project, then type
 * the task description. We keep it as a follow-on Dialog (rather than
 * nesting state in the CommandDialog) so the focus management stays
 * clean — cmdk doesn't love arbitrary text inputs mid-list.
 */
function NewTaskDialog({
  projects,
  areas,
  onClose,
  onCreated,
}: {
  projects: Project[]
  areas: Area[]
  onClose: () => void
  onCreated: (projectId: string) => void
}) {
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    const trimmed = description.trim()
    if (!trimmed || !projectId || submitting) return
    setSubmitting(true)
    try {
      const result = await createProjectTask({
        projectId,
        description: trimmed,
      })
      if (!result.ok) {
        toast.error(result.message, {
          action: result.upgradeUrl
            ? {
                label: "Upgrade",
                onClick: () => window.location.assign(result.upgradeUrl!),
              }
            : undefined,
        })
        return
      }
      onCreated(projectId)
    } catch (err) {
      console.error(err)
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-amber" />
            New task
          </DialogTitle>
          <DialogDescription>
            Pick the project this belongs to, then describe the move.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm"
            >
              {projects.length === 0 ? (
                <option value="">No active projects</option>
              ) : (
                projects.map((p) => {
                  const area = areas.find((a) => a.id === p.areaId)
                  return (
                    <option key={p.id} value={p.id}>
                      {p.title}
                      {area ? ` · ${area.name}` : ""}
                    </option>
                  )
                })
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              What&apos;s the move?
            </label>
            <Textarea
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One concrete next action…"
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                  e.preventDefault()
                  void submit()
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!description.trim() || !projectId || submitting}
          >
            {submitting ? "Adding…" : "Add task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
