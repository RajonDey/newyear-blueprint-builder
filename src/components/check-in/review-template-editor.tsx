"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import type { ReviewCadence } from "@prisma/client"
import {
  defaultFieldsForCadence,
  type ReviewTemplateField,
} from "@/lib/review-templates"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function slugifyLabel(label: string): string {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36)
  return base || "field"
}

function nextUniqueKey(base: string, keys: Set<string>): string {
  let k = base.slice(0, 48)
  let n = 2
  while (keys.has(k)) {
    const suffix = `_${n}`
    k = `${base.slice(0, Math.max(1, 48 - suffix.length))}${suffix}`
    n++
  }
  return k
}

interface ReviewTemplateEditorProps {
  cadence: ReviewCadence
  /** Current fields from the server (already resolved defaults vs custom). */
  fields: ReviewTemplateField[]
}

/**
 * Collapsible editor for Monthly / Quarterly review prompts — reorder, rename
 * labels, edit placeholders, add/remove rows (Pro).
 *
 * Saves via `PATCH /api/review-templates`; parent should `router.refresh()`
 * after save so forms pick up new keys.
 */
export function ReviewTemplateEditor({
  cadence,
  fields: initialFields,
}: ReviewTemplateEditorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState<ReviewTemplateField[]>(initialFields)
  const [newLabel, setNewLabel] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFields(initialFields)
  }, [initialFields])

  async function save() {
    if (fields.length === 0) {
      toast.error("Keep at least one field.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/review-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cadence, fields }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Could not save template.")
        return
      }
      setFields(body.data.fields as ReviewTemplateField[])
      router.refresh()
    } catch {
      toast.error("Network error.")
    } finally {
      setSaving(false)
    }
  }

  function resetToDefaults() {
    setFields(defaultFieldsForCadence(cadence))
    toast.message("Defaults loaded — tap Save to apply.")
  }

  function removeAt(idx: number) {
    if (fields.length <= 1) {
      toast.error("You need at least one prompt.")
      return
    }
    setFields((prev) => prev.filter((_, i) => i !== idx))
  }

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir
    if (j < 0 || j >= fields.length) return
    setFields((prev) => {
      const next = [...prev]
      ;[next[idx], next[j]] = [next[j], next[idx]]
      return next
    })
  }

  function addFromLabel() {
    const label = newLabel.trim()
    if (!label) return
    const keys = new Set(fields.map((f) => f.key))
    const base = slugifyLabel(label)
    const key = nextUniqueKey(base, keys)
    setFields((prev) => [
      ...prev,
      {
        key,
        label,
        placeholder: "",
      },
    ])
    setNewLabel("")
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm hover:bg-muted/30 transition-colors"
      >
        <span className="inline-flex items-center gap-2 font-medium">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          Customize review fields
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-border/70 px-4 py-4 space-y-4 text-sm">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Rename prompts, change placeholders, add rows (up to 12), or reorder.
            Answers are saved under stable keys — removing a field hides past text
            until you add the field back with the same key.
          </p>

          <ul className="space-y-3">
            {fields.map((f, idx) => (
              <li
                key={f.key}
                className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/40 p-3 sm:flex-row sm:items-start"
              >
                <div className="flex items-center gap-1 shrink-0 pt-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={idx === 0}
                    onClick={() => move(idx, -1)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={idx === fields.length - 1}
                    onClick={() => move(idx, 1)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 ml-0.5 hidden sm:block" />
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <Input
                    value={f.label}
                    onChange={(e) =>
                      setFields((prev) =>
                        prev.map((row, i) =>
                          i === idx ? { ...row, label: e.target.value } : row,
                        ),
                      )
                    }
                    placeholder="Field label"
                    className="font-medium"
                  />
                  <Input
                    value={f.placeholder ?? ""}
                    onChange={(e) =>
                      setFields((prev) =>
                        prev.map((row, i) =>
                          i === idx
                            ? { ...row, placeholder: e.target.value || undefined }
                            : row,
                        ),
                      )
                    }
                    placeholder="Placeholder hint (optional)"
                    className="text-xs"
                  />
                  <div className="text-[10px] font-mono text-muted-foreground">
                    key: {f.key}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove field"
                  onClick={() => removeAt(idx)}
                  className={cn(
                    "rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 self-start",
                    fields.length <= 1 && "opacity-40 pointer-events-none",
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="New prompt label…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addFromLabel()
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={fields.length >= 12 || !newLabel.trim()}
              onClick={addFromLabel}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add field
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={resetToDefaults}>
              Reset to defaults
            </Button>
            <Button type="button" size="sm" onClick={save} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Saving…
                </>
              ) : (
                "Save fields"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
