"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const MAX_BYTES = 4.5 * 1024 * 1024; // ~4.5MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

/**
 * Upload a report photo. Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set;
 * otherwise writes to public/uploads/reports for local demo.
 */
export async function uploadReportPhotoAction(formData: FormData): Promise<
  { url: string } | { error: string }
> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo to continue." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Photo must be under 4.5 MB." };
  }
  const type = file.type || "image/jpeg";
  if (!ALLOWED.has(type) && !type.startsWith("image/")) {
    return { error: "Only image files are supported." };
  }

  const ext =
    type === "image/png"
      ? "png"
      : type === "image/webp"
        ? "webp"
        : type === "image/heic" || type === "image/heif"
          ? "heic"
          : "jpg";
  const filename = `report-${session.user.id.slice(0, 8)}-${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (token) {
    try {
      const blob = await put(`reports/${filename}`, bytes, {
        access: "public",
        contentType: type,
        token,
      });
      return { url: blob.url };
    } catch {
      return { error: "Upload failed. Try again." };
    }
  }

  const dir = path.join(process.cwd(), "public", "uploads", "reports");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return { url: `/uploads/reports/${filename}` };
}
