import type { ReactElement, ReactNode } from "react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { listLivePlansForUser } from "@/features/plans/services/server/plan-service.server";
import { AppShell } from "@/shared/components/AppShell";
import { toAppNavLivePlan } from "@/shared/utils/app-nav.utils";

export default async function AppGroupLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<ReactElement> {
  const user = await requireAppUser();
  const livePlans = (await listLivePlansForUser(user.id)).map(toAppNavLivePlan);

  return (
    <AppShell livePlans={livePlans} name={user.name} email={user.email}>
      {children}
    </AppShell>
  );
}
