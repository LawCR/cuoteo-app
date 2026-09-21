"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

interface IThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: IThemeProviderProps): ReactNode {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="cuoteo-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
