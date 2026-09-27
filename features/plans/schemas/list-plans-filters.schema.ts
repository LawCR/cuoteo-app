import { z } from "zod";
import {
  PLAN_LIST_PHASE_ALL,
  PLAN_NAME_MAX_LENGTH,
  PLAN_PHASE_VALUES,
} from "@/features/plans/constants/plans.constants";
import { LIMA_CALENDAR_DATE_PATTERN } from "@/shared/utils/lima-date.utils";

const PLAN_LIST_PHASE_FILTER_VALUES = [
  PLAN_LIST_PHASE_ALL,
  ...PLAN_PHASE_VALUES,
] as const;

const limaDateInput = z
  .string()
  .refine(
    (value) => value === "" || LIMA_CALENDAR_DATE_PATTERN.test(value),
    "La fecha no es válida.",
  );

export const listPlansFiltersFormSchema = z
  .object({
    phase: z.enum(PLAN_LIST_PHASE_FILTER_VALUES),
    name: z
      .string()
      .max(
        PLAN_NAME_MAX_LENGTH,
        `Usa como máximo ${PLAN_NAME_MAX_LENGTH} caracteres.`,
      ),
    createdAtFrom: limaDateInput,
    createdAtTo: limaDateInput,
  })
  .superRefine((data, ctx) => {
    if (
      data.createdAtFrom &&
      data.createdAtTo &&
      data.createdAtFrom > data.createdAtTo
    ) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha inicial no puede ser posterior a la final.",
        path: ["createdAtTo"],
      });
    }
  });

export type TListPlansFiltersFormData = z.infer<
  typeof listPlansFiltersFormSchema
>;
