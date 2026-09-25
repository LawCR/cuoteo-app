export type TLeavePlanDenial = "creator_cannot_leave";

export type TRemoveMemberDenial =
  | "cannot_remove_creator"
  | "cannot_remove_registered_member";

export function getLeavePlanDenial(
  actorUserId: string,
  creatorUserId: string,
): TLeavePlanDenial | null {
  if (actorUserId === creatorUserId) {
    return "creator_cannot_leave";
  }

  return null;
}

export function getRemoveMemberDenial(input: {
  actorUserId: string;
  creatorUserId: string;
  targetUserId: string | null;
}): TRemoveMemberDenial | null {
  if (input.targetUserId === input.creatorUserId) {
    return "cannot_remove_creator";
  }

  if (
    input.targetUserId !== null &&
    input.actorUserId !== input.creatorUserId
  ) {
    return "cannot_remove_registered_member";
  }

  return null;
}
