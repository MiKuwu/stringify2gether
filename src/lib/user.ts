import { prisma } from "@/lib/prisma"

import { unstable_cache } from "next/cache"

export async function findUserByCustomId(customId: string) {
  if (!customId || customId.length < 11) return null;
  const regionCode = customId.substring(0, 2).toUpperCase()
  const indexStr = customId.substring(2)
  const index = parseInt(indexStr, 10)
  if (isNaN(index)) return null;

  // Optimize: skip fetching all users, just use skip/take
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    skip: index,
    take: 1
  })
  
  const user = users[0]
  if (!user || user.regionCode !== regionCode) return null
  
  return user
}

export const getCustomIdForUser = async (userId: string) => {
  return unstable_cache(
    async () => {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) return null

      const index = await prisma.user.count({
        where: {
          createdAt: { lt: user.createdAt }
        }
      })
      
      return `${user.regionCode}${String(index).padStart(9, "0")}`
    },
    ['user-custom-id', userId],
    { tags: ['user-id', userId], revalidate: 3600 } // Cache for 1 hour
  )()
}
