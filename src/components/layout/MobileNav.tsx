"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  FileText,
  Heart,
  MoreHorizontal,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY_MOBILE_ITEMS = [
  { label: "Today", href: "/today", icon: Sun },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Care", href: "/care", icon: Heart },
  { label: "More", href: "/documents", icon: MoreHorizontal },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden h-16 border-t border-border bg-surface px-2 justify-around items-center"
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
              "flex flex-col items-center justify-center min-w-[56px] min-h-touch py-1 px-2 rounded text-xs transition-colors",
              isActive
                ? "text-brand font-bold"
                : "text-content-muted hover:text-content"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-5 w-5 mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
