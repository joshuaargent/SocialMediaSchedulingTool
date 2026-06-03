import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOut } from "next-auth/react"

export default async function PendingPage() {
  const session = await auth()
  
  if (!session) redirect("/login")
  if (session?.user?.approved) redirect("/dashboard")

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6 text-6xl">⏳</div>
        <h1 className="mb-4 text-3xl font-bold text-[var(--color-text-primary)]">Account Pending Approval</h1>
        <p className="mb-8 text-[var(--color-text-secondary)]">
          Your account has been created but is awaiting approval.<br />
          Please contact the administrator to get access.
        </p>
        <div className="rounded-lg bg-[var(--color-bg-card)] p-6 border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-secondary)]">Email: {session.user?.email}</p>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-6 text-[var(--color-accent)] hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}