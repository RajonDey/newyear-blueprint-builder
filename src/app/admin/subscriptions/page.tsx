import type { Metadata } from "next"
import Link from "next/link"
import { getAdminSubscriptions } from "@/lib/queries/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = { title: "Subscriptions - Admin" }

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const { subscriptions, total, totalPages } = await getAdminSubscriptions(page, 20)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">
          {total} total subscriptions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Period End</th>
                  <th className="text-left py-3 px-4 font-medium">Cancel at End</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-0">
                    <td className="py-3 px-4">{sub.user.name || "—"}</td>
                    <td className="py-3 px-4">{sub.user.email}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          sub.status === "ACTIVE"
                            ? "default"
                            : sub.status === "CANCELED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {sub.currentPeriodEnd
                        ? formatDate(sub.currentPeriodEnd)
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {sub.cancelAtPeriodEnd ? "Yes" : "No"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(sub.createdAt)}
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
                  href={`/admin/subscriptions?page=${page - 1}`}
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
                  href={`/admin/subscriptions?page=${page + 1}`}
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
