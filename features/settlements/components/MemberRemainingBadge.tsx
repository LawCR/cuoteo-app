import type { ReactElement } from "react";
import type { TMemberBalanceRole } from "@/features/settlements/interfaces/remaining-balance.interface";
import { Badge } from "@/shared/components/ui/badge";
import { formatPen } from "@/shared/utils/money.utils";

interface IMemberRemainingBadgeProps {
  remaining: number;
  role: TMemberBalanceRole;
}

export function MemberRemainingBadge({
  remaining,
  role,
}: IMemberRemainingBadgeProps): ReactElement | null {
  if (role === "zero") {
    return null;
  }

  const isCreditor = role === "creditor";

  return (
    <Badge
      variant="outline"
      className={
        isCreditor
          ? "border-transparent bg-success/10 text-success"
          : "border-transparent bg-destructive/10 text-destructive"
      }
    >
      <span className="tabular-nums">
        {isCreditor ? "A favor" : "Debe"} {formatPen(Math.abs(remaining))}
      </span>
    </Badge>
  );
}
