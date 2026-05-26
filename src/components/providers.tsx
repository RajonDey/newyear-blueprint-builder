"use client"

import { Toaster } from "sonner"
import type { ReactNode } from "react"

/**
 * Top-level client provider tree.
 *
 * Currently this only mounts `<Toaster>` for global toasts. The app does
 * not use React Query, Zustand, or any other client-side state store —
 * server state flows through React Server Components + `lib/queries/*`,
 * and component-local state stays in `useState` hooks.
 *
 * If you ever need a global client store again (e.g. for a multi-step
 * wizard with persisted progress) add the provider here.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground",
          },
        }}
      />
    </>
  )
}
