import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { queryMany } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { format, subDays, startOfDay } from "date-fns";
import { BarChart2, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Analytics",
};

interface AnalyticsEventRow {
  event_type: string;
  destination: string | null;
  created_at: string;
  card_code: string | null;
}

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch all analytics events for user's owned cards and profiles
  // We can select events where card's owner_id = userId OR profile's user_id = userId
  const events = await queryMany<AnalyticsEventRow>(
    `SELECT 
      ae.event_type, 
      ae.destination, 
      ae.created_at,
      c.card_code
     FROM analytics_events ae
     LEFT JOIN cards c ON c.id = ae.card_id
     LEFT JOIN profiles p ON p.id = ae.profile_id
     WHERE c.owner_id = $1 OR p.user_id = $1
     ORDER BY ae.created_at DESC
     LIMIT 500`,
    [session.userId]
  );

  // Get active card count
  const cards = await queryMany<{ id: string }>(
    "SELECT id FROM cards WHERE owner_id = $1",
    [session.userId]
  );
  const cardCount = cards.length;

  const tapEvents = events.filter((e) => e.event_type === "tap");
  const viewEvents = events.filter((e) => e.event_type === "profile_view");

  // Build last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i));
    const dateStr = format(date, "yyyy-MM-dd");
    const dayTaps = tapEvents.filter(
      (e) => format(new Date(e.created_at), "yyyy-MM-dd") === dateStr
    ).length;
    return { date: format(date, "EEE"), taps: dayTaps };
  });

  const maxTaps = Math.max(...last7.map((d) => d.taps), 1);

  const hasData = events.length > 0;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-heading">Analytics</h2>
        <p className="text-body mt-0.5">Track your NFC card taps and profile views.</p>
      </div>

      {!hasData ? (
        <div className="surface">
          <EmptyState
            icon={BarChart2}
            title="No activity yet"
            description="Tap your NFC card to start collecting analytics data."
          />
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Total Taps", value: tapEvents.length },
              { label: "Profile Views", value: viewEvents.length },
              { label: "Cards Tracked", value: cardCount },
            ].map((m) => (
              <div key={m.label} className="surface p-4">
                <p className="text-caption mb-1">{m.label}</p>
                <p
                  className="text-[1.5rem] font-semibold"
                  style={{ color: "var(--color-fg)" }}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* 7-day tap chart */}
          <div className="surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} strokeWidth={1.5} style={{ color: "var(--color-muted)" }} />
              <p className="text-label">Taps — Last 7 Days</p>
            </div>
            <div className="flex items-end gap-2 h-32">
              {last7.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-[var(--radius-sm)] transition-base"
                    style={{
                      height: `${Math.round((day.taps / maxTaps) * 100)}%`,
                      minHeight: day.taps > 0 ? 4 : 2,
                      backgroundColor:
                        day.taps > 0
                          ? "var(--color-primary)"
                          : "var(--color-border)",
                    }}
                  />
                  <span className="text-[0.625rem]" style={{ color: "var(--color-muted)" }}>
                    {day.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent taps */}
          {tapEvents.length > 0 && (
            <div className="surface p-5">
              <p className="text-label mb-4">Recent Taps</p>
              <div className="flex flex-col gap-2">
                {tapEvents.slice(0, 10).map((event, i) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 py-2"
                      style={{
                        borderTop: i > 0 ? "1px solid var(--color-border)" : undefined,
                      }}
                    >
                      <div>
                        <p className="text-label">{event.card_code ?? "Unknown Card"}</p>
                        {event.destination && (
                          <p className="text-caption">
                            {event.destination.replace("https://", "")}
                          </p>
                        )}
                      </div>
                      <span className="text-caption shrink-0">
                        {format(new Date(event.created_at), "d MMM, HH:mm")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
