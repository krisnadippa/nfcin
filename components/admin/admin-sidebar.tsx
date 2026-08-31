"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Users, LogOut, Nfc } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/actions/auth";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/scan", label: "Scan NFC", icon: Nfc },
  { href: "/admin/cards", label: "Cards", icon: CreditCard },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-56 border-r z-30"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="h-14 flex items-center px-5 border-b shrink-0" style={{ borderColor: "var(--color-border)" }}>
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="flex items-center justify-center size-7 rounded-[var(--radius-sm)] text-white text-[0.6875rem] font-bold" style={{ backgroundColor: "var(--color-primary)" }}>
            NFC
          </span>
          <span className="font-semibold text-[0.875rem] text-[var(--color-fg)]">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[0.875rem] font-medium transition-base no-underline",
                isActive
                  ? "bg-[var(--color-bg)] text-[var(--color-fg)]"
                  : "text-[var(--color-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-fg)]"
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.5} style={{ color: isActive ? "var(--color-fg)" : "var(--color-muted)" }} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t" style={{ borderColor: "var(--color-border)" }}>
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[var(--radius-md)] text-[0.875rem] text-[var(--color-secondary)] hover:bg-[var(--color-bg)] transition-base">
            <LogOut size={16} strokeWidth={1.5} />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
