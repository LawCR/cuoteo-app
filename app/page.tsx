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

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-16">
      <main className="flex w-full max-w-lg flex-col gap-8 rounded-lg border border-border bg-card p-8 text-card-foreground shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-primary">Cuoteo</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sistema de diseño
          </h1>
          <p className="text-sm text-muted-foreground">
            Paleta teal con tema según el sistema. El interruptor estará en
            perfil.
          </p>
        </div>
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
      </main>
    </div>
  );
}
