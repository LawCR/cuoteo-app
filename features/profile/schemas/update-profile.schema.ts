import { z } from "zod";
import {
  ACCOUNT_NUMBER_MAX_LENGTH,
  ACCOUNT_NUMBER_MIN_LENGTH,
  BANK_NAME_MAX_LENGTH,
  BANK_SELECT_VALUES,
  CCI_DIGIT_COUNT,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  OTHER_BANK_SELECT_VALUE,
  PERU_PHONE_DIGIT_COUNT,
} from "@/features/profile/constants/profile.constants";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(NAME_MIN_LENGTH, "El nombre debe tener al menos 2 caracteres.")
      .max(NAME_MAX_LENGTH, "El nombre es demasiado largo."),
    phone: z
      .string()
      .regex(
        new RegExp(`^\\d{${PERU_PHONE_DIGIT_COUNT}}$`),
        "El teléfono debe tener 9 dígitos.",
      ),
    bankSelect: z.enum(BANK_SELECT_VALUES),
    customBankName: z.string().max(BANK_NAME_MAX_LENGTH).optional(),
    cci: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === "" || new RegExp(`^\\d{${CCI_DIGIT_COUNT}}$`).test(value),
        "El CCI debe tener 20 dígitos.",
      ),
    accountNumber: z
      .string()
      .trim()
      .refine((value) => {
        if (value === "") {
          return true;
        }

        return new RegExp(
          `^\\d{${ACCOUNT_NUMBER_MIN_LENGTH},${ACCOUNT_NUMBER_MAX_LENGTH}}$`,
        ).test(value);
      }, "El número de cuenta debe tener entre 8 y 20 dígitos."),
  })
  .superRefine((data, ctx) => {
    if (
      data.bankSelect === OTHER_BANK_SELECT_VALUE &&
      !data.customBankName?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["customBankName"],
        message: "Indica el nombre del banco.",
      });
    }
  });

export type TUpdateProfileFormData = z.infer<typeof updateProfileSchema>;
