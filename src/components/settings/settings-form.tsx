"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Settings — workbench sections, silent saves, status tokens (Wave D5).
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Check,
  ExternalLink,
  Globe,
  Loader2,
  LogOut,
  ShieldAlert,
  Sparkles,
  Trash2,
  User,
  Download,
} from "lucide-react"
import { toast } from "sonner"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { EmailNotificationsSection } from "@/components/settings/email-notifications-section"
import { DataExportSection } from "@/components/settings/data-export-section"
import { YearSettingsSection } from "@/components/settings/year-settings-section"
import type { YearlyPlanSettingsData } from "@/lib/queries/yearly-plan"
import type { ResolvedEmailPreferences } from "@/lib/user-preferences"
import { SITE_LEGAL_NAME, getSupportEmail } from "@/lib/legal"
import { marketingPlanCopy } from "@/lib/marketing-plan-copy"
import { cn } from "@/lib/utils"

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

type SettingsUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  timezone: string | null
}

interface SettingsFormProps {
  planTier: string
  initialUser?: SettingsUser
  initialEmailPreferences: ResolvedEmailPreferences
  yearlyPlan?: YearlyPlanSettingsData
}

export function SettingsForm({
  planTier,
  initialUser,
  initialEmailPreferences,
  yearlyPlan,
}: SettingsFormProps) {
  const [loading, setLoading] = useState(!initialUser)
  const [saving, setSaving] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const isPro = planTier === "PRO"
  const [name, setName] = useState(initialUser?.name ?? "")
  const [email, setEmail] = useState(initialUser?.email ?? "")
  const [timezone, setTimezone] = useState(initialUser?.timezone ?? "UTC")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)

  const supportEmail = getSupportEmail()
  const deletePhrase = "DELETE MY ACCOUNT"

  useEffect(() => {
    if (initialUser) return
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
  }, [initialUser])

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
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber" />
      </div>
    )
  }

  return (
    <div className="space-y-10 [&>section+section]:border-t [&>section+section]:border-border [&>section+section]:pt-10">
      <PageHeader
        title="Settings"
        description="Your profile, plan, and the quieter details that make the app feel yours."
      />

      <Section
        id="billing"
        icon={<Sparkles className="h-4 w-4 text-amber shrink-0" />}
        title="Membership"
        description="What you have access to today, and how to change it."
      >
        {isPro ? (
          <ProActiveCard />
        ) : (
          <ProUpsellCardInline
            onCheckout={async () => {
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
                toast.error(
                  err instanceof Error ? err.message : "Failed to start checkout",
                )
              } finally {
                setCheckoutLoading(false)
              }
            }}
            checkoutLoading={checkoutLoading}
          />
        )}
      </Section>

      {yearlyPlan && (
        <Section
          id="your-year"
          icon={<Calendar className="h-4 w-4 text-amber shrink-0" />}
          title="Your year"
          description="Edit your theme word, archive a finished year, or start the next one — no re-onboarding."
        >
          <YearSettingsSection data={yearlyPlan} />
        </Section>
      )}

      <Section
        id="knowledge"
        icon={<BookOpen className="h-4 w-4 text-amber shrink-0" />}
        title="Notes & resources"
        description="Browse everything you've captured across areas and projects. Add new items from detail pages — these indexes are read-first."
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/knowledge/notes"
            className="inline-flex flex-1 items-center justify-between gap-2 border border-border px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
          >
            <span>All notes</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
          <Link
            href="/knowledge/resources"
            className="inline-flex flex-1 items-center justify-between gap-2 border border-border px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
          >
            <span>All resources</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>
      </Section>

      <Section
        icon={<User className="h-4 w-4 text-amber shrink-0" />}
        title="Profile"
        description="Used in greetings, recap cards, and your account email."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Email
              </Label>
              <Input id="email" value={email} disabled className="bg-muted/40" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Email is managed by your sign-in provider. To change it, sign in with the new address.
          </p>
          <SaveButton saving={saving} />
        </form>
      </Section>

      <Section
        icon={<Globe className="h-4 w-4 text-amber shrink-0" />}
        title="Timezone"
        description="Drives 'today' for your daily check-in, systems completion, and recap cards."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="timezone" className="text-xs text-muted-foreground">
              Current
            </Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone" className="w-full sm:w-80">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SaveButton saving={saving} />
        </form>
      </Section>

      <Section
        id="export"
        icon={<Download className="h-4 w-4 text-amber shrink-0" />}
        title="Export your data"
        description="Take your full year with you — reflections, plans, projects, and rhythm history."
      >
        <DataExportSection />
      </Section>

      <Section
        id="notifications"
        icon={<Bell className="h-4 w-4 text-amber shrink-0" />}
        title="Notifications"
        description="Email reminders for your rhythm — all on by default; turn off anything you don't want."
      >
        <EmailNotificationsSection initialPreferences={initialEmailPreferences} />
      </Section>

      <Section
        icon={<ShieldAlert className="h-4 w-4 text-amber shrink-0" />}
        title="Sign out & legal"
        description="Sign out on this device. For Google sign-in, you can also revoke the app from your Google account to remove access everywhere."
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
          <div className="text-xs text-muted-foreground inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{SITE_LEGAL_NAME} ·</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
            <Link
              href="/privacy/california"
              className="hover:text-foreground transition-colors"
            >
              California
            </Link>
            <Link href="/refund" className="hover:text-foreground transition-colors">
              Refunds
            </Link>
          </div>
        </div>
      </Section>

      <Section
        icon={<Trash2 className="h-4 w-4 text-status-risk shrink-0" />}
        title="Danger zone"
        description="Delete your account and everything tied to it. Cannot be undone."
        tone="danger"
      >
        <div className="border border-status-risk/30 bg-status-risk/10 p-5">
          <p className="text-sm leading-relaxed">
            Export your data first if you want a copy — deletion is permanent.
            If you have an active Pro subscription, cancel billing in your Lemon
            Squeezy customer portal first — or email{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="font-medium text-foreground hover:underline underline-offset-2"
            >
              {supportEmail}
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-status-risk text-destructive-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete my account
          </button>
        </div>
      </Section>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Delete account permanently?</DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <span className="block">
                All of your data will be removed. You will lose access immediately.
              </span>
              <span className="block text-muted-foreground">
                Download an export from Settings first if you want to keep a copy.
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
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
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
                  setDeleteOpen(false)
                  await signOut({ callbackUrl: "/" })
                } catch (e: unknown) {
                  toast.error(
                    e instanceof Error ? e.message : "Failed to delete account",
                  )
                } finally {
                  setDeleting(false)
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-status-risk text-destructive-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete forever
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Section({
  id,
  icon,
  title,
  description,
  children,
  tone,
}: {
  id?: string
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
  tone?: "default" | "danger"
}) {
  return (
    <section id={id} className="grid gap-6 md:grid-cols-[200px_1fr]">
      <header>
        <h2
          className={cn(
            "font-display text-xl tracking-tight inline-flex items-center gap-2",
            tone === "danger" && "text-status-risk",
          )}
        >
          {icon}
          {title}
        </h2>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {description}
        </p>
      </header>
      <div>{children}</div>
    </section>
  )
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      Save changes
    </button>
  )
}

function ProActiveCard() {
  return (
    <div className="border border-status-positive/30 bg-status-positive/10 p-5">
      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-status-positive">
        <Check className="h-3 w-3" />
        Pro · Active
      </div>
      <h3 className="font-display text-lg tracking-tight mt-1.5">
        You&apos;re on Pro
      </h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        Full access to up to {marketingPlanCopy.proProjects} projects, monthly + quarterly reviews,
        analytics depth, file uploads, and the cinematic Wrapped.
      </p>
      <div className="mt-3 flex items-center gap-3 text-xs">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          See plan details
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

function ProUpsellCardInline({
  onCheckout,
  checkoutLoading,
}: {
  onCheckout: () => Promise<void>
  checkoutLoading: boolean
}) {
  return (
    <div className="border border-amber/40 bg-amber-tint p-6">
      <div className="text-xs font-medium text-amber mb-2">Pro · $49 / year</div>
      <h3 className="font-display text-2xl tracking-tight leading-snug">
        The whole year, without the caps
      </h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        Unlimited projects, monthly + quarterly reviews, file uploads, advanced
        analytics, and the cinematic Wrapped at year&apos;s end.
      </p>
      <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 text-xs text-foreground/85">
        {[
          "Up to 20 projects per plan",
          "200 tasks per project",
          "Quarterly review & full Wrapped",
          "2 GB file storage on resources",
        ].map((b) => (
          <li key={b} className="flex items-start gap-1.5">
            <span aria-hidden className="mt-1.5 h-1 w-1 rounded-full bg-amber shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCheckout}
          disabled={checkoutLoading}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {checkoutLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Upgrade to Pro
        </button>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          See full comparison
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
