import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { NotFoundError } from "@/core/errors/not-found.error";
import { SendFriendRequestButton } from "@/features/friends/components/SendFriendRequestButton";
import { listFriendRequests } from "@/features/friends/services/server/friend-request-service.server";
import { listFriends } from "@/features/friends/services/server/friendship-service.server";
import { AddFriendToPlanForm } from "@/features/plans/components/AddFriendToPlanForm";
import { AddGhostToPlanForm } from "@/features/plans/components/AddGhostToPlanForm";
import { PlanMemberList } from "@/features/plans/components/PlanMemberList";
import { PlanMetadataForm } from "@/features/plans/components/PlanMetadataForm";
import { PlanPhaseBadge } from "@/features/plans/components/PlanPhaseBadge";
import { getPlanForUser } from "@/features/plans/services/server/plan-service.server";
import { FriendRequestStatus, PlanPhase } from "@/generated/prisma/enums";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatLimaDate } from "@/shared/utils/lima-date.utils";

interface IPlanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailPage({
  params,
}: IPlanDetailPageProps): Promise<ReactElement> {
  const { id } = await params;
  const user = await requireAppUser();

  let plan;

  try {
    plan = await getPlanForUser(id, user.id);
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }

  const [friends, inbox] = await Promise.all([
    listFriends(user.id),
    listFriendRequests(user.id),
  ]);
  const friendIds = new Set(friends.map((item) => item.friend.id));
  const pendingPeerIds = new Set(
    [...inbox.received, ...inbox.sent]
      .filter((item) => item.status === FriendRequestStatus.PENDING)
      .map((item) => item.peer.id),
  );
  const memberUserIds = new Set(
    plan.members
      .map((member) => member.userId)
      .filter((userId): userId is string => userId !== null),
  );
  const eligibleFriends = friends
    .filter((item) => !memberUserIds.has(item.friend.id))
    .map((item) => ({
      id: item.friend.id,
      name: item.friend.name,
      username: item.friend.username,
    }));
  const memberActions = Object.fromEntries(
    plan.members.flatMap((member) => {
      if (
        !member.userId ||
        !member.user ||
        member.userId === user.id ||
        friendIds.has(member.userId) ||
        pendingPeerIds.has(member.userId)
      ) {
        return [];
      }

      return [
        [
          member.id,
          <SendFriendRequestButton
            key={member.id}
            friendUserId={member.user.id}
            friendName={member.user.name}
          />,
        ],
      ];
    }),
  );

  const canEdit = plan.phase === PlanPhase.ACTIVE;
  const isCreator = plan.creatorUserId === user.id;

  return (
    <main className="flex min-h-full flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/planes"
          className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Volver a planes
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{plan.name}</h1>
          <PlanPhaseBadge phase={plan.phase} />
        </div>
        <p className="text-sm text-muted-foreground">
          Creado el {formatLimaDate(plan.createdAt)}
          {isCreator ? " · Eres el creador" : null}
        </p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Nombre e ícono</CardTitle>
          <CardDescription>
            {canEdit
              ? "Puedes cambiar el nombre y el ícono mientras el plan esté activo."
              : "El nombre y el ícono se pueden cambiar solo cuando el plan está activo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanMetadataForm
            mode="edit"
            planId={plan.id}
            defaultValues={{ name: plan.name, icon: plan.icon }}
            readOnly={!canEdit}
          />
        </CardContent>
      </Card>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Integrantes</CardTitle>
          <CardDescription>
            Suma amigos de Cuoteo o invitados que todavía no tienen cuenta. Cada
            invitado necesita un nombre distinto en este plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <PlanMemberList
            members={plan.members}
            creatorUserId={plan.creatorUserId}
            memberActions={memberActions}
          />
          {canEdit ? (
            <>
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-medium">Agregar amigo</h2>
                <AddFriendToPlanForm
                  planId={plan.id}
                  friends={eligibleFriends}
                />
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-medium">Agregar invitado</h2>
                <AddGhostToPlanForm planId={plan.id} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Los integrantes se pueden cambiar solo cuando el plan está activo.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
