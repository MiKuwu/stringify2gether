const fs = require("fs");
let formContent = fs.readFileSync("src/app/edit/[id]/EditPostForm.tsx", "utf-8");

const postDataOld = `    const postData = {
      title: form.get("title") as string,
      content: content,
      categoryId: form.get("categoryId") as string,
      newMedia: newMediaData,
      keptMedia: keptMedia.map(m => ({ id: m.id, caption: m.caption })),
      status: finalStatus,
      watermarkText: form.get("watermarkText") || null,
      watermarkLogo: form.get("watermarkLogo") || null,
      isAiGenerated: form.get("isAiGenerated") === "on"
    }`;

const postDataNew = `    const postData = {
      title: form.get("title") as string,
      content: content,
      categoryId: form.get("categoryId") as string,
      newMedia: newMediaData,
      keptMedia: keptMedia.map(m => ({ id: m.id, caption: m.caption })),
      status: finalStatus,
      watermarkText: form.get("watermarkText") || null,
      watermarkLogo: form.get("watermarkLogo") || null,
      isAiGenerated: form.get("isAiGenerated") === "on",
      poll: poll ? {
        question: poll.question,
        allowMultiple: poll.allowMultiple,
        hideResults: poll.hideResults,
        anonymous: poll.anonymous,
        expiresAt: poll.hasExpiry && poll.expiresAt ? new Date(poll.expiresAt).toISOString() : null,
        options: poll.options.map(o => ({ id: o.id, text: o.text || null, imageUrl: o.imageUrl || null }))
      } : null
    }`;

formContent = formContent.replace(postDataOld, postDataNew);
fs.writeFileSync("src/app/edit/[id]/EditPostForm.tsx", formContent);
console.log("Fixed postData in EditPostForm.tsx");