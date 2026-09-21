import type { ReactElement, ReactNode } from "react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppShell } from "@/shared/components/AppShell";

export default async function AppGroupLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<ReactElement> {
  const user = await requireAppUser();

  return (
    <AppShell name={user.name} email={user.email}>
      {children}
    </AppShell>
  );
}
