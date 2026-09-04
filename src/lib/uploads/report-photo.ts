/** Raster formats only. SVG and other image/* types are rejected. */
export const ALLOWED_REPORT_PHOTO_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export type AllowedReportPhotoMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/heic"
  | "image/heif";

export const REPORT_PHOTO_EXT_BY_MIME: Record<AllowedReportPhotoMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

function startsWithBytes(buf: Uint8Array, signature: number[]): boolean {
  if (buf.length < signature.length) return false;
  return signature.every((byte, i) => buf[i] === byte);
}

function readAscii(buf: Uint8Array, start: number, length: number): string {
  return Buffer.from(buf.subarray(start, start + length)).toString("ascii");
}

/**
 * Sniff real image type from magic bytes so clients cannot spoof MIME/SVG as JPEG.
 */
export function sniffAllowedImageMime(
  bytes: Uint8Array,
): AllowedReportPhotoMime | null {
  if (startsWithBytes(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (
    startsWithBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes.length >= 12 &&
    readAscii(bytes, 8, 4) === "WEBP"
  ) {
    return "image/webp";
  }

  // HEIC/HEIF: ISO BMFF `ftyp` box with heic/heif brands.
  if (bytes.length >= 12 && readAscii(bytes, 4, 4) === "ftyp") {
    const brand = readAscii(bytes, 8, 4).toLowerCase();
    const compatible = readAscii(
      bytes,
      16,
      Math.min(32, Math.max(0, bytes.length - 16)),
    ).toLowerCase();
    const brands = `${brand}${compatible}`;
    if (
      brands.includes("heic") ||
      brands.includes("heif") ||
      brands.includes("mif1") ||
      brands.includes("msf1")
    ) {
      return brand.includes("heif") ? "image/heif" : "image/heic";
    }
  }

  return null;
}

export function normalizeDeclaredImageMime(type: string): string {
  const normalized = type.trim().toLowerCase();
  if (normalized === "image/jpg") return "image/jpeg";
  return normalized;
}

export function declaredMimeMatchesSniffed(
  declared: string,
  sniffed: AllowedReportPhotoMime,
): boolean {
  if (!declared) return true;
  if (declared === sniffed) return true;
  const heicFamily =
    (declared === "image/heic" || declared === "image/heif") &&
    (sniffed === "image/heic" || sniffed === "image/heif");
  return heicFamily;
}
