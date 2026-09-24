import Link from "next/link";
import type { ReactElement } from "react";
import { PlanMetadataForm } from "@/features/plans/components/PlanMetadataForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ArrowLeftIcon } from 'lucide-react';

export default function NewPlanPage(): ReactElement {
  return (
    <main className="flex min-h-full flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/planes"
          className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a planes
        </Link>
        <h1 className="text-2xl font-semibold">Nuevo plan</h1>
      </div>

      <Card className='max-w-4xl'>
        <CardHeader>
          <CardTitle>Datos del plan</CardTitle>
          <CardDescription>
            Elige un nombre y un ícono. Quedarás como creador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanMetadataForm mode="create" />
        </CardContent>
      </Card>
    </main>
  );
}
