import { clerkMiddleware } from "@clerk/nextjs/server";
import { isClerkHandshakePath } from "@/core/auth/clerk-handshake.utils";
import { isPublicPath } from "@/core/auth/public-path.utils";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (isClerkHandshakePath(req.nextUrl.searchParams) || isPublicPath(pathname)) {
    return;
  }

  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
