"use client"

import { signOut } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Clock, Mail } from "lucide-react"

export default function PendingPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="max-w-md text-center p-8 animate-scale-in">
        {/* Animated Icon */}
        <div className="mb-6 relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10">
            <Clock className="w-10 h-10 text-warning animate-pulse" />
          </div>
          {/* Decorative ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-2 border-warning/20 animate-ping"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-2xl font-bold text-text-primary">
          Account Pending Approval
        </h1>

        {/* Description */}
        <p className="text-text-secondary mb-6">
          Your account has been created but is awaiting approval from the administrator.
          You'll be able to access all features once approved.
        </p>

        {/* Info box */}
        <div className="bg-bg-secondary/50 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-text-muted mt-0.5" />
            <div>
              <p className="text-sm text-text-secondary">
                Need help? Contact the administrator at:
              </p>
              <a 
                href="mailto:argentjackjoshua@outlook.com" 
                className="text-sm text-primary hover:underline"
              >
                argentjackjoshua@outlook.com
              </a>
            </div>
          </div>
        </div>

        {/* Sign out button */}
        <Button
          variant="secondary"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </Button>
      </Card>
    </div>
  )
}
