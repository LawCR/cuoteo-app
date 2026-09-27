"use client";

import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { wipePlanPaymentsAction } from "@/features/plans/actions/wipe-plan-payments.action";
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

interface IWipePlanPaymentsButtonProps {
  planId: string;
}

export function WipePlanPaymentsButton({
  planId,
}: IWipePlanPaymentsButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmWipe(): void {
    startTransition(async () => {
      const result = await wipePlanPaymentsAction({ planId });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("Pagos borrados. El plan volvió a Activo");
        setOpen(false);
      }
    });
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
            Borrar pagos y volver a Activo
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Borrar pagos y volver a Activo</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrarán todos los pagos de este plan, incluidos los asientos
              de cierre. Los gastos no se tocan. Después podrás editar gastos e
              integrantes otra vez.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="min-h-11">
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending}
              onClick={confirmWipe}
            >
              {isPending ? "Borrando…" : "Borrar pagos"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
