import { describe, expect, it } from "vitest";
import { getCreateExpenseDenial, getMutateExpenseDenial } from "@/features/expenses/utils/expense-rules.utils";
import { PlanPhase } from "@/generated/prisma/enums";

describe("getCreateExpenseDenial", () => {
  it("exige fase Activo", () => {
    expect(
      getCreateExpenseDenial({
        phase: PlanPhase.BALANCE,
        memberCount: 2,
      }),
    ).toBe("plan_not_active");
  });

  it("exige al menos 2 integrantes", () => {
    expect(
      getCreateExpenseDenial({
        phase: PlanPhase.ACTIVE,
        memberCount: 1,
      }),
    ).toBe("not_enough_members");
  });

  it("permite crear con 2 integrantes en Activo", () => {
    expect(
      getCreateExpenseDenial({
        phase: PlanPhase.ACTIVE,
        memberCount: 2,
      }),
    ).toBeNull();
  });
});

describe("getMutateExpenseDenial", () => {
  it("bloquea fuera de Activo", () => {
    expect(getMutateExpenseDenial(PlanPhase.COMPLETED)).toBe("plan_not_active");
  });

  it("permite en Activo", () => {
    expect(getMutateExpenseDenial(PlanPhase.ACTIVE)).toBeNull();
  });
});
