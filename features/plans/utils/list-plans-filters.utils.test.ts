import { describe, expect, it } from "vitest";
import { PLAN_LIST_PHASE_ALL } from "@/features/plans/constants/plans.constants";
import { PlanPhase } from "@/generated/prisma/enums";
import {
  isListPlansFiltersActive,
  parseListPlansFiltersFormFromSearchParams,
  toListPlansHref,
  toPlanListServiceFilters,
} from "@/features/plans/utils/list-plans-filters.utils";

describe("parseListPlansFiltersFormFromSearchParams", () => {
  it("trata fase ausente o inválida como todas", () => {
    expect(parseListPlansFiltersFormFromSearchParams({}).phase).toBe(
      PLAN_LIST_PHASE_ALL,
    );
    expect(
      parseListPlansFiltersFormFromSearchParams({ phase: "NOPE" }).phase,
    ).toBe(PLAN_LIST_PHASE_ALL);
  });

  it("toma el primer valor de arrays y descarta fechas mal formadas", () => {
    const parsed = parseListPlansFiltersFormFromSearchParams({
      phase: ["BALANCE", "ACTIVE"],
      name: ["Cena"],
      createdAtFrom: "27-09-2026",
      createdAtTo: "2026-09-27",
    });

    expect(parsed).toEqual({
      phase: PlanPhase.BALANCE,
      name: "Cena",
      createdAtFrom: "",
      createdAtTo: "2026-09-27",
    });
  });
});

describe("isListPlansFiltersActive", () => {
  it("es falso cuando no hay filtros", () => {
    expect(
      isListPlansFiltersActive({
        phase: PLAN_LIST_PHASE_ALL,
        name: "  ",
        createdAtFrom: "",
        createdAtTo: "",
      }),
    ).toBe(false);
  });

  it("es verdadero con fase, nombre o rango", () => {
    expect(
      isListPlansFiltersActive({
        phase: PlanPhase.ACTIVE,
        name: "",
        createdAtFrom: "",
        createdAtTo: "",
      }),
    ).toBe(true);
  });
});

describe("toListPlansHref", () => {
  it("omite valores vacíos y ALL", () => {
    expect(
      toListPlansHref({
        phase: PLAN_LIST_PHASE_ALL,
        name: "  ",
        createdAtFrom: "",
        createdAtTo: "",
      }),
    ).toBe("/planes");

    expect(
      toListPlansHref({
        phase: PlanPhase.COMPLETED,
        name: "  Viaje  ",
        createdAtFrom: "2026-01-01",
        createdAtTo: "2026-01-31",
      }),
    ).toBe(
      "/planes?phase=COMPLETED&name=Viaje&createdAtFrom=2026-01-01&createdAtTo=2026-01-31",
    );
  });
});

describe("toPlanListServiceFilters", () => {
  it("convierte ALL y nombre vacío a ausencia de filtro", () => {
    expect(
      toPlanListServiceFilters({
        phase: PLAN_LIST_PHASE_ALL,
        name: "   ",
        createdAtFrom: "",
        createdAtTo: "",
      }),
    ).toEqual({});
  });

  it("pasa substring recortado y el rango como instantes UTC de Lima", () => {
    expect(
      toPlanListServiceFilters({
        phase: PlanPhase.ACTIVE,
        name: "  Cena  ",
        createdAtFrom: "2026-09-27",
        createdAtTo: "2026-09-27",
      }),
    ).toEqual({
      phase: PlanPhase.ACTIVE,
      name: "Cena",
      createdAtFrom: new Date("2026-09-27T05:00:00.000Z"),
      createdAtTo: new Date("2026-09-28T04:59:59.999Z"),
    });
  });
});
