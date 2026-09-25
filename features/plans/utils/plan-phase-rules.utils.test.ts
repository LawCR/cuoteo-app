import { describe, expect, it } from "vitest";
import { PlanPhase } from "@/generated/prisma/enums";
import { getMovePlanToBalanceDenial } from "@/features/plans/utils/plan-phase-rules.utils";

describe("getMovePlanToBalanceDenial", () => {
  it("permite Activo con al menos 2 integrantes", () => {
    expect(
      getMovePlanToBalanceDenial({
        phase: PlanPhase.ACTIVE,
        memberCount: 2,
      }),
    ).toBeNull();
  });

  it("bloquea Activo con menos de 2 integrantes", () => {
    expect(
      getMovePlanToBalanceDenial({
        phase: PlanPhase.ACTIVE,
        memberCount: 1,
      }),
    ).toBe("not_enough_members");
  });

  it("bloquea si el plan no está activo", () => {
    expect(
      getMovePlanToBalanceDenial({
        phase: PlanPhase.BALANCE,
        memberCount: 3,
      }),
    ).toBe("plan_not_active");
  });
});
