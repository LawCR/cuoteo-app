import type { Metadata } from "next";
import type { ReactElement } from "react";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { toPeruNationalDigits } from "@/features/profile/utils/profile.utils";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { buildPageMetadata } from "@/shared/utils/page-metadata.utils";

export const metadata: Metadata = buildPageMetadata({
  title: "Perfil",
  description:
    "Actualiza tu nombre, teléfono, datos de cobro y el tema de Cuoteo.",
  path: "/perfil",
});

export default async function ProfilePage(): Promise<ReactElement> {
  const user = await requireAppUser();

  return (
    <main className="flex min-h-full flex-1 flex-col p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Perfil</CardTitle>
            <CardDescription>
              Actualiza tu nombre, teléfono y datos de cobro. El usuario y el
              correo no se pueden cambiar aquí.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              email={user.email}
              username={user.username}
              name={user.name}
              phoneDigits={toPeruNationalDigits(user.phone)}
              bankName={user.bankName}
              cci={user.cci}
              accountNumber={user.accountNumber}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>
              Elige cómo se ve Cuoteo en este dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Label>Tema</Label>
            <ThemeToggle />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
