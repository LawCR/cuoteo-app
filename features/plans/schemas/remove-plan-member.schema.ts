import { z } from "zod";

export const removePlanMemberSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
  memberId: z.string().min(1, "El integrante no es válido."),
});

export type TRemovePlanMemberFormData = z.infer<typeof removePlanMemberSchema>;
