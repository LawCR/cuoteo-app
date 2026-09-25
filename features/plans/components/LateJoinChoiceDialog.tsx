"use client";

import type { ReactElement } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";

interface ILateJoinChoiceDialogProps {
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onChoose: (includeInPastExpenses: boolean) => void;
}

export function LateJoinChoiceDialog({
  open,
  isPending,
  onOpenChange,
  onChoose,
}: ILateJoinChoiceDialogProps): ReactElement {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Este plan ya tiene gastos</AlertDialogTitle>
          <AlertDialogDescription>
            Puedes sumar a esta persona solo a los gastos nuevos, o incluirla
            también en todos los gastos actuales. Quién pagó no cambia, y quien
            ya estaba excluido de un gasto sigue fuera.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            className="min-h-11"
            disabled={isPending}
            onClick={() => onChoose(false)}
          >
            {isPending ? "Agregando…" : "Solo gastos nuevos"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={isPending}
            onClick={() => onChoose(true)}
          >
            Incluir en todos los gastos
          </Button>
          <AlertDialogCancel disabled={isPending} className="min-h-11">
            Cancelar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
