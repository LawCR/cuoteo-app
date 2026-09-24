import type { ReactElement } from "react";
import { PlanCard } from "@/features/plans/components/PlanCard";
import type { IPlanSummary } from "@/features/plans/interfaces/plan.interface";

interface IPlanListProps {
  plans: IPlanSummary[];
}

export function PlanList({ plans }: IPlanListProps): ReactElement {
  if (plans.length === 0) {
    return (
      <p className="text-muted-foreground">
        Todavía no tienes planes. Crea el primero para empezar a cuotear.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {plans.map((plan) => (
        <li key={plan.id}>
          <PlanCard plan={plan} />
        </li>
      ))}
    </ul>
  );
}
