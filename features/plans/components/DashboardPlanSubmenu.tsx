import Link from "next/link";
import type { ReactElement } from "react";
import { PlanCategoryIcon } from "@/features/plans/components/PlanCategoryIcon";
import type { IPlanSummary } from "@/features/plans/interfaces/plan.interface";
import {
  APP_NAV_SUBITEM_CLASS,
  APP_NAV_SUBMENU_LIST_CLASS,
} from "@/shared/constants/app-nav.constants";
import { cn } from "@/shared/utils/cn.utils";

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
    <div className="flex min-w-0 flex-col gap-1">
      <p className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium">
        {title}
      </p>
      <ul className={APP_NAV_SUBMENU_LIST_CLASS}>
        {plans.length === 0 ? (
          <li className="px-3 py-2 text-sm text-muted-foreground">{emptyLabel}</li>
        ) : (
          plans.map((plan) => (
            <li key={plan.id}>
              <Link
                href={`/planes/${plan.id}`}
                className={cn(APP_NAV_SUBITEM_CLASS, "min-w-0")}
              >
                <PlanCategoryIcon category={plan.icon} className="size-4 shrink-0" />
                <span className="truncate">{plan.name}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
