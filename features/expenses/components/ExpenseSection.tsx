"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { ExpenseShareChart } from "@/features/expenses/components/ExpenseShareChart";
import { MIN_MEMBERS_TO_CREATE_EXPENSE } from "@/features/expenses/constants/expenses.constants";
import type {
  IExpenseListItem,
  IExpenseMemberOption,
} from "@/features/expenses/interfaces/expense.interface";
import { buildMemberShareBreakdown } from "@/features/expenses/utils/expense-share-chart.utils";

interface IExpenseSectionProps {
  planId: string;
  members: IExpenseMemberOption[];
  sessionMemberId: string;
  expenses: IExpenseListItem[];
  canEdit: boolean;
}

export function ExpenseSection({
  planId,
  members,
  sessionMemberId,
  expenses,
  canEdit,
}: IExpenseSectionProps): ReactElement {
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const canCreateExpenses =
    canEdit && members.length >= MIN_MEMBERS_TO_CREATE_EXPENSE;
  const editingExpense = expenses.find(
    (expense) => expense.id === editingExpenseId,
  );
  const shareBreakdown = buildMemberShareBreakdown(members, expenses);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-medium">Reparto</h2>
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
      <ExpenseList
        expenses={expenses}
        canEdit={canEdit}
        onEdit={(expense) => setEditingExpenseId(expense.id)}
      />
      {canEdit && editingExpense ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-medium">Editar gasto</h2>
          <ExpenseForm
            mode="edit"
            planId={planId}
            expenseId={editingExpense.id}
            members={members}
            sessionMemberId={sessionMemberId}
            defaultValues={{
              title: editingExpense.title,
              amount: editingExpense.amount.toFixed(2),
              category: editingExpense.category,
              paidByMemberId: editingExpense.paidByMemberId,
              shareMemberIds: editingExpense.shareMemberIds,
            }}
            onCancel={() => setEditingExpenseId(null)}
          />
        </div>
      ) : canCreateExpenses ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-medium">Nuevo gasto</h2>
          <ExpenseForm
            mode="create"
            planId={planId}
            members={members}
            sessionMemberId={sessionMemberId}
          />
        </div>
      ) : canEdit ? (
        <p className="text-sm text-muted-foreground">
          Agrega al menos {MIN_MEMBERS_TO_CREATE_EXPENSE} integrantes para
          registrar gastos.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Los gastos se pueden crear o editar solo cuando el plan está activo.
        </p>
      )}
    </div>
  );
}
