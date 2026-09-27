"use client";

import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { completePlanAction } from "@/features/settlements/actions/complete-plan.action";
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

interface ICompletePlanButtonProps {
  planId: string;
  canComplete: boolean;
}

export function CompletePlanButton({
  planId,
  canComplete,
}: ICompletePlanButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmComplete(): void {
    startTransition(async () => {
      const result = await completePlanAction({ planId });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("Plan completado");
        setOpen(false);
      }
    });
  }

  if (!canComplete) {
    return (
      <div className="flex w-full flex-col gap-1 sm:max-w-sm sm:w-auto">
        <Button
          type="button"
          variant="outline"
          disabled
          className="min-h-11 w-full sm:w-auto"
        >
          Completar plan
        </Button>
        <p className="text-sm text-muted-foreground">
          Primero deja los saldos en cero (registrar pagos o Completar pagos).
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button" className="min-h-11 w-full sm:w-auto">
            Completar plan
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Completar plan</AlertDialogTitle>
            <AlertDialogDescription>
              El plan pasará a Completado. Nadie podrá registrar pagos ni editar
              gastos o integrantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="min-h-11">
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending}
              onClick={confirmComplete}
            >
              {isPending ? "Completando…" : "Completar plan"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
