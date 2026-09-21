import { Loader2Icon } from "lucide-react";
import type { ReactElement } from "react";

interface ILoadingProps {
  label?: string;
}

export function Loading({
  label = "Cargando…",
}: ILoadingProps): ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-full flex-1 flex-col items-center justify-center gap-5 p-6"
    >
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/10" />
        <span className="absolute inset-1 rounded-full border border-primary/20" />
        <Loader2Icon
          className="relative size-7 animate-spin text-primary"
          aria-hidden
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-base font-semibold tracking-tight text-foreground">
          Cuoteo
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
