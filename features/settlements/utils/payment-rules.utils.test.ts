import { describe, expect, it } from "vitest";
import { PlanPhase } from "@/generated/prisma/enums";
import {
  getCompletePaymentsDenial,
  getCompletePlanDenial,
  getPaymentCap,
  getRecordPaymentDenial,
} from "@/features/settlements/utils/payment-rules.utils";

describe("getRecordPaymentDenial", () => {
  it("solo permite registrar en Balance", () => {
    expect(getRecordPaymentDenial(PlanPhase.BALANCE)).toBeNull();
    expect(getRecordPaymentDenial(PlanPhase.ACTIVE)).toBe("plan_not_in_balance");
    expect(getRecordPaymentDenial(PlanPhase.COMPLETED)).toBe(
      "plan_not_in_balance",
    );
  });
});

describe("getCompletePaymentsDenial", () => {
  it("solo permite al creador en Balance", () => {
    expect(
      getCompletePaymentsDenial(PlanPhase.BALANCE, "user-1", "user-1"),
    ).toBeNull();
    expect(
      getCompletePaymentsDenial(PlanPhase.BALANCE, "user-2", "user-1"),
    ).toBe("not_plan_creator");
    expect(
      getCompletePaymentsDenial(PlanPhase.ACTIVE, "user-1", "user-1"),
    ).toBe("plan_not_in_balance");
    expect(
      getCompletePaymentsDenial(PlanPhase.COMPLETED, "user-1", "user-1"),
    ).toBe("plan_not_in_balance");
  });
});

describe("getCompletePlanDenial", () => {
  it("permite al creador en Balance con saldos en cero", () => {
    expect(
      getCompletePlanDenial(PlanPhase.BALANCE, "user-1", "user-1", true),
    ).toBeNull();
  });

  it("bloquea si aún hay saldos", () => {
    expect(
      getCompletePlanDenial(PlanPhase.BALANCE, "user-1", "user-1", false),
    ).toBe("balances_not_settled");
  });

  it("bloquea si el actor no es el creador", () => {
    expect(
      getCompletePlanDenial(PlanPhase.BALANCE, "user-2", "user-1", true),
    ).toBe("not_plan_creator");
  });

  it("bloquea fuera de Balance", () => {
    expect(
      getCompletePlanDenial(PlanPhase.ACTIVE, "user-1", "user-1", true),
    ).toBe("plan_not_in_balance");
    expect(
      getCompletePlanDenial(PlanPhase.COMPLETED, "user-1", "user-1", true),
    ).toBe("plan_not_in_balance");
  });
});

describe("getPaymentCap", () => {
  it("usa el mínimo entre deuda y crédito", () => {
    expect(getPaymentCap(-30, 20)).toBe(20);
    expect(getPaymentCap(-10, 40)).toBe(10);
  });

  it("es 0 si el origen no es deudor o el destino no es acreedor", () => {
    expect(getPaymentCap(10, 20)).toBe(0);
    expect(getPaymentCap(-10, -5)).toBe(0);
    expect(getPaymentCap(0, 20)).toBe(0);
  });
});
