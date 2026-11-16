import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { DEVICE_COOKIE, deviceCookieOptions, newDeviceCookie, verifyDeviceCookie } from "@/lib/device";

const isProtectedRoute = createRouteMatcher(["/onboarding", "/dashboard(.*)", "/board(.*)"]);
const isScanRoute = createRouteMatcher(["/r/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();

  // Diners: make sure the signed device cookie exists (180 days).
  if (isScanRoute(req)) {
    const valid = await verifyDeviceCookie(req.cookies.get(DEVICE_COOKIE)?.value);
    if (!valid) {
      const res = NextResponse.next();
      const { value } = await newDeviceCookie();
      res.cookies.set(DEVICE_COOKIE, value, deviceCookieOptions);
      return res;
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
