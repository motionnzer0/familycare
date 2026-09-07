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
  Pill,
  Shield,
  StickyNote,
  Sun,
  Users,
  Settings,
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
    label: "Medications",
    href: "/medications",
    icon: Pill,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Notes",
    href: "/notes",
    icon: StickyNote,
  },
  {
    label: "Care Team",
    href: "/team",
    icon: Users,
  },
  {
    label: "Care Profile",
    href: "/care",
    icon: Heart,
  },
  {
    label: "Updates",
    href: "/updates",
    icon: History,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Emergency",
    href: "/emergency",
    icon: Shield,
    isEmergency: true,
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
            pathname === item.href || (item.href !== "/today" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-touch",
                item.isEmergency && "text-red-800 hover:bg-red-50",
                isActive
                  ? item.isEmergency
                    ? "bg-red-700 text-white shadow-sm font-bold"
                    : "bg-brand text-white shadow font-bold ring-1 ring-brand/20"
                  : "text-content hover:bg-surface hover:text-content font-medium"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white stroke-[2.2]" : "text-content-muted")} />
              <span className={isActive ? "text-white font-bold" : "text-content"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
