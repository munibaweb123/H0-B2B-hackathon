"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Kanban,
  Bot,
  MessageCircle,
  CalendarCheck,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: Kanban },
  { label: "AI Chat", href: "/ai-chat", icon: Bot },
  { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
  { label: "Site Visits", href: "/site-visits", icon: CalendarCheck },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-maroon-dark flex flex-col z-30">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <span className="font-serif text-2xl font-bold text-white tracking-tight">
          PropFlow
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors " +
                (active
                  ? "bg-maroon-medium text-white border-l-4 border-blush pl-2"
                  : "text-white/70 hover:bg-maroon-medium/60 hover:text-white")
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
