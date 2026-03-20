"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { Loader2, User, LogOut, Sparkles, Check, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { SITE_LEGAL_NAME, getSupportEmail } from "@/lib/legal"

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
]

interface SettingsFormProps {
  planTier: string
}

export function SettingsForm({ planTier }: SettingsFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const isPro = planTier === "PRO"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)

  const supportEmail = getSupportEmail()
  const deletePhrase = "DELETE MY ACCOUNT"

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setName(json.data.name ?? "")
          setEmail(json.data.email ?? "")
          setTimezone(json.data.timezone ?? "UTC")
        }
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined, timezone }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Profile updated")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="relative w-full space-y-8">
      <MandalaWatermark position="top-right" size="sm" />

      <div>
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <OrnamentDivider variant="lotus" />

      <Card id="billing">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" /> Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPro ? (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">You&apos;re on Pro</p>
                <p className="text-sm text-muted-foreground">
                  Full access to analytics, quarterly reviews, and more.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro for unlimited goals, quarterly reviews, advanced
                analytics, and streak shields.
              </p>
              <Button
                onClick={async () => {
                  setCheckoutLoading(true)
                  try {
                    const res = await fetch("/api/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ plan: "yearly" }),
                    })
                    const json = await res.json()
                    if (!res.ok) throw new Error(json.error || "Failed")
                    if (json.data?.url) {
                      window.location.href = json.data.url
                    } else {
                      throw new Error("No checkout URL")
                    }
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : "Failed to start checkout")
                  } finally {
                    setCheckoutLoading(false)
                  }
                }}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Upgrade to Pro — $49/year
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <User className="h-4 w-4 text-accent" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email is managed by your sign-in provider.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Legal</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Policies for {SITE_LEGAL_NAME}:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link href="/privacy/california" className="text-primary hover:underline">
                California privacy notice
              </Link>
            </li>
            <li>
              <Link href="/refund" className="text-primary hover:underline">
                Refund Policy
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign out on this device. For Google sign-in, you can also revoke the app in your Google
              account if you want to remove access everywhere.
            </p>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg font-display text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Permanently delete your account and all plans, goals, and data. This cannot be undone. If
            you have an active Pro subscription, cancel billing in your Lemon Squeezy customer
            portal first (or email{" "}
            <a href={`mailto:${supportEmail}`} className="text-primary font-medium hover:underline">
              {supportEmail}
            </a>
            ).
          </p>
          <Button variant="destructive" className="gap-2" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete my account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Delete account permanently?</DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <span className="block">
                All of your data will be removed from our systems. You will lose access immediately.
              </span>
              <span className="block font-medium text-foreground">
                Type <span className="font-mono text-sm">{deletePhrase}</span> to confirm.
              </span>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={deletePhrase}
            className="font-mono text-sm"
            autoComplete="off"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== deletePhrase || deleting}
              onClick={async () => {
                if (deleteConfirm !== deletePhrase) return
                setDeleting(true)
                try {
                  const res = await fetch("/api/user/account", { method: "DELETE" })
                  if (!res.ok) {
                    const j = await res.json().catch(() => ({}))
                    throw new Error(j.error || "Failed to delete account")
                  }
                  toast.success("Account deleted")
                  setDeleteOpen(false)
                  await signOut({ callbackUrl: "/" })
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : "Failed to delete account")
                } finally {
                  setDeleting(false)
                }
              }}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
