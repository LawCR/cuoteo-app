import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { NotFoundError } from "@/core/errors/not-found.error";
import { listFriends } from "@/features/friends/services/server/friendship-service.server";
import { AddFriendToPlanForm } from "@/features/plans/components/AddFriendToPlanForm";
import { PlanMemberList } from "@/features/plans/components/PlanMemberList";
import { PlanMetadataForm } from "@/features/plans/components/PlanMetadataForm";
import { PlanPhaseBadge } from "@/features/plans/components/PlanPhaseBadge";
import { getPlanForUser } from "@/features/plans/services/server/plan-service.server";
import { PlanPhase } from "@/generated/prisma/enums";
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

  const friends = await listFriends(user.id);
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
              ? "Cualquier integrante registrado puede editar estos datos mientras el plan esté activo."
              : "El plan ya no está en Activo, así que estos datos no se pueden cambiar."}
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
            Los registrados ven este plan en su listado. Unfriend no los saca
            del plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <PlanMemberList
            members={plan.members}
            creatorUserId={plan.creatorUserId}
          />
          {canEdit ? (
            <AddFriendToPlanForm planId={plan.id} friends={eligibleFriends} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Solo se pueden agregar amigos en fase Activo.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
