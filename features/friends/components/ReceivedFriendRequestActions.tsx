"use client";

import { useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { acceptFriendRequestAction } from "@/features/friends/actions/accept-friend-request.action";
import { rejectFriendRequestAction } from "@/features/friends/actions/reject-friend-request.action";
import { Button } from "@/shared/components/ui/button";

interface IReceivedFriendRequestActionsProps {
  friendRequestId: string;
}

export function ReceivedFriendRequestActions({
  friendRequestId,
}: IReceivedFriendRequestActionsProps): ReactElement {
  const [isPending, startTransition] = useTransition();

  function respond(
    action: (id: string) => Promise<{ error: string | null; success: boolean }>,
    successMessage: string,
  ): void {
    startTransition(async () => {
      const result = await action(friendRequestId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(successMessage);
      }
    });
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      <Button
        type="button"
        size="lg"
        disabled={isPending}
        className="min-h-11 w-full sm:w-auto"
        onClick={() =>
          respond(acceptFriendRequestAction, "Ahora son amigos.")
        }
      >
        Aceptar
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="lg"
        disabled={isPending}
        className="min-h-11 w-full sm:w-auto"
        onClick={() =>
          respond(rejectFriendRequestAction, "Solicitud rechazada.")
        }
      >
        Rechazar
      </Button>
    </div>
  );
}
