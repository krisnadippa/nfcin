import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { queryOne } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import Link from "next/link";
import { Nfc } from "lucide-react";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = await queryOne<{ role: string }>(
    "SELECT role FROM user_roles WHERE user_id = $1",
    [session.userId]
  );

  if (role?.role !== "admin") redirect("/dashboard");
  return session;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)" }}>
      <AdminSidebar userEmail={session.email} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-56">
        <header
          className="h-14 shrink-0 flex items-center justify-between px-6 border-b sticky top-0 z-20"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-[0.6875rem] font-medium uppercase tracking-wide"
              style={{
                backgroundColor: "var(--color-warning-bg)",
                color: "var(--color-warning)",
                border: "1px solid #FEF08A",
              }}
            >
              Admin
            </span>
            <span className="text-caption">{session.email}</span>
          </div>
          <Link
            href="/admin/scan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[0.75rem] font-medium transition-base border no-underline hover:bg-[var(--color-bg)]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-fg)",
            }}
          >
            <Nfc size={14} />
            <span>Scan NFC</span>
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
