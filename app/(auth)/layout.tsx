import { auth } from "@clerk/nextjs/server";
import type { ReactElement, ReactNode } from "react";

export default async function AuthGroupLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<ReactElement> {
  await auth.protect();

  return <>{children}</>;
}
