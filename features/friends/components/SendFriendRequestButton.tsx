"use client";

import { UserPlusIcon } from "lucide-react";
import { useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { sendFriendRequestToUserAction } from "@/features/friends/actions/send-friend-request.action";
import { Button } from "@/shared/components/ui/button";

interface ISendFriendRequestButtonProps {
  friendUserId: string;
  friendName: string;
}

export function SendFriendRequestButton({
  friendUserId,
  friendName,
}: ISendFriendRequestButtonProps): ReactElement {
  const [isPending, startTransition] = useTransition();

  function sendRequest(): void {
    startTransition(async () => {
      const result = await sendFriendRequestToUserAction(friendUserId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("Solicitud enviada");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      className="min-h-11 min-w-11"
      disabled={isPending}
      aria-label={`Enviar solicitud de amistad a ${friendName}`}
      onClick={sendRequest}
    >
      <UserPlusIcon />
    </Button>
  );
}
