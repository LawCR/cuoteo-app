"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  buildWhatsAppMeUrl,
  isShareAbortError,
} from "@/features/plans/utils/whatsapp-share.utils";
import { Button } from "@/shared/components/ui/button";

interface ISharePlanWhatsAppButtonProps {
  text: string;
}

export function SharePlanWhatsAppButton({
  text,
}: ISharePlanWhatsAppButtonProps): ReactElement {
  const [isSharing, setIsSharing] = useState(false);

  async function handleShare(): Promise<void> {
    setIsSharing(true);

    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ text });
          return;
        } catch (error: unknown) {
          if (isShareAbortError(error)) {
            return;
          }
        }
      }

      window.open(buildWhatsAppMeUrl(text), "_blank", "noopener,noreferrer");
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={() => {
        void handleShare();
      }}
      disabled={isSharing}
      className="min-h-11 w-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 sm:w-auto"
    >
      <MessageCircle />
      Compartir por WhatsApp
    </Button>
  );
}
