"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { IAppAccountMenuProps } from "@/shared/interfaces/app-account-menu.interface";
import { cn } from "@/shared/utils/cn.utils";
import { getNameInitials } from "@/shared/utils/name.utils";

function AccountAvatar({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string;
  className?: string;
}): ReactElement {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt=""
        width={40}
        height={40}
        unoptimized
        className={cn("size-10 shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {getNameInitials(name)}
    </span>
  );
}

export function AppAccountMenu({
  name,
  email,
  variant = "icon",
  showProfileLink = false,
}: IAppAccountMenuProps): ReactElement {
  const { user } = useUser();
  const { signOut } = useClerk();
  const imageUrl = user?.imageUrl;
  const isSidebar = variant === "sidebar";

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isSidebar ? (
          <button
            type="button"
            className="flex w-full min-h-14 items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AccountAvatar name={name} imageUrl={imageUrl} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {email}
              </span>
            </span>
          </button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="size-11 rounded-full"
            aria-label="Cuenta"
          >
            <AccountAvatar name={name} imageUrl={imageUrl} className="size-9" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isSidebar ? "start" : "end"}
        side={isSidebar ? "top" : "bottom"}
        className="w-64"
      >
        <div className="flex items-center gap-3 px-2 py-2">
          <AccountAvatar name={name} imageUrl={imageUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {showProfileLink ? (
          <DropdownMenuItem asChild>
            <Link href="/perfil" className="min-h-11 cursor-pointer">
              <UserRound />
              Perfil
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          className="min-h-11 cursor-pointer"
          onSelect={() => {
            void signOut({ redirectUrl: "/" });
          }}
        >
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isSidebar) {
    return <div className="mt-auto border-t border-border pt-3">{menu}</div>;
  }

  return menu;
}
