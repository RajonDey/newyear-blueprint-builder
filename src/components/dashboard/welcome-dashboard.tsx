"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { WheelIcebreaker } from "./wheel-icebreaker"
import {
  Target,
  ListChecks,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react"

const JOURNEY_STEPS = [
  {
    icon: Target,
    title: "Set your goals",
    description: "Choose 3–5 intentional goals across the areas of life that matter most.",
  },
  {
    icon: ListChecks,
    title: "Build daily habits",
    description: "Attach small, repeatable actions to each goal — where real change happens.",
  },
  {
    icon: CalendarCheck,
    title: "Plan & review each week",
    description: "Set weekly priorities, then reflect on what moved and what's stuck.",
  },
  {
    icon: TrendingUp,
    title: "Track real progress",
    description: "Key results, streaks, and monthly reviews show you the compound effect.",
  },
]

interface WelcomeDashboardProps {
  userName?: string | null
}

export function WelcomeDashboard({ userName }: WelcomeDashboardProps) {
  const [showWheel, setShowWheel] = useState(false)
  const firstName = userName?.split(" ")[0] || "there"

  if (showWheel) {
    return <WheelIcebreaker userName={userName} />
  }

  return (
    <div className="relative space-y-10 max-w-4xl mx-auto py-4">
      <MandalaWatermark position="top-right" size="sm" />

      <div className="text-center space-y-4">
        <h1 className="font-display text-4xl font-semibold">
          Welcome, {firstName}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          This is your space to plan your year, track your progress, and actually
          achieve what matters to you. Here&apos;s how it works.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {JOURNEY_STEPS.map((step, i) => (
          <Card key={step.title} className="relative overflow-hidden">
            <CardContent className="pt-6 pb-5">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    <span className="text-accent mr-1.5">{i + 1}.</span>
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <OrnamentDivider variant="lotus" />

      <div className="flex flex-col items-center text-center space-y-5">
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold">
            Ready to begin?
          </h2>
          <p className="text-muted-foreground max-w-md">
            Start with a quick life assessment, then build your plan step by step.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" onClick={() => setShowWheel(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Start with Life Assessment
            <span className="text-xs opacity-75 ml-1 flex items-center gap-0.5">
              <Clock className="h-3 w-3" /> 30 sec
            </span>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link href="/plan/new">
              Jump to Full Plan
              <span className="text-xs opacity-75 ml-1 flex items-center gap-0.5">
                <Clock className="h-3 w-3" /> ~15 min
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
