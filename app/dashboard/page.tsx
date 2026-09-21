import type { ReactElement } from "react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppUserButton } from "@/shared/components/AppUserButton";

export default async function DashboardPage(): Promise<ReactElement> {
  await requireAppUser();

  return (
    <main className="flex min-h-full flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <AppUserButton showProfileLink />
      </div>
    </main>
  );
}
