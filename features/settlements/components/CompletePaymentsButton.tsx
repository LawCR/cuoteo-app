"use client";

import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { completePaymentsAction } from "@/features/settlements/actions/complete-payments.action";
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

interface ICompletePaymentsButtonProps {
  planId: string;
  canComplete: boolean;
  highlight: boolean;
}

export function CompletePaymentsButton({
  planId,
  canComplete,
  highlight,
}: ICompletePaymentsButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmComplete(): void {
    startTransition(async () => {
      const result = await completePaymentsAction({ planId });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("Pagos completados");
        setOpen(false);
      }
    });
  }

  if (!canComplete) {
    return (
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="outline"
          disabled
          className="min-h-11 w-fit"
        >
          Completar pagos
        </Button>
        <p className="text-sm text-muted-foreground">
          Los saldos ya están en cero.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant={highlight ? "default" : "outline"}
            className="min-h-11 w-fit"
          >
            Completar pagos
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Completar pagos</AlertDialogTitle>
            <AlertDialogDescription>
              Se registrarán asientos de cierre para dejar los saldos en cero.
              El plan seguirá en Balance y los pagos ya registrados no se
              borran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              className="min-h-11"
              disabled={isPending}
              onClick={confirmComplete}
            >
              {isPending ? "Completando…" : "Completar pagos"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {highlight ? (
        <p className="text-sm text-muted-foreground">
          Eres el único con cuenta en este plan. Puedes cerrar los saldos
          pendientes de una vez.
        </p>
      ) : null}
    </div>
  );
}
