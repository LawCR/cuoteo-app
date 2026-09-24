"use client";

import { Inbox, Send } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import { FriendUserCard } from "@/features/friends/components/FriendUserCard";
import { ReceivedFriendRequestActions } from "@/features/friends/components/ReceivedFriendRequestActions";
import type { IFriendRequestListItem } from "@/features/friends/interfaces/friend-request-inbox.interface";
import { formatLimaDate } from "@/shared/utils/lima-date.utils";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

interface IFriendRequestInboxListProps {
  received: IFriendRequestListItem[];
  sent: IFriendRequestListItem[];
}

export function FriendRequestInboxList({
  received,
  sent,
}: IFriendRequestInboxListProps): ReactElement {
  const defaultTab = received.length > 0 ? "received" : "sent";

  return (
    <Tabs defaultValue={defaultTab} className="gap-4">
      <TabsList className="grid h-auto min-h-11 w-full grid-cols-2">
        <TabsTrigger
          value="received"
          className="min-h-11 gap-2 px-3"
        >
          <Inbox />
          Recibidas
          <span className="text-xs text-muted-foreground">
            {received.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="sent" className="min-h-11 gap-2 px-3">
          <Send />
          Enviadas
          <span className="text-xs text-muted-foreground">{sent.length}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="received" className="flex flex-col gap-3">
        {received.length === 0 ? (
          <p className="text-muted-foreground">
            No tienes solicitudes pendientes.
          </p>
        ) : (
          received.map((item) => (
            <FriendUserCard
              key={item.id}
              name={item.peer.name}
              username={item.peer.username}
              email={item.peer.email}
              meta={formatLimaDate(new Date(item.createdAt))}
              actions={
                <ReceivedFriendRequestActions friendRequestId={item.id} />
              }
              actionsPosition="bottom"
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="sent" className="flex flex-col gap-3">
        {sent.length === 0 ? (
          <p className="text-muted-foreground">
            No has enviado solicitudes todavía.
          </p>
        ) : (
          sent.map((item) => (
            <FriendUserCard
              key={item.id}
              name={item.peer.name}
              username={item.peer.username}
              email={item.peer.email}
              meta={formatLimaDate(new Date(item.createdAt))}
              actions={
                item.status === "PENDING" ? (
                  <Badge variant="default">Pendiente</Badge>
                ) : (
                  <>
                    <Badge variant="outline">Rechazada</Badge>
                    <Link
                      href="/amigos"
                      className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Volver a enviar
                    </Link>
                  </>
                )
              }
              actionsPosition="top"
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
