import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
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
      if (user) {
        token.id = user.id
      }
      
      // Luôn kiểm tra lại quyền trong Database ở mỗi phiên để cập nhật realtime
      if (token.id) {
                const { unstable_cache } = require("next/cache");
        const getCachedUser = unstable_cache(
          async (userId: string) => {
            return await prisma.user.findUnique({
              where: { id: userId },
              select: { role: true, username: true, email: true, bannedUntil: true }
            });
          },
          ['auth-user-cache', token.id as string],
          { tags: ['auth', token.id as string], revalidate: 60 }
        );
        const dbUser = await getCachedUser(token.id);
        
        if (dbUser) {
          let dbRole = dbUser.role || "USER"
          
          // Kiểm tra Super Admin
          if (dbUser.email === process.env.ADMIN_EMAIL && dbRole !== "ADMIN + FOUNDER") {
            dbRole = "ADMIN + FOUNDER"
            try {
              await prisma.user.update({
                where: { id: token.id as string },
                data: { role: "ADMIN + FOUNDER" }
              })
            } catch(e) {}
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

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }


