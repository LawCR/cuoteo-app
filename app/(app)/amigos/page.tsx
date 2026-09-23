import Link from "next/link";
import type { ReactElement } from "react";
import { SendFriendRequestForm } from "@/features/friends/components/SendFriendRequestForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { UserPlusIcon } from "lucide-react";

export default function FriendsPage(): ReactElement {
  return (
    <main className="flex min-h-full flex-1 flex-col gap-6 p-6">
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

      <p className="text-muted-foreground">Todavía no hay amigos en tu lista.</p>
    </main>
  );
}
