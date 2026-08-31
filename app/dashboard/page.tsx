import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Nfc, BarChart2, Eye, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { queryOne, queryMany } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { ActivateCardForm } from "@/components/dashboard/activate-card-form";

async function getDashboardStats(userId: string) {
  // Query counts using native postgres joins/filters
  const cards = await queryMany<{ id: string; status: string }>(
    "SELECT id, status FROM cards WHERE owner_id = $1",
    [userId]
  );

  const cardIds = cards.map((c) => c.id);

  let totalTaps = 0;
  if (cardIds.length > 0) {
    const taps = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM analytics_events 
       WHERE event_type = 'tap' AND card_id = ANY($1::uuid[])`,
      [cardIds]
    );
    totalTaps = parseInt(taps?.count ?? "0", 10);
  }

  // Get user's profiles
  const profiles = await queryMany<{ id: string }>(
    "SELECT id FROM profiles WHERE user_id = $1",
    [userId]
  );
  const profileIds = profiles.map((p) => p.id);

  let profileViews = 0;
  if (profileIds.length > 0) {
    const views = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM analytics_events 
       WHERE event_type = 'profile_view' AND profile_id = ANY($1::uuid[])`,
      [profileIds]
    );
    profileViews = parseInt(views?.count ?? "0", 10);
  }

  return {
    totalCards: cards.length,
    activeCards: cards.filter((c) => c.status === "active").length,
    totalTaps,
    profileViews,
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const stats = await getDashboardStats(session.userId);

  const profile = await queryOne<{ name: string }>(
    "SELECT name FROM profiles WHERE user_id = $1",
    [session.userId]
  );

  const displayName = profile?.name ?? session.email.split("@")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const statCards = [
    { label: "Total Cards", value: stats.totalCards, icon: CreditCard },
    { label: "Active Cards", value: stats.activeCards, icon: Nfc },
    { label: "Total Taps", value: stats.totalTaps, icon: BarChart2 },
    { label: "Profile Views", value: stats.profileViews, icon: Eye },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Greeting */}
      <div>
        <h2 className="text-heading">
          {greeting}, {displayName.split(" ")[0]}.
        </h2>
        <p className="text-body mt-1">
          Manage your NFC cards and digital profiles.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="surface p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-caption">{stat.label}</p>
                <Icon
                  size={16}
                  strokeWidth={1.5}
                  style={{ color: "var(--color-muted)" }}
                />
              </div>
              <p
                className="text-[1.75rem] font-semibold leading-none"
                style={{ color: "var(--color-fg)" }}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Manual activation form */}
      <div className="max-w-md">
        <ActivateCardForm />
      </div>

      {/* Empty state for no cards */}
      {stats.totalCards === 0 && (
        <div className="surface">
          <EmptyState
            icon={CreditCard}
            title="No NFC cards yet"
            description="Your NFC cards will appear here after activation. Scan the QR code on your card to get started."
            action={
              <Link href="/dashboard/cards">
                <Button>Activate Card</Button>
              </Link>
            }
          />
        </div>
      )}

      {/* Quick actions */}
      {stats.totalCards > 0 && (
        <div className="surface p-5">
          <p className="text-label mb-4">Quick Actions</p>
          <div className="flex flex-col gap-1.5">
            {[
              {
                href: "/dashboard/cards",
                label: "View My Cards",
                desc: "Manage and monitor your NFC cards",
              },
              {
                href: "/dashboard/links",
                label: "Edit Links",
                desc: "Update the links on your profile",
              },
              {
                href: "/dashboard/analytics",
                label: "View Analytics",
                desc: "See tap history and profile views",
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-bg)] transition-base no-underline"
              >
                <div>
                  <p className="text-label">{action.label}</p>
                  <p className="text-caption">{action.desc}</p>
                </div>
                <ArrowRight
                  size={16}
                  style={{ color: "var(--color-muted)" }}
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
