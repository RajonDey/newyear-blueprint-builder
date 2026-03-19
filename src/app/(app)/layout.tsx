import { requireAuth } from "@/lib/auth-guard"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { Topbar } from "@/components/shared/topbar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar user={session.user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
