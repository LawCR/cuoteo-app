import type { TMoneyTone } from "@/shared/interfaces/money-text.interface";

export function formatPen(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const [integerPart, fractionPart] = Math.abs(amount).toFixed(2).split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${sign}S/ ${groupedInteger}.${fractionPart}`;
}

export function getMoneyTone(amount: number): TMoneyTone {
  if (amount > 0) {
    return "success";
  }

  if (amount < 0) {
    return "destructive";
  }

  return "muted";
}
