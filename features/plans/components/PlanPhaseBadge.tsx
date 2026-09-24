import type { ReactElement } from "react";
import { PLAN_PHASE_LABELS } from "@/features/plans/constants/plans.constants";
import type { PlanPhase } from "@/generated/prisma/enums";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn.utils";

const PHASE_BADGE_CLASS: Record<PlanPhase, string> = {
  ACTIVE: "border-transparent bg-info/10 text-info",
  BALANCE: "border-transparent bg-warning/10 text-warning",
  COMPLETED: "border-transparent bg-muted text-muted-foreground",
};

interface IPlanPhaseBadgeProps {
  phase: PlanPhase;
}

export function PlanPhaseBadge({ phase }: IPlanPhaseBadgeProps): ReactElement {
  return (
    <Badge variant="outline" className={cn(PHASE_BADGE_CLASS[phase])}>
      {PLAN_PHASE_LABELS[phase]}
    </Badge>
  );
}
