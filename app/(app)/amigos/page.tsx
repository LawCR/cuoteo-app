import Link from "next/link";
import type { ReactElement } from "react";
import { UserPlusIcon } from "lucide-react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { FriendsList } from "@/features/friends/components/FriendsList";
import { SendFriendRequestForm } from "@/features/friends/components/SendFriendRequestForm";
import { listFriends } from "@/features/friends/services/server/friendship-service.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default async function FriendsPage(): Promise<ReactElement> {
  const user = await requireAppUser();
  const friends = await listFriends(user.id);

  return (
    <main className="flex min-h-full flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Amigos</h1>
        <Link
          href="/amigos/solicitudes"
          className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <UserPlusIcon className="size-4" />
          Ver solicitudes
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregar amigo</CardTitle>
          <CardDescription>
            Busca por usuario o correo exacto. Si no hay coincidencia, te lo
            avisamos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SendFriendRequestForm />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Tu lista</h2>
        <FriendsList friends={friends} />
      </section>
    </main>
  );
}
