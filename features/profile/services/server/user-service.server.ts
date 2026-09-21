import { prisma } from "@/core/db";
import { ConflictError } from "@/core/errors/conflict.error";
import { Prisma, type User } from "@/generated/prisma/client";
import type { ICompleteOnboardingInput } from "@/features/profile/interfaces/complete-onboarding.interface";
import { normalizeUsername } from "@/features/profile/utils/profile.utils";

function uniqueFieldFromMeta(target: unknown): string | null {
  if (!Array.isArray(target) || target.length === 0) {
    return null;
  }

  const [first] = target;
  return typeof first === "string" ? first : null;
}

export async function completeOnboarding(
  input: ICompleteOnboardingInput,
): Promise<User> {
  const usernameNormalized = normalizeUsername(input.username);
  const name = input.name.trim();
  const username = input.username.trim();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { clerkUserId: input.clerkUserId },
        { email: input.email },
        { usernameNormalized },
        { phone: input.phone },
      ],
    },
  });

  if (existing) {
    if (existing.clerkUserId === input.clerkUserId) {
      return existing;
    }

    if (existing.usernameNormalized === usernameNormalized) {
      throw new ConflictError("username_taken", { field: "username" });
    }

    if (existing.phone === input.phone) {
      throw new ConflictError("phone_taken", { field: "phone" });
    }

    throw new ConflictError("email_taken", { field: "email" });
  }

  try {
    return await prisma.user.create({
      data: {
        clerkUserId: input.clerkUserId,
        email: input.email,
        name,
        username,
        usernameNormalized,
        phone: input.phone,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const field = uniqueFieldFromMeta(error.meta?.target);
      throw new ConflictError("unique_constraint", {
        field: field ?? "unknown",
      });
    }

    throw error;
  }
}
