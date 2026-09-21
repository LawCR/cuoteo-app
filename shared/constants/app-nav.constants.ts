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
