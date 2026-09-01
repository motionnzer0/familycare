"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  FileText,
  Heart,
  History,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAVIGATION_ITEMS = [
  {
    label: "Today",
    href: "/today",
    icon: Sun,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Care",
    href: "/care",
    icon: Heart,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Updates",
    href: "/updates",
    icon: History,
  },
];

export function NavigationRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main Navigation"
      className="hidden md:flex flex-col w-64 border-r border-border bg-surface-subtle p-4 space-y-1 min-h-[calc(100vh-4rem)]"
    >
      <div className="space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors min-h-touch",
                isActive
                  ? "bg-brand text-white font-semibold shadow-sm"
                  : "text-content-muted hover:bg-surface hover:text-content"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
