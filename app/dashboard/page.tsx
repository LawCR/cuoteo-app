import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { ReactElement } from "react";

export default async function DashboardPage(): Promise<ReactElement> {
  await auth.protect();

  return (
    <main className="flex min-h-full flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <UserButton />
      </div>
    </main>
  );
}
