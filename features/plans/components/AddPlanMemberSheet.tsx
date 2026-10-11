"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { AddFriendToPlanForm } from "@/features/plans/components/AddFriendToPlanForm";
import { AddGhostToPlanForm } from "@/features/plans/components/AddGhostToPlanForm";
import type { IPlanFriendOption } from "@/features/plans/interfaces/plan.interface";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

interface IAddPlanMemberSheetProps {
  planId: string;
  friends: IPlanFriendOption[];
  hasExpenses: boolean;
}

export function AddPlanMemberSheet({
  planId,
  friends,
  hasExpenses,
}: IAddPlanMemberSheetProps): ReactElement {
  const [open, setOpen] = useState(false);

  function close(): void {
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        className="min-h-11 w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <PlusIcon />
        Agregar integrante
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Agregar integrante</SheetTitle>
            <SheetDescription>
              Suma un amigo de Cuoteo o un invitado que todavía no tiene cuenta.
              Cada invitado necesita un nombre distinto en este plan.
            </SheetDescription>
          </SheetHeader>
          {open ? (
            <div className="flex flex-col gap-6 px-4 pb-4">
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-medium">Amigo</h2>
                <AddFriendToPlanForm
                  planId={planId}
                  friends={friends}
                  hasExpenses={hasExpenses}
                  onSuccess={close}
                />
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-medium">Invitado</h2>
                <AddGhostToPlanForm
                  planId={planId}
                  hasExpenses={hasExpenses}
                  onSuccess={close}
                />
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
