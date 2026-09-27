import { beforeEach, describe, expect, it, vi } from "vitest";
import { FriendRequestStatus } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  friendRequestCount: vi.fn(),
}));

vi.mock("@/core/db", () => ({
  prisma: {
    friendRequest: {
      count: mocks.friendRequestCount,
    },
  },
}));

import { countPendingReceivedFriendRequests } from "@/features/friends/services/server/friend-request-service.server";

describe("countPendingReceivedFriendRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cuenta solo solicitudes recibidas pendientes", async () => {
    mocks.friendRequestCount.mockResolvedValue(3);

    await expect(countPendingReceivedFriendRequests("user-1")).resolves.toBe(3);
    expect(mocks.friendRequestCount).toHaveBeenCalledWith({
      where: {
        toUserId: "user-1",
        status: FriendRequestStatus.PENDING,
      },
    });
  });
});
