"use client";

import { PencilIcon } from "lucide-react";
import { useState, type ReactElement } from "react";
import { PlanMetadataForm } from "@/features/plans/components/PlanMetadataForm";
import { PlanPhaseBadge } from "@/features/plans/components/PlanPhaseBadge";
import type { TPlanMetadataFormData } from "@/features/plans/schemas/plan-metadata.schema";
import type { PlanPhase } from "@/generated/prisma/enums";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface IPlanIdentitySectionProps {
  planId: string;
  name: string;
  phase: PlanPhase;
  defaultValues: TPlanMetadataFormData;
  canEdit: boolean;
}

export function PlanIdentitySection({
  planId,
  name,
  phase,
  defaultValues,
  canEdit,
}: IPlanIdentitySectionProps): ReactElement {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">{name}</h1>
        {canEdit ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="min-h-11 min-w-11"
            aria-label="Editar nombre e ícono"
            aria-expanded={isEditing}
            onClick={() => setIsEditing(true)}
          >
            <PencilIcon />
          </Button>
        ) : null}
        <PlanPhaseBadge phase={phase} />
      </div>

      {canEdit && isEditing ? (
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Nombre e ícono</CardTitle>
            <CardDescription>
              Cambia el nombre y el ícono del plan. Cancela para ocultar esta
              sección.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlanMetadataForm
              mode="edit"
              planId={planId}
              defaultValues={defaultValues}
              readOnly={false}
              onCancel={() => setIsEditing(false)}
              onSaved={() => setIsEditing(false)}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
