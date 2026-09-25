"use client";

import { Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { deleteExpenseAction } from "@/features/expenses/actions/delete-expense.action";
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

interface IDeleteExpenseButtonProps {
  planId: string;
  expenseId: string;
  expenseTitle: string;
}

export function DeleteExpenseButton({
  planId,
  expenseId,
  expenseTitle,
}: IDeleteExpenseButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmDelete(): void {
    startTransition(async () => {
      const result = await deleteExpenseAction({ planId, expenseId });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("Gasto eliminado");
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
          aria-label={`Eliminar el gasto ${expenseTitle}`}
        >
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar gasto</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará “{expenseTitle}” y su reparto. Esta acción no se puede
            deshacer.
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
