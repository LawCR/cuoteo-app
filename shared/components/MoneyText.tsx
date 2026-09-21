import type { ReactNode } from "react";
import type { IMoneyTextProps, TMoneyTone } from "@/shared/interfaces/money-text.interface";
import { cn } from "@/shared/utils/cn.utils";
import { formatPen, getMoneyTone } from "@/shared/utils/money.utils";

const TONE_CLASS: Record<TMoneyTone, string> = {
  success: "text-success",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};

export function MoneyText({ amount, className }: IMoneyTextProps): ReactNode {
  const tone = getMoneyTone(amount);

  return (
    <span className={cn("tabular-nums", TONE_CLASS[tone], className)}>
      {formatPen(amount)}
    </span>
  );
}
