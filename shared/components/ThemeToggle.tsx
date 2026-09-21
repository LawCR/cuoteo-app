"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";
import { THEME_OPTIONS } from "@/shared/constants/theme.constants";
import type { TThemeValue } from "@/shared/interfaces/theme.interface";

export function ThemeToggle(): ReactNode {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        aria-hidden
        className="grid h-[3.25rem] grid-cols-3 gap-1 rounded-lg bg-muted p-1"
      />
    );
  }

  const selectedTheme: TThemeValue = isThemeValue(theme) ? theme : "system";

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
    >
      {THEME_OPTIONS.map((option) => {
        const isSelected = isMounted && selectedTheme === option.value;

        return (
          <Button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            variant={isSelected ? "default" : "ghost"}
            className="min-h-11"
            onClick={() => setTheme(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

function isThemeValue(value: string | undefined): value is TThemeValue {
  return THEME_OPTIONS.some((option) => option.value === value);
}
