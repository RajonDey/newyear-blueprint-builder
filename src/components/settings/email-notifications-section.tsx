"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Email notification toggles — divided list, silent saves (Wave D5).
 */

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type {
  EmailPreferenceKey,
  ResolvedEmailPreferences,
} from "@/lib/user-preferences"

const EMAIL_TOGGLES: {
  key: EmailPreferenceKey
  label: string
  description: string
}[] = [
  {
    key: "weeklyReviewReminder",
    label: "Weekly review reminder",
    description: "Fridays when you haven't logged this week's review yet.",
  },
  {
    key: "monthlyNudge",
    label: "Monthly recap nudge",
    description: "First of the month — Pro only, when your monthly review is open.",
  },
  {
    key: "quarterlyNudge",
    label: "Quarterly check-in",
    description: "Start of each quarter — Pro only.",
  },
  {
    key: "dailyNudge",
    label: "Daily rhythm nudge",
    description: "Once when your daily systems streak slips — not a daily blast.",
  },
]

interface EmailNotificationsSectionProps {
  initialPreferences: ResolvedEmailPreferences
}

export function EmailNotificationsSection({
  initialPreferences,
}: EmailNotificationsSectionProps) {
  const [prefs, setPrefs] = useState(initialPreferences)
  const [savingKey, setSavingKey] = useState<EmailPreferenceKey | null>(null)

  async function togglePreference(key: EmailPreferenceKey, enabled: boolean) {
    const previous = prefs[key]
    setPrefs((current) => ({ ...current, [key]: enabled }))
    setSavingKey(key)

    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailPreferences: { [key]: enabled },
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      const json = await res.json()
      if (json.data?.emailPreferences) {
        setPrefs(json.data.emailPreferences)
      }
    } catch {
      setPrefs((current) => ({ ...current, [key]: previous }))
      toast.error("Failed to update email preferences")
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {EMAIL_TOGGLES.map(({ key, label, description }) => {
        const id = `email-${key}`
        const saving = savingKey === key

        return (
          <li key={key} className="flex items-start gap-3 py-4">
            <Checkbox
              id={id}
              checked={prefs[key]}
              disabled={saving}
              onCheckedChange={(checked) => {
                togglePreference(key, checked === true)
              }}
              className="mt-0.5"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor={id} className="text-sm font-medium leading-none">
                {label}
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            {saving && (
              <Loader2
                className="h-4 w-4 shrink-0 animate-spin text-muted-foreground"
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}
