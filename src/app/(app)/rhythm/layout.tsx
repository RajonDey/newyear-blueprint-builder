import { RhythmTabs } from "@/components/rhythm/rhythm-tabs"

export default function RhythmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <div className="bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="font-display text-3xl font-semibold">Your Rhythm</h1>
          <p className="text-muted-foreground mt-1">Execute today. Course-correct tomorrow. Win the year.</p>
        </div>
        <RhythmTabs />
      </div>
      <div className="flex-1 py-8">
        {children}
      </div>
    </div>
  )
}
