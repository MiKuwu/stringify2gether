import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, username: true, createdAt: true } });
  console.dir(users, { depth: null });
}
main().finally(() => prisma.$disconnect());
