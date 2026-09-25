import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { getAppUser } from "@/core/auth/app-user.utils";
import { OnboardingForm } from "@/features/profile/components/OnboardingForm";
import { AppAccountMenu } from "@/shared/components/AppAccountMenu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default async function OnboardingPage(): Promise<ReactElement> {
  const appUser = await getAppUser();

  if (appUser) {
    redirect("/dashboard");
  }

  const clerkUser = await currentUser();
  const defaultName =
    clerkUser?.fullName?.trim() ?? clerkUser?.firstName?.trim() ?? "";
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <main className="flex min-h-full flex-1 flex-col p-4 sm:p-6">
      <div className="mb-6 flex justify-end">
        <AppAccountMenu name={defaultName || clerkEmail} email={clerkEmail} />
      </div>
      <div className="flex flex-1 items-start justify-center md:items-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Completa tu perfil</CardTitle>
            <CardDescription>
              Estos datos te identifican en Cuoteo. El usuario y el teléfono
              deben ser únicos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm defaultName={defaultName} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
