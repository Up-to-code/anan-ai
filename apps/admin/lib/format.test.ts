import { describe, expect, it } from "vitest";
import { formatDateTime } from "./format";

describe("admin format helpers", () => {
  it("formats Arabic timestamps with a stable Gregorian calendar and timezone", () => {
    expect(formatDateTime(Date.parse("2026-03-22T09:00:00.000Z"))).toBe("٢٢‏/٠٣‏/٢٠٢٦، ١١:٠٠ ص");
  });

  it("formats English timestamps using the same pinned admin timezone", () => {
    expect(formatDateTime(Date.parse("2026-03-22T09:00:00.000Z"), "en")).toBe("Mar 22, 2026, 11:00 AM");
  });
});
