import Link from "next/link";
import type { Metadata } from "next";
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
import { PlanHistoryTabs } from "@/features/plans/components/PlanHistoryTabs";
import { PlanIdentitySection } from "@/features/plans/components/PlanIdentitySection";
import { PlanMemberList } from "@/features/plans/components/PlanMemberList";
import { RemovePlanMemberButton } from "@/features/plans/components/RemovePlanMemberButton";
import { SharePlanWhatsAppButton } from "@/features/plans/components/SharePlanWhatsAppButton";
import { WipePlanPaymentsButton } from "@/features/plans/components/WipePlanPaymentsButton";
import { getPlanForUser } from "@/features/plans/services/server/plan-service.server";
import { buildPlanAbsoluteUrl } from "@/features/plans/utils/plan-url.utils";
import { CompletePaymentsButton } from "@/features/settlements/components/CompletePaymentsButton";
import { CompletePlanButton } from "@/features/settlements/components/CompletePlanButton";
import { MemberRemainingBadge } from "@/features/settlements/components/MemberRemainingBadge";
import { RecordPaymentSheet } from "@/features/settlements/components/RecordPaymentSheet";
import { SettlementBalanceSection } from "@/features/settlements/components/SettlementBalanceSection";
import { getPlanSettlement } from "@/features/settlements/services/server/settlement-service.server";
import { buildWhatsAppBalanceText } from "@/features/settlements/utils/whatsapp-balance-text.utils";
import { FriendRequestStatus, PlanPhase } from "@/generated/prisma/enums";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatLimaDate } from "@/shared/utils/lima-date.utils";
import { buildPageMetadata } from "@/shared/utils/page-metadata.utils";

interface IPlanDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: IPlanDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const user = await requireAppUser();
    const plan = await getPlanForUser(id, user.id);

    return buildPageMetadata({
      title: plan.name,
      description: `Gastos, integrantes y liquidación de ${plan.name} en Cuoteo. Divide en soles y cobra en Perú.`,
      path: `/planes/${id}`,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return buildPageMetadata({
        title: "Plan",
        description:
          "Consulta un plan de Cuoteo para dividir gastos en grupo y liquidar en soles.",
        path: `/planes/${id}`,
      });
    }

    throw error;
  }
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

  const [friends, inbox, expenses, settlement] = await Promise.all([
    listFriends(user.id),
    listFriendRequests(user.id),
    listExpensesForPlan(plan.id, user.id),
    plan.phase === PlanPhase.BALANCE || plan.phase === PlanPhase.COMPLETED
      ? getPlanSettlement(plan.id, user.id)
      : Promise.resolve(null),
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
  const settlementByMemberId = new Map(
    (settlement?.members ?? []).map((member) => [member.memberId, member]),
  );
  const debtors = (settlement?.members ?? []).filter(
    (member) => member.role === "debtor",
  );
  const memberMeta = Object.fromEntries(
    (settlement?.members ?? [])
      .filter((member) => member.role !== "zero")
      .map((member) => [
        member.memberId,
        <MemberRemainingBadge
          key={member.memberId}
          remaining={member.remaining}
          role={member.role}
        />,
      ]),
  );
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
      const balanceMember = settlementByMemberId.get(member.id);
      const canRecordPayment = Boolean(
        settlement?.canRecordPayments &&
          sessionMemberId &&
          balanceMember?.role === "creditor",
      );

      if (
        !canSendFriendRequest &&
        !canRemoveGhost &&
        !canRemoveRegistered &&
        !canRecordPayment
      ) {
        return [];
      }

      return [
        [
          member.id,
          <div key={member.id} className="flex flex-wrap items-center justify-end gap-2">
            {canRecordPayment && settlement && sessionMemberId && balanceMember ? (
              <RecordPaymentSheet
                planId={plan.id}
                creditor={balanceMember}
                debtors={debtors}
                sessionMemberId={sessionMemberId}
              />
            ) : null}
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
                hasExpenses={expenses.length > 0}
              />
            ) : null}
          </div>,
        ],
      ];
    }),
  );

  const expensesSection = sessionMemberId ? (
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
  );
  const expensesListSection = sessionMemberId ? (
    <ExpenseSection
      planId={plan.id}
      members={expenseMembers}
      sessionMemberId={sessionMemberId}
      expenses={expenses}
      canEdit={false}
      showChart={false}
    />
  ) : (
    <p className="text-sm text-muted-foreground">
      No encontramos tu membresía en este plan.
    </p>
  );
  const shareSection = sessionMemberId ? (
    <ExpenseSection
      planId={plan.id}
      members={expenseMembers}
      sessionMemberId={sessionMemberId}
      expenses={expenses}
      canEdit={false}
      showList={false}
      showChartTitle={false}
    />
  ) : (
    <p className="text-sm text-muted-foreground">
      No encontramos tu membresía en este plan.
    </p>
  );
  const whatsAppShareText = settlement
    ? buildWhatsAppBalanceText({
        planName: plan.name,
        planUrl: buildPlanAbsoluteUrl(plan.id),
        members: settlement.members.map((member) => ({
          name: member.name,
          remaining: member.remaining,
          role: member.role,
        })),
        transfers: settlement.transfers.map((transfer) => ({
          fromName: transfer.fromName,
          toName: transfer.toName,
          amount: transfer.amount,
        })),
      })
    : null;
  const shareWhatsAppButton = whatsAppShareText ? (
    <SharePlanWhatsAppButton text={whatsAppShareText} />
  ) : null;
  const settlementSection = settlement ? (
    <SettlementBalanceSection
      planId={plan.id}
      transfers={settlement.transfers}
      payments={settlement.payments}
      canVoidPayments={settlement.canRecordPayments}
      showSuggestedTransfers={settlement.showSuggestedTransfers}
    />
  ) : null;
  const expensesHistoryCard = (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Gastos</CardTitle>
        <CardDescription>
          {canEdit
            ? "Concepto, monto, categoría y quién pagó. Arriba ves el total y el reparto por integrante."
            : "Consulta el detalle de cada gasto. No se puede editar fuera de Activo."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCompleted ? expensesListSection : expensesSection}
      </CardContent>
    </Card>
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
        <PlanIdentitySection
          planId={plan.id}
          name={plan.name}
          phase={plan.phase}
          defaultValues={{ name: plan.name, icon: plan.icon }}
          canEdit={canEdit}
        />
        <p className="text-sm text-muted-foreground">
          Creado el {formatLimaDate(plan.createdAt)}
          {isCreator ? " · Eres el creador" : null}
        </p>
        {canEdit ? (
          <div className="flex flex-col gap-3">
            {!isCreator ? (
              <LeavePlanButton
                planId={plan.id}
                planName={plan.name}
                hasExpenses={expenses.length > 0}
              />
            ) : null}
            <MovePlanToBalanceButton
              planId={plan.id}
              memberCount={plan.members.length}
              expenseCount={expenses.length}
              incompleteExpenseTitles={expenses
                .filter((expense) => expense.shareMemberIds.length === 0)
                .map((expense) => expense.title)}
            />
          </div>
        ) : null}
        {isBalance ? (
          <div className="flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
            <MovePlanToActiveButton
              planId={plan.id}
              paymentCount={plan.paymentCount}
            />
            {isCreator && plan.paymentCount > 0 ? (
              <WipePlanPaymentsButton planId={plan.id} />
            ) : null}
            {settlement?.showCompletePayments ? (
              <CompletePaymentsButton
                planId={plan.id}
                canComplete={settlement.canCompletePayments}
                highlight={settlement.highlightCompletePayments}
              />
            ) : null}
            {settlement?.showCompletePlan ? (
              <CompletePlanButton
                planId={plan.id}
                canComplete={settlement.canCompletePlan}
              />
            ) : null}
            {shareWhatsAppButton}
          </div>
        ) : null}
        {isCompleted ? (
          <div className="flex w-full max-w-4xl flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Este plan está completado y no se puede modificar.
            </p>
            {shareWhatsAppButton}
          </div>
        ) : null}
      </div>

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
            memberMeta={memberMeta}
          />
          {canEdit ? (
            <>
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-medium">Agregar amigo</h2>
                <AddFriendToPlanForm
                  planId={plan.id}
                  friends={eligibleFriends}
                  hasExpenses={expenses.length > 0}
                />
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-medium">Agregar invitado</h2>
                <AddGhostToPlanForm
                  planId={plan.id}
                  hasExpenses={expenses.length > 0}
                />
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

      {isBalance && settlementSection ? (
        <PlanHistoryTabs
          defaultTab="settlement"
          settlementLabel="Liquidación"
          expensesLabel="Gastos"
          settlementPanel={settlementSection}
          expensesPanel={expensesHistoryCard}
        />
      ) : null}

      {isCompleted ? (
        <>
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Reparto</CardTitle>
              <CardDescription>
                Cuánto le tocó a cada integrante. Este plan está completado y no
                se puede modificar.
              </CardDescription>
            </CardHeader>
            <CardContent>{shareSection}</CardContent>
          </Card>
          {settlementSection ? (
            <PlanHistoryTabs
              defaultTab="settlement"
              settlementLabel="Pagos"
              expensesLabel="Gastos"
              settlementPanel={settlementSection}
              expensesPanel={expensesHistoryCard}
            />
          ) : null}
        </>
      ) : null}

      {canEdit ? expensesHistoryCard : null}
    </main>
  );
}
