"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import {
  ALLOWED_REPORT_PHOTO_MIME,
  declaredMimeMatchesSniffed,
  normalizeDeclaredImageMime,
  REPORT_PHOTO_EXT_BY_MIME,
  sniffAllowedImageMime,
} from "@/lib/uploads/report-photo";

const MAX_BYTES = 4.5 * 1024 * 1024; // ~4.5MB

/**
 * Upload a report photo. Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set;
 * otherwise writes to public/uploads/reports for local demo.
 *
 * Accepts JPEG/PNG/WebP/HEIC only. SVG and other image/* types are rejected.
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

  const declared = normalizeDeclaredImageMime(file.type || "");
  if (declared && !ALLOWED_REPORT_PHOTO_MIME.has(declared)) {
    return {
      error: "Only JPEG, PNG, WebP, or HEIC photos are supported.",
    };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffAllowedImageMime(bytes);
  if (!sniffed) {
    return {
      error: "Only JPEG, PNG, WebP, or HEIC photos are supported.",
    };
  }

  if (!declaredMimeMatchesSniffed(declared, sniffed)) {
    return { error: "Photo type did not match file contents." };
  }

  const contentType = sniffed;
  const ext = REPORT_PHOTO_EXT_BY_MIME[contentType];
  const filename = `report-${session.user.id.slice(0, 8)}-${randomUUID()}.${ext}`;

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (token) {
    try {
      const blob = await put(`reports/${filename}`, bytes, {
        access: "public",
        contentType,
        token,
      });
      return { url: blob.url };
    } catch {
      return { error: "Upload failed. Try again." };
    }
  }

  // Vercel serverless has a read-only filesystem outside /tmp.
  if (process.env.VERCEL) {
    return {
      error:
        "Photo storage is not configured. Ask an admin to set BLOB_READ_WRITE_TOKEN.",
    };
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads", "reports");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);
    return { url: `/uploads/reports/${filename}` };
  } catch {
    return { error: "Could not save photo locally. Try again." };
  }
}
