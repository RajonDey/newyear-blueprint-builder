"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StickyNote, Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Note {
  id: string
  content: string
  createdAt: string
}

interface GoalNotesProps {
  goalId: string
  notes: Note[]
}

function formatNoteDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function GoalNotes({ goalId, notes }: GoalNotesProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [content, setContent] = useState("")
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function addNote() {
    if (!content.trim()) {
      toast.error("Write something first")
      return
    }
    setAdding(true)
    try {
      const res = await fetch(`/api/goals/${goalId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (!res.ok) throw new Error("Failed to add note")
      toast.success("Note added")
      setContent("")
      setShowAdd(false)
      router.refresh()
    } catch {
      toast.error("Failed to add note")
    } finally {
      setAdding(false)
    }
  }

  async function deleteNote(noteId: string) {
    setDeletingId(noteId)
    try {
      const res = await fetch(`/api/goal-notes/${noteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Note removed")
      router.refresh()
    } catch {
      toast.error("Failed to delete note")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-accent" /> Journal
          </CardTitle>
          {!showAdd && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdd(true)}
              className="gap-1 -mr-2"
            >
              <Plus className="h-3.5 w-3.5" /> Add note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAdd && (
          <div className="space-y-2 rounded-lg border p-3 bg-muted/20">
            <Textarea
              placeholder="What's on your mind about this goal?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="resize-none text-sm"
              disabled={adding}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addNote} disabled={adding}>
                {adding && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Save note
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAdd(false)
                  setContent("")
                }}
                disabled={adding}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 && !showAdd && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Jot down progress updates, ideas, or reflections as you work toward this goal.
          </p>
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            className="group relative rounded-lg border p-3 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  {formatNoteDate(note.createdAt)}
                </p>
                <p className="whitespace-pre-wrap">{note.content}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
                onClick={() => deleteNote(note.id)}
                disabled={deletingId === note.id}
              >
                {deletingId === note.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
