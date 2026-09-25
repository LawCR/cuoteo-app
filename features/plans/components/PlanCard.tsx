import Link from "next/link";
import type { ReactElement } from "react";
import { DeletePlanButton } from "@/features/plans/components/DeletePlanButton";
import { PlanCategoryIcon } from "@/features/plans/components/PlanCategoryIcon";
import { PlanPhaseBadge } from "@/features/plans/components/PlanPhaseBadge";
import { EXPENSE_CATEGORY_LABELS } from "@/features/plans/constants/plans.constants";
import type { IPlanSummary } from "@/features/plans/interfaces/plan.interface";
import { Card, CardContent } from "@/shared/components/ui/card";
import { formatLimaDate } from "@/shared/utils/lima-date.utils";

interface IPlanCardProps {
  plan: IPlanSummary;
  currentUserId: string;
}

export function PlanCard({
  plan,
  currentUserId,
}: IPlanCardProps): ReactElement {
  const canDelete = currentUserId === plan.creatorUserId;

  return (
    <Card className="transition-colors hover:bg-muted/40">
      <CardContent className="flex items-center gap-3 py-4">
        <Link
          href={`/planes/${plan.id}`}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-3"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <PlanCategoryIcon category={plan.icon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{plan.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {EXPENSE_CATEGORY_LABELS[plan.icon]} ·{" "}
              {formatLimaDate(plan.createdAt)}
            </p>
          </div>
          <PlanPhaseBadge phase={plan.phase} />
        </Link>
        {canDelete ? (
          <DeletePlanButton planId={plan.id} planName={plan.name} />
        ) : null}
      </CardContent>
    </Card>
  );
}
