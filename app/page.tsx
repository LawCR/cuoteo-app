import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { getAppUser } from "@/core/auth/app-user.utils";
import { HomeSignedOutRedirect } from "@/shared/components/HomeSignedOutRedirect";

export default async function Home(): Promise<ReactElement> {
  const { userId } = await auth();

  if (!userId) {
    return <HomeSignedOutRedirect />;
  }

  const appUser = await getAppUser();
  redirect(appUser ? "/dashboard" : "/onboarding");
}
