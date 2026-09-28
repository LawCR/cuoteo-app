import { describe, expect, it } from "vitest";
import { buildWhatsAppBalanceText } from "@/features/settlements/utils/whatsapp-balance-text.utils";

describe("buildWhatsAppBalanceText", () => {
  it("incluye saldos, transferencias y la URL del plan", () => {
    const text = buildWhatsAppBalanceText({
      planName: "Viaje a Cusco",
      planUrl: "http://localhost:3000/planes/plan-1",
      members: [
        { name: "Ana", remaining: 50, role: "creditor" },
        { name: "Luis", remaining: -50, role: "debtor" },
        { name: "Invitado", remaining: 0, role: "zero" },
      ],
      transfers: [
        { fromName: "Luis", toName: "Ana", amount: 50 },
      ],
    });

    expect(text).toBe(
      [
        "Cuoteo — Viaje a Cusco",
        "",
        "Saldos:",
        "• Ana: a favor S/ 50.00",
        "• Luis: debe S/ 50.00",
        "• Invitado: al día",
        "",
        "Cómo saldar:",
        "• Luis le paga a Ana S/ 50.00",
        "",
        "Abre el plan (necesitas iniciar sesión):",
        "http://localhost:3000/planes/plan-1",
      ].join("\n"),
    );
  });

  it("omite transferencias cuando nadie se debe nada", () => {
    const text = buildWhatsAppBalanceText({
      planName: "Cena",
      planUrl: "https://cuoteo.app/planes/plan-2",
      members: [
        { name: "Ana", remaining: 0, role: "zero" },
        { name: "Luis", remaining: 0, role: "zero" },
      ],
      transfers: [],
    });

    expect(text).toContain("• Ana: al día");
    expect(text).not.toContain("Cómo saldar:");
    expect(text).toContain("https://cuoteo.app/planes/plan-2");
  });
});
