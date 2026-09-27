"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusIcon, Users, Wallet } from "lucide-react";
import type { ReactElement } from "react";
import { PlanPhase } from "@/generated/prisma/enums";
import { AppNavSubmenu } from "@/shared/components/AppNavSubmenu";
import { Button } from "@/shared/components/ui/button";
import {
  APP_NAV_CREATE_PLAN,
  APP_NAV_DASHBOARD,
  APP_NAV_FRIENDS,
  APP_NAV_LIVE_PLAN_PHASE_LABELS,
  APP_NAV_PLANS,
  APP_NAV_PLAN_SUBITEMS_LABEL,
} from "@/shared/constants/app-nav.constants";
import type { IAppNavProps } from "@/shared/interfaces/app-nav.interface";
import { cn } from "@/shared/utils/cn.utils";
import {
  filterAppNavLivePlansByPhase,
  isAppNavItemActive,
} from "@/shared/utils/app-nav.utils";

function NavLink({
  href,
  label,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: ReactElement;
  onNavigate?: () => void;
}): ReactElement {
  const pathname = usePathname();
  const isActive = isAppNavItemActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

export function AppNav({ livePlans, onNavigate }: IAppNavProps): ReactElement {
  const activePlans = filterAppNavLivePlansByPhase(
    livePlans,
    PlanPhase.ACTIVE,
  );
  const balancePlans = filterAppNavLivePlansByPhase(
    livePlans,
    PlanPhase.BALANCE,
  );
  const hasLivePlans = activePlans.length > 0 || balancePlans.length > 0;

  return (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      <NavLink
        href={APP_NAV_DASHBOARD.href}
        label={APP_NAV_DASHBOARD.label}
        icon={<LayoutDashboard className="size-4" />}
        onNavigate={onNavigate}
      />
      <div className="flex flex-col gap-1">
        <NavLink
          href={APP_NAV_PLANS.href}
          label={APP_NAV_PLANS.label}
          icon={<Wallet className="size-4" />}
          onNavigate={onNavigate}
        />
        {hasLivePlans ? (
          <div
            aria-label={APP_NAV_PLAN_SUBITEMS_LABEL}
            className="flex flex-col gap-1"
          >
            <AppNavSubmenu
              title={APP_NAV_LIVE_PLAN_PHASE_LABELS.ACTIVE}
              plans={activePlans}
              headerTrailing={
                <Button
                  asChild
                  variant="ghost"
                  size="icon-lg"
                  className="size-11 shrink-0"
                >
                  <Link
                    href={APP_NAV_CREATE_PLAN.href}
                    onClick={onNavigate}
                    aria-label={APP_NAV_CREATE_PLAN.label}
                  >
                    <PlusIcon />
                  </Link>
                </Button>
              }
              onNavigate={onNavigate}
            />
            <AppNavSubmenu
              title={APP_NAV_LIVE_PLAN_PHASE_LABELS.BALANCE}
              plans={balancePlans}
              onNavigate={onNavigate}
            />
          </div>
        ) : null}
      </div>
      <NavLink
        href={APP_NAV_FRIENDS.href}
        label={APP_NAV_FRIENDS.label}
        icon={<Users className="size-4" />}
        onNavigate={onNavigate}
      />
    </nav>
  );
}
