import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma, requirePrisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    // Auth requires database to be configured
    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    // Create organization first (approved=false by default)
    const org = await prisma.organization.create({
      data: {
        name: `${email.split('@')[0]}'s Organization`,
        approved: false,
      },
    })

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: email.split('@')[0],
        organizationId: org.id,
      },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}