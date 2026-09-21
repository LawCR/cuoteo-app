import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/core/db";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import type { User } from "@/generated/prisma/client";

export async function getAppUser(): Promise<User | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
}

export async function requireAppUser(): Promise<User> {
  const { userId } = await auth.protect();

  if (!userId) {
    throw new UnauthorizedError("missing_clerk_user");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    redirect("/onboarding");
  }

  return user;
}
