export function orderedUserPair(
  userIdA: string,
  userIdB: string,
): { userLowId: string; userHighId: string } {
  if (userIdA < userIdB) {
    return { userLowId: userIdA, userHighId: userIdB };
  }

  return { userLowId: userIdB, userHighId: userIdA };
}
