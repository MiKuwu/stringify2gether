const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.category.createMany({
    data: [
      { name: "Giáo án Outbreak", slug: "outbreak" },
      { name: "Chia sẻ Line-up", slug: "lineup" },
      { name: "Các giáo án, thông tin khác", slug: "other" }
    ],
    skipDuplicates: true
  })
  
  await prisma.siteSettings.create({
    data: { id: 1, siteTitle: "Strinova Guide Hub" }
  })
  
  console.log("Seeded basic categories and site settings!")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
