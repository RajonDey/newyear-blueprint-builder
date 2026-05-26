"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProUpsellCard } from "@/components/upgrade/pro-upsell-card"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { lifeCategoryLabels } from "@/lib/level-styles"
import { Loader2, Plus, Zap } from "lucide-react"
import { toast } from "sonner"
import type { LifeCategory } from "@prisma/client"
import { cn } from "@/lib/utils"

export type ProjectQuickStartProps = {
  /** Dashed empty-state card vs header/dialog button. */
  variant?: "empty" | "dialog"
  defaultAreaId?: string
  defaultCategory?: LifeCategory | null
  areaName?: string
  atCap?: boolean
  maxProjects?: number
  triggerLabel?: string
  triggerSize?: "default" | "sm"
  className?: string
}

export function ProjectQuickStart({
  variant = "empty",
  defaultAreaId,
  defaultCategory = null,
  areaName,
  atCap = false,
  maxProjects = 3,
  triggerLabel = "New project",
  triggerSize = "default",
  className,
}: ProjectQuickStartProps) {
  const [open, setOpen] = useState(false)
  const lockedCategory = defaultCategory ?? null

  if (atCap) {
    if (variant === "empty") {
      return (
        <ProUpsellCard
          feature="more projects"
          title={`You're at the Free cap of ${maxProjects} projects`}
          description="Upgrade to Pro for more projects per plan, unlimited tasks per project, and the full rhythm stack."
          bullets={[
            "Up to 12 projects per yearly plan",
            "Unlimited tasks per project",
            "Monthly & quarterly reviews",
          ]}
          className={className}
        />
      )
    }
    return null
  }

  if (variant === "dialog") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size={triggerSize} className={cn("gap-1.5", className)}>
            <Plus className="h-4 w-4" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display tracking-tight">
              {areaName ? `Add project in ${areaName}` : "New project"}
            </DialogTitle>
            <DialogDescription>
              {areaName
                ? "This project will live in this area on your active plan."
                : "One specific outcome for the year — add details anytime."}
            </DialogDescription>
          </DialogHeader>
          <ProjectQuickStartForm
            defaultAreaId={defaultAreaId}
            lockedCategory={lockedCategory}
            areaName={areaName}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <ProjectQuickStartEmpty
      defaultAreaId={defaultAreaId}
      lockedCategory={lockedCategory}
      areaName={areaName}
    />
  )
}

function ProjectQuickStartEmpty({
  defaultAreaId,
  lockedCategory,
  areaName,
}: {
  defaultAreaId?: string
  lockedCategory: LifeCategory | null
  areaName?: string
}) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-accent/30 p-6 text-center transition-colors hover:border-accent/60 hover:bg-accent/5"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <p className="text-sm font-semibold">
            {areaName ? `Add a project in ${areaName}` : "Quick-start a project"}
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Skip the full wizard. Create one project now and add details later.
          </p>
        </div>
      </button>
    )
  }

  return (
    <Card className="border-accent/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          {areaName ? `Add project in ${areaName}` : "Quick-start a project"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProjectQuickStartForm
          defaultAreaId={defaultAreaId}
          lockedCategory={lockedCategory}
          areaName={areaName}
          onCancel={() => setOpen(false)}
        />
      </CardContent>
    </Card>
  )
}

function ProjectQuickStartForm({
  defaultAreaId,
  lockedCategory,
  areaName,
  onSuccess,
  onCancel,
}: {
  defaultAreaId?: string
  lockedCategory: LifeCategory | null
  areaName?: string
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<LifeCategory>(
    lockedCategory ?? "HEALTH",
  )
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    try {
      const body: Record<string, string> = {
        title: title.trim(),
        category: lockedCategory ?? category,
      }
      if (defaultAreaId) body.areaId = defaultAreaId

      const res = await fetch("/api/projects/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const json = await res.json().catch(() => ({}))

      if (res.status === 402) {
        toast.error(json.message ?? "Project limit reached.", {
          action: json.upgradeUrl
            ? {
                label: "Upgrade",
                onClick: () => router.push(json.upgradeUrl),
              }
            : undefined,
        })
        setSubmitting(false)
        return
      }

      if (!res.ok) {
        throw new Error(json.error || json.message || "Failed to create project")
      }

      toast.success("Project created!")
      onSuccess?.()
      router.push(`/projects/${json.data.projectId}`)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="qs-title" className="text-sm font-medium">
          What do you want to achieve this year?
        </label>
        <Input
          id="qs-title"
          placeholder='e.g. "Run a half marathon" or "Read 24 books"'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={500}
          autoFocus
        />
      </div>

      {lockedCategory ? (
        <p className="text-sm text-muted-foreground">
          Life area:{" "}
          <span className="text-foreground font-medium">
            {lifeCategoryLabels[lockedCategory]}
          </span>
          {areaName ? ` · from ${areaName}` : null}
        </p>
      ) : (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Life area</label>
          <div className="grid grid-cols-3 gap-2">
            {LIFE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition-colors",
                  category === cat.id
                    ? "border-accent bg-accent/10 font-medium"
                    : "hover:bg-muted/50",
                )}
              >
                <cat.icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: cat.color }}
                />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="submit"
          disabled={submitting || !title.trim()}
          className="gap-1.5"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Create project
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
