"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Ban, Check, Lock, Pencil, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import type { AntiGoal, LifeCategory } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AntiGoalsListProps {
  initial: AntiGoal[]
  cap: number
  isPro: boolean
  hasActivePlan: boolean
}

const LIFE_CATEGORIES: { id: LifeCategory; label: string }[] = [
  { id: "HEALTH", label: "Health" },
  { id: "CAREER", label: "Career" },
  { id: "FINANCE", label: "Finance" },
  { id: "RELATIONSHIPS", label: "Relationships" },
  { id: "SPIRITUALITY", label: "Spirituality" },
  { id: "PASSION", label: "Passion" },
]

export function AntiGoalsList({
  initial,
  cap,
  isPro,
  hasActivePlan,
}: AntiGoalsListProps) {
  const router = useRouter()
  const [items, setItems] = useState<AntiGoal[]>(initial)
  const [draft, setDraft] = useState("")
  const [draftCategory, setDraftCategory] = useState<LifeCategory | "">("")
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [editCategory, setEditCategory] = useState<LifeCategory | "">("")
  const [, startTransition] = useTransition()

  const visible = isPro ? items : items.slice(0, cap)
  const hiddenCount = isPro ? 0 : Math.max(0, items.length - cap)
  const atCap = !isPro && items.length >= cap

  async function add() {
    const text = draft.trim()
    if (!text || submitting) return
    if (atCap) {
      toast.error("Free plans cap anti-goals at 3.", {
        description: "Upgrade to Pro to add more.",
      })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/anti-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: text,
          category: draftCategory || null,
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Could not save.")
        setSubmitting(false)
        return
      }
      setItems((prev) => [...prev, body.data])
      setDraft("")
      setDraftCategory("")
      startTransition(() => router.refresh())
    } catch (err) {
      console.error(err)
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: string) {
    const prev = items
    setItems((curr) => curr.filter((i) => i.id !== id))
    try {
      const res = await fetch(`/api/anti-goals/${id}`, { method: "DELETE" })
      if (!res.ok) {
        setItems(prev)
        toast.error("Could not remove. Please try again.")
        return
      }
      startTransition(() => router.refresh())
    } catch (err) {
      console.error(err)
      setItems(prev)
      toast.error("Network error. Please try again.")
    }
  }

  function startEdit(a: AntiGoal) {
    setEditingId(a.id)
    setEditDescription(a.description)
    setEditCategory(a.category ?? "")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDescription("")
    setEditCategory("")
  }

  async function saveEdit(a: AntiGoal) {
    const desc = editDescription.trim()
    if (!desc) {
      toast.error("Anti-goal can't be empty.")
      return
    }
    const cat = editCategory || null
    if (desc === a.description && cat === a.category) {
      cancelEdit()
      return
    }
    const prev = items
    setItems((curr) =>
      curr.map((i) =>
        i.id === a.id ? { ...i, description: desc, category: cat } : i,
      ),
    )
    setEditingId(null)
    try {
      const res = await fetch(`/api/anti-goals/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc, category: cat }),
      })
      if (!res.ok) {
        setItems(prev)
        toast.error("Could not save.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setItems(prev)
      toast.error("Network error.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-border px-4 py-3.5 text-sm text-muted-foreground leading-relaxed">
        <p>
          <span className="font-medium text-foreground">Why both?</span> The{" "}
          <Link
            href="/dashboard#today"
            className="text-foreground/90 hover:underline underline-offset-2"
          >
            dashboard Today
          </Link>{" "}
          pill asks &ldquo;Held the line?&rdquo; on one anti-goal per day. Weekly
          and monthly reviews reference them too — edit the full list here.
        </p>
        <p className="mt-2 text-xs">
          Pair with your{" "}
          <Link
            href="/vision"
            className="text-foreground/90 hover:underline underline-offset-2"
          >
            Vision
          </Link>{" "}
          (who you&apos;re becoming) — anti-goals are what you&apos;re choosing
          not to do.
        </p>
      </div>

      {!hasActivePlan && (
        <div className="border border-dashed border-amber/40 bg-amber-tint p-6">
          <p className="text-sm">
            You need an active yearly plan before adding anti-goals.{" "}
            <Link href="/onboarding" className="underline font-medium">
              Create your plan
            </Link>
            .
          </p>
        </div>
      )}

      {hasActivePlan && (
        <section className="border border-border">
          <header className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl tracking-tight flex items-center gap-2">
                <Ban className="h-4 w-4 text-accent" />
                This year&apos;s noes
              </h2>
              {!isPro && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {Math.min(items.length, cap)} / {cap} on Free
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              One rotates on Today each day. Review the full set during rhythm
              check-ins — a no held is a yes earned.
            </p>
          </header>
          <div className="px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add()
              }}
              placeholder="e.g. Stop saying yes to projects that don't fit the year"
              disabled={submitting || atCap}
            />
            <select
              value={draftCategory}
              onChange={(e) =>
                setDraftCategory((e.target.value || "") as LifeCategory | "")
              }
              className="h-10 rounded-md border border-border bg-background px-2 text-sm sm:w-40"
              disabled={submitting || atCap}
            >
              <option value="">No category</option>
              {LIFE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <Button onClick={add} disabled={!draft.trim() || submitting || atCap}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No anti-goals yet. Start with one thing you&apos;re choosing not to do this year.
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {visible.map((a) => {
                const isEditing = editingId === a.id
                return (
                  <li
                    key={a.id}
                    className="group border border-border p-4 relative"
                  >
                    {isEditing ? (
                      <div className="space-y-2 pr-2">
                        <Input
                          autoFocus
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(a)
                            if (e.key === "Escape") cancelEdit()
                          }}
                        />
                        <select
                          value={editCategory}
                          onChange={(e) =>
                            setEditCategory(
                              (e.target.value || "") as LifeCategory | "",
                            )
                          }
                          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                        >
                          <option value="">No category</option>
                          {LIFE_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            aria-label="Cancel edit"
                            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(a)}
                            aria-label="Save"
                            className="rounded-md p-1 text-status-positive hover:bg-status-positive/10"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium text-sm pr-16">
                          {a.description}
                        </div>
                        {a.category && (
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {a.category.toLowerCase()}
                          </div>
                        )}
                        <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <button
                            type="button"
                            onClick={() => startEdit(a)}
                            aria-label="Edit anti-goal"
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(a.id)}
                            aria-label="Remove anti-goal"
                            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                )
              })}
              {hiddenCount > 0 && (
                <li>
                  <Link
                    href="/settings#billing"
                    className="block h-full w-full border border-dashed border-amber/40 bg-amber-tint p-4 text-left transition-colors hover:bg-amber-wash"
                  >
                    <div className="flex items-center gap-1.5 text-amber text-[11px] font-medium mb-1">
                      <Lock className="h-3 w-3" />
                      Pro
                    </div>
                    <div className="text-sm font-medium">
                      + {hiddenCount} more {hiddenCount === 1 ? "anti-goal" : "anti-goals"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Unlock up to 50 anti-goals on Pro.
                    </div>
                  </Link>
                </li>
              )}
            </ul>
          )}
          </div>
        </section>
      )}
    </div>
  )
}
