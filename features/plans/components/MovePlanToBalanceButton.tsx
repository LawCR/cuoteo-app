"use client";

import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { movePlanToBalanceAction } from "@/features/plans/actions/move-plan-to-balance.action";
import { MIN_MEMBERS_TO_ENTER_BALANCE } from "@/features/plans/constants/plans.constants";
import { formatExpensesMissingShareMembersMessage } from "@/features/plans/utils/plan-balance-messages.utils";
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

interface IMovePlanToBalanceButtonProps {
  planId: string;
  memberCount: number;
  incompleteExpenseTitles: string[];
}

export function MovePlanToBalanceButton({
  planId,
  memberCount,
  incompleteExpenseTitles,
}: IMovePlanToBalanceButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canMove = memberCount >= MIN_MEMBERS_TO_ENTER_BALANCE;

  function handleOpen(): void {
    if (incompleteExpenseTitles.length > 0) {
      toast.error(
        formatExpensesMissingShareMembersMessage(incompleteExpenseTitles),
      );
      return;
    }

    setOpen(true);
  }

  function confirmMove(): void {
    startTransition(async () => {
      const result = await movePlanToBalanceAction({ planId });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("El plan pasó a Balance");
        setOpen(false);
      }
    });
  }

  if (!canMove) {
    return (
      <div className="flex flex-col gap-1">
        <Button type="button" disabled className="min-h-11 w-fit">
          Pasar a Balance
        </Button>
        <p className="text-sm text-muted-foreground">
          Necesitas al menos {MIN_MEMBERS_TO_ENTER_BALANCE} integrantes para
          pasar a Balance.
        </p>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        className="min-h-11 w-fit"
        onClick={handleOpen}
      >
        Pasar a Balance
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pasar a Balance</AlertDialogTitle>
            <AlertDialogDescription>
              No se podrán editar los gastos ni los integrantes hasta volver a
              Activo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              className="min-h-11"
              disabled={isPending}
              onClick={confirmMove}
            >
              {isPending ? "Pasando…" : "Pasar a Balance"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
