"use client";

import { useActionState, useEffect } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { completeOnboardingAction } from "@/features/profile/actions/complete-onboarding.action";
import {
  NAME_MAX_LENGTH,
  PERU_PHONE_DIGIT_COUNT,
  PERU_PHONE_PREFIX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/features/profile/constants/profile.constants";
import type { TCompleteOnboardingActionState } from "@/features/profile/interfaces/complete-onboarding.interface";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const INITIAL_STATE: TCompleteOnboardingActionState = { error: null };

interface IOnboardingFormProps {
  defaultName: string;
}

export function OnboardingForm({
  defaultName,
}: IOnboardingFormProps): ReactElement {
  const [state, formAction, isPending] = useActionState(
    completeOnboardingAction,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={NAME_MAX_LENGTH}
          defaultValue={defaultName}
          autoComplete="name"
          className="min-h-11"
          placeholder="Cómo te verán en los planes"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          name="username"
          required
          minLength={USERNAME_MIN_LENGTH}
          maxLength={USERNAME_MAX_LENGTH}
          pattern={`[a-zA-Z0-9_]{${USERNAME_MIN_LENGTH},${USERNAME_MAX_LENGTH}}`}
          autoComplete="username"
          className="min-h-11"
          placeholder="alvaro_perez"
        />
        <p className="text-sm text-muted-foreground">
          {USERNAME_MIN_LENGTH}–{USERNAME_MAX_LENGTH} caracteres: letras,
          números y guion bajo.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Teléfono</Label>
        <div className="flex min-h-11 overflow-hidden rounded-md border border-input shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
          <span className="flex items-center bg-muted px-3 text-sm text-muted-foreground">
            {PERU_PHONE_PREFIX}
          </span>
          <Input
            id="phone"
            name="phone"
            required
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={PERU_PHONE_DIGIT_COUNT}
            pattern={`\\d{${PERU_PHONE_DIGIT_COUNT}}`}
            placeholder="987654321"
            className="min-h-11 rounded-none border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          9 dígitos de celular en Perú.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="min-h-11 w-full"
      >
        {isPending ? "Guardando…" : "Continuar"}
      </Button>
    </form>
  );
}
