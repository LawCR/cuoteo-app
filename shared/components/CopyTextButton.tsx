"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { ReactElement } from "react";
import { Button } from "@/shared/components/ui/button";

interface ICopyTextButtonProps {
  value: string;
  label: string;
}

export function CopyTextButton({
  value,
  label,
}: ICopyTextButtonProps): ReactElement | null {
  if (value.length === 0) {
    return null;
  }

  async function copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado`);
    } catch {
      toast.error(`No se pudo copiar ${label.toLowerCase()}.`);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11"
      onClick={() => {
        void copyToClipboard();
      }}
    >
      <Copy />
      Copiar {label}
    </Button>
  );
}
