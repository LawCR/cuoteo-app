"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ReactElement } from "react";
import { addGhostToPlanAction } from "@/features/plans/actions/add-ghost-to-plan.action";
import { GHOST_NAME_MAX_LENGTH } from "@/features/plans/constants/plans.constants";
import {
  addGhostToPlanSchema,
  type TAddGhostToPlanFormData,
} from "@/features/plans/schemas/add-ghost-to-plan.schema";
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

interface IAddGhostToPlanFormProps {
  planId: string;
}

export function AddGhostToPlanForm({
  planId,
}: IAddGhostToPlanFormProps): ReactElement {
  const form = useForm<TAddGhostToPlanFormData>({
    resolver: zodResolver(addGhostToPlanSchema),
    defaultValues: { planId, ghostName: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: TAddGhostToPlanFormData): Promise<void> {
    const result = await addGhostToPlanAction(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success("Invitado agregado al plan");
      form.reset({ planId, ghostName: "" });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <FormField
          control={form.control}
          name="ghostName"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  autoComplete="off"
                  maxLength={GHOST_NAME_MAX_LENGTH}
                  className="min-h-11"
                  placeholder="Ej. Carla"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="min-h-11 w-full sm:w-auto"
        >
          {isSubmitting ? "Agregando…" : "Agregar invitado"}
        </Button>
      </form>
    </Form>
  );
}
