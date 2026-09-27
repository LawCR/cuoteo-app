"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import type { ReactElement } from "react";
import {
  PLAN_LIST_PHASE_ALL,
  PLAN_NAME_MAX_LENGTH,
  PLAN_PHASE_LABELS,
  PLAN_PHASE_VALUES,
} from "@/features/plans/constants/plans.constants";
import {
  listPlansFiltersFormSchema,
  type TListPlansFiltersFormData,
} from "@/features/plans/schemas/list-plans-filters.schema";
import {
  isListPlansFiltersActive,
  toListPlansHref,
} from "@/features/plans/utils/list-plans-filters.utils";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
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

interface IPlanFiltersFormProps {
  defaultValues: TListPlansFiltersFormData;
}

export function PlanFiltersForm({
  defaultValues,
}: IPlanFiltersFormProps): ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const hasActiveFilters = isListPlansFiltersActive(defaultValues);

  const form = useForm<TListPlansFiltersFormData>({
    resolver: zodResolver(listPlansFiltersFormSchema),
    defaultValues,
  });

  const canClear =
    hasActiveFilters || form.formState.isDirty || isListPlansFiltersActive(form.watch());

  function onSubmit(values: TListPlansFiltersFormData): void {
    startTransition(() => {
      router.push(toListPlansHref(values));
    });
  }

  function onClear(): void {
    form.reset({
      phase: PLAN_LIST_PHASE_ALL,
      name: "",
      createdAtFrom: "",
      createdAtTo: "",
    });

    if (hasActiveFilters) {
      startTransition(() => {
        router.push("/planes");
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name="phase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fase</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger className="min-h-11 w-full">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={PLAN_LIST_PHASE_ALL}>Todas</SelectItem>
                    {PLAN_PHASE_VALUES.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {PLAN_PHASE_LABELS[phase]}
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    maxLength={PLAN_NAME_MAX_LENGTH}
                    className="min-h-11"
                    placeholder="Buscar por nombre"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="createdAtFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creado desde</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="min-h-11 scheme-light dark:scheme-dark"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="createdAtTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creado hasta</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="min-h-11 scheme-light dark:scheme-dark"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="min-h-11 w-full sm:w-auto"
          >
            {isPending ? "Filtrando…" : "Filtrar"}
          </Button>
          {canClear ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending}
              onClick={onClear}
            >
              Limpiar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-11 w-full sm:w-auto"
              disabled
            >
              Limpiar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
