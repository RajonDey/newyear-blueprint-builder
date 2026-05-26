"use client"

import { signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail } from "lucide-react"

/* Hallmark · design-system: design.md · designed-as-app
 * Conversion login/signup — left-aligned Letter form on page paper (§11).
 */

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  SessionInvalid:
    "Your session expired or this account is no longer available. Please sign in again.",
  AccessDenied:
    "Sign-in was denied. If you had an account, it may have been deactivated—contact support if you think this is wrong.",
  Configuration:
    "Authentication is misconfigured. Please try again later or contact support.",
  Verification:
    "The sign-in link expired or was already used. Request a new magic link.",
  Default: "Something went wrong while signing in. Please try again.",
}

async function freshSignIn(
  provider: "google" | "resend",
  options?: Parameters<typeof signIn>[1],
) {
  await signOut({ redirect: false })
  await signIn(provider, options)
}

function useDelayedSpinner(active: boolean, delayMs = 200) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => setShow(true), delayMs)
    return () => {
      window.clearTimeout(timer)
      setShow(false)
    }
  }, [active, delayMs])
  return show
}

interface LoginFormProps {
  mode?: "login" | "signup"
  authError?: string
  /** JWT cookie present but user row missing / session neutered — clear before sign-in */
  clearStaleSession?: boolean
}

export function LoginForm({
  mode = "login",
  authError,
  clearStaleSession = false,
}: LoginFormProps) {
  const isSignup = mode === "signup"
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState<"google" | "email" | null>(null)
  const showSpinner = useDelayedSpinner(loading !== null)

  useEffect(() => {
    if (clearStaleSession || authError === "SessionInvalid") {
      void signOut({ redirect: false })
    }
  }, [clearStaleSession, authError])

  const errorMessage = authError
    ? (AUTH_ERROR_MESSAGES[authError] ?? AUTH_ERROR_MESSAGES.Default)
    : null

  async function handleGoogle() {
    setLoading("google")
    await freshSignIn("google", { callbackUrl: "/dashboard" })
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading("email")
    await freshSignIn("resend", { email, callbackUrl: "/dashboard" })
  }

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      <header className="space-y-3">
        <p className="font-display italic text-lg text-muted-foreground">
          {isSignup ? "New here," : "Welcome back,"}
        </p>
        <h1 className="font-display text-3xl md:text-[2.35rem] tracking-tight text-foreground leading-[1.1]">
          {isSignup ? "Begin your year" : "Pick up where you left off"}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed text-pretty max-w-md">
          {isSignup
            ? "Free to start — no card. The same calm workspace from the home page."
            : "Your yearly plan, weekly rhythm, and daily systems are waiting."}
        </p>
      </header>

      <div className="space-y-5">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 gap-2.5 border-border bg-background font-medium hover:bg-muted/50 hover:text-foreground hover:border-border"
          onClick={handleGoogle}
          disabled={loading !== null}
        >
          {loading === "google" && showSpinner ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/80" />
          </div>
          <div className="relative text-xs">
            <span className="bg-background pr-3 text-muted-foreground">
              or use email
            </span>
          </div>
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading !== null}
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 gap-2"
            disabled={loading !== null}
          >
            {loading === "email" && showSpinner ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Send magic link
          </Button>
        </form>
      </div>

      <p className="text-sm text-muted-foreground pt-2">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
            >
              Log in
            </Link>
            <span className="text-muted-foreground/80">
              {" "}· about ninety seconds to start.
            </span>
          </>
        ) : (
          <>
            New here?{" "}
            <Link
              href="/signup"
              className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
            >
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
