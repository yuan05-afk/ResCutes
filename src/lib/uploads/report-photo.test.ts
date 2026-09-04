import { describe, expect, it } from "vitest";
import {
  declaredMimeMatchesSniffed,
  normalizeDeclaredImageMime,
  sniffAllowedImageMime,
} from "@/lib/uploads/report-photo";

describe("report photo sniffing", () => {
  it("accepts JPEG magic bytes", () => {
    const bytes = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(sniffAllowedImageMime(bytes)).toBe("image/jpeg");
  });

  it("accepts PNG magic bytes", () => {
    const bytes = Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);
    expect(sniffAllowedImageMime(bytes)).toBe("image/png");
  });

  it("rejects SVG even if labeled as an image", () => {
    const svg = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    );
    expect(sniffAllowedImageMime(svg)).toBeNull();
    expect(normalizeDeclaredImageMime("image/svg+xml")).toBe("image/svg+xml");
    expect(declaredMimeMatchesSniffed("image/svg+xml", "image/jpeg")).toBe(
      false,
    );
  });

  it("rejects random bytes", () => {
    expect(sniffAllowedImageMime(Uint8Array.from([1, 2, 3, 4]))).toBeNull();
  });
});
