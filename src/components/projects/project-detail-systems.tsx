"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api-fetch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Repeat, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { FREQUENCY_LABELS } from "./project-detail-constants"
import type { ProjectDetail } from "@/types/project-detail"

export function ProjectDetailSystems({
  projectId,
  systems,
}: {
  projectId: string
  systems: ProjectDetail["systems"]
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [newSystemDesc, setNewSystemDesc] = useState("")
  const [newSystemFreq, setNewSystemFreq] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY")
  const [addingSystem, setAddingSystem] = useState(false)
  const [editingSystemId, setEditingSystemId] = useState<string | null>(null)
  const [sysDraftDesc, setSysDraftDesc] = useState("")
  const [sysDraftFreq, setSysDraftFreq] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY")
  const [sysDraftActive, setSysDraftActive] = useState(true)

  function startEditSystem(s: ProjectDetail["systems"][number]) {
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
    const result = await apiFetch(`/api/systems/${systemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: sysDraftDesc.trim(),
        frequency: sysDraftFreq,
        isActive: sysDraftActive,
      }),
      errorMessage: "Failed to update system",
    })
    setUpdating(false)
    if (!result.ok) return
    setEditingSystemId(null)
    router.refresh()
  }

  async function deleteSystem(systemId: string) {
    setUpdating(true)
    const result = await apiFetch(`/api/systems/${systemId}`, {
      method: "DELETE",
      errorMessage: "Failed to remove system",
    })
    setUpdating(false)
    if (!result.ok) return
    setEditingSystemId(null)
    router.refresh()
  }

  async function addSystem() {
    if (!newSystemDesc.trim()) {
      toast.error("Enter a short description for this system")
      return
    }
    setAddingSystem(true)
    const result = await apiFetch(`/api/projects/${projectId}/systems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: newSystemDesc.trim(),
        frequency: newSystemFreq,
      }),
      errorMessage: "Failed to add system",
    })
    setAddingSystem(false)
    if (!result.ok) return
    setNewSystemDesc("")
    setNewSystemFreq("DAILY")
    router.refresh()
  }

  return (
    <section className="space-y-4 border border-border p-5 md:p-6">
      <div>
        <h2 className="font-display text-lg tracking-tight flex items-center gap-2">
          <Repeat className="h-4 w-4 text-muted-foreground" aria-hidden />
          Daily &amp; weekly systems
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          These power your Dashboard Today card. Weekly/monthly items stay done for
          the whole week or month once checked.
        </p>
      </div>
      <div className="space-y-4">
        {systems.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No systems yet. Add one below — small, repeatable actions work best.
          </p>
        )}
        {systems.map((sys) =>
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
                Active (show on Dashboard Today)
              </label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => saveSystem(sys.id)} disabled={updating}>
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
          ),
        )}

        <hr className="border-border" />

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
            <Button onClick={addSystem} disabled={addingSystem} className="shrink-0">
              {addingSystem ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
