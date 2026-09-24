import { z } from "zod";
import {
  EXPENSE_CATEGORY_VALUES,
  PLAN_NAME_MAX_LENGTH,
} from "@/features/plans/constants/plans.constants";

export const planMetadataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe un nombre.")
    .max(PLAN_NAME_MAX_LENGTH, `Usa como máximo ${PLAN_NAME_MAX_LENGTH} caracteres.`),
  icon: z.enum(EXPENSE_CATEGORY_VALUES, { error: "Elige un ícono." }),
});

export const updatePlanMetadataSchema = planMetadataSchema.extend({
  planId: z.string().min(1, "El plan no es válido."),
});

export type TPlanMetadataFormData = z.infer<typeof planMetadataSchema>;
export type TUpdatePlanMetadataFormData = z.infer<typeof updatePlanMetadataSchema>;
