"use client";

import { UserButton } from "@clerk/nextjs";
import { UserRound } from "lucide-react";
import type { ReactElement } from "react";

interface IAppUserButtonProps {
  showProfileLink?: boolean;
}

export function AppUserButton({
  showProfileLink = false,
}: IAppUserButtonProps): ReactElement {
  return (
    <UserButton>
      {showProfileLink ? (
        <UserButton.MenuItems>
          <UserButton.Link
            label="Perfil"
            href="/perfil"
            labelIcon={<UserRound className="size-4" />}
          />
        </UserButton.MenuItems>
      ) : null}
    </UserButton>
  );
}
