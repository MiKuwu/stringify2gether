const fs = require("fs");

let formContent = fs.readFileSync("src/app/edit/[id]/EditPostForm.tsx", "utf-8");

// 1. Add Import
formContent = formContent.replace(
  `import "react-quill-new/dist/quill.snow.css"`,
  `import "react-quill-new/dist/quill.snow.css"\nimport PollCreator, { PollDraft, defaultPoll } from "@/app/create/PollCreator"`
);

// 2. Add state
const stateReplacement = `  const [externalMedia, setExternalMedia] = useState<ExternalMedia[]>([])

  const initialPoll: PollDraft | null = post.poll ? {
    question: post.poll.question,
    allowMultiple: post.poll.allowMultiple,
    hideResults: post.poll.hideResults,
    anonymous: post.poll.anonymous,
    hasExpiry: !!post.poll.expiresAt,
    expiresAt: post.poll.expiresAt ? new Date(new Date(post.poll.expiresAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
    options: post.poll.options.map((o: any) => ({
      id: o.id,
      text: o.text || "",
      imageUrl: o.imageUrl || "",
      imageMode: o.imageUrl ? "url" : "upload"
    }))
  } : null

  const [poll, setPoll] = useState<PollDraft | null>(initialPoll)`;

formContent = formContent.replace(
  `  const [externalMedia, setExternalMedia] = useState<ExternalMedia[]>([])`,
  stateReplacement
);

// 3. Update postData
const postDataOld = `
    const updateData: any = {
      title: form.get("title") as string,
      content: content,
      categoryId: form.get("categoryId") as string,
      status: finalStatus,
      keptMedia: keptMedia,
      newMedia: finalNewMedia,
      watermarkText: form.get("watermarkText") || null,
      watermarkLogo: form.get("watermarkLogo") || null,
      isAiGenerated: form.get("isAiGenerated") === "on"
    }`;

const postDataNew = `
    const updateData: any = {
      title: form.get("title") as string,
      content: content,
      categoryId: form.get("categoryId") as string,
      status: finalStatus,
      keptMedia: keptMedia,
      newMedia: finalNewMedia,
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

// 4. Add UI block
const uiBlockNew = `
      {/* Poll Creator */}
      {poll ? (
        <PollCreator value={poll} onChange={setPoll} onRemove={() => setPoll(null)} />
      ) : (
        <button
          type="button"
          onClick={() => setPoll(defaultPoll())}
          className="w-full border-2 border-dashed border-slate-600 hover:border-teal-500 text-slate-400 hover:text-teal-400 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>📊</span> Đính kèm Bình chọn (Poll)
        </button>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          value="ACTIVE"`;

formContent = formContent.replace(
  `<div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">\n        <button \n          value="ACTIVE"`,
  uiBlockNew
);

fs.writeFileSync("src/app/edit/[id]/EditPostForm.tsx", formContent);
console.log("Updated EditPostForm.tsx");