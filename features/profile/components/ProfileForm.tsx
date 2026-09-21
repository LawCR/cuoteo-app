"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ReactElement } from "react";
import { updateProfileAction } from "@/features/profile/actions/update-profile.action";
import {
  ACCOUNT_NUMBER_MAX_LENGTH,
  ACCOUNT_NUMBER_MIN_LENGTH,
  BANK_NAME_MAX_LENGTH,
  BANK_OPTIONS,
  CCI_DIGIT_COUNT,
  NAME_MAX_LENGTH,
  NO_BANK_SELECT_VALUE,
  OTHER_BANK_SELECT_VALUE,
  PERU_PHONE_DIGIT_COUNT,
  PERU_PHONE_PREFIX,
} from "@/features/profile/constants/profile.constants";
import {
  updateProfileSchema,
  type TUpdateProfileFormData,
} from "@/features/profile/schemas/update-profile.schema";
import { bankSelectFromStoredName } from "@/features/profile/utils/profile.utils";
import { CopyTextButton } from "@/shared/components/CopyTextButton";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface IProfileFormProps {
  email: string;
  username: string;
  name: string;
  phoneDigits: string;
  bankName: string | null;
  cci: string | null;
  accountNumber: string | null;
}

export function ProfileForm({
  email,
  username,
  name,
  phoneDigits,
  bankName,
  cci,
  accountNumber,
}: IProfileFormProps): ReactElement {
  const storedBank = bankSelectFromStoredName(bankName);
  const form = useForm<TUpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name,
      phone: phoneDigits,
      bankSelect: storedBank.bankSelect,
      customBankName: storedBank.customBankName,
      cci: cci ?? "",
      accountNumber: accountNumber ?? "",
    },
  });

  const bankSelect = form.watch("bankSelect");
  const cciValue = form.watch("cci");
  const accountNumberValue = form.watch("accountNumber");
  const isOtherBank = bankSelect === OTHER_BANK_SELECT_VALUE;
  const hasBank = bankSelect !== NO_BANK_SELECT_VALUE;
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: TUpdateProfileFormData): Promise<void> {
    const result = await updateProfileAction(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success("Perfil actualizado");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            defaultValue={email}
            readOnly
            className="min-h-11 bg-muted"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            defaultValue={username}
            readOnly
            className="min-h-11 bg-muted"
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  maxLength={NAME_MAX_LENGTH}
                  className="min-h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <div className="flex min-h-11 overflow-hidden rounded-md border border-input shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                <span className="flex items-center bg-muted px-3 text-sm text-muted-foreground">
                  {PERU_PHONE_PREFIX}
                </span>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={PERU_PHONE_DIGIT_COUNT}
                    className="min-h-11 rounded-none border-0 shadow-none focus-visible:ring-0"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankSelect"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banco</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);

                  if (value === NO_BANK_SELECT_VALUE) {
                    form.setValue("cci", "");
                    form.setValue("accountNumber", "");
                    form.setValue("customBankName", "");
                    return;
                  }

                  if (value !== OTHER_BANK_SELECT_VALUE) {
                    form.setValue("customBankName", "");
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="min-h-11 w-full">
                    <SelectValue placeholder="Sin banco" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card text-card-foreground">
                  <SelectItem value={NO_BANK_SELECT_VALUE}>Sin banco</SelectItem>
                  {BANK_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                  <SelectItem value={OTHER_BANK_SELECT_VALUE}>Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isOtherBank ? (
          <FormField
            control={form.control}
            name="customBankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del banco</FormLabel>
                <FormControl>
                  <Input
                    maxLength={BANK_NAME_MAX_LENGTH}
                    className="min-h-11"
                    placeholder="Escribe el banco"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {hasBank ? (
          <>
            <FormField
              control={form.control}
              name="cci"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CCI</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      maxLength={CCI_DIGIT_COUNT}
                      className="min-h-11"
                      placeholder="20 dígitos"
                      {...field}
                    />
                  </FormControl>
                  <CopyTextButton
                    value={
                      new RegExp(`^\\d{${CCI_DIGIT_COUNT}}$`).test(cciValue)
                        ? cciValue
                        : ""
                    }
                    label="CCI"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de cuenta</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      maxLength={ACCOUNT_NUMBER_MAX_LENGTH}
                      className="min-h-11"
                      placeholder={`${ACCOUNT_NUMBER_MIN_LENGTH}–${ACCOUNT_NUMBER_MAX_LENGTH} dígitos`}
                      {...field}
                    />
                  </FormControl>
                  <CopyTextButton
                    value={
                      new RegExp(
                        `^\\d{${ACCOUNT_NUMBER_MIN_LENGTH},${ACCOUNT_NUMBER_MAX_LENGTH}}$`,
                      ).test(accountNumberValue)
                        ? accountNumberValue
                        : ""
                    }
                    label="número de cuenta"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="min-h-11 w-full md:col-span-2"
        >
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>
    </Form>
  );
}
