import Link from "next/link";
import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { DashboardFriendsPreview } from "@/features/friends/components/DashboardFriendsPreview";
import { countPendingReceivedFriendRequests } from "@/features/friends/services/server/friend-request-service.server";
import { listFriends } from "@/features/friends/services/server/friendship-service.server";
import { DashboardPlanSubmenu } from "@/features/plans/components/DashboardPlanSubmenu";
import { PLAN_PHASE_LABELS } from "@/features/plans/constants/plans.constants";
import { listLivePlansForUser } from "@/features/plans/services/server/plan-service.server";
import { getUserNetRemainingInBalancePlans } from "@/features/settlements/services/server/settlement-service.server";
import { PlanPhase } from "@/generated/prisma/enums";
import { MoneyText } from "@/shared/components/MoneyText";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { buildPageMetadata } from "@/shared/utils/page-metadata.utils";

export const metadata: Metadata = buildPageMetadata({
  title: "Inicio",
  description:
    "Resumen de tus planes activos, saldos pendientes y amigos en Cuoteo.",
  path: "/dashboard",
});

interface IKpiTileProps {
  label: string;
  children: ReactNode;
  href?: string;
  badgeCount?: number;
}

function KpiTile({
  label,
  children,
  href,
  badgeCount = 0,
}: IKpiTileProps): ReactElement {
  const content = (
    <div className="flex min-h-20 flex-col justify-center gap-1 rounded-xl border border-border bg-card px-3 py-3 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {label}
        {badgeCount > 0 ? <Badge>{badgeCount}</Badge> : null}
      </p>
      <div className="text-lg font-semibold tabular-nums">{children}</div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      {content}
    </Link>
  );
}

export default async function DashboardPage(): Promise<ReactElement> {
  const user = await requireAppUser();
  const [livePlans, friends, pendingRequestCount, netRemaining] =
    await Promise.all([
      listLivePlansForUser(user.id),
      listFriends(user.id),
      countPendingReceivedFriendRequests(user.id),
      getUserNetRemainingInBalancePlans(user.id),
    ]);

  const activePlans = livePlans.filter(
    (plan) => plan.phase === PlanPhase.ACTIVE,
  );
  const balancePlans = livePlans.filter(
    (plan) => plan.phase === PlanPhase.BALANCE,
  );

  return (
    <main className="flex min-h-full flex-1 flex-col gap-5 p-4 sm:gap-6 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button asChild className="min-h-11 w-full sm:w-auto">
          <Link href="/planes/nuevo">
            <PlusIcon />
            Crear plan
          </Link>
        </Button>
      </div>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <KpiTile label={PLAN_PHASE_LABELS.ACTIVE}>{activePlans.length}</KpiTile>
        <KpiTile label={PLAN_PHASE_LABELS.BALANCE}>
          {balancePlans.length}
        </KpiTile>
        <KpiTile label="Saldo neto">
          <MoneyText amount={netRemaining} className="text-lg font-semibold" />
        </KpiTile>
        <KpiTile
          label="Solicitudes"
          href="/amigos/solicitudes"
          badgeCount={pendingRequestCount}
        >
          {pendingRequestCount}
        </KpiTile>
      </section>

      <DashboardFriendsPreview friends={friends} />

      <section className="flex min-w-0 flex-col gap-2">
        <h2 className="text-sm font-medium">Planes en curso</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <DashboardPlanSubmenu
            title={PLAN_PHASE_LABELS.ACTIVE}
            plans={activePlans}
            emptyLabel="No tienes planes en Activo."
          />
          <DashboardPlanSubmenu
            title={PLAN_PHASE_LABELS.BALANCE}
            plans={balancePlans}
            emptyLabel="No tienes planes en Balance."
          />
        </div>
      </section>
    </main>
  );
}
