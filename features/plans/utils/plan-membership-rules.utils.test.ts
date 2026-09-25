import { describe, expect, it } from "vitest";
import {
  getDeletePlanDenial,
  getLeavePlanDenial,
  getRemoveMemberDenial,
} from "@/features/plans/utils/plan-membership-rules.utils";

const CREATOR_ID = "creator-1";
const MEMBER_ID = "member-1";
const OTHER_MEMBER_ID = "member-2";

describe("getLeavePlanDenial", () => {
  it("bloquea al creador", () => {
    expect(getLeavePlanDenial(CREATOR_ID, CREATOR_ID)).toBe(
      "creator_cannot_leave",
    );
  });

  it("permite a un integrante registrado", () => {
    expect(getLeavePlanDenial(MEMBER_ID, CREATOR_ID)).toBeNull();
  });
});

describe("getRemoveMemberDenial", () => {
  it("impide quitar al creador, incluso si actúa él mismo", () => {
    expect(
      getRemoveMemberDenial({
        actorUserId: CREATOR_ID,
        creatorUserId: CREATOR_ID,
        targetUserId: CREATOR_ID,
      }),
    ).toBe("cannot_remove_creator");
  });

  it("permite al creador quitar a otro registrado", () => {
    expect(
      getRemoveMemberDenial({
        actorUserId: CREATOR_ID,
        creatorUserId: CREATOR_ID,
        targetUserId: MEMBER_ID,
      }),
    ).toBeNull();
  });

  it("impide a un integrante quitar a otro registrado", () => {
    expect(
      getRemoveMemberDenial({
        actorUserId: MEMBER_ID,
        creatorUserId: CREATOR_ID,
        targetUserId: OTHER_MEMBER_ID,
      }),
    ).toBe("cannot_remove_registered_member");
  });

  it("permite al creador quitar un invitado", () => {
    expect(
      getRemoveMemberDenial({
        actorUserId: CREATOR_ID,
        creatorUserId: CREATOR_ID,
        targetUserId: null,
      }),
    ).toBeNull();
  });

  it("permite a un integrante quitar un invitado", () => {
    expect(
      getRemoveMemberDenial({
        actorUserId: MEMBER_ID,
        creatorUserId: CREATOR_ID,
        targetUserId: null,
      }),
    ).toBeNull();
  });
});

describe("getDeletePlanDenial", () => {
  it("permite al creador", () => {
    expect(getDeletePlanDenial(CREATOR_ID, CREATOR_ID)).toBeNull();
  });

  it("bloquea a un integrante que no es creador", () => {
    expect(getDeletePlanDenial(MEMBER_ID, CREATOR_ID)).toBe("not_plan_creator");
  });
});
