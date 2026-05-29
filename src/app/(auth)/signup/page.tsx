import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { resolveSessionUser } from "@/lib/auth-guard"
import { buildAuthContinueUrl } from "@/lib/post-auth-redirect"
import { LoginForm } from "@/components/shared/login-form"

export const metadata: Metadata = { title: "Sign Up" }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const sp = await searchParams
  const session = await auth()
  const verified = await resolveSessionUser(session)
  const clearStaleSession = Boolean(session?.user && !verified)

  if (verified) {
    redirect(buildAuthContinueUrl(sp.callbackUrl))
  }

  return (
    <LoginForm
      mode="signup"
      authError={sp.error}
      callbackUrl={sp.callbackUrl}
      clearStaleSession={clearStaleSession}
    />
  )
}
