export function buildWhatsAppMeUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function isShareAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}
