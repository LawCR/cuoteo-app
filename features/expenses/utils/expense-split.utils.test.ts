import { describe, expect, it } from "vitest";
import { ValidationError } from "@/core/errors/validation.error";
import {
  memberIdsWithLateJoiner,
  recalculateEqualExpenseShares,
  splitEqualExpenseShares,
  sumShareCents,
} from "@/features/expenses/utils/expense-split.utils";

describe("splitEqualExpenseShares", () => {
  it("reparte sin residuo cuando el monto es divisible", () => {
    const shares = splitEqualExpenseShares(100, ["b", "a"]);

    expect(shares).toEqual([
      { memberId: "b", shareAmount: 50 },
      { memberId: "a", shareAmount: 50 },
    ]);
    expect(sumShareCents(shares)).toBe(10000);
  });

  it("asigna los céntimos restantes por mayor resto y empate por id", () => {
    const shares = splitEqualExpenseShares(100, ["c", "a", "b"]);

    expect(shares).toEqual([
      { memberId: "c", shareAmount: 33.33 },
      { memberId: "a", shareAmount: 33.34 },
      { memberId: "b", shareAmount: 33.33 },
    ]);
    expect(sumShareCents(shares)).toBe(10000);
  });

  it("no usa el orden de entrada para desempatar", () => {
    const shares = splitEqualExpenseShares(10, ["z", "m", "a"]);

    expect(shares).toEqual([
      { memberId: "z", shareAmount: 3.33 },
      { memberId: "m", shareAmount: 3.33 },
      { memberId: "a", shareAmount: 3.34 },
    ]);
    expect(sumShareCents(shares)).toBe(1000);
  });

  it("reparte un solo céntimo cuando N es mayor que el monto", () => {
    const shares = splitEqualExpenseShares(0.01, ["b", "a"]);

    expect(shares).toEqual([
      { memberId: "b", shareAmount: 0 },
      { memberId: "a", shareAmount: 0.01 },
    ]);
    expect(sumShareCents(shares)).toBe(1);
  });

  it("asigna el monto completo si hay un solo integrante", () => {
    const shares = splitEqualExpenseShares(12.5, ["solo"]);

    expect(shares).toEqual([{ memberId: "solo", shareAmount: 12.5 }]);
    expect(sumShareCents(shares)).toBe(1250);
  });

  it("rechaza N = 0", () => {
    expect(() => splitEqualExpenseShares(10, [])).toThrow(ValidationError);
    expect(() => splitEqualExpenseShares(10, [])).toThrow("no_share_members");
  });

  it("rechaza ids duplicados", () => {
    expect(() => splitEqualExpenseShares(10, ["a", "a"])).toThrow(
      "duplicate_member_id",
    );
  });

  it("rechaza montos que no son PEN con 2 decimales", () => {
    expect(() => splitEqualExpenseShares(10.001, ["a"])).toThrow(
      "amount_not_pen_cents",
    );
    expect(() => splitEqualExpenseShares(0, ["a"])).toThrow(
      "amount_not_positive",
    );
  });
});

describe("memberIdsWithLateJoiner", () => {
  it("suma al tardío y deja fuera a los ya excluidos", () => {
    expect(memberIdsWithLateJoiner(["a", "b"], "d")).toEqual(["a", "b", "d"]);
  });

  it("no duplica si el tardío ya participa", () => {
    expect(memberIdsWithLateJoiner(["a", "d"], "d")).toEqual(["a", "d"]);
  });
});

describe("recalculateEqualExpenseShares", () => {
  it("mantiene suma = monto al excluir integrantes", () => {
    const shares = recalculateEqualExpenseShares(10, ["b"]);

    expect(shares).toEqual([{ memberId: "b", shareAmount: 10 }]);
    expect(sumShareCents(shares)).toBe(1000);
  });
});
