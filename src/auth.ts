import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db/prisma"

// Create adapter only if prisma is available
// Note: With JWT strategy, adapter is optional, but needed for Google OAuth Account linking
const adapter = prisma ? PrismaAdapter(prisma) : null

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: adapter as any,
  session: {
    strategy: "jwt",  // Use JWT strategy for credentials auth
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
    async jwt({ token, user }) {
      // Always fetch fresh organization data from database
      if (token?.id && prisma) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { 
            organizationId: true,
            role: true,
            organization: { select: { approved: true } }
          },
        })
        if (dbUser) {
          token.organizationId = dbUser.organizationId
          token.approved = dbUser.organization?.approved ?? false
          token.role = dbUser.role
        }
      }
      // On initial sign in, user object is provided
      if (user?.id && !token?.organizationId && prisma) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { 
            organizationId: true,
            role: true,
            organization: { select: { approved: true } }
          },
        })
        if (dbUser) {
          token.organizationId = dbUser.organizationId
          token.approved = dbUser.organization?.approved ?? false
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      // Add custom fields from token to session
      if (token?.id) {
        session.user.id = token.id as string
      }
      if (token?.organizationId) {
        session.user.organizationId = token.organizationId as string
      }
      if (token?.approved !== undefined) {
        session.user.approved = token.approved as boolean
      }
      if (token?.role) {
        (session.user as any).role = token.role as string
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