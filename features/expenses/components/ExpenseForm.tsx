"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ReactElement } from "react";
import { createExpenseAction } from "@/features/expenses/actions/create-expense.action";
import { updateExpenseAction } from "@/features/expenses/actions/update-expense.action";
import { EXPENSE_TITLE_MAX_LENGTH } from "@/features/expenses/constants/expenses.constants";
import type { IExpenseMemberOption } from "@/features/expenses/interfaces/expense.interface";
import {
  expenseFormSchema,
  type TExpenseFormData,
} from "@/features/expenses/schemas/expense.schema";
import { ExpenseCategoryIcon } from "@/shared/components/ExpenseCategoryIcon";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DEFAULT_EXPENSE_CATEGORY,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_VALUES,
} from "@/shared/constants/expense-category.constants";
import { cn } from "@/shared/utils/cn.utils";

export interface IExpenseFormValues {
  title: string;
  amount: string;
  category: TExpenseFormData["category"];
  paidByMemberId: string;
  shareMemberIds: string[];
}

type TExpenseFormProps =
  | {
      mode: "create";
      planId: string;
      members: IExpenseMemberOption[];
      sessionMemberId: string;
    }
  | {
      mode: "edit";
      planId: string;
      expenseId: string;
      members: IExpenseMemberOption[];
      sessionMemberId: string;
      defaultValues: IExpenseFormValues;
      onCancel: () => void;
    };

function buildCreateDefaults(
  members: IExpenseMemberOption[],
  sessionMemberId: string,
): IExpenseFormValues {
  return {
    title: "",
    amount: "",
    category: DEFAULT_EXPENSE_CATEGORY,
    paidByMemberId: sessionMemberId,
    shareMemberIds: members.map((member) => member.id),
  };
}

export function ExpenseForm(props: TExpenseFormProps): ReactElement {
  const isEdit = props.mode === "edit";
  const form = useForm<TExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: isEdit
      ? props.defaultValues
      : buildCreateDefaults(props.members, props.sessionMemberId),
  });
  const editExpenseId = props.mode === "edit" ? props.expenseId : null;

  useEffect(() => {
    if (props.mode === "edit") {
      form.reset(props.defaultValues);
      return;
    }

    form.reset(buildCreateDefaults(props.members, props.sessionMemberId));
    // Solo al cambiar de gasto o al montar el alta; no al teclear.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset acotado al gasto
  }, [editExpenseId, form, props.mode, props.sessionMemberId]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: TExpenseFormData): Promise<void> {
    const result =
      props.mode === "create"
        ? await createExpenseAction({ planId: props.planId, ...values })
        : await updateExpenseAction({
            planId: props.planId,
            expenseId: props.expenseId,
            ...values,
          });

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success(props.mode === "create" ? "Gasto registrado" : "Gasto actualizado");

      if (props.mode === "create") {
        form.reset(buildCreateDefaults(props.members, props.sessionMemberId));
        return;
      }

      props.onCancel();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  maxLength={EXPENSE_TITLE_MAX_LENGTH}
                  className="min-h-11"
                  placeholder="Ceviche en la Costa Verde"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto (S/)</FormLabel>
              <FormControl>
                <Input
                  inputMode="decimal"
                  autoComplete="off"
                  className="min-h-11 tabular-nums"
                  placeholder="120.50"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="min-h-11 w-full">
                    <SelectValue placeholder="Elige una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPENSE_CATEGORY_VALUES.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex flex-row items-center gap-2">
                        <ExpenseCategoryIcon category={category} />
                        {EXPENSE_CATEGORY_LABELS[category]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paidByMemberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pagado por</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="min-h-11 w-full">
                    <SelectValue placeholder="Quién pagó" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {props.members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <span className="flex flex-col text-left">
                        <span>{member.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {member.subtitle}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shareMemberIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dividido entre</FormLabel>
              <FormDescription>
                Todos participan por defecto. Desmarca a quien quieras excluir.
              </FormDescription>
              <div className="flex flex-col gap-2">
                {props.members.map((member) => {
                  const selected = field.value.includes(member.id);

                  return (
                    <button
                      key={member.id}
                      type="button"
                      aria-pressed={selected}
                      disabled={isSubmitting}
                      className={cn(
                        "flex min-h-11 flex-col items-start rounded-md border px-3 py-2 text-left",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-dashed bg-muted/30 text-muted-foreground",
                      )}
                      onClick={() => {
                        if (selected) {
                          field.onChange(
                            field.value.filter((id) => id !== member.id),
                          );
                          return;
                        }

                        field.onChange([...field.value, member.id]);
                      }}
                    >
                      <span className="font-medium text-foreground">
                        {member.name}
                      </span>
                      <span className="text-xs">{member.subtitle}</span>
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="min-h-11 w-full sm:w-auto"
          >
            {isSubmitting
              ? isEdit
                ? "Guardando…"
                : "Registrando…"
              : isEdit
                ? "Guardar gasto"
                : "Registrar gasto"}
          </Button>
          {props.mode === "edit" ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting}
              className="min-h-11 w-full sm:w-auto"
              onClick={props.onCancel}
            >
              Cancelar
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
