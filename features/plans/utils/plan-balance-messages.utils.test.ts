import { describe, expect, it } from "vitest";
import { formatExpensesMissingShareMembersMessage } from "@/features/plans/utils/plan-balance-messages.utils";

describe("formatExpensesMissingShareMembersMessage", () => {
  it("nombra un solo gasto", () => {
    expect(formatExpensesMissingShareMembersMessage(["Taxi"])).toBe(
      "Falta asignar al menos una persona al gasto “Taxi”.",
    );
  });

  it("nombra dos gastos", () => {
    expect(formatExpensesMissingShareMembersMessage(["Taxi", "Cena"])).toBe(
      "Falta asignar al menos una persona a los gastos “Taxi” y “Cena”.",
    );
  });

  it("nombra tres gastos", () => {
    expect(
      formatExpensesMissingShareMembersMessage(["Taxi", "Cena", "Hotel"]),
    ).toBe(
      "Falta asignar al menos una persona a los gastos “Taxi”, “Cena” y “Hotel”.",
    );
  });

  it("resume si hay más de tres", () => {
    expect(
      formatExpensesMissingShareMembersMessage([
        "Taxi",
        "Cena",
        "Hotel",
        "Entradas",
      ]),
    ).toBe(
      "Falta asignar al menos una persona a los gastos “Taxi”, “Cena”, “Hotel” y 1 más.",
    );
  });
});
