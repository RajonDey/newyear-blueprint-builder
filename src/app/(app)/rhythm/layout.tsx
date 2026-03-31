import { RhythmTabs } from "@/components/rhythm/rhythm-tabs"

export default function RhythmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="-m-4 sm:-m-6 flex flex-col min-h-[calc(100vh-4rem)]">
      <RhythmTabs />
      <div className="flex-1 bg-muted/20 px-4 sm:px-6 pt-8 pb-6">
        <div className="mx-auto max-w-3xl w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
