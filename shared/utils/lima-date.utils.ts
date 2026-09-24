const LIMA_TIME_ZONE = "America/Lima";

export function formatLimaDate(date: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TIME_ZONE,
    dateStyle: "medium",
  }).format(date);
}
