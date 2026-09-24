import Link from "next/link";
import type { ReactElement } from "react";
import { PlusIcon } from "lucide-react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { PlanList } from "@/features/plans/components/PlanList";
import { listPlansForUser } from "@/features/plans/services/server/plan-service.server";
import { Button } from "@/shared/components/ui/button";

export default async function PlansPage(): Promise<ReactElement> {
  const user = await requireAppUser();
  const plans = await listPlansForUser(user.id);

  return (
    <main className="flex min-h-full flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Planes</h1>
        <Button asChild size="lg" className="min-h-11 w-full sm:w-auto">
          <Link href="/planes/nuevo">
            <PlusIcon />
            Crear plan
          </Link>
        </Button>
      </div>

      <PlanList plans={plans} />
    </main>
  );
}
