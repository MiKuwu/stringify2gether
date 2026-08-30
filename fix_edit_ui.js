const fs = require("fs");
let formContent = fs.readFileSync("src/app/edit/[id]/EditPostForm.tsx", "utf-8");

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

      <div className="flex gap-4">
        <button 
          value="ACTIVE"`;

formContent = formContent.replace(
  `<div className="flex gap-4">\n        <button \n          value="ACTIVE"`,
  uiBlockNew
);

fs.writeFileSync("src/app/edit/[id]/EditPostForm.tsx", formContent);
console.log("Fixed EditPostForm.tsx");