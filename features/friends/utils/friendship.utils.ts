export function normalizeUsernameLookup(value: string): string {
  return value.trim().toLowerCase();
}

export function isEmailLookup(value: string): boolean {
  return value.includes("@");
}
