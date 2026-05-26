"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  resolveMonthlyWorkspaceTab,
  resolveQuarterlyWorkspaceTab,
  resolveWeeklyWorkspaceTab,
  type MonthlyTabContext,
  type QuarterlyTabContext,
  type RhythmTab,
  type WeeklyTabContext,
} from "@/lib/rhythm-defaults"

const CADENCE_TAB_LABELS = {
  weekly: { plan: "Plan week", review: "Review week" },
  monthly: { plan: "Plan month", review: "Review month" },
  quarterly: { plan: "Plan quarter", review: "Review quarter" },
} as const

export type CadenceKind = keyof typeof CADENCE_TAB_LABELS

type CadenceWorkspaceProps =
  | {
      cadence: "weekly"
      planTab: React.ReactNode
      reviewTab: React.ReactNode
      periodBar?: React.ReactNode
      tabContext?: WeeklyTabContext
    }
  | {
      cadence: "monthly"
      planTab: React.ReactNode
      reviewTab: React.ReactNode
      periodBar?: React.ReactNode
      tabContext: MonthlyTabContext
    }
  | {
      cadence: "quarterly"
      planTab: React.ReactNode
      reviewTab: React.ReactNode
      periodBar?: React.ReactNode
      tabContext: QuarterlyTabContext
    }

function resolveTab(
  cadence: CadenceKind,
  tabParam: string | null,
  tabContext: WeeklyTabContext | MonthlyTabContext | QuarterlyTabContext | undefined,
): RhythmTab {
  switch (cadence) {
    case "weekly":
      return resolveWeeklyWorkspaceTab(tabParam ?? undefined, tabContext)
    case "monthly":
      return resolveMonthlyWorkspaceTab(
        tabParam,
        tabContext as MonthlyTabContext,
      )
    case "quarterly":
      return resolveQuarterlyWorkspaceTab(
        tabParam,
        tabContext as QuarterlyTabContext,
      )
  }
}

/**
 * Shared Plan / Review tab shell for weekly, monthly, and quarterly rhythm pages.
 * Must be rendered under a parent `<Suspense>` because of `useSearchParams`.
 */
export function CadenceWorkspace(props: CadenceWorkspaceProps) {
  const { cadence, planTab, reviewTab, periodBar } = props
  const tabContext =
    props.cadence === "weekly" ? props.tabContext : props.tabContext

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tab = resolveTab(cadence, searchParams.get("tab"), tabContext)

  const onValueChange = useCallback(
    (value: string) => {
      const next: RhythmTab = value === "review" ? "review" : "plan"
      const params = new URLSearchParams(searchParams.toString())
      const defaultTab = resolveTab(cadence, null, tabContext)
      if (next === defaultTab) {
        params.delete("tab")
      } else {
        params.set("tab", next)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [cadence, pathname, router, searchParams, tabContext],
  )

  const labels = CADENCE_TAB_LABELS[cadence]

  const tabs = (
    <Tabs value={tab} onValueChange={onValueChange} className="w-full">
      <TabsList className="grid h-auto w-full max-w-xl grid-cols-2 gap-1 p-1">
        <TabsTrigger value="plan" className="min-h-11 py-2.5">
          {labels.plan}
        </TabsTrigger>
        <TabsTrigger value="review" className="min-h-11 py-2.5">
          {labels.review}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="plan" className="mt-6">
        {planTab}
      </TabsContent>
      <TabsContent value="review" className="mt-6">
        {reviewTab}
      </TabsContent>
    </Tabs>
  )

  if (periodBar) {
    return (
      <div className="space-y-6">
        {periodBar}
        {tabs}
      </div>
    )
  }

  return tabs
}
