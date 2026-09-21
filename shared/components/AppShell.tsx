"use client";

import { Menu } from "lucide-react";
import { useState, type ReactElement, type ReactNode } from "react";
import { AppAccountMenu } from "@/shared/components/AppAccountMenu";
import { AppNav } from "@/shared/components/AppNav";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

interface IAppShellProps {
  children: ReactNode;
  name: string;
  email: string;
}

export function AppShell({
  children,
  name,
  email,
}: IAppShellProps): ReactElement {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-background p-4 md:flex">
        <p className="mb-6 px-3 text-lg font-semibold">Cuoteo</p>
        <AppNav />
        <AppAccountMenu
          variant="sidebar"
          name={name}
          email={email}
          showProfileLink
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex min-h-14 items-center justify-between gap-3 border-b border-border bg-background px-4 py-2 md:hidden">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className="size-11"
                aria-label="Abrir menú"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle>Cuoteo</SheetTitle>
              </SheetHeader>
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <AppNav onNavigate={() => setIsMobileNavOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <p className="text-base font-semibold">Cuoteo</p>
          <AppAccountMenu name={name} email={email} showProfileLink />
        </header>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
