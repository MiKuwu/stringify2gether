import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

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

type CustomIdRow = {
  id: string
  regionCode: string
  userIndex: bigint
}

export async function getCustomIdsForUsers(userIds: string[]) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))]
  if (uniqueUserIds.length === 0) return {} as Record<string, string>

  const rows = await prisma.$queryRaw<CustomIdRow[]>(Prisma.sql`
    SELECT
      target."id",
      target."regionCode",
      (
        SELECT COUNT(*)
        FROM "User" AS earlier
        WHERE earlier."createdAt" < target."createdAt"
      ) AS "userIndex"
    FROM "User" AS target
    WHERE target."id" IN (${Prisma.join(uniqueUserIds)})
  `)

  return Object.fromEntries(
    rows.map(row => [
      row.id,
      `${row.regionCode}${String(Number(row.userIndex)).padStart(9, "0")}`,
    ])
  )
}

export const getCustomIdForUser = async (userId: string) => {
  return unstable_cache(
    async () => {
      const customIds = await getCustomIdsForUsers([userId])
      return customIds[userId] ?? null
    },
    ['user-custom-id', userId],
    { tags: ['user-id', userId], revalidate: 3600 } // Cache for 1 hour
  )()
}
