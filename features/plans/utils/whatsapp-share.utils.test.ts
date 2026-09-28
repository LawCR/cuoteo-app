import { describe, expect, it } from "vitest";
import {
  buildWhatsAppMeUrl,
  isShareAbortError,
} from "@/features/plans/utils/whatsapp-share.utils";

describe("buildWhatsAppMeUrl", () => {
  it("codifica el texto para wa.me", () => {
    expect(buildWhatsAppMeUrl("hola mundo\nhttps://ejemplo.com")).toBe(
      "https://wa.me/?text=hola%20mundo%0Ahttps%3A%2F%2Fejemplo.com",
    );
  });
});

describe("isShareAbortError", () => {
  it("reconoce AbortError de DOMException y Error", () => {
    expect(isShareAbortError(new DOMException("cancelado", "AbortError"))).toBe(
      true,
    );
    expect(isShareAbortError(new Error("AbortError"))).toBe(false);

    const named = new Error("cancelado");
    named.name = "AbortError";
    expect(isShareAbortError(named)).toBe(true);
    expect(isShareAbortError("AbortError")).toBe(false);
  });
});
