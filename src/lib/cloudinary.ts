import { v2 as cloudinary } from 'cloudinary'

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true })
}

export function extractPublicId(url: string): string | null {
  if (!url.includes('cloudinary.com')) return null;
  const parts = url.split('/upload/');
  if (parts.length < 2) return null;
  
  const path = parts[1];
  const withoutVersion = path.replace(/^v\d+\//, '');
  const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, '');
  
  return withoutExtension;
}

export async function deleteCloudinaryMedia(url: string, type: "IMAGE" | "VIDEO") {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: type === "VIDEO" ? "video" : "image" });
  } catch (error) {
    console.error("Cloudinary delete error for", publicId, ":", error);
  }
}
