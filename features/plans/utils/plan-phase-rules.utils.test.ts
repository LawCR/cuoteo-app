import { describe, expect, it } from "vitest";
import {
  getMovePlanToActiveDenial,
  getMovePlanToBalanceDenial,
} from "@/features/plans/utils/plan-phase-rules.utils";
import { PlanPhase } from "@/generated/prisma/enums";

describe("getMovePlanToBalanceDenial", () => {
  it("permite Activo con al menos 2 integrantes", () => {
    expect(
      getMovePlanToBalanceDenial({
        phase: PlanPhase.ACTIVE,
        memberCount: 2,
        expenseCount: 1,
        hasExpensesWithoutShareMembers: false,
      }),
    ).toBeNull();
  });

  it("bloquea Activo con menos de 2 integrantes", () => {
    expect(
      getMovePlanToBalanceDenial({
        phase: PlanPhase.ACTIVE,
        memberCount: 1,
        expenseCount: 0,
        hasExpensesWithoutShareMembers: false,
      }),
    ).toBe("not_enough_members");
  });

  it("bloquea si el plan no está activo", () => {
    expect(
      getMovePlanToBalanceDenial({
        phase: PlanPhase.BALANCE,
        memberCount: 3,
        expenseCount: 1,
        hasExpensesWithoutShareMembers: false,
      }),
    ).toBe("plan_not_active");
  });

  it("bloquea Completado", () => {
    expect(
      getMovePlanToBalanceDenial({
        phase: PlanPhase.COMPLETED,
        memberCount: 3,
        expenseCount: 1,
        hasExpensesWithoutShareMembers: false,
      }),
    ).toBe("plan_not_active");
  });

  it("bloquea Activo sin gastos", () => {
    expect(
      getMovePlanToBalanceDenial({
        phase: PlanPhase.ACTIVE,
        memberCount: 2,
        expenseCount: 0,
        hasExpensesWithoutShareMembers: false,
      }),
    ).toBe("not_enough_expenses");
  });

  it("bloquea si hay gastos sin integrantes", () => {
    expect(
      getMovePlanToBalanceDenial({
        phase: PlanPhase.ACTIVE,
        memberCount: 2,
        expenseCount: 1,
        hasExpensesWithoutShareMembers: true,
      }),
    ).toBe("expenses_missing_share_members");
  });
});

describe("getMovePlanToActiveDenial", () => {
  it("permite Balance sin pagos", () => {
    expect(
      getMovePlanToActiveDenial({
        phase: PlanPhase.BALANCE,
        paymentCount: 0,
      }),
    ).toBeNull();
  });

  it("bloquea Balance si hay pagos", () => {
    expect(
      getMovePlanToActiveDenial({
        phase: PlanPhase.BALANCE,
        paymentCount: 1,
      }),
    ).toBe("has_payments");
  });

  it("bloquea si el plan no está en Balance", () => {
    expect(
      getMovePlanToActiveDenial({
        phase: PlanPhase.ACTIVE,
        paymentCount: 0,
      }),
    ).toBe("plan_not_in_balance");
  });

  it("bloquea Completado", () => {
    expect(
      getMovePlanToActiveDenial({
        phase: PlanPhase.COMPLETED,
        paymentCount: 0,
      }),
    ).toBe("plan_not_in_balance");
  });
});
