const fs = require("fs");
let content = fs.readFileSync("src/app/create/PollCreator.tsx", "utf-8");

const oldHandleUpload = `  const handleUpload = async (optionId: string, file: File) => {
    updateOption(optionId, { uploading: true })
    try {
      const sigRes = await fetch("/api/upload/signature")
      const { signature, timestamp, cloudName, apiKey } = await sigRes.json()
      const fd = new FormData()
      fd.append("file", file)
      fd.append("api_key", apiKey)
      fd.append("timestamp", timestamp)
      fd.append("signature", signature)
      const up = await fetch(\`https://api.cloudinary.com/v1_1/\${cloudName}/image/upload\`, { method: "POST", body: fd })
      const upData = await up.json()
      if (upData.secure_url) {
        updateOption(optionId, { imageUrl: upData.secure_url, uploading: false })
        toast.success("Đã tải ảnh lên!")
      } else { throw new Error() }
    } catch {
      toast.error("Lỗi tải ảnh lên")
      updateOption(optionId, { uploading: false })
    }
  }`;

const newHandleUpload = `  const handleUpload = async (optionId: string, file: File) => {
    updateOption(optionId, { uploading: true })
    try {
      const { uploadFilesDirectly } = await import("@/lib/uploadHelpers")
      const results = await uploadFilesDirectly([file])
      if (results && results[0] && results[0].url) {
        updateOption(optionId, { imageUrl: results[0].url, uploading: false })
        toast.success("Đã tải ảnh lên!")
      } else {
        throw new Error()
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi tải ảnh lên")
      updateOption(optionId, { uploading: false })
    }
  }`;

if (content.includes("const handleUpload = async (optionId: string, file: File) => {")) {
    // Need to do a careful replacement because there might be slight formatting differences.
    // I'll just use regex to replace the function block.
    const regex = /const handleUpload = async \(optionId: string, file: File\) => \{[\s\S]*?toast\.error\("Lỗi tải ảnh lên"\)[\s\S]*?updateOption\(optionId, \{ uploading: false \}\)\s*\n\s*\}/;
    content = content.replace(regex, newHandleUpload.trim());
    fs.writeFileSync("src/app/create/PollCreator.tsx", content);
    console.log("Updated PollCreator.tsx");
} else {
    console.log("Could not find handleUpload in PollCreator.tsx");
}