const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetMaintenance() {
  await prisma.siteSettings.update({
    where: { id: 1 },
    data: { maintenanceMode: false }
  })
  console.log("Maintenance mode disabled!")
}

resetMaintenance()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
