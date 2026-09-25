"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { FormEvent, ReactElement } from "react";
import { addFriendToPlanAction } from "@/features/plans/actions/add-friend-to-plan.action";
import { LateJoinChoiceDialog } from "@/features/plans/components/LateJoinChoiceDialog";
import type { IPlanFriendOption } from "@/features/plans/interfaces/plan.interface";
import {
  addFriendToPlanSchema,
  type TAddFriendToPlanFormData,
} from "@/features/plans/schemas/add-friend-to-plan.schema";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface IAddFriendToPlanFormProps {
  planId: string;
  friends: IPlanFriendOption[];
  hasExpenses: boolean;
}

export function AddFriendToPlanForm({
  planId,
  friends,
  hasExpenses,
}: IAddFriendToPlanFormProps): ReactElement {
  const [choiceOpen, setChoiceOpen] = useState(false);
  const form = useForm<TAddFriendToPlanFormData>({
    resolver: zodResolver(addFriendToPlanSchema),
    defaultValues: {
      planId,
      friendUserId: "",
      includeInPastExpenses: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function submit(values: TAddFriendToPlanFormData): Promise<void> {
    const result = await addFriendToPlanAction(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success("Amigo agregado al plan");
      form.reset({
        planId,
        friendUserId: "",
        includeInPastExpenses: false,
      });
      setChoiceOpen(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const isValid = await form.trigger();

    if (!isValid) {
      return;
    }

    if (hasExpenses) {
      setChoiceOpen(true);
      return;
    }

    await form.handleSubmit((values) =>
      submit({ ...values, includeInPastExpenses: false }),
    )();
  }

  async function onChoose(includeInPastExpenses: boolean): Promise<void> {
    await form.handleSubmit((values) =>
      submit({ ...values, includeInPastExpenses }),
    )();
  }

  if (friends.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay más amigos para sumar. Puedes invitar a alguien nuevo desde{" "}
        <Link
          href="/amigos"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Amigos
        </Link>{" "}
        o agregar un invitado sin cuenta.
      </p>
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <FormField
            control={form.control}
            name="friendUserId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Amigo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="min-h-11 w-full">
                      <SelectValue placeholder="Elige un amigo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {friends.map((friend) => (
                      <SelectItem key={friend.id} value={friend.id}>
                        {friend.name} (@{friend.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            {isSubmitting ? "Agregando…" : "Agregar"}
          </Button>
        </form>
      </Form>
      <LateJoinChoiceDialog
        open={choiceOpen}
        isPending={isSubmitting}
        onOpenChange={setChoiceOpen}
        onChoose={onChoose}
      />
    </>
  );
}
