import { z } from "zod";
import { GHOST_NAME_MAX_LENGTH } from "@/features/plans/constants/plans.constants";

export const addGhostToPlanSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
  ghostName: z
    .string()
    .trim()
    .min(1, "Escribe el nombre del invitado.")
    .max(
      GHOST_NAME_MAX_LENGTH,
      `Usa como máximo ${GHOST_NAME_MAX_LENGTH} caracteres.`,
    ),
  includeInPastExpenses: z.boolean(),
});

export type TAddGhostToPlanFormData = z.infer<typeof addGhostToPlanSchema>;
