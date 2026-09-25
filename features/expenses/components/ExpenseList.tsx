"use client";

import { PencilIcon } from "lucide-react";
import type { ReactElement } from "react";
import { DeleteExpenseButton } from "@/features/expenses/components/DeleteExpenseButton";
import type { IExpenseListItem } from "@/features/expenses/interfaces/expense.interface";
import { ExpenseCategoryIcon } from "@/shared/components/ExpenseCategoryIcon";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { EXPENSE_CATEGORY_LABELS } from "@/shared/constants/expense-category.constants";
import { formatLimaDate } from "@/shared/utils/lima-date.utils";
import { formatPen } from "@/shared/utils/money.utils";

interface IExpenseListProps {
  expenses: IExpenseListItem[];
  canEdit: boolean;
  onEdit: (expense: IExpenseListItem) => void;
}

export function ExpenseList({
  expenses,
  canEdit,
  onEdit,
}: IExpenseListProps): ReactElement {
  if (expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay gastos en este plan.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {expenses.map((expense) => (
        <li key={expense.id}>
          <Card className="py-4">
            <CardContent className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ExpenseCategoryIcon category={expense.category} />
                  <p className="truncate font-medium">{expense.title}</p>
                </div>
                <p className="mt-1 text-sm tabular-nums">
                  {formatPen(expense.amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {EXPENSE_CATEGORY_LABELS[expense.category]} · Pagó{" "}
                  {expense.paidByName} · Dividido entre{" "}
                  {expense.shareMemberIds.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatLimaDate(new Date(expense.createdAt))}
                </p>
              </div>
              {canEdit ? (
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    className="min-h-11 min-w-11"
                    aria-label={`Editar ${expense.title}`}
                    onClick={() => onEdit(expense)}
                  >
                    <PencilIcon />
                  </Button>
                  <DeleteExpenseButton
                    planId={expense.planId}
                    expenseId={expense.id}
                    expenseTitle={expense.title}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
