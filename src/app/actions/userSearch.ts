"use server"
import { prisma } from "@/lib/prisma"
import { findUserByCustomId, getCustomIdForUser } from "@/lib/user"

export async function searchUsers(query: string) {
  if (!query || query.trim() === "") return []
  
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { id: { contains: query, mode: "insensitive" } }
      ]
    },
    select: { 
      id: true, 
      username: true, 
      image: true 
    },
    take: 10
  })

  const results = await Promise.all(users.map(async u => ({
    ...u,
    customId: await getCustomIdForUser(u.id)
  })))

  const cleanQuery = query.trim().toUpperCase()
  if (/^[A-Z]{2}\d+$/.test(cleanQuery)) {
    const customUser = await findUserByCustomId(cleanQuery)
    if (customUser && !results.find(u => u.id === customUser.id)) {
      results.unshift({
        id: customUser.id,
        username: customUser.username,
        image: customUser.image,
        customId: cleanQuery
      })
    }
  }
  
  return results.slice(0, 10)
}
