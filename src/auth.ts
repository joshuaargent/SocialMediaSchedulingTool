import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db/prisma"

// Create adapter only if prisma is available
const adapter = prisma ? PrismaAdapter(prisma) : null

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: adapter as any,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID ? [Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    })] : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !prisma) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user.id && prisma) {
        session.user.id = user.id
        // Get user's organization and approval status
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            organizationId: true,
            organization: { select: { approved: true } }
          },
        })
        session.user.organizationId = dbUser?.organizationId
        session.user.approved = dbUser?.organization?.approved ?? false
      }
      return session
    },
    async signIn({ user }) {
      // Auto-create organization for new users (approved=false by default)
      if (user.id && prisma) {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { organization: true }
        })
        
        if (!existingUser?.organizationId) {
          const org = await prisma.organization.create({
            data: {
              name: `${user.email}'s Organization`,
              approved: false,  // Default to NOT approved
            },
          })
          await prisma.user.update({
            where: { id: user.id },
            data: { organizationId: org.id },
          })
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})