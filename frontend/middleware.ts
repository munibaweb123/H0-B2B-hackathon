import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// localStorage is client-side only — auth redirect is handled in (app)/layout.tsx via useAuth().
// This middleware only exists as the entry point for future cookie-based token upgrades.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
