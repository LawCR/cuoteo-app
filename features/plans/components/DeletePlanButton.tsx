"use client";

import { Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { deletePlanAction } from "@/features/plans/actions/delete-plan.action";
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

interface IDeletePlanButtonProps {
  planId: string;
  planName: string;
}

export function DeletePlanButton({
  planId,
  planName,
}: IDeletePlanButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmDelete(): void {
    startTransition(async () => {
      const result = await deletePlanAction({ planId });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("Plan eliminado");
        setOpen(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="min-h-11 min-w-11 shrink-0 text-destructive"
          aria-label={`Eliminar el plan ${planName}`}
        >
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar plan</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará “{planName}” y todos sus integrantes. Esta acción no se
            puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            disabled={isPending}
            onClick={confirmDelete}
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
