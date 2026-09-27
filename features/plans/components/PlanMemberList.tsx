import type { ReactElement, ReactNode } from "react";
import type { IPlanMemberItem } from "@/features/plans/interfaces/plan.interface";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";

interface IPlanMemberListProps {
  members: IPlanMemberItem[];
  creatorUserId: string;
  memberActions?: Record<string, ReactNode>;
  memberMeta?: Record<string, ReactNode>;
}

export function PlanMemberList({
  members,
  creatorUserId,
  memberActions,
  memberMeta,
}: IPlanMemberListProps): ReactElement {
  if (members.length === 0) {
    return (
      <p className="text-muted-foreground">Todavía no hay integrantes.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {members.map((member) => {
        const isGhost = member.userId === null;
        const name = isGhost
          ? (member.ghostName ?? "Invitado")
          : (member.user?.name ?? "Integrante");
        const isCreator = member.userId === creatorUserId;
        const actions = memberActions?.[member.id];
        const meta = memberMeta?.[member.id];

        return (
          <li key={member.id}>
            <Card
              className={
                isGhost ? "border-dashed bg-muted/30 py-4" : "py-4"
              }
            >
              <CardContent className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{name}</p>
                    {meta}
                  </div>
                  {isGhost ? (
                    <p className="text-sm text-muted-foreground">Invitado</p>
                  ) : (
                    <p className="truncate text-sm text-muted-foreground">
                      {member.user?.email}
                    </p>
                  )}
                </div>
                {actions || isCreator ? (
                  <div className="flex shrink-0 items-center gap-2">
                    {actions}
                    {isCreator ? (
                      <Badge variant="secondary">Creador</Badge>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
