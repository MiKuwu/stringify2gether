import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id

      if (token.id) {
        const userId = token.id as string
        const getCachedUser = unstable_cache(
          async () => prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, username: true, email: true, bannedUntil: true },
          }),
          ["auth-user-cache", userId],
          { tags: ["auth", userId], revalidate: 60 },
        )
        const dbUser = await getCachedUser()

        if (dbUser) {
          let dbRole = dbUser.role || "USER"

          if (dbUser.email === process.env.ADMIN_EMAIL && dbRole !== "ADMIN + FOUNDER") {
            dbRole = "ADMIN + FOUNDER"
            try {
              await prisma.user.update({
                where: { id: userId },
                data: { role: "ADMIN + FOUNDER" },
              })
            } catch {
              // The current token can still use the founder role for this request.
            }
          }

          token.role = dbRole
          token.username = dbUser.username
          token.bannedUntil = dbUser.bannedUntil?.toISOString() || null
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.username = token.username as string
        session.user.bannedUntil = token.bannedUntil as string | null
      }
      return session
    },
  },
}
