"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { apiFetch } from "@/lib/api-fetch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { Flame, Loader2, ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { sanitizeRichTextHtml } from "@/lib/sanitize-client"
import { ProjectCompletionDialog } from "./project-completion-dialog"
import { STATUS_OPTIONS } from "./project-detail-constants"
import type { ProjectDetail } from "@/types/project-detail"

export function ProjectDetailHeader({ project }: { project: ProjectDetail }) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [editingDetails, setEditingDetails] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [completionOpen, setCompletionOpen] = useState(false)

  const [draftTitle, setDraftTitle] = useState(project.title)
  const [draftDescription, setDraftDescription] = useState(project.description ?? "")
  const [draftType, setDraftType] = useState(project.type)
  const [draftWhy, setDraftWhy] = useState(project.motivation?.whyText ?? "")
  const [draftConsequence, setDraftConsequence] = useState(
    project.motivation?.consequenceText ?? "",
  )

  function beginEditing() {
    setDraftTitle(project.title)
    setDraftDescription(project.description ?? "")
    setDraftType(project.type)
    setDraftWhy(project.motivation?.whyText ?? "")
    setDraftConsequence(project.motivation?.consequenceText ?? "")
    setEditingDetails(true)
  }

  const catInfo = LIFE_CATEGORIES.find((c) => c.id === project.category)

  async function updateStatus(status: string) {
    setUpdating(true)
    const result = await apiFetch<{ achievementUnlocked?: boolean }>(
      `/api/projects/${project.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        silent: true,
      },
    )
    setUpdating(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    if (
      status === "COMPLETED" &&
      result.body &&
      typeof result.body === "object" &&
      (result.body as { achievementUnlocked?: boolean }).achievementUnlocked
    ) {
      setCompletionOpen(true)
    }
    router.refresh()
  }

  async function saveDetails() {
    if (!draftTitle.trim()) {
      toast.error("Title is required")
      return
    }
    setUpdating(true)
    const result = await apiFetch(`/api/projects/${project.id}`, {
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
      errorMessage: "Failed to save project",
    })
    setUpdating(false)
    if (!result.ok) return
    setEditingDetails(false)
    router.refresh()
  }

  async function deleteGoal() {
    setDeleting(true)
    const result = await apiFetch(`/api/projects/${project.id}`, {
      method: "DELETE",
      errorMessage: "Failed to delete project",
    })
    setDeleting(false)
    setDeleteOpen(false)
    if (!result.ok) return
    router.push("/projects")
    router.refresh()
  }

  return (
    <>
      <section className="-mx-4 space-y-6 border-b border-border px-4 pb-8 sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" /> Projects
            </Link>
          </Button>
          <div className="flex-1" />
          {!editingDetails && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={beginEditing}
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
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge
              variant="outline"
              className="gap-1"
              style={{ borderColor: catInfo?.color, color: catInfo?.color }}
            >
              {catInfo && <catInfo.icon className="h-3 w-3" />}
              {catInfo?.label}
            </Badge>
            {project.type === "PRIMARY" && (
              <Badge variant="secondary" className="gap-1 text-accent">
                <Flame className="h-3 w-3" /> Primary
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {project.plan.year}
            </Badge>
          </div>

          {editingDetails ? (
            <div className="border border-border bg-card p-5 md:p-6 space-y-4">
              <h2 className="font-display text-lg tracking-tight">Edit project</h2>
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
                <Label>Project type</Label>
                <Select
                  value={draftType}
                  onValueChange={(v) =>
                    setDraftType(v as "PRIMARY" | "SECONDARY")
                  }
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
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold sm:text-3xl tracking-tight">
                {project.title}
              </h1>
            {project.description && (
              <div
                className="text-muted-foreground mt-1 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichTextHtml(project.description),
                }}
              />
            )}
          </>
        )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Status</span>
          <Select
            value={project.status}
            onValueChange={(v) => updateStatus(v)}
            disabled={updating}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue>
                {(() => {
                  const current = STATUS_OPTIONS.find((o) => o.value === project.status)
                  if (!current) return project.status
                  return (
                    <span className={`flex items-center gap-2 ${current.color}`}>
                      <current.icon className="h-3.5 w-3.5" />
                      {current.label}
                    </span>
                  )
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className={`flex items-center gap-2 ${opt.color}`}>
                    <opt.icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {updating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </section>

      <ProjectCompletionDialog
        open={completionOpen}
        onOpenChange={setCompletionOpen}
        projectId={project.id}
        goalTitle={project.title}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription>
              This removes the project, its systems, checkpoints, and progress tied
              to it. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteGoal} disabled={deleting}>
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
