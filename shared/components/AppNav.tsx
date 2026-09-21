"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet } from "lucide-react";
import type { ReactElement } from "react";
import {
  APP_NAV_DASHBOARD,
  APP_NAV_FRIENDS,
  APP_NAV_PLANS,
  APP_NAV_PLAN_SUBITEMS,
  APP_NAV_PLAN_SUBITEMS_LABEL,
} from "@/shared/constants/app-nav.constants";
import type { IAppNavProps } from "@/shared/interfaces/app-nav.interface";
import { cn } from "@/shared/utils/cn.utils";
import { isAppNavItemActive } from "@/shared/utils/app-nav.utils";

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

export function AppNav({ onNavigate }: IAppNavProps): ReactElement {
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
        <ul
          aria-label={APP_NAV_PLAN_SUBITEMS_LABEL}
          className={cn(
            "flex flex-col gap-1",
            APP_NAV_PLAN_SUBITEMS.length > 0 &&
              "ml-4 border-l border-border pl-3",
          )}
        >
          {APP_NAV_PLAN_SUBITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
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
