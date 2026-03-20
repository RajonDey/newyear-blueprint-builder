"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Flame,
  Calendar,
  Repeat,
  Heart,
  AlertTriangle,
  Check,
  Clock,
  Loader2,
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react"
import { toast } from "sonner"

interface GoalDetailProps {
  goal: {
    id: string
    title: string
    description?: string | null
    category: string
    type: string
    status: string
    plan: { id: string; year: number }
    checkpointGoals: {
      id: string
      quarter: string
      title: string
      description?: string | null
      status: string
    }[]
    dailySystems: {
      id: string
      description: string
      frequency: string
      isActive: boolean
    }[]
    habits: { id: string; description: string; routineFormula?: string | null; frequency: string }[]
    motivation: { whyText: string; consequenceText: string } | null
    actions: { id: string; type: string; description: string; status: string }[]
  }
}

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started", icon: Clock },
  { value: "IN_PROGRESS", label: "In Progress", icon: Loader2 },
  { value: "ON_TRACK", label: "On Track", icon: Check },
  { value: "AT_RISK", label: "At Risk", icon: AlertTriangle },
  { value: "COMPLETED", label: "Completed", icon: Check },
]

const QUARTER_LABELS: Record<string, string> = {
  Q1: "Jan – Mar",
  Q2: "Apr – Jun",
  Q3: "Jul – Sep",
  Q4: "Oct – Dec",
}

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
}

export function GoalDetailView({ goal }: GoalDetailProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [editingDetails, setEditingDetails] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [draftTitle, setDraftTitle] = useState(goal.title)
  const [draftDescription, setDraftDescription] = useState(goal.description ?? "")
  const [draftType, setDraftType] = useState(goal.type)
  const [draftWhy, setDraftWhy] = useState(goal.motivation?.whyText ?? "")
  const [draftConsequence, setDraftConsequence] = useState(
    goal.motivation?.consequenceText ?? ""
  )

  const [newSystemDesc, setNewSystemDesc] = useState("")
  const [newSystemFreq, setNewSystemFreq] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY")
  const [addingSystem, setAddingSystem] = useState(false)

  const [editingSystemId, setEditingSystemId] = useState<string | null>(null)
  const [sysDraftDesc, setSysDraftDesc] = useState("")
  const [sysDraftFreq, setSysDraftFreq] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY")
  const [sysDraftActive, setSysDraftActive] = useState(true)

  useEffect(() => {
    if (!editingDetails) {
      setDraftTitle(goal.title)
      setDraftDescription(goal.description ?? "")
      setDraftType(goal.type)
      setDraftWhy(goal.motivation?.whyText ?? "")
      setDraftConsequence(goal.motivation?.consequenceText ?? "")
    }
  }, [goal, editingDetails])

  const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)

  const completedCPs = goal.checkpointGoals.filter(
    (cp) => cp.status === "COMPLETED"
  ).length
  const totalCPs = goal.checkpointGoals.length
  const progress = totalCPs > 0 ? (completedCPs / totalCPs) * 100 : 0

  async function updateStatus(status: string) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast.success(`Status updated to ${status.replace(/_/g, " ")}`)
      router.refresh()
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  async function saveDetails() {
    if (!draftTitle.trim()) {
      toast.error("Title is required")
      return
    }
    setUpdating(true)
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draftTitle.trim(),
          description: draftDescription.trim() || null,
          type: draftType,
          motivation: {
            whyText: draftWhy,
            consequenceText: draftConsequence,
          },
        }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast.success("Goal updated")
      setEditingDetails(false)
      router.refresh()
    } catch {
      toast.error("Failed to save goal")
    } finally {
      setUpdating(false)
    }
  }

  async function deleteGoal() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/goals/${goal.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Goal deleted")
      router.push("/goals")
      router.refresh()
    } catch {
      toast.error("Failed to delete goal")
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  async function toggleCheckpoint(cp: GoalDetailProps["goal"]["checkpointGoals"][0]) {
    const next = cp.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED"
    setUpdating(true)
    try {
      const res = await fetch(`/api/checkpoints/${cp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error("Failed to update")
      router.refresh()
    } catch {
      toast.error("Failed to update checkpoint")
    } finally {
      setUpdating(false)
    }
  }

  function startEditSystem(s: GoalDetailProps["goal"]["dailySystems"][0]) {
    setEditingSystemId(s.id)
    setSysDraftDesc(s.description)
    setSysDraftFreq(s.frequency as "DAILY" | "WEEKLY" | "MONTHLY")
    setSysDraftActive(s.isActive)
  }

  async function saveSystem(systemId: string) {
    if (!sysDraftDesc.trim()) {
      toast.error("Description is required")
      return
    }
    setUpdating(true)
    try {
      const res = await fetch(`/api/systems/${systemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: sysDraftDesc.trim(),
          frequency: sysDraftFreq,
          isActive: sysDraftActive,
        }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast.success("System updated")
      setEditingSystemId(null)
      router.refresh()
    } catch {
      toast.error("Failed to update system")
    } finally {
      setUpdating(false)
    }
  }

  async function deleteSystem(systemId: string) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/systems/${systemId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("System removed")
      setEditingSystemId(null)
      router.refresh()
    } catch {
      toast.error("Failed to remove system")
    } finally {
      setUpdating(false)
    }
  }

  async function addSystem() {
    if (!newSystemDesc.trim()) {
      toast.error("Enter a short description for this system")
      return
    }
    setAddingSystem(true)
    try {
      const res = await fetch(`/api/goals/${goal.id}/systems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newSystemDesc.trim(),
          frequency: newSystemFreq,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || "Failed to add")
      }
      toast.success("System added")
      setNewSystemDesc("")
      setNewSystemFreq("DAILY")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add system")
    } finally {
      setAddingSystem(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
          <Link href="/goals">
            <ArrowLeft className="h-4 w-4" /> Goals
          </Link>
        </Button>
        <div className="flex-1" />
        {!editingDetails && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setEditingDetails(true)}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="gap-1"
            style={{ borderColor: catInfo?.color, color: catInfo?.color }}
          >
            {catInfo && <catInfo.icon className="h-3 w-3" />}
            {catInfo?.label}
          </Badge>
          {goal.type === "PRIMARY" && (
            <Badge variant="secondary" className="gap-1 text-accent">
              <Flame className="h-3 w-3" /> Primary
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {goal.plan.year}
          </Badge>
        </div>

        {editingDetails ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">Edit goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="g-title">Title</Label>
                <Input
                  id="g-title"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-desc">Description</Label>
                <Textarea
                  id="g-desc"
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label>Goal type</Label>
                <Select
                  value={draftType}
                  onValueChange={(v) => setDraftType(v)}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIMARY">Primary</SelectItem>
                    <SelectItem value="SECONDARY">Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-why">Why this matters</Label>
                <Textarea
                  id="g-why"
                  value={draftWhy}
                  onChange={(e) => setDraftWhy(e.target.value)}
                  rows={2}
                  className="resize-none"
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-stake">What&apos;s at stake</Label>
                <Textarea
                  id="g-stake"
                  value={draftConsequence}
                  onChange={(e) => setDraftConsequence(e.target.value)}
                  rows={2}
                  className="resize-none"
                  disabled={updating}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={saveDetails} disabled={updating}>
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingDetails(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">
              {goal.title}
            </h1>
            {goal.description && (
              <p className="text-muted-foreground mt-1">{goal.description}</p>
            )}
          </>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-3">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={goal.status === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateStatus(opt.value)}
                disabled={updating || goal.status === opt.value}
                className="gap-1.5"
              >
                <opt.icon className="h-3.5 w-3.5" />
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {totalCPs > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" /> Quarterly
                Checkpoints
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {completedCPs}/{totalCPs} done
              </span>
            </div>
            <Progress value={progress} className="h-2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            {goal.checkpointGoals.map((cp) => (
              <button
                key={cp.id}
                type="button"
                onClick={() => toggleCheckpoint(cp)}
                disabled={updating}
                className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    cp.status === "COMPLETED"
                      ? "bg-emerald-500 text-white"
                      : "border-2 border-muted-foreground/30"
                  }`}
                >
                  {cp.status === "COMPLETED" && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-accent">
                      {cp.quarter}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {QUARTER_LABELS[cp.quarter]}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{cp.title}</p>
                  {cp.description && (
                    <p className="text-xs text-muted-foreground">
                      {cp.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {cp.status === "COMPLETED"
                      ? "Tap to mark not started"
                      : "Tap to mark complete"}
                  </p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Repeat className="h-4 w-4 text-accent" /> Daily &amp; weekly systems
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            These power your Daily Systems page. Weekly/monthly items stay done
            for the whole week or month once checked.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {goal.dailySystems.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No systems yet. Add one below — small, repeatable actions work best.
            </p>
          )}
          {goal.dailySystems.map((sys) =>
            editingSystemId === sys.id ? (
              <div
                key={sys.id}
                className="space-y-3 rounded-lg border p-3 bg-muted/20"
              >
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={sysDraftDesc}
                    onChange={(e) => setSysDraftDesc(e.target.value)}
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={sysDraftFreq}
                    onValueChange={(v) =>
                      setSysDraftFreq(v as "DAILY" | "WEEKLY" | "MONTHLY")
                    }
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={sysDraftActive}
                    onCheckedChange={(c) => setSysDraftActive(c === true)}
                    disabled={updating}
                  />
                  Active (show on Daily Systems)
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => saveSystem(sys.id)}
                    disabled={updating}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSystemId(null)}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteSystem(sys.id)}
                    disabled={updating}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                key={sys.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 ${
                  !sys.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{sys.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {FREQUENCY_LABELS[sys.frequency] ?? sys.frequency}
                    {!sys.isActive ? " · Paused" : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => startEditSystem(sys)}
                  disabled={updating}
                >
                  Edit
                </Button>
              </div>
            )
          )}

          <OrnamentDivider variant="dot" />

          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-accent" /> Add system
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="e.g. 20 minutes of movement"
                value={newSystemDesc}
                onChange={(e) => setNewSystemDesc(e.target.value)}
                disabled={addingSystem}
                className="flex-1"
              />
              <Select
                value={newSystemFreq}
                onValueChange={(v) =>
                  setNewSystemFreq(v as "DAILY" | "WEEKLY" | "MONTHLY")
                }
                disabled={addingSystem}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={addSystem}
                disabled={addingSystem}
                className="shrink-0"
              >
                {addingSystem ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {goal.motivation && !editingDetails && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Heart className="h-4 w-4 text-accent" /> Your Why
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goal.motivation.whyText && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Why this matters
                </p>
                <p className="text-sm">{goal.motivation.whyText}</p>
              </div>
            )}
            <OrnamentDivider variant="dot" />
            {goal.motivation.consequenceText && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  What&apos;s at stake
                </p>
                <p className="text-sm">{goal.motivation.consequenceText}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this goal?</DialogTitle>
            <DialogDescription>
              This removes the goal, its systems, checkpoints, and progress tied
              to it. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteGoal}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete goal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
