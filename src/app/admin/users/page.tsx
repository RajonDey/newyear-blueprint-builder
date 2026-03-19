import type { Metadata } from "next"

export const metadata: Metadata = { title: "Users - Admin" }

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Users</h1>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        User management table will be built in Phase 4.
      </div>
    </div>
  )
}
