export const APP_NAV_DASHBOARD = {
  href: "/dashboard",
  label: "Dashboard",
} as const;

export const APP_NAV_PLANS = {
  href: "/planes",
  label: "Planes",
} as const;

export const APP_NAV_FRIENDS = {
  href: "/amigos",
  label: "Amigos",
} as const;

export const APP_NAV_PLAN_SUBITEMS_LABEL = "Planes en curso";

export const APP_NAV_PLAN_SUBITEMS: ReadonlyArray<{
  href: string;
  label: string;
}> = [];

export const APP_NAV_SUBMENU_LIST_CLASS =
  "ml-4 flex flex-col gap-1 border-l border-border pl-3";

export const APP_NAV_SUBITEM_CLASS =
  "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground";
