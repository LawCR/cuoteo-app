/** Prefijos de Next accesibles sin sesión. El Account Portal no está aquí. */
const PUBLIC_PATH_PREFIXES = ["/__clerk"] as const;

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }

  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
