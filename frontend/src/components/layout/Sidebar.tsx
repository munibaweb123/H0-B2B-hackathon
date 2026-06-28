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
  X,
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

export function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-maroon-dark transition-transform duration-300 ease-in-out lg:translate-x-0 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <span className="font-serif text-2xl font-bold tracking-tight text-white">
            PropFlow
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="-mr-1 rounded-md p-1 text-white/70 hover:bg-maroon-medium/60 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={
                  "flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors " +
                  (active
                    ? "border-l-4 border-blush bg-maroon-medium pl-2 text-white"
                    : "text-white/70 hover:bg-maroon-medium/60 hover:text-white")
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
