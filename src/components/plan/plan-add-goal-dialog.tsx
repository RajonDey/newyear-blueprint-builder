"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LIFE_CATEGORIES, type LifeCategoryId } from "@/lib/constants/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

type PlanTier = "FREE" | "PRO"

export function PlanAddGoalDialog({
  planId,
  goalCount,
  maxGoals,
  planTier,
}: {
  planId: string
  goalCount: number
  maxGoals: number
  planTier: PlanTier
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [category, setCategory] = useState<LifeCategoryId>("HEALTH")
  const [type, setType] = useState<"PRIMARY" | "SECONDARY">("PRIMARY")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const canAdd = goalCount < maxGoals

  function resetForm() {
    setCategory("HEALTH")
    setType("PRIMARY")
    setTitle("")
    setDescription("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      toast.error("Give your goal a short title.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          category,
          type,
          title: trimmed,
          description: description.trim() || undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(
          typeof json.error === "string" ? json.error : "Could not create goal"
        )
      }
      toast.success("Goal added")
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create goal")
    } finally {
      setSubmitting(false)
    }
  }

  if (!canAdd) {
    if (planTier === "FREE") {
      return (
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings#billing">
            Upgrade for more goals
          </Link>
        </Button>
      )
    }
    return (
      <p className="text-sm text-muted-foreground max-w-xs text-right">
        Goal limit reached for this plan ({maxGoals}).
      </p>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-display">Add a goal</DialogTitle>
            <DialogDescription>
              Tie it to a life area. You can refine checkpoints and systems on the
              goal page.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="goal-category">Life area</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as LifeCategoryId)}
              >
                <SelectTrigger id="goal-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIFE_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-type">Priority</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "PRIMARY" | "SECONDARY")}
              >
                <SelectTrigger id="goal-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIMARY">Primary</SelectItem>
                  <SelectItem value="SECONDARY">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What you want to achieve this year"
                maxLength={500}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-description">Details (optional)</Label>
              <Textarea
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Context, success criteria, or notes"
                rows={3}
                className="resize-none"
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add goal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
