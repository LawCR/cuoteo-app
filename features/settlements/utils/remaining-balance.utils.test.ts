import { describe, expect, it } from "vitest";
import { ValidationError } from "@/core/errors/validation.error";
import {
  computeRemainingBalances,
  sumSessionRemainingAcrossPlans,
  getMemberBalanceRole,
} from "@/features/settlements/utils/remaining-balance.utils";

describe("getMemberBalanceRole", () => {
  it("clasifica acreedor, deudor y cero", () => {
    expect(getMemberBalanceRole(0.01)).toBe("creditor");
    expect(getMemberBalanceRole(-0.01)).toBe("debtor");
    expect(getMemberBalanceRole(0)).toBe("zero");
  });
});

describe("computeRemainingBalances", () => {
  it("asigna neto de gastos y rol sin payments", () => {
    const balances = computeRemainingBalances(
      ["a", "b"],
      [
        {
          paidByMemberId: "a",
          amount: 100,
          shares: [
            { memberId: "a", shareAmount: 50 },
            { memberId: "b", shareAmount: 50 },
          ],
        },
      ],
      [],
    );

    expect(balances).toEqual([
      { memberId: "a", netExpense: 50, remaining: 50, role: "creditor" },
      { memberId: "b", netExpense: -50, remaining: -50, role: "debtor" },
    ]);
  });

  it("resta payments del neto y llega a cero cuando se cubre el saldo", () => {
    const balances = computeRemainingBalances(
      ["a", "b"],
      [
        {
          paidByMemberId: "a",
          amount: 100,
          shares: [
            { memberId: "a", shareAmount: 50 },
            { memberId: "b", shareAmount: 50 },
          ],
        },
      ],
      [{ fromMemberId: "b", toMemberId: "a", amount: 50 }],
    );

    expect(balances).toEqual([
      { memberId: "a", netExpense: 50, remaining: 0, role: "zero" },
      { memberId: "b", netExpense: -50, remaining: 0, role: "zero" },
    ]);
  });

  it("acepta payments parciales y no reescribe el neto de gastos", () => {
    const balances = computeRemainingBalances(
      ["a", "b"],
      [
        {
          paidByMemberId: "a",
          amount: 100,
          shares: [
            { memberId: "a", shareAmount: 50 },
            { memberId: "b", shareAmount: 50 },
          ],
        },
      ],
      [{ fromMemberId: "b", toMemberId: "a", amount: 20 }],
    );

    expect(balances).toEqual([
      { memberId: "a", netExpense: 50, remaining: 30, role: "creditor" },
      { memberId: "b", netExpense: -50, remaining: -30, role: "debtor" },
    ]);
  });

  it("conserva suma 0 con tres integrantes y varios gastos", () => {
    const balances = computeRemainingBalances(
      ["a", "b", "c"],
      [
        {
          paidByMemberId: "a",
          amount: 90,
          shares: [
            { memberId: "a", shareAmount: 30 },
            { memberId: "b", shareAmount: 30 },
            { memberId: "c", shareAmount: 30 },
          ],
        },
        {
          paidByMemberId: "c",
          amount: 30,
          shares: [
            { memberId: "a", shareAmount: 15 },
            { memberId: "b", shareAmount: 15 },
          ],
        },
      ],
      [{ fromMemberId: "b", toMemberId: "a", amount: 10 }],
    );

    expect(balances).toEqual([
      { memberId: "a", netExpense: 45, remaining: 35, role: "creditor" },
      { memberId: "b", netExpense: -45, remaining: -35, role: "debtor" },
      { memberId: "c", netExpense: 0, remaining: 0, role: "zero" },
    ]);
    expect(balances.reduce((sum, row) => sum + row.remaining, 0)).toBe(0);
  });

  it("omite gastos sin shares para no distorsionar el balance", () => {
    const balances = computeRemainingBalances(
      ["a", "b"],
      [
        {
          paidByMemberId: "a",
          amount: 40,
          shares: [],
        },
        {
          paidByMemberId: "b",
          amount: 10,
          shares: [
            { memberId: "a", shareAmount: 5 },
            { memberId: "b", shareAmount: 5 },
          ],
        },
      ],
      [],
    );

    expect(balances).toEqual([
      { memberId: "a", netExpense: -5, remaining: -5, role: "debtor" },
      { memberId: "b", netExpense: 5, remaining: 5, role: "creditor" },
    ]);
  });

  it("ignora pagos y shares de integrantes que no están en la lista", () => {
    const balances = computeRemainingBalances(
      ["a"],
      [
        {
          paidByMemberId: "a",
          amount: 10,
          shares: [
            { memberId: "a", shareAmount: 6 },
            { memberId: "gone", shareAmount: 4 },
          ],
        },
      ],
      [{ fromMemberId: "gone", toMemberId: "a", amount: 2 }],
    );

    expect(balances).toEqual([
      { memberId: "a", netExpense: 4, remaining: 2, role: "creditor" },
    ]);
  });

  it("deja en cero a quien no pagó ni consumió", () => {
    const balances = computeRemainingBalances(
      ["a", "b", "c"],
      [
        {
          paidByMemberId: "a",
          amount: 20,
          shares: [
            { memberId: "a", shareAmount: 10 },
            { memberId: "b", shareAmount: 10 },
          ],
        },
      ],
      [],
    );

    expect(balances[2]).toEqual({
      memberId: "c",
      netExpense: 0,
      remaining: 0,
      role: "zero",
    });
  });

  it("rechaza ids duplicados", () => {
    expect(() => computeRemainingBalances(["a", "a"], [], [])).toThrow(
      ValidationError,
    );
    expect(() => computeRemainingBalances(["a", "a"], [], [])).toThrow(
      "duplicate_member_id",
    );
  });

  it("rechaza montos de gasto o pago que no son PEN con 2 decimales", () => {
    expect(() =>
      computeRemainingBalances(
        ["a"],
        [{ paidByMemberId: "a", amount: 10.001, shares: [{ memberId: "a", shareAmount: 10.001 }] }],
        [],
      ),
    ).toThrow("amount_not_pen_cents");

    expect(() =>
      computeRemainingBalances(
        ["a", "b"],
        [
          {
            paidByMemberId: "a",
            amount: 10,
            shares: [
              { memberId: "a", shareAmount: 5 },
              { memberId: "b", shareAmount: 5 },
            ],
          },
        ],
        [{ fromMemberId: "b", toMemberId: "a", amount: 0 }],
      ),
    ).toThrow("amount_not_positive");
  });
});

describe("sumSessionRemainingAcrossPlans", () => {
  it("suma el remaining de la sesión entre varios planes", () => {
    const total = sumSessionRemainingAcrossPlans([
      {
        sessionMemberId: "a",
        memberIds: ["a", "b"],
        expenses: [
          {
            paidByMemberId: "a",
            amount: 40,
            shares: [
              { memberId: "a", shareAmount: 20 },
              { memberId: "b", shareAmount: 20 },
            ],
          },
        ],
        payments: [],
      },
      {
        sessionMemberId: "c",
        memberIds: ["c", "d"],
        expenses: [
          {
            paidByMemberId: "d",
            amount: 10,
            shares: [
              { memberId: "c", shareAmount: 5 },
              { memberId: "d", shareAmount: 5 },
            ],
          },
        ],
        payments: [],
      },
    ]);

    expect(total).toBe(15);
  });

  it("devuelve 0 si no hay planes", () => {
    expect(sumSessionRemainingAcrossPlans([])).toBe(0);
  });
});
