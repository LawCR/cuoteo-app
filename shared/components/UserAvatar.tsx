"use client";

import type { ReactElement } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { getNameInitials } from "@/shared/utils/name.utils";
import { cn } from "@/shared/utils/cn.utils";

interface IUserAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function UserAvatar({
  name,
  imageUrl,
  size = "lg",
  className,
}: IUserAvatarProps): ReactElement {
  return (
    <Avatar size={size} className={cn("bg-muted", className)}>
      {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
      <AvatarFallback className="font-medium">
        {getNameInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
