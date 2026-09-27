import { describe, expect, it } from "vitest";
import { ValidationError } from "@/core/errors/validation.error";
import { computeRemainingBalances } from "@/features/settlements/utils/remaining-balance.utils";
import { computeMinTransfers } from "@/features/settlements/utils/min-transfers.utils";

describe("computeMinTransfers", () => {
  it("omite saldos en cero y no sugiere transferencias", () => {
    expect(
      computeMinTransfers([
        { memberId: "a", remaining: 0 },
        { memberId: "b", remaining: 0 },
      ]),
    ).toEqual([]);
  });

  it("sugiere una sola transferencia entre un deudor y un acreedor", () => {
    expect(
      computeMinTransfers([
        { memberId: "a", remaining: 50 },
        { memberId: "b", remaining: -50 },
      ]),
    ).toEqual([{ fromMemberId: "b", toMemberId: "a", amount: 50 }]);
  });

  it("empareja el mayor deudor con el mayor acreedor", () => {
    expect(
      computeMinTransfers([
        { memberId: "a", remaining: 60 },
        { memberId: "b", remaining: -30 },
        { memberId: "c", remaining: -30 },
      ]),
    ).toEqual([
      { fromMemberId: "b", toMemberId: "a", amount: 30 },
      { fromMemberId: "c", toMemberId: "a", amount: 30 },
    ]);
  });

  it("desempata por id cuando los restantes son iguales", () => {
    expect(
      computeMinTransfers([
        { memberId: "z", remaining: 20 },
        { memberId: "a", remaining: 20 },
        { memberId: "m", remaining: -40 },
      ]),
    ).toEqual([
      { fromMemberId: "m", toMemberId: "a", amount: 20 },
      { fromMemberId: "m", toMemberId: "z", amount: 20 },
    ]);
  });

  it("recalcula la solución después de un pago parcial", () => {
    const expenses = [
      {
        paidByMemberId: "a",
        amount: 90,
        shares: [
          { memberId: "a", shareAmount: 30 },
          { memberId: "b", shareAmount: 30 },
          { memberId: "c", shareAmount: 30 },
        ],
      },
    ];
    const members = ["a", "b", "c"];

    const before = computeRemainingBalances(members, expenses, []);
    expect(computeMinTransfers(before)).toEqual([
      { fromMemberId: "b", toMemberId: "a", amount: 30 },
      { fromMemberId: "c", toMemberId: "a", amount: 30 },
    ]);

    const after = computeRemainingBalances(members, expenses, [
      { fromMemberId: "c", toMemberId: "a", amount: 10 },
    ]);
    expect(computeMinTransfers(after)).toEqual([
      { fromMemberId: "b", toMemberId: "a", amount: 30 },
      { fromMemberId: "c", toMemberId: "a", amount: 20 },
    ]);
  });

  it("al aplicar las sugerencias los restantes quedan en cero", () => {
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
      [],
    );

    const transfers = computeMinTransfers(balances);
    const settled = computeRemainingBalances(
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
      transfers,
    );

    expect(settled.every((row) => row.remaining === 0)).toBe(true);
  });

  it("rechaza ids duplicados", () => {
    expect(() =>
      computeMinTransfers([
        { memberId: "a", remaining: 10 },
        { memberId: "a", remaining: -10 },
      ]),
    ).toThrow(ValidationError);
    expect(() =>
      computeMinTransfers([
        { memberId: "a", remaining: 10 },
        { memberId: "a", remaining: -10 },
      ]),
    ).toThrow("duplicate_member_id");
  });
});
