import {
  PLAN_LIST_PHASE_ALL,
  PLAN_NAME_MAX_LENGTH,
  PLAN_PHASE_VALUES,
} from "@/features/plans/constants/plans.constants";
import type { IPlanListFilters } from "@/features/plans/interfaces/plan.interface";
import type { TListPlansFiltersFormData } from "@/features/plans/schemas/list-plans-filters.schema";
import type { PlanPhase } from "@/generated/prisma/enums";
import {
  LIMA_CALENDAR_DATE_PATTERN,
  limaCalendarDateToUtcEnd,
  limaCalendarDateToUtcStart,
} from "@/shared/utils/lima-date.utils";

function firstQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseLimaDateQuery(value: string | undefined): string {
  if (!value || !LIMA_CALENDAR_DATE_PATTERN.test(value)) {
    return "";
  }

  return value;
}

export function parseListPlansFiltersFormFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): TListPlansFiltersFormData {
  const phaseRaw = firstQueryValue(searchParams.phase);
  const phase = PLAN_PHASE_VALUES.includes(phaseRaw as PlanPhase)
    ? (phaseRaw as PlanPhase)
    : PLAN_LIST_PHASE_ALL;

  const name = (firstQueryValue(searchParams.name) ?? "").slice(
    0,
    PLAN_NAME_MAX_LENGTH,
  );

  return {
    phase,
    name,
    createdAtFrom: parseLimaDateQuery(
      firstQueryValue(searchParams.createdAtFrom),
    ),
    createdAtTo: parseLimaDateQuery(firstQueryValue(searchParams.createdAtTo)),
  };
}

export function isListPlansFiltersActive(
  data: TListPlansFiltersFormData,
): boolean {
  return (
    data.phase !== PLAN_LIST_PHASE_ALL ||
    data.name.trim() !== "" ||
    data.createdAtFrom !== "" ||
    data.createdAtTo !== ""
  );
}

export function toListPlansHref(data: TListPlansFiltersFormData): string {
  const params = new URLSearchParams();

  if (data.phase !== PLAN_LIST_PHASE_ALL) {
    params.set("phase", data.phase);
  }

  const name = data.name.trim();
  if (name) {
    params.set("name", name);
  }

  if (data.createdAtFrom) {
    params.set("createdAtFrom", data.createdAtFrom);
  }

  if (data.createdAtTo) {
    params.set("createdAtTo", data.createdAtTo);
  }

  const query = params.toString();
  return query ? `/planes?${query}` : "/planes";
}

export function toPlanListServiceFilters(
  data: TListPlansFiltersFormData,
): IPlanListFilters {
  const name = data.name.trim();
  const filters: IPlanListFilters = {};

  if (data.phase !== PLAN_LIST_PHASE_ALL) {
    filters.phase = data.phase;
  }

  if (name) {
    filters.name = name;
  }

  if (data.createdAtFrom) {
    filters.createdAtFrom = limaCalendarDateToUtcStart(data.createdAtFrom);
  }

  if (data.createdAtTo) {
    filters.createdAtTo = limaCalendarDateToUtcEnd(data.createdAtTo);
  }

  return filters;
}
