"use client";

import { useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { removeFriendshipAction } from "@/features/friends/actions/remove-friendship.action";
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

interface IRemoveFriendshipButtonProps {
  friendUserId: string;
  friendName: string;
}

export function RemoveFriendshipButton({
  friendUserId,
  friendName,
}: IRemoveFriendshipButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmRemove(): void {
    startTransition(async () => {
      const result = await removeFriendshipAction(friendUserId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("Amistad eliminada");
        setOpen(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="lg"
          className="min-h-11 w-full sm:w-auto"
        >
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar a {friendName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Dejarán de ser amigos. Podrás volver a enviarle una solicitud. Esto
            no lo saca de ningún plan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="min-h-11"
          >
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="min-h-11"
            disabled={isPending}
            onClick={confirmRemove}
          >
            {isPending ? "Eliminando…" : "Eliminar amistad"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
