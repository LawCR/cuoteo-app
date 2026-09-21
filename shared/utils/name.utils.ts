export function getNameInitials(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    return "?";
  }

  if (trimmed.includes("@")) {
    return trimmed.slice(0, 2).toUpperCase();
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0];

  if (!first) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const last = parts[parts.length - 1]?.[0];

  if (!last) {
    return first.toUpperCase();
  }

  return `${first}${last}`.toUpperCase();
}
