import { env } from "@/core/env";

export function buildPlanAbsoluteUrl(planId: string): string {
  return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/planes/${planId}`;
}
