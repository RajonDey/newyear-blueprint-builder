"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface LoginFormProps {
  mode?: "login" | "signup"
}

export function LoginForm({ mode = "login" }: LoginFormProps) {
  const isSignup = mode === "signup"

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        {isSignup ? "Create your account" : "Welcome back"}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {isSignup
          ? "Sign up form will be built in Phase 1."
          : "Login form will be built in Phase 1."}
      </p>
      <div className="flex flex-col gap-4">
        <Button asChild>
          <Link href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Already have an account? Log in" : "Need an account? Sign up"}
          </Link>
        </Button>
      </div>
    </div>
  )
}
