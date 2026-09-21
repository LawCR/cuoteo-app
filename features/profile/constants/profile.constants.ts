export const PERU_PHONE_PREFIX = "+51";
export const PERU_PHONE_DIGIT_COUNT = 9;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 80;
export const CCI_DIGIT_COUNT = 20;
export const ACCOUNT_NUMBER_MIN_LENGTH = 8;
export const ACCOUNT_NUMBER_MAX_LENGTH = 20;
export const BANK_NAME_MAX_LENGTH = 80;
export const NO_BANK_SELECT_VALUE = "__none__";
export const OTHER_BANK_SELECT_VALUE = "__other__";

export const BANK_OPTIONS = [
  "Banco de Crédito del Perú (BCP)",
  "Interbank",
  "Scotiabank",
  "BBVA",
  "Banco de la Nación",
  "MiBanco",
] as const;

export const BANK_SELECT_VALUES = [
  NO_BANK_SELECT_VALUE,
  OTHER_BANK_SELECT_VALUE,
  ...BANK_OPTIONS,
] as const;
