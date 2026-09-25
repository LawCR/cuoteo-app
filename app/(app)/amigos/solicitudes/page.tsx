import Link from "next/link";
import type { ReactElement } from "react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { FriendRequestInboxList } from "@/features/friends/components/FriendRequestInboxList";
import { listFriendRequests } from "@/features/friends/services/server/friend-request-service.server";
import { ArrowLeftIcon } from "lucide-react";
export default async function FriendRequestsPage(): Promise<ReactElement> {
  const user = await requireAppUser();
  const inbox = await listFriendRequests(user.id);

  return (
    <main className="flex min-h-full flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Solicitudes</h1>
        <Link
          href="/amigos"
          className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeftIcon className="size-4" />
          Volver a amigos
        </Link>
      </div>

      <FriendRequestInboxList received={inbox.received} sent={inbox.sent} />
    </main>
  );
}
