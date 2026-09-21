import type { TThemeValue } from "@/shared/interfaces/theme.interface";

export const THEME_OPTIONS: ReadonlyArray<{
  value: TThemeValue;
  label: string;
}> = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
];
