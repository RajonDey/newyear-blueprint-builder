import type { Role, PlanTier } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: Role
      planTier: PlanTier
    }
  }

  interface User {
    role: Role
    planTier: PlanTier
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: Role
    planTier: PlanTier
  }
}

export type { Role, PlanTier }
