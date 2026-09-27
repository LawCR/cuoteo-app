"use client";

import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { leavePlanAction } from "@/features/plans/actions/leave-plan.action";
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

interface ILeavePlanButtonProps {
  planId: string;
  planName: string;
  hasExpenses: boolean;
}

export function LeavePlanButton({
  planId,
  planName,
  hasExpenses,
}: ILeavePlanButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmLeave(): void {
    startTransition(async () => {
      const result = await leavePlanAction({ planId });

      if (result?.error) {
        toast.error(result.error);
        return;
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          className="min-h-11 w-fit"
        >
          Salir del plan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Salir del plan</AlertDialogTitle>
          <AlertDialogDescription>
            {hasExpenses
              ? `Vas a salir de “${planName}”. Se eliminarán los gastos que pagaste y dejarás de estar incluido en el resto. El plan se recalculará entre quienes se queden.`
              : `Vas a salir de “${planName}”. Podrás volver si alguien te agrega de nuevo.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            disabled={isPending}
            onClick={confirmLeave}
          >
            {isPending ? "Saliendo…" : "Salir del plan"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
