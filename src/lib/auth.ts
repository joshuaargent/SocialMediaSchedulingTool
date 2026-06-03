import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"

export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized")
  }
  
  return session
}

export async function requireApproved() {
  const session = await requireAuth()
  
  if (!prisma) {
    throw new Error("Database not configured")
  }
  
  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { approved: true },
  })
  
  if (!org?.approved) {
    throw new Error("Account not approved")
  }
  
  return session
}