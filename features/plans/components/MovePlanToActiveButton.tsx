"use client";

import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { movePlanToActiveAction } from "@/features/plans/actions/move-plan-to-active.action";
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

interface IMovePlanToActiveButtonProps {
  planId: string;
  paymentCount: number;
}

export function MovePlanToActiveButton({
  planId,
  paymentCount,
}: IMovePlanToActiveButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canMove = paymentCount === 0;

  function confirmMove(): void {
    startTransition(async () => {
      const result = await movePlanToActiveAction({ planId });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("El plan volvió a Activo");
        setOpen(false);
      }
    });
  }

  if (!canMove) {
    return (
      <div className="flex w-full flex-col gap-1 sm:max-w-sm sm:w-auto">
        <Button
          type="button"
          variant="outline"
          disabled
          className="min-h-11 w-full sm:w-auto"
        >
          Volver a Activo
        </Button>
        <p className="text-sm text-muted-foreground">
          No puedes volver a Activo mientras haya pagos registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
          >
            Volver a Activo
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Volver a Activo</AlertDialogTitle>
            <AlertDialogDescription>
              Podrás editar de nuevo los gastos y los integrantes.
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
              onClick={confirmMove}
            >
              {isPending ? "Volviendo…" : "Volver a Activo"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
