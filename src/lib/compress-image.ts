// Client-side image compression for admin uploads. Re-encoding in the
// browser keeps server-action bodies small (Next/Vercel cap request sizes)
// and converts formats sharp can't decode on the server (e.g. iPhone HEIC)
// into WebP before they're sent.

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 0.85;

// Decode a File into something drawable. createImageBitmap is fastest and
// honors EXIF orientation; fall back to <img> decode for older engines.
async function loadDrawable(
  file: File,
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to the <img> path
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Compress one image to WebP at max 1600px wide. Returns the original file
// untouched if it isn't an image or the browser can't decode it (the server
// then reports a proper error instead of silently dying).
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const src = await loadDrawable(file);
    const width = "naturalWidth" in src ? src.naturalWidth : src.width;
    const height = "naturalHeight" in src ? src.naturalHeight : src.height;
    if (!width || !height) return file;

    const scale = Math.min(1, MAX_WIDTH / width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}
