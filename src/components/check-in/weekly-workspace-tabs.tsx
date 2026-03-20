"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function WeeklyWorkspaceTabs({
  planSlot,
  reviewSlot,
}: {
  planSlot: React.ReactNode
  reviewSlot: React.ReactNode
}) {
  return (
    <Tabs defaultValue="plan" className="w-full">
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
    </Tabs>
  )
}
