import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?error=SessionInvalid")
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }
  return session
}
