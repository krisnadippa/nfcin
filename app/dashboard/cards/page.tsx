import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Nfc, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { queryMany } from "@/lib/db";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { TEMPLATE_MAP, ACTION_TYPE_OPTIONS } from "@/constants/templates";
import { format } from "date-fns";

export const metadata = {
  title: "My Cards",
};

interface CardRow {
  id: string;
  card_code: string;
  status: string;
  activated_at: string | null;
  profile_name: string | null;
  profile_template: string | null;
  profile_company_name: string | null;
  action_type: string | null;
}

export default async function CardsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch all user's cards, profiles, and card actions with a single clean JOIN
  const cards = await queryMany<CardRow>(
    `SELECT 
      c.id, 
      c.card_code, 
      c.status, 
      c.activated_at,
      p.name AS profile_name,
      p.template AS profile_template,
      p.company_name AS profile_company_name,
      ca.action_type
     FROM cards c
     LEFT JOIN profiles p ON p.id = c.profile_id
     LEFT JOIN card_actions ca ON ca.card_id = c.id
     WHERE c.owner_id = $1
     ORDER BY c.activated_at DESC`,
    [session.userId]
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading">My NFC Cards</h2>
          <p className="text-body mt-0.5">
            {cards.length} card{cards.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={CreditCard}
            title="No NFC cards yet"
            description="Your NFC cards will appear here after activation."
            action={
              <p className="text-caption">
                Scan the QR code on your card packaging to activate it.
              </p>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cards.map((card) => {
            const templateConfig = card.profile_template
              ? TEMPLATE_MAP[card.profile_template as keyof typeof TEMPLATE_MAP]
              : null;
            const actionLabel = card.action_type
              ? ACTION_TYPE_OPTIONS.find((o) => o.value === card.action_type)
                  ?.label ?? card.action_type
              : "—";
            const displayName =
              card.profile_template === "company"
                ? card.profile_company_name
                : card.profile_name;

            return (
              <div
                key={card.id}
                className="surface p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Card icon */}
                <div
                  className="flex items-center justify-center size-10 rounded-[var(--radius-md)] border shrink-0"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                  }}
                >
                  <Nfc size={18} strokeWidth={1.5} style={{ color: "var(--color-secondary)" }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-mono font-medium text-[0.875rem]">
                      {card.card_code}
                    </span>
                    <StatusBadge status={card.status as "active" | "inactive" | "suspended"} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                    {templateConfig && (
                      <span className="text-caption">
                        {templateConfig.label}
                      </span>
                    )}
                    {displayName && (
                      <span className="text-caption">{displayName}</span>
                    )}
                    <span className="text-caption">
                      NFC: {actionLabel}
                    </span>
                    {card.activated_at && (
                      <span className="text-caption">
                        Activated {format(new Date(card.activated_at), "d MMM yyyy")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Manage button */}
                <Link href={`/dashboard/cards/${card.id}`}>
                  <Button variant="secondary" size="sm">
                    Manage
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
