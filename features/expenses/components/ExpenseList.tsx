"use client";

import { PencilIcon } from "lucide-react";
import type { ReactElement } from "react";
import { DeleteExpenseButton } from "@/features/expenses/components/DeleteExpenseButton";
import type { IExpenseListItem } from "@/features/expenses/interfaces/expense.interface";
import { ExpenseCategoryIcon } from "@/shared/components/ExpenseCategoryIcon";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { EXPENSE_CATEGORY_LABELS } from "@/shared/constants/expense-category.constants";
import { cn } from "@/shared/utils/cn.utils";
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
      {expenses.map((expense) => {
        const isIncomplete = expense.shareMemberIds.length === 0;

        return (
          <li key={expense.id}>
            <Card
              className={cn("py-4", isIncomplete && "border-destructive")}
            >
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
                    {expense.paidByName}
                    {isIncomplete
                      ? null
                      : ` · Dividido entre ${expense.shareMemberIds.length}`}
                  </p>
                  {isIncomplete ? (
                    <p role="alert" className="mt-2 text-sm text-destructive">
                      Nadie está incluido. Edítalo para elegir quiénes lo
                      dividen.
                    </p>
                  ) : null}
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
        );
      })}
    </ul>
  );
}
