"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { MoneyText } from "@/shared/components/MoneyText";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { toast } from "@/shared/components/ui/sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

const TOKEN_SWATCHES = [
  { name: "Primary", className: "bg-primary text-primary-foreground" },
  { name: "Success", className: "bg-success text-success-foreground" },
  { name: "Warning", className: "bg-warning text-warning-foreground" },
  { name: "Destructive", className: "bg-destructive text-destructive-foreground" },
  { name: "Info", className: "bg-info text-info-foreground" },
  { name: "Muted", className: "bg-muted text-muted-foreground" },
] as const;

const CHART_SWATCHES = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
] as const;

export function DesignSystemPreview(): ReactNode {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-16">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-primary">Cuoteo</p>
            <Badge>New York · zinc</Badge>
          </div>
          <CardTitle>Sistema de diseño</CardTitle>
          <CardDescription>
            Paleta teal con shadcn. El interruptor vivirá en perfil; aquí se
            prueba.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TOKEN_SWATCHES.map((swatch) => (
              <li
                key={swatch.name}
                className={`flex h-11 items-center justify-center rounded-md text-sm font-medium ${swatch.className}`}
              >
                {swatch.name}
              </li>
            ))}
          </ul>
          <div className="flex gap-2" aria-label="Colores de categoría">
            {CHART_SWATCHES.map((className) => (
              <span
                key={className}
                className={`h-8 flex-1 rounded-md ${className}`}
              />
            ))}
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Tema</p>
            <ThemeToggle />
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <p>
              A favor: <MoneyText amount={42.5} />
            </p>
            <p>
              En contra: <MoneyText amount={-18} />
            </p>
            <p>
              En cero: <MoneyText amount={0} />
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="preview-name">Nombre</Label>
            <Input id="preview-name" placeholder="Ej. Ana" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => toast.success("Toast de prueba")}
            >
              Mostrar toast
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" size="icon">
                  <Menu />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                  <SheetDescription>
                    En la app esto será el sidebar flotante en móvil.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
