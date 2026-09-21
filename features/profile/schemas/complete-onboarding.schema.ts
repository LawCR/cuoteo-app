import { z } from "zod";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PERU_PHONE_DIGIT_COUNT,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/features/profile/constants/profile.constants";

export const completeOnboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(NAME_MIN_LENGTH)
    .max(NAME_MAX_LENGTH),
  username: z
    .string()
    .trim()
    .regex(
      new RegExp(
        `^[a-zA-Z0-9_]{${USERNAME_MIN_LENGTH},${USERNAME_MAX_LENGTH}}$`,
      ),
    ),
  phone: z.string().regex(new RegExp(`^\\d{${PERU_PHONE_DIGIT_COUNT}}$`)),
});

export type TCompleteOnboardingFormData = z.infer<
  typeof completeOnboardingSchema
>;
