import type { Metadata } from "next"

export const metadata: Metadata = { title: "Settings" }

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="space-y-6">
        <div className="rounded-lg border p-6 space-y-2">
          <h3 className="font-semibold">Profile</h3>
          <p className="text-sm text-muted-foreground">Manage your account settings.</p>
        </div>
        <div className="rounded-lg border p-6 space-y-2">
          <h3 className="font-semibold">Subscription</h3>
          <p className="text-sm text-muted-foreground">Manage your plan and billing.</p>
        </div>
        <div className="rounded-lg border p-6 space-y-2">
          <h3 className="font-semibold">Preferences</h3>
          <p className="text-sm text-muted-foreground">Theme, timezone, and notification settings.</p>
        </div>
      </div>
    </div>
  )
}
