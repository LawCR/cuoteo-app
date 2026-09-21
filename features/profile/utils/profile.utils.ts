import {
  BANK_OPTIONS,
  NO_BANK_SELECT_VALUE,
  OTHER_BANK_SELECT_VALUE,
  PERU_PHONE_PREFIX,
} from "@/features/profile/constants/profile.constants";
import type { TUpdateProfileFormData } from "@/features/profile/schemas/update-profile.schema";

export function toPeruE164(digits: string): string {
  return `${PERU_PHONE_PREFIX}${digits}`;
}

export function toPeruNationalDigits(e164: string): string {
  if (e164.startsWith(PERU_PHONE_PREFIX)) {
    return e164.slice(PERU_PHONE_PREFIX.length);
  }

  return e164;
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function isKnownBankName(value: string): boolean {
  return (BANK_OPTIONS as readonly string[]).includes(value);
}

export function bankSelectFromStoredName(bankName: string | null): {
  bankSelect: TUpdateProfileFormData["bankSelect"];
  customBankName: string;
} {
  if (!bankName) {
    return { bankSelect: NO_BANK_SELECT_VALUE, customBankName: "" };
  }

  const knownBank = BANK_OPTIONS.find((option) => option === bankName);

  if (knownBank) {
    return { bankSelect: knownBank, customBankName: "" };
  }

  return { bankSelect: OTHER_BANK_SELECT_VALUE, customBankName: bankName };
}

export function resolveBankName(
  bankSelect: string,
  customBankName: string,
): string | null {
  if (bankSelect === OTHER_BANK_SELECT_VALUE) {
    return emptyToNull(customBankName);
  }

  if (isKnownBankName(bankSelect)) {
    return bankSelect;
  }

  return null;
}
