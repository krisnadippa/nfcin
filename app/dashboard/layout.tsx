import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { queryOne } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch user profile for display name using Neon
  const profile = await queryOne<{ name: string; username: string; avatar_url: string | null }>(
    "SELECT name, username, avatar_url FROM profiles WHERE user_id = $1",
    [session.userId]
  );

  const displayName =
    profile?.name ?? session.email.split("@")[0] ?? "User";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Sidebar — desktop only */}
      <DashboardSidebar displayName={displayName} userEmail={session.email} isAdmin={session.role === "admin"} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        <DashboardHeader displayName={displayName} isAdmin={session.role === "admin"} />
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <MobileNav />
    </div>
  );
}
