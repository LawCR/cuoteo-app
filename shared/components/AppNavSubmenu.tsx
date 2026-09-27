"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import type { ExpenseCategory } from "@/generated/prisma/enums";
import { ExpenseCategoryIcon } from "@/shared/components/ExpenseCategoryIcon";
import {
  APP_NAV_SUBITEM_CLASS,
  APP_NAV_SUBMENU_LIST_CLASS,
} from "@/shared/constants/app-nav.constants";
import type { IAppNavSubmenuProps } from "@/shared/interfaces/app-nav.interface";
import { cn } from "@/shared/utils/cn.utils";
import { isAppNavItemActive } from "@/shared/utils/app-nav.utils";

export function AppNavSubmenu({
  title,
  plans,
  emptyLabel,
  headerTrailing,
  onNavigate,
}: IAppNavSubmenuProps): ReactElement | null {
  if (plans.length === 0 && !emptyLabel && !headerTrailing) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div
        className={cn(
          "flex min-h-11 items-center rounded-md text-sm font-medium",
          headerTrailing ? "pl-3" : "px-3",
        )}
      >
        <p className="min-w-0 flex-1 truncate">{title}</p>
        {headerTrailing}
      </div>
      {plans.length === 0 && emptyLabel ? (
        <ul className={APP_NAV_SUBMENU_LIST_CLASS}>
          <li className="px-3 py-2 text-sm text-muted-foreground">
            {emptyLabel}
          </li>
        </ul>
      ) : null}
      {plans.length > 0 ? (
        <ul className={APP_NAV_SUBMENU_LIST_CLASS}>
          {plans.map((plan) => (
            <AppNavSubitem
              key={plan.id}
              href={`/planes/${plan.id}`}
              name={plan.name}
              icon={plan.icon}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AppNavSubitem({
  href,
  name,
  icon,
  onNavigate,
}: {
  href: string;
  name: string;
  icon: ExpenseCategory;
  onNavigate?: () => void;
}): ReactElement {
  const pathname = usePathname();
  const isActive = isAppNavItemActive(pathname, href);

  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          APP_NAV_SUBITEM_CLASS,
          "min-w-0",
          isActive && "bg-primary/10 text-primary",
        )}
      >
        <ExpenseCategoryIcon category={icon} className="size-4 shrink-0" />
        <span className="truncate">{name}</span>
      </Link>
    </li>
  );
}
