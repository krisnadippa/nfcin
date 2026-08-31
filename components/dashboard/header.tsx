"use client";

import { usePathname } from "next/navigation";

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
}

export function DashboardHeader({ displayName }: HeaderProps) {
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

      {/* User avatar — desktop only */}
      <div className="hidden lg:flex items-center gap-2">
        <div
          className="size-7 rounded-full flex items-center justify-center text-[0.75rem] font-semibold text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
