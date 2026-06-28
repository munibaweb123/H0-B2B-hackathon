"use client";

import { usePathname } from "next/navigation";
import { Search, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/properties": "Properties",
  "/clients": "Clients",
  "/pipeline": "Sales Pipeline",
  "/ai-chat": "AI Chat",
  "/whatsapp": "WhatsApp",
  "/site-visits": "Site Visits",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return title;
  }
  return "PropFlow";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-white px-4 sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="-ml-1 rounded-md p-2 text-maroon-dark hover:bg-maroon-dark/5 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="flex-1 truncate font-serif text-lg font-semibold text-maroon-dark sm:text-xl">
        {title}
      </h1>

      <div className="relative hidden w-64 md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Search..."
          className="pl-9 bg-cream border-border h-9 text-sm"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-maroon-medium text-white text-xs">
              {user ? getInitials(user.full_name) : "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-text-primary hidden sm:block">
            {user?.full_name ?? ""}
          </span>
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={logout} className="text-destructive">
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
