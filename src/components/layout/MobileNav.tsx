"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  FileText,
  Pill,
  Shield,
  Sun,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY_MOBILE_ITEMS = [
  { label: "Today", href: "/today", icon: Sun },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Meds", href: "/medications", icon: Pill },
  { label: "Docs", href: "/documents", icon: FileText },
  { label: "Team", href: "/team", icon: Users },
  { label: "Emergency", href: "/emergency", icon: Shield, isEmergency: true },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden h-16 border-t border-border bg-surface px-1 justify-around items-center"
    >
      {PRIMARY_MOBILE_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/today" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center min-w-[44px] min-h-touch py-1 px-1.5 rounded text-[11px] transition-colors",
              item.isEmergency && "text-red-700 font-bold",
              isActive
                ? item.isEmergency
                  ? "text-red-800 font-bold bg-red-50/80"
                  : "text-brand font-bold bg-brand-light/30"
                : "text-content-muted hover:text-content font-medium"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className={cn("h-4 w-4 mb-0.5", isActive ? "text-brand stroke-[2.5]" : "text-content-muted")} />
            <span className={cn(isActive && "font-bold text-brand")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
