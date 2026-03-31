import type { Metadata } from "next"
import Link from "next/link"
import { getAdminUsers } from "@/lib/queries/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = { title: "Users - Admin" }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const { users, total, totalPages } = await getAdminUsers(page, 20)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Users</h1>
        <p className="text-muted-foreground mt-1">
          {total} total users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Plans</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3 px-4">{user.name || "—"}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={user.planTier === "PRO" ? "default" : "secondary"}
                      >
                        {user.planTier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{user.role}</td>
                    <td className="py-3 px-4">{user._count.yearlyPlans}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex gap-2 mt-4">
              {page > 1 && (
                <Link
                  href={`/admin/users?page=${page - 1}`}
                  className="text-sm text-accent hover:underline"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/admin/users?page=${page + 1}`}
                  className="text-sm text-accent hover:underline"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
