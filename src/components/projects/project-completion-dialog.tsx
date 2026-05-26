"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProjectCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  goalTitle: string
}

export function ProjectCompletionDialog({
  open,
  onOpenChange,
  projectId,
  goalTitle,
}: ProjectCompletionDialogProps) {
  const router = useRouter()
  const [reflection, setReflection] = useState("")
  const [saving, setSaving] = useState(false)

  async function saveReflection() {
    setSaving(true)
    try {
      if (reflection.trim()) {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            parentType: "PROJECT",
            parentId: projectId,
            content: `🎉 Project completed!\n\n${reflection.trim()}`,
          }),
        })
        const body = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            body?.message ?? body?.error ?? "Couldn't save reflection, but your project is still complete!",
          )
          onOpenChange(false)
          router.refresh()
          return
        }
      }
      toast.success("Achievement unlocked: Project Crusher!", {
        description: "You completed a project. That's what this whole thing is about.",
        duration: 5000,
      })
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("Couldn't save reflection, but your project is still complete!")
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="text-5xl mb-3 mx-auto">🎉</div>
          <DialogTitle className="text-2xl font-display">
            Project complete!
          </DialogTitle>
          <DialogDescription className="text-base">
            You finished <span className="font-medium text-foreground">{goalTitle}</span>.
            Take a moment to reflect.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground font-medium">
            What worked? What would you do differently?
          </p>
          <Textarea
            placeholder="Optional — but worth it for your future self."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
            className="resize-none"
            disabled={saving}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              toast.success("Project marked complete!")
            }}
          >
            Skip
          </Button>
          <Button onClick={saveReflection} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save reflection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
