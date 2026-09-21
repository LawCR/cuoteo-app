import { PERU_PHONE_PREFIX } from "@/features/profile/constants/profile.constants";

export function toPeruE164(digits: string): string {
  return `${PERU_PHONE_PREFIX}${digits}`;
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
