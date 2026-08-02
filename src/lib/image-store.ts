/**
 * Where order photos live.
 *
 * Every picture the app takes — primary shots, proof of payment, box and warning
 * images — is written to the Supabase Storage bucket below and stored on the order as
 * a public URL. Nothing is uploaded to a third party any more.
 *
 * Historic orders still carry i.ibb.co links from the previous host. Those keep
 * working because they are ordinary URLs; only new uploads change destination.
 */

import { supabase } from "@/lib/supabase";

/** Public bucket holding every order photo. Created with a 10 MB per-file limit. */
const BUCKET = "order-images";

/**
 * Which set of pictures an upload belongs to. Only used to lay the bucket out in
 * readable folders — the order row is what actually links a photo to an order.
 */
export type ImageKind = "primary" | "proof" | "warning" | "box" | "message";

/**
 * Longest edge kept when a photo is resized before upload.
 *
 * Phone cameras produce 4000px files that take seconds each to send over a slow
 * connection; staff upload several per order, so the batch is what has to stay quick.
 */
const MAX_DIMENSION = 800;

const JPEG_QUALITY = 0.6;

/** Shrinks a photo to a JPEG small enough to upload quickly. */
export function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Could not read that image"))),
          "image/jpeg",
          JPEG_QUALITY,
        );
      };
      img.onerror = () => reject(new Error("That file is not an image the browser can open"));
    };
    reader.onerror = () => reject(new Error("Could not read that file"));
  });
}

/** A name no other upload can take, grouped by kind and month so the bucket stays browsable. */
function objectPath(kind: ImageKind): string {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const unique =
    globalThis.crypto?.randomUUID?.() ??
    `${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${kind}/${month}/${unique}.jpg`;
}

/**
 * The previous image host, kept only as a safety net.
 *
 * Uploading to the bucket needs a storage policy that allows signed-in users to write.
 * Until that policy is in place — and if it is ever dropped by accident — a failed
 * upload falls back here rather than losing the staff member's photo. Every fallback is
 * logged so it is obvious the bucket is not accepting writes.
 */
async function uploadToLegacyHost(file: Blob, name: string): Promise<string> {
  const apiKey = "3c43400a3770b8fc733935ff82e816fc";
  const body = new FormData();
  body.append("image", file, name || "image.jpg");

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body,
  });
  const data = await response.json();
  if (data.data?.url) return data.data.url;
  throw new Error("Failed to upload image");
}

/**
 * Stores one photo and returns the URL to save on the order.
 *
 * Throws only if both the bucket and the fallback refuse the file, so a caller that
 * uploads several pictures can report exactly which ones failed and keep the rest.
 */
export async function uploadOrderImage(file: File, kind: ImageKind = "primary"): Promise<string> {
  const compressed = await compressImage(file);
  const path = objectPath(kind);

  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: "image/jpeg",
    // Photos are never rewritten in place — a new upload gets a new name — so they can
    // be cached for a year.
    cacheControl: "31536000",
    upsert: false,
  });

  if (!error) {
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  console.warn(
    `[images] Supabase Storage refused the upload (${error.message}). ` +
      "Falling back to the old host — check the storage policies on the order-images bucket.",
  );
  return uploadToLegacyHost(compressed, file.name);
}

/** How many of a batch succeeded, and the errors for the ones that did not. */
export interface BatchUploadResult {
  urls: string[];
  failed: number;
  errors: string[];
}

/**
 * Uploads several photos, keeping whatever succeeds.
 *
 * A plain `Promise.all` rejects on the first failure and discards the successful
 * uploads with it, which is why attaching a batch of pictures used to end with none of
 * them saved. Each file is settled on its own here.
 */
export async function uploadOrderImages(
  files: File[],
  kind: ImageKind = "primary",
): Promise<BatchUploadResult> {
  const settled = await Promise.allSettled(files.map((file) => uploadOrderImage(file, kind)));

  const urls: string[] = [];
  const errors: string[] = [];
  settled.forEach((outcome, index) => {
    if (outcome.status === "fulfilled") urls.push(outcome.value);
    else
      errors.push(
        `${files[index]?.name || `image ${index + 1}`}: ${outcome.reason?.message || outcome.reason}`,
      );
  });

  return { urls, failed: errors.length, errors };
}
