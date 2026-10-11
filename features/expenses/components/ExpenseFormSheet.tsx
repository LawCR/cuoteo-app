"use client";

import type { ReactElement } from "react";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import type {
  IExpenseListItem,
  IExpenseMemberOption,
} from "@/features/expenses/interfaces/expense.interface";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

interface IExpenseFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  members: IExpenseMemberOption[];
  sessionMemberId: string;
  expense?: IExpenseListItem;
}

export function ExpenseFormSheet({
  open,
  onOpenChange,
  planId,
  members,
  sessionMemberId,
  expense,
}: IExpenseFormSheetProps): ReactElement {
  const isEdit = Boolean(expense);
  const close = (): void => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Editar gasto" : "Nuevo gasto"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Cambia el concepto, el monto, quién pagó o entre quiénes se divide."
              : "Registra el concepto, el monto en soles, la categoría y quién pagó."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          {open && expense ? (
            <ExpenseForm
              key={expense.id}
              mode="edit"
              planId={planId}
              expenseId={expense.id}
              members={members}
              sessionMemberId={sessionMemberId}
              defaultValues={{
                title: expense.title,
                amount: expense.amount.toFixed(2),
                category: expense.category,
                paidByMemberId: expense.paidByMemberId,
                shareMemberIds: expense.shareMemberIds,
              }}
              onSuccess={close}
              onCancel={close}
            />
          ) : null}
          {open && !expense ? (
            <ExpenseForm
              key="create"
              mode="create"
              planId={planId}
              members={members}
              sessionMemberId={sessionMemberId}
              onSuccess={close}
              onCancel={close}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
