"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/cards": "My Cards",
  "/dashboard/profiles": "Profiles",
  "/dashboard/links": "Links",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
};

interface HeaderProps {
  displayName: string;
  isAdmin?: boolean;
}

export function DashboardHeader({ displayName, isAdmin }: HeaderProps) {
  const pathname = usePathname();
  const title =
    Object.entries(ROUTE_TITLES)
      .reverse()
      .find(([route]) => pathname.startsWith(route))?.[1] ?? "Dashboard";

  return (
    <header
      className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 border-b sticky top-0 z-20"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <h1 className="text-[0.9375rem] font-semibold" style={{ color: "var(--color-fg)" }}>
        {title}
      </h1>

      <div className="flex items-center gap-2.5">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-md)] text-[0.6875rem] font-semibold uppercase tracking-wide border no-underline transition-base"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-fg)",
            }}
          >
            <Shield size={12} className="text-[var(--color-primary)]" />
            <span>Admin</span>
          </Link>
        )}
        <div
          className="size-7 rounded-full flex items-center justify-center text-[0.75rem] font-semibold text-white shrink-0"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
