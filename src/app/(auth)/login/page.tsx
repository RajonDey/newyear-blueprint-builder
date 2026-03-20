import type { Metadata } from "next"
import { LoginForm } from "@/components/shared/login-form"

export const metadata: Metadata = { title: "Log In" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const sp = await searchParams
  return <LoginForm authError={sp.error} />
}
