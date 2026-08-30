function uploadWithXHR(url: string, formData: FormData, headers: Record<string, string> = {}, onProgress?: (loaded: number) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", url)
    for (const [k, v] of Object.entries(headers)) {
      xhr.setRequestHeader(k, v)
    }
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded)
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        try {
          reject(new Error(JSON.parse(xhr.responseText).error?.message || "Lỗi tải lên"))
        } catch {
          reject(new Error("Lỗi tải lên"))
        }
      }
    }
    xhr.onerror = () => reject(new Error("Lỗi mạng"))
    xhr.send(formData)
  })
}

export async function uploadFilesDirectly(
  files: FileList | File[], 
  onProgress?: (progress: number) => void
): Promise<{url: string, type: string}[]> {
  const fileArray = Array.from(files)
  if (fileArray.length === 0) return []

  const sigRes = await fetch("/api/upload/signature", { method: "POST" })
  if (!sigRes.ok) {
    throw new Error("Không thể kết nối đến máy chủ tải ảnh (Unauthorized)")
  }
  const { timestamp, signature, cloudName, apiKey, maxUploadSizeMB } = await sigRes.json()

  const MAX_SIZE = (maxUploadSizeMB || 5) * 1024 * 1024;
  let totalBytes = 0;
  for (const file of fileArray) {
    if (file.size > MAX_SIZE) {
      throw new Error(`File ${file.name} quá lớn (tối đa ${maxUploadSizeMB}MB).`)
    }
    totalBytes += file.size;
  }

  const fileLoadedBytes = new Array(fileArray.length).fill(0)
  
  function updateGlobalProgress() {
    if (!onProgress) return
    const loaded = fileLoadedBytes.reduce((acc, val) => acc + val, 0)
    onProgress(Math.min(100, Math.round((loaded / totalBytes) * 100)))
  }

  // We can upload concurrently directly from the client!
  const uploadPromises = fileArray.map(async (file, index) => {
    const formDataBase = new FormData()
    formDataBase.append("api_key", apiKey)
    formDataBase.append("timestamp", timestamp.toString())
    formDataBase.append("signature", signature)
    formDataBase.append("folder", "strinova_hub")
    
    const type = file.type.startsWith("video/") ? "video" : "image"
    const chunkSize = 20 * 1024 * 1024; // 20MB chunks
    
    if (file.size <= chunkSize) {
      // Normal upload
      const formData = new FormData()
      for (const [key, value] of formDataBase.entries()) {
        formData.append(key, value)
      }
      formData.append("file", file)

      const uploadData = await uploadWithXHR(
        `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
        formData,
        {},
        (loaded) => {
          fileLoadedBytes[index] = loaded;
          updateGlobalProgress();
        }
      )
      
      return { url: uploadData.secure_url, type: type === "video" ? "VIDEO" : "IMAGE" }
    } else {
      // Chunked upload
      const totalChunks = Math.ceil(file.size / chunkSize);
      const uploadId = Math.random().toString(36).substring(2, 15);
      let finalData = null;
      let uploadedSoFar = 0;
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        const formData = new FormData();
        for (const [key, value] of formDataBase.entries()) {
          formData.append(key, value);
        }
        formData.append("file", chunk, file.name);
        
        const data = await uploadWithXHR(
          `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
          formData,
          {
            "X-Unique-Upload-Id": uploadId,
            "Content-Range": `bytes ${start}-${end - 1}/${file.size}`
          },
          (loaded) => {
            fileLoadedBytes[index] = uploadedSoFar + loaded;
            updateGlobalProgress();
          }
        )
        
        uploadedSoFar += (end - start);
        if (i === totalChunks - 1) finalData = data;
      }
      
      return { url: finalData.secure_url, type: type === "video" ? "VIDEO" : "IMAGE" }
    }
  })

  const results = await Promise.all(uploadPromises)
  return results
}
