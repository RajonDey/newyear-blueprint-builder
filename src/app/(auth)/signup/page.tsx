import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { resolveSessionUser } from "@/lib/auth-guard"
import { LoginForm } from "@/components/shared/login-form"

export const metadata: Metadata = { title: "Sign Up" }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  const session = await auth()
  const verified = await resolveSessionUser(session)
  const clearStaleSession = Boolean(session?.user && !verified)

  return (
    <LoginForm
      mode="signup"
      authError={sp.error}
      clearStaleSession={clearStaleSession}
    />
  )
}
