import Link from "next/link";
import type { ReactElement } from "react";
import { DASHBOARD_FRIENDS_PREVIEW_LIMIT } from "@/features/friends/constants/friends.constants";
import type { IFriendListItem } from "@/features/friends/interfaces/friendship.interface";
import { UserAvatar } from "@/shared/components/UserAvatar";

interface IDashboardFriendsPreviewProps {
  friends: readonly IFriendListItem[];
}

export function DashboardFriendsPreview({
  friends,
}: IDashboardFriendsPreviewProps): ReactElement {
  const preview = friends.slice(0, DASHBOARD_FRIENDS_PREVIEW_LIMIT);

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex min-h-11 items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Amigos</h2>
        <Link
          href="/amigos"
          className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver todos
        </Link>
      </div>

      {preview.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay amigos en tu lista.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
          {preview.map((item) => (
            <li key={item.friendshipId} className="min-w-0">
              <div className="flex min-h-11 min-w-0 items-center gap-2 rounded-md px-2">
                <UserAvatar name={item.friend.name} size="sm" />
                <p className="truncate text-sm">{item.friend.name}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
