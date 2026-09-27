import { PlanPhase } from "@/generated/prisma/enums";
import type { IAppNavLivePlan } from "@/shared/interfaces/app-nav.interface";

export function isAppNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function toAppNavLivePlan(plan: IAppNavLivePlan): IAppNavLivePlan {
  return {
    id: plan.id,
    name: plan.name,
    icon: plan.icon,
    phase: plan.phase,
  };
}

export function filterAppNavLivePlansByPhase(
  plans: readonly IAppNavLivePlan[],
  phase: PlanPhase,
): IAppNavLivePlan[] {
  return plans.filter((plan) => plan.phase === phase);
}
