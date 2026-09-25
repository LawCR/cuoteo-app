"use client";

import { UserMinusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { removePlanMemberAction } from "@/features/plans/actions/remove-plan-member.action";
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

interface IRemovePlanMemberButtonProps {
  planId: string;
  memberId: string;
  memberName: string;
}

export function RemovePlanMemberButton({
  planId,
  memberId,
  memberName,
}: IRemovePlanMemberButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmRemove(): void {
    startTransition(async () => {
      const result = await removePlanMemberAction({ planId, memberId });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("Integrante quitado del plan");
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
          className="min-h-11 min-w-11 text-destructive"
          aria-label={`Quitar a ${memberName} del plan`}
        >
          <UserMinusIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quitar integrante</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Quitar a {memberName} de este plan?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            disabled={isPending}
            onClick={confirmRemove}
          >
            {isPending ? "Quitando…" : "Quitar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
