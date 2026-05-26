import { requireAuth } from "@/lib/auth-guard"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return <div className="min-h-screen bg-background text-foreground">{children}</div>
}
