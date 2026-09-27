import type { ReactElement } from "react";
import type { IPlanSummary } from "@/features/plans/interfaces/plan.interface";
import { AppNavSubmenu } from "@/shared/components/AppNavSubmenu";

interface IDashboardPlanSubmenuProps {
  title: string;
  plans: readonly IPlanSummary[];
  emptyLabel: string;
}

export function DashboardPlanSubmenu({
  title,
  plans,
  emptyLabel,
}: IDashboardPlanSubmenuProps): ReactElement {
  return (
    <AppNavSubmenu title={title} plans={plans} emptyLabel={emptyLabel} />
  );
}
