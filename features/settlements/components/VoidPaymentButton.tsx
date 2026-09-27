"use client";

import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { voidPaymentAction } from "@/features/settlements/actions/void-payment.action";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";

interface IVoidPaymentButtonProps {
  planId: string;
  paymentId: string;
  fromName: string;
  toName: string;
}

export function VoidPaymentButton({
  planId,
  paymentId,
  fromName,
  toName,
}: IVoidPaymentButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmVoid(): void {
    startTransition(async () => {
      const result = await voidPaymentAction({ planId, paymentId });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("Pago anulado");
        setOpen(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="min-h-11">
          Anular
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anular pago</AlertDialogTitle>
          <AlertDialogDescription>
            Se anulará el pago de {fromName} a {toName}. Los saldos y las
            transferencias mínimas se recalcularán.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            disabled={isPending}
            onClick={confirmVoid}
          >
            {isPending ? "Anulando…" : "Anular"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
