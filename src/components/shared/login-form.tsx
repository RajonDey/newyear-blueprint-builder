"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrnamentDivider } from "@/components/shared/ornament-divider";
import { Loader2, Mail } from "lucide-react";

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
};

interface LoginFormProps {
  mode?: "login" | "signup";
  authError?: string;
}

export function LoginForm({ mode = "login", authError }: LoginFormProps) {
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);

  const errorMessage = authError
    ? (AUTH_ERROR_MESSAGES[authError] ?? AUTH_ERROR_MESSAGES.Default)
    : null;

  async function handleGoogle() {
    setLoading("google");
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading("email");
    await signIn("resend", { email, callbackUrl: "/dashboard" });
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden bg-lotus-corner">
      <div className="px-8 py-9 sm:px-10 sm:py-10 space-y-7">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {errorMessage}
          </div>
        )}
        <div className="text-center space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {isSignup ? "Start here" : "Welcome back"}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {isSignup ? "Begin your journey" : "Sign in"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
            {isSignup
              ? "Free to start, no credit card. You will use the same planning workspace you saw on the home page."
              : "Pick up your yearly plan, weekly rhythm, and daily systems where you left off."}
          </p>
        </div>

        <OrnamentDivider variant="lotus" className="py-1" />

        <div className="space-y-5">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-2.5 border-border/90 bg-background hover:bg-muted/40 font-medium"
            onClick={handleGoogle}
            disabled={loading !== null}
          >
            {loading === "google" ? (
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
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground font-medium tracking-wide uppercase">
                or email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading !== null}
                className="h-11 bg-background/80 border-border/90"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 gap-2 font-display font-semibold tracking-wide shadow-sm"
              disabled={loading !== null}
            >
              {loading === "email" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Send magic link
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground pt-1">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline underline-offset-4"
              >
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link
                href="/signup"
                className="text-primary font-semibold hover:underline underline-offset-4"
              >
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
