import Link from "next/link";
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { PlusIcon } from "lucide-react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { PlanFiltersForm } from "@/features/plans/components/PlanFiltersForm";
import { PlanList } from "@/features/plans/components/PlanList";
import { listPlansForUser } from "@/features/plans/services/server/plan-service.server";
import {
  isListPlansFiltersActive,
  parseListPlansFiltersFormFromSearchParams,
  toListPlansHref,
  toPlanListServiceFilters,
} from "@/features/plans/utils/list-plans-filters.utils";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { buildPageMetadata } from "@/shared/utils/page-metadata.utils";

export const metadata: Metadata = buildPageMetadata({
  title: "Planes",
  description:
    "Lista tus planes, filtra por fase y crea uno nuevo para dividir gastos en soles.",
  path: "/planes",
});

interface IPlansPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PlansPage({
  searchParams,
}: IPlansPageProps): Promise<ReactElement> {
  const user = await requireAppUser();
  const formFilters = parseListPlansFiltersFormFromSearchParams(
    await searchParams,
  );
  const hasActiveFilters = isListPlansFiltersActive(formFilters);
  const plans = await listPlansForUser(
    user.id,
    toPlanListServiceFilters(formFilters),
  );

  return (
    <main className="flex min-h-full flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Planes</h1>
        <Button asChild size="lg" className="min-h-11 w-full sm:w-auto">
          <Link href="/planes/nuevo">
            <PlusIcon />
            Crear plan
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtra por fase, nombre o fecha de creación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanFiltersForm
            key={toListPlansHref(formFilters)}
            defaultValues={formFilters}
          />
        </CardContent>
      </Card>

      <PlanList
        plans={plans}
        currentUserId={user.id}
        hasActiveFilters={hasActiveFilters}
      />
    </main>
  );
}
