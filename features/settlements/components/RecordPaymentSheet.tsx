"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ReactElement } from "react";
import { recordTransferPaymentAction } from "@/features/settlements/actions/record-transfer-payment.action";
import type { ISettlementMember } from "@/features/settlements/interfaces/settlement.interface";
import {
  recordPaymentFormSchema,
  type TRecordPaymentFormData,
} from "@/features/settlements/schemas/record-payment.schema";
import { getPaymentCap } from "@/features/settlements/utils/payment-rules.utils";
import { CopyTextButton } from "@/shared/components/CopyTextButton";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { formatPen } from "@/shared/utils/money.utils";

interface IRecordPaymentSheetProps {
  planId: string;
  creditor: ISettlementMember;
  debtors: ISettlementMember[];
  sessionMemberId: string;
}

function defaultFromMemberId(
  debtors: ISettlementMember[],
  sessionMemberId: string,
): string {
  if (debtors.some((debtor) => debtor.memberId === sessionMemberId)) {
    return sessionMemberId;
  }

  return "";
}

export function RecordPaymentSheet({
  planId,
  creditor,
  debtors,
  sessionMemberId,
}: IRecordPaymentSheetProps): ReactElement | null {
  const [open, setOpen] = useState(false);
  const isSessionCreditor = creditor.memberId === sessionMemberId;
  const form = useForm<TRecordPaymentFormData>({
    resolver: zodResolver(recordPaymentFormSchema),
    defaultValues: {
      fromMemberId: defaultFromMemberId(debtors, sessionMemberId),
      amount: "",
    },
  });
  const fromMemberId = form.watch("fromMemberId");
  const selectedDebtor = debtors.find(
    (debtor) => debtor.memberId === fromMemberId,
  );
  const cap = selectedDebtor
    ? getPaymentCap(selectedDebtor.remaining, creditor.remaining)
    : 0;
  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      fromMemberId: defaultFromMemberId(debtors, sessionMemberId),
      amount: "",
    });
  }, [open, debtors, sessionMemberId, form]);

  async function onSubmit(values: TRecordPaymentFormData): Promise<void> {
    const amount = Number(values.amount.trim().replace(",", "."));

    if (cap <= 0 || amount > cap) {
      form.setError("amount", {
        message: `El tope es ${formatPen(cap)}.`,
      });
      return;
    }

    const result = await recordTransferPaymentAction({
      planId,
      toMemberId: creditor.memberId,
      fromMemberId: values.fromMemberId,
      amount: values.amount,
    });

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success("Pago registrado");
      setOpen(false);
    }
  }

  if (debtors.length === 0) {
    return null;
  }

  const title = isSessionCreditor
    ? "Registrar cobro"
    : `Registrar pago a ${creditor.name}`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" size="sm" className="min-h-11">
          Registrar pago
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            El monto no puede superar {formatPen(Math.abs(creditor.remaining))}{" "}
            a favor de {creditor.name}.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          {creditor.payout ? (
            <div className="flex flex-col gap-2">
              <CopyTextButton value={creditor.payout.phone} label="teléfono" />
              {creditor.payout.cci ? (
                <CopyTextButton value={creditor.payout.cci} label="CCI" />
              ) : null}
              {creditor.payout.accountNumber ? (
                <CopyTextButton
                  value={creditor.payout.accountNumber}
                  label="cuenta"
                />
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Este invitado no tiene datos de cobro.
            </p>
          )}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="fromMemberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quién paga</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="min-h-11 w-full">
                          <SelectValue placeholder="Elige un deudor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {debtors.map((debtor) => (
                          <SelectItem
                            key={debtor.memberId}
                            value={debtor.memberId}
                          >
                            {debtor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto (S/)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        autoComplete="off"
                        className="min-h-11 tabular-nums"
                        placeholder={cap > 0 ? cap.toFixed(2) : "0.00"}
                        disabled={isSubmitting || cap <= 0}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {cap > 0
                        ? `Tope ${formatPen(cap)}. Puedes registrar un pago parcial.`
                        : "Elige un deudor para ver el tope."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || cap <= 0}
                className="min-h-11 w-full"
              >
                {isSubmitting ? "Registrando…" : "Registrar"}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
