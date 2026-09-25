import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import { PlanPhase } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  planFindFirst: vi.fn(),
  planUpdate: vi.fn(),
  planDelete: vi.fn(),
  planMemberFindUnique: vi.fn(),
  planMemberFindFirst: vi.fn(),
  planMemberDelete: vi.fn(),
  planMemberCount: vi.fn(),
}));

vi.mock("@/core/db", () => ({
  prisma: {
    plan: {
      findFirst: mocks.planFindFirst,
      update: mocks.planUpdate,
      delete: mocks.planDelete,
    },
    planMember: {
      findUnique: mocks.planMemberFindUnique,
      findFirst: mocks.planMemberFindFirst,
      delete: mocks.planMemberDelete,
      count: mocks.planMemberCount,
    },
  },
}));

import {
  deletePlan,
  leavePlan,
  movePlanToActive,
  movePlanToBalance,
  removePlanMember,
} from "@/features/plans/services/server/plan-service.server";

const PLAN_ID = "plan-1";
const CREATOR_ID = "creator-1";
const MEMBER_USER_ID = "member-1";
const MEMBER_ROW_ID = "pm-member";
const GHOST_ROW_ID = "pm-ghost";
const CREATOR_ROW_ID = "pm-creator";

function makePlan(phase: PlanPhase = PlanPhase.ACTIVE) {
  return {
    id: PLAN_ID,
    name: "Asado",
    icon: "FOOD" as const,
    phase,
    creatorUserId: CREATOR_ID,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}

describe("leavePlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.planMemberFindUnique.mockResolvedValue({
      id: MEMBER_ROW_ID,
      planId: PLAN_ID,
      userId: MEMBER_USER_ID,
    });
    mocks.planMemberDelete.mockResolvedValue({});
  });

  it("borra la membresía del integrante en Activo", async () => {
    await leavePlan({ actorUserId: MEMBER_USER_ID, planId: PLAN_ID });

    expect(mocks.planMemberDelete).toHaveBeenCalledWith({
      where: { id: MEMBER_ROW_ID },
    });
  });

  it("rechaza al creador", async () => {
    await expect(
      leavePlan({ actorUserId: CREATOR_ID, planId: PLAN_ID }),
    ).rejects.toMatchObject({
      message: "creator_cannot_leave",
    });
    expect(mocks.planMemberDelete).not.toHaveBeenCalled();
  });

  it("rechaza si el plan no está activo", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.BALANCE));

    await expect(
      leavePlan({ actorUserId: MEMBER_USER_ID, planId: PLAN_ID }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.planMemberDelete).not.toHaveBeenCalled();
  });

  it("rechaza mutaciones en Completado", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.COMPLETED));

    await expect(
      leavePlan({ actorUserId: MEMBER_USER_ID, planId: PLAN_ID }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.planMemberDelete).not.toHaveBeenCalled();
  });

  it("rechaza si el actor no pertenece al plan", async () => {
    mocks.planFindFirst.mockResolvedValue(null);

    await expect(
      leavePlan({ actorUserId: MEMBER_USER_ID, planId: PLAN_ID }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("removePlanMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.planMemberDelete.mockResolvedValue({});
  });

  it("permite al creador quitar a un registrado", async () => {
    mocks.planMemberFindFirst.mockResolvedValue({
      id: MEMBER_ROW_ID,
      planId: PLAN_ID,
      userId: MEMBER_USER_ID,
    });

    await removePlanMember({
      actorUserId: CREATOR_ID,
      planId: PLAN_ID,
      memberId: MEMBER_ROW_ID,
    });

    expect(mocks.planMemberDelete).toHaveBeenCalledWith({
      where: { id: MEMBER_ROW_ID },
    });
  });

  it("permite a un integrante quitar un invitado", async () => {
    mocks.planMemberFindFirst.mockResolvedValue({
      id: GHOST_ROW_ID,
      planId: PLAN_ID,
      userId: null,
    });

    await removePlanMember({
      actorUserId: MEMBER_USER_ID,
      planId: PLAN_ID,
      memberId: GHOST_ROW_ID,
    });

    expect(mocks.planMemberDelete).toHaveBeenCalledWith({
      where: { id: GHOST_ROW_ID },
    });
  });

  it("impide a un integrante quitar a otro registrado", async () => {
    mocks.planMemberFindFirst.mockResolvedValue({
      id: MEMBER_ROW_ID,
      planId: PLAN_ID,
      userId: MEMBER_USER_ID,
    });

    await expect(
      removePlanMember({
        actorUserId: "other-member",
        planId: PLAN_ID,
        memberId: MEMBER_ROW_ID,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(mocks.planMemberDelete).not.toHaveBeenCalled();
  });

  it("impide quitar al creador", async () => {
    mocks.planMemberFindFirst.mockResolvedValue({
      id: CREATOR_ROW_ID,
      planId: PLAN_ID,
      userId: CREATOR_ID,
    });

    await expect(
      removePlanMember({
        actorUserId: CREATOR_ID,
        planId: PLAN_ID,
        memberId: CREATOR_ROW_ID,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.planMemberDelete).not.toHaveBeenCalled();
  });

  it("rechaza si el integrante no está en el plan", async () => {
    mocks.planMemberFindFirst.mockResolvedValue(null);

    await expect(
      removePlanMember({
        actorUserId: CREATOR_ID,
        planId: PLAN_ID,
        memberId: "missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("movePlanToBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.planMemberCount.mockResolvedValue(2);
    mocks.planUpdate.mockResolvedValue(makePlan(PlanPhase.BALANCE));
  });

  it("pasa a Balance con al menos 2 integrantes", async () => {
    const result = await movePlanToBalance({
      actorUserId: MEMBER_USER_ID,
      planId: PLAN_ID,
    });

    expect(mocks.planUpdate).toHaveBeenCalledWith({
      where: { id: PLAN_ID },
      data: { phase: PlanPhase.BALANCE },
    });
    expect(result.phase).toBe(PlanPhase.BALANCE);
  });

  it("bloquea con menos de 2 integrantes", async () => {
    mocks.planMemberCount.mockResolvedValue(1);

    await expect(
      movePlanToBalance({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({ message: "not_enough_members" });
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("bloquea si el plan no está activo", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.BALANCE));

    await expect(
      movePlanToBalance({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("rechaza si el actor no pertenece al plan", async () => {
    mocks.planFindFirst.mockResolvedValue(null);

    await expect(
      movePlanToBalance({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("movePlanToActive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.BALANCE));
    mocks.planUpdate.mockResolvedValue(makePlan(PlanPhase.ACTIVE));
  });

  it("vuelve a Activo desde Balance sin pagos", async () => {
    const result = await movePlanToActive({
      actorUserId: MEMBER_USER_ID,
      planId: PLAN_ID,
    });

    expect(mocks.planUpdate).toHaveBeenCalledWith({
      where: { id: PLAN_ID },
      data: { phase: PlanPhase.ACTIVE },
    });
    expect(result.phase).toBe(PlanPhase.ACTIVE);
  });

  it("bloquea si el plan está activo", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.ACTIVE));

    await expect(
      movePlanToActive({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({ message: "plan_not_in_balance" });
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("bloquea Completado", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.COMPLETED));

    await expect(
      movePlanToActive({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("rechaza si el actor no pertenece al plan", async () => {
    mocks.planFindFirst.mockResolvedValue(null);

    await expect(
      movePlanToActive({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("deletePlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planDelete.mockResolvedValue({});
  });

  it.each([PlanPhase.ACTIVE, PlanPhase.BALANCE, PlanPhase.COMPLETED])(
    "permite al creador borrar en fase %s",
    async (phase) => {
      mocks.planFindFirst.mockResolvedValue(makePlan(phase));

      await deletePlan({ actorUserId: CREATOR_ID, planId: PLAN_ID });

      expect(mocks.planDelete).toHaveBeenCalledWith({
        where: { id: PLAN_ID },
      });
    },
  );

  it("impide a un integrante que no es creador", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan());

    await expect(
      deletePlan({ actorUserId: MEMBER_USER_ID, planId: PLAN_ID }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(mocks.planDelete).not.toHaveBeenCalled();
  });

  it("rechaza si el actor no pertenece al plan", async () => {
    mocks.planFindFirst.mockResolvedValue(null);

    await expect(
      deletePlan({ actorUserId: CREATOR_ID, planId: PLAN_ID }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(mocks.planDelete).not.toHaveBeenCalled();
  });
});
