import { describe, expect, it } from "vitest";
import {
  limaCalendarDateToUtcEnd,
  limaCalendarDateToUtcStart,
} from "@/shared/utils/lima-date.utils";

describe("limaCalendarDateToUtcStart", () => {
  it("usa el inicio del día en America/Lima (UTC-5)", () => {
    expect(limaCalendarDateToUtcStart("2026-09-27").toISOString()).toBe(
      "2026-09-27T05:00:00.000Z",
    );
  });
});

describe("limaCalendarDateToUtcEnd", () => {
  it("usa el final del día en America/Lima (UTC-5)", () => {
    expect(limaCalendarDateToUtcEnd("2026-09-27").toISOString()).toBe(
      "2026-09-28T04:59:59.999Z",
    );
  });
});
