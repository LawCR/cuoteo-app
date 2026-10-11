"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { ExpenseFormSheet } from "@/features/expenses/components/ExpenseFormSheet";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { ExpenseShareChart } from "@/features/expenses/components/ExpenseShareChart";
import { MIN_MEMBERS_TO_CREATE_EXPENSE } from "@/features/expenses/constants/expenses.constants";
import type {
  IExpenseListItem,
  IExpenseMemberOption,
} from "@/features/expenses/interfaces/expense.interface";
import { buildMemberShareBreakdown } from "@/features/expenses/utils/expense-share-chart.utils";
import { Button } from "@/shared/components/ui/button";

interface IExpenseSectionProps {
  planId: string;
  members: IExpenseMemberOption[];
  sessionMemberId: string;
  expenses: IExpenseListItem[];
  canEdit: boolean;
  showChart?: boolean;
  showList?: boolean;
  showChartTitle?: boolean;
}

export function ExpenseSection({
  planId,
  members,
  sessionMemberId,
  expenses,
  canEdit,
  showChart = true,
  showList = true,
  showChartTitle = true,
}: IExpenseSectionProps): ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const canCreateExpenses =
    canEdit && members.length >= MIN_MEMBERS_TO_CREATE_EXPENSE;
  const editingExpense = expenses.find(
    (expense) => expense.id === editingExpenseId,
  );
  const shareBreakdown = buildMemberShareBreakdown(members, expenses);

  function openCreateForm(): void {
    setEditingExpenseId(null);
    setIsFormOpen(true);
  }

  function openEditForm(expense: IExpenseListItem): void {
    setEditingExpenseId(expense.id);
    setIsFormOpen(true);
  }

  function handleFormOpenChange(open: boolean): void {
    setIsFormOpen(open);
    if (!open) {
      setEditingExpenseId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {showChart ? (
        <div className="flex flex-col gap-3">
          {showChartTitle ? (
            <h2 className="text-base font-medium">Reparto</h2>
          ) : null}
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Cuando haya gastos, aquí verás el total y cuánto le toca a cada
              integrante.
            </p>
          ) : (
            <>
              <ExpenseShareChart breakdown={shareBreakdown} />
              {shareBreakdown.incompleteCount > 0 ? (
                <p role="alert" className="text-sm text-destructive">
                  {shareBreakdown.incompleteCount === 1
                    ? "Hay 1 gasto sin integrantes. No entra en el total hasta que elijas quiénes lo dividen."
                    : `Hay ${shareBreakdown.incompleteCount} gastos sin integrantes. No entran en el total hasta que elijas quiénes los dividen.`}
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
      {showList ? (
        <>
          {canCreateExpenses ? (
            <Button
              type="button"
              className="min-h-11 w-full sm:w-auto"
              onClick={openCreateForm}
            >
              <PlusIcon />
              Agregar gasto
            </Button>
          ) : canEdit ? (
            <p className="text-sm text-muted-foreground">
              Agrega al menos {MIN_MEMBERS_TO_CREATE_EXPENSE} integrantes para
              registrar gastos.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Los gastos se consultan aquí. Solo se pueden crear o editar cuando
              el plan está activo.
            </p>
          )}
          <ExpenseList
            expenses={expenses}
            canEdit={canEdit}
            onEdit={openEditForm}
          />
          {canEdit ? (
            <ExpenseFormSheet
              open={isFormOpen}
              onOpenChange={handleFormOpenChange}
              planId={planId}
              members={members}
              sessionMemberId={sessionMemberId}
              expense={editingExpense}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
