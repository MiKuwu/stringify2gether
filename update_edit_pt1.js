const fs = require("fs");

// 1. Update src/app/edit/[id]/page.tsx
let pageContent = fs.readFileSync("src/app/edit/[id]/page.tsx", "utf-8");
pageContent = pageContent.replace(
  /include:\s*\{\s*media:\s*true\s*\}/g,
  "include: { media: true, poll: { include: { options: true } } }"
);
fs.writeFileSync("src/app/edit/[id]/page.tsx", pageContent);
console.log("Updated edit page.tsx");

// 2. Update src/app/api/posts/[id]/route.ts
let routeContent = fs.readFileSync("src/app/api/posts/[id]/route.ts", "utf-8");
routeContent = routeContent.replace(
  "const { title, content, categoryId, newMedia, keptMedia, status, watermarkText, watermarkLogo, isAiGenerated } = await request.json()",
  "const { title, content, categoryId, newMedia, keptMedia, status, watermarkText, watermarkLogo, isAiGenerated, poll } = await request.json()"
);
const pollUpdateLogic = `
  const existingPoll = await prisma.poll.findUnique({ where: { postId: id }, include: { options: true } })

  if (poll === null) {
    if (existingPoll) await prisma.poll.delete({ where: { id: existingPoll.id } })
  } else if (poll !== undefined) {
    if (existingPoll) {
      await prisma.poll.update({
        where: { id: existingPoll.id },
        data: {
          question: poll.question,
          allowMultiple: poll.allowMultiple,
          hideResults: poll.hideResults,
          anonymous: poll.anonymous,
          expiresAt: poll.expiresAt,
        }
      })
      const existingOptionIds = existingPoll.options.map(o => o.id)
      const incomingOptionIds = poll.options.map((o: any) => o.id).filter((id: any) => id)
      
      const optionsToDelete = existingOptionIds.filter(id => !incomingOptionIds.includes(id))
      if (optionsToDelete.length > 0) {
        await prisma.pollOption.deleteMany({ where: { id: { in: optionsToDelete } } })
      }
      
      for (const opt of poll.options) {
        if (opt.id && existingOptionIds.includes(opt.id)) {
          await prisma.pollOption.update({
            where: { id: opt.id },
            data: { text: opt.text, imageUrl: opt.imageUrl }
          })
        } else {
          await prisma.pollOption.create({
            data: { pollId: existingPoll.id, text: opt.text, imageUrl: opt.imageUrl }
          })
        }
      }
    } else {
      await prisma.poll.create({
        data: {
          postId: id,
          question: poll.question,
          allowMultiple: poll.allowMultiple,
          hideResults: poll.hideResults,
          anonymous: poll.anonymous,
          expiresAt: poll.expiresAt,
          options: { create: poll.options.map((o: any) => ({ text: o.text, imageUrl: o.imageUrl })) }
        }
      })
    }
  }

  return NextResponse.json(updatedPost)
`;
routeContent = routeContent.replace("return NextResponse.json(updatedPost)", pollUpdateLogic);
fs.writeFileSync("src/app/api/posts/[id]/route.ts", routeContent);
console.log("Updated api/posts/[id]/route.ts");