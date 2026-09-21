import type { ReactElement, ReactNode } from "react";
import { requireAppUser } from "@/core/auth/app-user.utils";

export default async function AppGroupLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<ReactElement> {
  await requireAppUser();

  return <>{children}</>;
}
