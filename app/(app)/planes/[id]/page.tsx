import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ExpenseSection } from "@/features/expenses/components/ExpenseSection";
import type { IExpenseMemberOption } from "@/features/expenses/interfaces/expense.interface";
import { listExpensesForPlan } from "@/features/expenses/services/server/expense-service.server";
import { SendFriendRequestButton } from "@/features/friends/components/SendFriendRequestButton";
import { listFriendRequests } from "@/features/friends/services/server/friend-request-service.server";
import { listFriends } from "@/features/friends/services/server/friendship-service.server";
import { AddFriendToPlanForm } from "@/features/plans/components/AddFriendToPlanForm";
import { AddGhostToPlanForm } from "@/features/plans/components/AddGhostToPlanForm";
import { LeavePlanButton } from "@/features/plans/components/LeavePlanButton";
import { MovePlanToActiveButton } from "@/features/plans/components/MovePlanToActiveButton";
import { MovePlanToBalanceButton } from "@/features/plans/components/MovePlanToBalanceButton";
import { PlanMemberList } from "@/features/plans/components/PlanMemberList";
import { PlanMetadataForm } from "@/features/plans/components/PlanMetadataForm";
import { PlanPhaseBadge } from "@/features/plans/components/PlanPhaseBadge";
import { RemovePlanMemberButton } from "@/features/plans/components/RemovePlanMemberButton";
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

  const [friends, inbox, expenses] = await Promise.all([
    listFriends(user.id),
    listFriendRequests(user.id),
    listExpensesForPlan(plan.id, user.id),
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
  const expenseMembers: IExpenseMemberOption[] = plan.members.map((member) => {
    const isGhost = member.userId === null;

    return {
      id: member.id,
      name: isGhost
        ? (member.ghostName ?? "Invitado")
        : (member.user?.name ?? "Integrante"),
      subtitle: isGhost ? "Invitado" : (member.user?.email ?? ""),
    };
  });
  const sessionMemberId = plan.members.find(
    (member) => member.userId === user.id,
  )?.id;
  const canEdit = plan.phase === PlanPhase.ACTIVE;
  const isBalance = plan.phase === PlanPhase.BALANCE;
  const isCompleted = plan.phase === PlanPhase.COMPLETED;
  const isCreator = plan.creatorUserId === user.id;
  const memberActions = Object.fromEntries(
    plan.members.flatMap((member) => {
      const isGhost = member.userId === null;
      const memberName = isGhost
        ? (member.ghostName ?? "Invitado")
        : (member.user?.name ?? "Integrante");
      const canSendFriendRequest = Boolean(
        member.userId &&
          member.user &&
          member.userId !== user.id &&
          !friendIds.has(member.userId) &&
          !pendingPeerIds.has(member.userId),
      );
      const canRemoveGhost = canEdit && isGhost;
      const canRemoveRegistered =
        canEdit &&
        isCreator &&
        member.userId !== null &&
        member.userId !== plan.creatorUserId;

      if (!canSendFriendRequest && !canRemoveGhost && !canRemoveRegistered) {
        return [];
      }

      return [
        [
          member.id,
          <div key={member.id} className="flex items-center gap-2">
            {canSendFriendRequest && member.user ? (
              <SendFriendRequestButton
                friendUserId={member.user.id}
                friendName={member.user.name}
              />
            ) : null}
            {canRemoveGhost || canRemoveRegistered ? (
              <RemovePlanMemberButton
                planId={plan.id}
                memberId={member.id}
                memberName={memberName}
              />
            ) : null}
          </div>,
        ],
      ];
    }),
  );

  return (
    <main className="flex min-h-full flex-1 flex-col gap-6 p-4 sm:p-6">
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
        {canEdit ? (
          <div className="flex flex-col gap-3">
            {!isCreator ? (
              <LeavePlanButton planId={plan.id} planName={plan.name} />
            ) : null}
            <MovePlanToBalanceButton
              planId={plan.id}
              memberCount={plan.members.length}
            />
          </div>
        ) : null}
        {isBalance ? (
          <MovePlanToActiveButton
            planId={plan.id}
            paymentCount={plan.paymentCount}
          />
        ) : null}
        {isCompleted ? (
          <p className="text-sm text-muted-foreground">
            Este plan está completado y no se puede modificar.
          </p>
        ) : null}
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Nombre e ícono</CardTitle>
          <CardDescription>
            {isCompleted
              ? "Este plan está completado. No se puede modificar."
              : canEdit
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
              {isCompleted
                ? "Este plan está completado. Los integrantes no se pueden cambiar."
                : "Los integrantes se pueden cambiar solo cuando el plan está activo."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Gastos</CardTitle>
          <CardDescription>
            Concepto, monto, categoría y quién pagó. El reparto es igualitario
            y puedes excluir integrantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionMemberId ? (
            <ExpenseSection
              planId={plan.id}
              members={expenseMembers}
              sessionMemberId={sessionMemberId}
              expenses={expenses}
              canEdit={canEdit}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No encontramos tu membresía en este plan.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
