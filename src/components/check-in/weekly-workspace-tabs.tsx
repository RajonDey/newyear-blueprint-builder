"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type WeeklyWorkspaceTab = "plan" | "review"

export function parseWeeklyWorkspaceTab(
  tab: string | string[] | undefined
): WeeklyWorkspaceTab {
  const v = Array.isArray(tab) ? tab[0] : tab
  return v === "review" ? "review" : "plan"
}

function tabsListAndContent(
  planSlot: React.ReactNode,
  reviewSlot: React.ReactNode
) {
  return (
    <>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="plan">This week&apos;s plan</TabsTrigger>
        <TabsTrigger value="review">Weekly review</TabsTrigger>
      </TabsList>
      <TabsContent value="plan" className="mt-6">
        {planSlot}
      </TabsContent>
      <TabsContent value="review" className="mt-6">
        {reviewSlot}
      </TabsContent>
    </>
  )
}

/**
 * Must be rendered under a parent `<Suspense>` (e.g. from the weekly page RSC)
 * because of `useSearchParams`.
 */
export function WeeklyWorkspaceTabs({
  planSlot,
  reviewSlot,
}: {
  planSlot: React.ReactNode
  reviewSlot: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tab = parseWeeklyWorkspaceTab(searchParams.get("tab") ?? undefined)

  const onValueChange = useCallback(
    (value: string) => {
      const next = parseWeeklyWorkspaceTab(value)
      const params = new URLSearchParams(searchParams.toString())
      if (next === "plan") {
        params.delete("tab")
      } else {
        params.set("tab", "review")
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <Tabs value={tab} onValueChange={onValueChange} className="w-full">
      {tabsListAndContent(planSlot, reviewSlot)}
    </Tabs>
  )
}
