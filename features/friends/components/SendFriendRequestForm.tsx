"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ReactElement } from "react";
import { sendFriendRequestAction } from "@/features/friends/actions/send-friend-request.action";
import { FRIEND_LOOKUP_MAX_LENGTH } from "@/features/friends/constants/friends.constants";
import {
  sendFriendRequestSchema,
  type TSendFriendRequestFormData,
} from "@/features/friends/schemas/send-friend-request.schema";
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

export function SendFriendRequestForm(): ReactElement {
  const form = useForm<TSendFriendRequestFormData>({
    resolver: zodResolver(sendFriendRequestSchema),
    defaultValues: { query: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: TSendFriendRequestFormData): Promise<void> {
    const result = await sendFriendRequestAction(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success("Solicitud enviada");
      form.reset({ query: "" });
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
          name="query"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Usuario o correo</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  maxLength={FRIEND_LOOKUP_MAX_LENGTH}
                  className="min-h-11"
                  placeholder="usuario o correo exacto"
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
          {isSubmitting ? "Enviando…" : "Enviar solicitud"}
        </Button>
      </form>
    </Form>
  );
}
