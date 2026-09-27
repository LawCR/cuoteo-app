import { describe, expect, it } from "vitest";
import { buildMemberShareBreakdown } from "@/features/expenses/utils/expense-share-chart.utils";

describe("buildMemberShareBreakdown", () => {
  const members = [
    { id: "a", name: "Ana" },
    { id: "b", name: "Beto" },
    { id: "c", name: "Cata" },
  ];

  it("suma el consumo por integrante y el total de gastos con shares", () => {
    const breakdown = buildMemberShareBreakdown(members, [
      {
        shareMemberIds: ["a", "b"],
        shares: [
          { memberId: "a", shareAmount: 30 },
          { memberId: "b", shareAmount: 30 },
        ],
      },
      {
        shareMemberIds: ["a", "b", "c"],
        shares: [
          { memberId: "a", shareAmount: 10 },
          { memberId: "b", shareAmount: 10 },
          { memberId: "c", shareAmount: 10 },
        ],
      },
    ]);

    expect(breakdown.total).toBe(90);
    expect(breakdown.incompleteCount).toBe(0);
    expect(breakdown.slices).toEqual([
      { memberId: "a", name: "Ana", amount: 40, chartIndex: 0 },
      { memberId: "b", name: "Beto", amount: 40, chartIndex: 1 },
      { memberId: "c", name: "Cata", amount: 10, chartIndex: 2 },
    ]);
  });

  it("omite gastos sin integrantes y deja en 0 a quien no consumió", () => {
    const breakdown = buildMemberShareBreakdown(members, [
      {
        shareMemberIds: [],
        shares: [],
      },
      {
        shareMemberIds: ["b"],
        shares: [{ memberId: "b", shareAmount: 25 }],
      },
    ]);

    expect(breakdown.total).toBe(25);
    expect(breakdown.incompleteCount).toBe(1);
    expect(breakdown.slices.map((slice) => slice.amount)).toEqual([0, 25, 0]);
  });

  it("ignora shares de integrantes que ya no están en el plan", () => {
    const breakdown = buildMemberShareBreakdown(members.slice(0, 1), [
      {
        shareMemberIds: ["a", "gone"],
        shares: [
          { memberId: "a", shareAmount: 8 },
          { memberId: "gone", shareAmount: 8 },
        ],
      },
    ]);

    expect(breakdown.total).toBe(8);
    expect(breakdown.slices).toEqual([
      { memberId: "a", name: "Ana", amount: 8, chartIndex: 0 },
    ]);
  });
});
