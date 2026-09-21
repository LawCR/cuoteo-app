"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactElement } from "react";
import { Loading } from "@/shared/components/Loading";

export function HomeSignedOutRedirect(): ReactElement {
  const { isLoaded, isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      router.replace("/dashboard");
      return;
    }

    void redirectToSignIn();
  }, [isLoaded, isSignedIn, redirectToSignIn, router]);

  return <Loading label="Entrando…" />;
}
