"use client";

import { usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
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

export function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const title = getPageTitle(pathname);

  return (
    <header className="h-16 bg-white border-b border-border flex items-center px-6 gap-4">
      <h1 className="font-serif text-xl font-semibold text-maroon-dark flex-1">
        {title}
      </h1>

      <div className="relative w-64">
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
