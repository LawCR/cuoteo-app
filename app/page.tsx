import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { getAppUser } from "@/core/auth/app-user.utils";
import { HomeSignedOutRedirect } from "@/shared/components/HomeSignedOutRedirect";
import {
  APP_DEFAULT_DESCRIPTION,
  APP_NAME,
  buildPageMetadata,
} from "@/shared/utils/page-metadata.utils";

export const metadata: Metadata = buildPageMetadata({
  title: APP_NAME,
  description: APP_DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default async function Home(): Promise<ReactElement> {
  const { userId } = await auth();

  if (!userId) {
    return <HomeSignedOutRedirect />;
  }

  const appUser = await getAppUser();
  redirect(appUser ? "/dashboard" : "/onboarding");
}
