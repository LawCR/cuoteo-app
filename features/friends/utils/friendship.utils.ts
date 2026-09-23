export function orderedUserPair(
  userIdA: string,
  userIdB: string,
): { userLowId: string; userHighId: string } {
  if (userIdA < userIdB) {
    return { userLowId: userIdA, userHighId: userIdB };
  }

  return { userLowId: userIdB, userHighId: userIdA };
}

export function normalizeUsernameLookup(value: string): string {
  return value.trim().toLowerCase();
}

export function isEmailLookup(value: string): boolean {
  return value.includes("@");
}
