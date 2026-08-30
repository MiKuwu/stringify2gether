import { prisma } from './src/lib/prisma';
async function run() {
  const start = Date.now();
  await prisma.user.findFirst();
  console.log('Prisma query took', Date.now() - start, 'ms');
}
run();
