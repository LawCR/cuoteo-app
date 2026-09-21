import Link from "next/link";
import type { ReactElement } from "react";

export default function FriendRequestsPage(): ReactElement {
  return (
    <main className="flex min-h-full flex-1 flex-col gap-2 p-6">
      <h1 className="text-2xl font-semibold">Solicitudes</h1>
      <p className="text-muted-foreground">Esta sección estará disponible pronto.</p>
      <Link
        href="/amigos"
        className="mt-2 inline-flex min-h-11 w-fit items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Volver a amigos
      </Link>
    </main>
  );
}
