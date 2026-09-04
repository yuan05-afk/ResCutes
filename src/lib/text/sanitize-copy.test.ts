import { describe, expect, it } from "vitest";
import { stripEmDashes } from "./sanitize-copy";

describe("stripEmDashes", () => {
  it("replaces em dashes with spaced hyphens", () => {
    expect(stripEmDashes("Heavy traffic \u2014 approach")).toBe(
      "Heavy traffic - approach",
    );
  });
});
