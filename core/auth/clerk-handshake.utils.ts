const CLERK_HANDSHAKE_PARAMS = [
  "__clerk_db_jwt",
  "__clerk_handshake",
  "__clerk_status",
] as const;

export function isClerkHandshakePath(searchParams: URLSearchParams): boolean {
  return CLERK_HANDSHAKE_PARAMS.some((param) => searchParams.has(param));
}
