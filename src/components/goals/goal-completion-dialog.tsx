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

interface GoalCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalId: string
  goalTitle: string
}

export function GoalCompletionDialog({
  open,
  onOpenChange,
  goalId,
  goalTitle,
}: GoalCompletionDialogProps) {
  const router = useRouter()
  const [reflection, setReflection] = useState("")
  const [saving, setSaving] = useState(false)

  async function saveReflection() {
    setSaving(true)
    try {
      if (reflection.trim()) {
        await fetch(`/api/goals/${goalId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🎉 Goal completed!\n\n${reflection.trim()}`,
          }),
        })
      }
      toast.success("Achievement unlocked: Goal Crusher!", {
        description: "You completed a goal. That's what this whole thing is about.",
        duration: 5000,
      })
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("Couldn't save reflection, but your goal is still complete!")
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
            Goal Complete!
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
              toast.success("Goal marked complete!")
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
