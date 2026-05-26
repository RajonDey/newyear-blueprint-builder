"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Plus, Pencil, Trash2, Loader2, Check, X } from "lucide-react"
import { toast } from "sonner"

interface KeyResult {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit: string
}

interface ProjectKeyResultsProps {
  projectId: string
  keyResults: KeyResult[]
  /** When true, omits outer card chrome (used inside accordions). */
  embedded?: boolean
}

export function ProjectKeyResults({
  projectId,
  keyResults,
  embedded = false,
}: ProjectKeyResultsProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const [title, setTitle] = useState("")
  const [target, setTarget] = useState("")
  const [current, setCurrent] = useState("")
  const [unit, setUnit] = useState("")

  const [editCurrent, setEditCurrent] = useState("")

  const overallProgress =
    keyResults.length > 0
      ? keyResults.reduce((sum, kr) => {
          const pct = Math.min(kr.currentValue / kr.targetValue, 1) * 100
          return sum + pct
        }, 0) / keyResults.length
      : 0

  async function addKeyResult() {
    if (!title.trim() || !target.trim()) {
      toast.error("Title and target are required")
      return
    }
    setAdding(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/key-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          targetValue: parseFloat(target),
          currentValue: current ? parseFloat(current) : 0,
          unit: unit.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to add")
      toast.success("Key result added")
      setTitle("")
      setTarget("")
      setCurrent("")
      setUnit("")
      setShowAdd(false)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add key result")
    } finally {
      setAdding(false)
    }
  }

  async function updateProgress(krId: string) {
    if (!editCurrent.trim()) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/key-results/${krId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue: parseFloat(editCurrent) }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast.success("Progress updated")
      setEditingId(null)
      router.refresh()
    } catch {
      toast.error("Failed to update progress")
    } finally {
      setUpdating(false)
    }
  }

  async function deleteKeyResult(krId: string) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/key-results/${krId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Key result removed")
      router.refresh()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setUpdating(false)
    }
  }

  const body = (
    <>
      {!embedded && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" /> Key Results
            </CardTitle>
            {keyResults.length > 0 && (
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round(overallProgress)}% overall
              </span>
            )}
          </div>
          {keyResults.length > 0 && (
            <Progress value={overallProgress} className="h-2 mt-2" />
          )}
        </CardHeader>
      )}
      {embedded && keyResults.length > 0 && (
        <div className="space-y-2 pb-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall progress</span>
            <span className="font-medium tabular-nums">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}
      <CardContent className={embedded ? "space-y-4 p-0" : "space-y-4"}>
        {keyResults.length === 0 && !showAdd && (
          <div className={embedded ? "py-1" : "text-center py-4"}>
            <p className="text-sm text-muted-foreground mb-3">
              Add measurable outcomes to track real progress toward this project.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdd(true)}
              className="gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add key result
            </Button>
          </div>
        )}

        {keyResults.map((kr) => {
          const pct = Math.min((kr.currentValue / kr.targetValue) * 100, 100)
          const isEditing = editingId === kr.id

          return (
            <div key={kr.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{kr.title}</p>
                  <div className="flex items-baseline gap-1 text-xs text-muted-foreground mt-0.5">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          value={editCurrent}
                          onChange={(e) => setEditCurrent(e.target.value)}
                          className="h-7 w-20 text-xs"
                          disabled={updating}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") updateProgress(kr.id)
                            if (e.key === "Escape") setEditingId(null)
                          }}
                        />
                        <span>/ {kr.targetValue} {kr.unit}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => updateProgress(kr.id)}
                          disabled={updating}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span>
                        {kr.currentValue} / {kr.targetValue} {kr.unit} ({Math.round(pct)}%)
                      </span>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingId(kr.id)
                        setEditCurrent(String(kr.currentValue))
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteKeyResult(kr.id)}
                      disabled={updating}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <Progress
                value={pct}
                className="h-1.5"
              />
            </div>
          )
        })}

        {showAdd && (
          <div className="rounded-lg border p-3 bg-muted/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">What will you measure?</Label>
                <Input
                  placeholder="e.g. Total kilometers run"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={adding}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Target</Label>
                <Input
                  type="number"
                  placeholder="e.g. 42"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={adding}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unit (optional)</Label>
                <Input
                  placeholder="e.g. km, hours, books"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={adding}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Current progress</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  disabled={adding}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={addKeyResult} disabled={adding}>
                {adding && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAdd(false)}
                disabled={adding}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {keyResults.length > 0 && !showAdd && keyResults.length < 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdd(true)}
            className="gap-1 w-full"
          >
            <Plus className="h-3.5 w-3.5" /> Add key result
          </Button>
        )}
      </CardContent>
    </>
  )

  if (embedded) {
    return <div className="space-y-4">{body}</div>
  }

  return <Card>{body}</Card>
}
