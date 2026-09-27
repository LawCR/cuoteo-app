const LIMA_TIME_ZONE = "America/Lima";
const LIMA_UTC_OFFSET = "-05:00";

export const LIMA_CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatLimaDate(date: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TIME_ZONE,
    dateStyle: "medium",
  }).format(date);
}

export function limaCalendarDateToUtcStart(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000${LIMA_UTC_OFFSET}`);
}

export function limaCalendarDateToUtcEnd(isoDate: string): Date {
  return new Date(`${isoDate}T23:59:59.999${LIMA_UTC_OFFSET}`);
}
