import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { getRecapData, type RecapPeriod, type RecapData } from "@/lib/queries/recap"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { ProMark } from "@/components/atmosphere/pro-mark"
import { RecapActions } from "@/components/recap/recap-actions"
import { WheelRadar } from "@/components/recap/wheel-radar"

export const dynamic = "force-dynamic"

const VALID: RecapPeriod[] = ["weekly", "monthly", "quarterly"]

const RHYTHM_BACK_HREF: Record<RecapPeriod, string> = {
  weekly: "/rhythm/weekly",
  monthly: "/rhythm/monthly",
  quarterly: "/rhythm/quarterly",
}

const RHYTHM_BACK_LABEL: Record<RecapPeriod, string> = {
  weekly: "Back to weekly planner",
  monthly: "Back to monthly planner",
  quarterly: "Back to quarterly planner",
}

const META: Record<RecapPeriod, { title: string; hint: string }> = {
  weekly: { title: "A quiet week of building.", hint: "Weekly recap" },
  monthly: { title: "The month, in one card.", hint: "Monthly recap" },
  quarterly: {
    title: "A season closed with intent.",
    hint: "Quarterly recap",
  },
}

interface RecapPageProps {
  params: Promise<{ period: string }>
}

export async function generateMetadata({
  params,
}: RecapPageProps): Promise<Metadata> {
  const { period } = await params
  const safe = VALID.includes(period as RecapPeriod)
    ? (period as RecapPeriod)
    : "weekly"
  return { title: `${META[safe].hint}` }
}

export default async function RecapPage({ params }: RecapPageProps) {
  const session = await requireAuth()
  const { period } = await params
  if (!VALID.includes(period as RecapPeriod)) {
    notFound()
  }
  const data = await getRecapData(session.user.id, period as RecapPeriod)
  const meta = META[period as RecapPeriod]
  const recapPeriod = period as RecapPeriod

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={RHYTHM_BACK_HREF[recapPeriod]}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors print:hidden"
          >
            <ArrowLeft className="h-4 w-4" /> {RHYTHM_BACK_LABEL[recapPeriod]}
          </Link>
          <RecapActions title={`${meta.hint} — YearInReview`} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">
            {meta.title}
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            A shareable summary of what compounded — quietly.
          </p>
        </div>
        <OrnamentDivider variant="asterisk" />

        <div className="relative mx-auto w-full max-w-2xl aspect-[4/5] rounded-3xl border border-border bg-card overflow-hidden shadow-sm recap-card">
          <div className="absolute inset-0 bg-gradient-to-br from-amber/15 via-transparent to-foreground/5 pointer-events-none" />
          <div className="relative h-full p-8 md:p-10 flex flex-col">
            <CardHeader data={data} period={period as RecapPeriod} />
            <div className="flex-1 flex items-center">
              {data ? <CardBody data={data} /> : <EmptyCard period={period as RecapPeriod} />}
            </div>
            <CardFooter userName={data?.userName ?? null} />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground print:hidden">
          <span>Switch view:</span>
          {VALID.map((p) => (
            <Link
              key={p}
              href={`/recap/${p}`}
              className={`rounded-full border px-3 py-1 transition-colors ${
                p === period
                  ? "border-foreground text-foreground"
                  : "border-border hover:bg-accent/10"
              }`}
            >
              {p[0].toUpperCase() + p.slice(1)}
            </Link>
          ))}
        </div>
      </main>

      <style>{`
        @media print {
          body { background: white !important; }
          header, nav, .print\\:hidden { display: none !important; }
          .recap-card { box-shadow: none !important; break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}

function CardHeader({
  data,
  period,
}: {
  data: RecapData | null
  period: RecapPeriod
}) {
  const label = (() => {
    if (!data) return period[0].toUpperCase() + period.slice(1)
    if (data.kind === "weekly") return `Week ${data.weekNumber} · ${data.year}`
    if (data.kind === "monthly") return `${data.monthName} ${data.year}`
    return `${data.quarter} · ${data.year}`
  })()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <ProMark className="text-xs" />
        <span className="font-display text-sm tracking-tight">YearInReview</span>
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{label}</span>
    </div>
  )
}

function CardFooter({ userName }: { userName: string | null }) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-border/60">
      <span className="text-xs text-muted-foreground">{userName || "Your year"}</span>
      <span className="text-xs text-muted-foreground">yearinreview.online</span>
    </div>
  )
}

function EmptyCard({ period }: { period: RecapPeriod }) {
  const label =
    period === "weekly"
      ? "weekly check-in"
      : period === "monthly"
        ? "monthly review"
        : "quarterly review"
  const href =
    period === "weekly"
      ? "/rhythm/weekly?tab=review"
      : period === "monthly"
        ? "/rhythm/monthly"
        : "/rhythm/quarterly"
  return (
    <div className="w-full text-center">
      <p className="font-display text-2xl tracking-tight mb-3">
        Nothing to recap yet.
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        Complete your {label} and a shareable card will appear here.
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Complete it now
      </Link>
    </div>
  )
}

function CardBody({ data }: { data: RecapData }) {
  if (data.kind === "weekly") {
    const wins = data.projectCheckIns.filter((g) => g.progressRating >= 3)
    return (
      <div className="w-full">
        <div className="text-xs text-muted-foreground mb-2">Theme of the week</div>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-tight mb-8">
          {data.theme || data.nextWeekFocus || "Small reps. Steady hands."}
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Stat
            value={data.mood !== null ? `${data.mood}/5` : "—"}
            label="Mood"
          />
          <Stat
            value={`${wins.length}/${data.projectCheckIns.length || data.priorityGoals.length || 0}`}
            label="Projects progressed"
          />
          <Stat
            value={`W${data.weekNumber}`}
            label={data.quarter}
          />
        </div>
        {data.priorityGoals.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">
              You said yes to
            </div>
            <ul className="space-y-2">
              {data.priorityGoals.slice(0, 4).map((g) => (
                <li key={g.id} className="text-sm">
                  <span className="text-foreground">{g.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
  if (data.kind === "monthly") {
    return (
      <div className="w-full">
        <div className="text-xs text-muted-foreground mb-2">The month, in shape</div>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-tight mb-8">
          {data.theme || `${data.monthName}, kept honest.`}
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber mb-3">
              Wins
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {data.winsText || (
                <span className="text-muted-foreground italic">No wins noted.</span>
              )}
            </p>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Adjustments
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {data.adjustments || (
                <span className="text-muted-foreground italic">None recorded.</span>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }
  // quarterly
  return (
    <div className="w-full">
      <div className="text-xs text-muted-foreground mb-2">Theme of the quarter</div>
      <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-tight mb-4">
        {data.theme || data.summary?.split(".")[0] || "A season of quiet building."}
      </h2>
      <WheelRadar entries={data.wheelEntries} />
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Carry forward what worked. Release what didn&apos;t.
      </p>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3 text-center">
      <div className="font-display text-2xl tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  )
}
