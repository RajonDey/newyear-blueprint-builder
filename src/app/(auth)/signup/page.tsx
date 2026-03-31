import type { Metadata } from "next"
import { LoginForm } from "@/components/shared/login-form"

export const metadata: Metadata = { title: "Sign Up" }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  return <LoginForm mode="signup" authError={sp.error} />
}
