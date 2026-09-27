import { describe, expect, it } from "vitest";
import { PlanPhase } from "@/generated/prisma/enums";
import {
  filterAppNavLivePlansByPhase,
  isAppNavItemActive,
  toAppNavLivePlan,
} from "@/shared/utils/app-nav.utils";

const activePlan = {
  id: "plan-active",
  name: "Cena",
  icon: "FOOD" as const,
  phase: PlanPhase.ACTIVE,
};

const balancePlan = {
  id: "plan-balance",
  name: "Viaje",
  icon: "TRANSPORT" as const,
  phase: PlanPhase.BALANCE,
};

describe("isAppNavItemActive", () => {
  it("marca el listado de planes y las rutas anidadas", () => {
    expect(isAppNavItemActive("/planes", "/planes")).toBe(true);
    expect(isAppNavItemActive("/planes/nuevo", "/planes")).toBe(true);
    expect(isAppNavItemActive("/planes/plan-1", "/planes")).toBe(true);
  });

  it("marca solo el plan cuyo href coincide", () => {
    expect(isAppNavItemActive("/planes/plan-1", "/planes/plan-1")).toBe(true);
    expect(isAppNavItemActive("/planes/plan-1/gastos", "/planes/plan-1")).toBe(
      true,
    );
    expect(isAppNavItemActive("/planes/plan-2", "/planes/plan-1")).toBe(false);
  });
});

describe("toAppNavLivePlan", () => {
  it("deja solo id, name, icon y phase", () => {
    expect(
      toAppNavLivePlan({
        ...activePlan,
      }),
    ).toEqual(activePlan);
  });
});

describe("filterAppNavLivePlansByPhase", () => {
  it("separa Activo y Balance", () => {
    const plans = [activePlan, balancePlan];

    expect(filterAppNavLivePlansByPhase(plans, PlanPhase.ACTIVE)).toEqual([
      activePlan,
    ]);
    expect(filterAppNavLivePlansByPhase(plans, PlanPhase.BALANCE)).toEqual([
      balancePlan,
    ]);
    expect(filterAppNavLivePlansByPhase(plans, PlanPhase.COMPLETED)).toEqual(
      [],
    );
  });
});
