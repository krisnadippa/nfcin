import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { queryOne } from "@/lib/db";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEMPLATE_MAP, ACTION_TYPE_OPTIONS } from "@/constants/templates";
import { getNfcUrl } from "@/lib/utils/url";
import { format } from "date-fns";

interface Props {
  params: Promise<{ cardId: string }>;
}

export default async function CardDetailPage({ params }: Props) {
  const { cardId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch card, profile, and action using custom Neon JOIN
  const card = await queryOne<{
    id: string;
    card_code: string;
    status: string;
    activated_at: string | null;
    owner_id: string;
    profile_id: string | null;
    username: string | null;
    profile_name: string | null;
    template: string | null;
    company_name: string | null;
    action_type: string | null;
    destination_url: string | null;
  }>(
    `SELECT 
      c.id, 
      c.card_code, 
      c.status, 
      c.activated_at, 
      c.owner_id,
      c.profile_id,
      p.username,
      p.name AS profile_name,
      p.template,
      p.company_name,
      ca.action_type,
      ca.destination_url
     FROM cards c
     LEFT JOIN profiles p ON p.id = c.profile_id
     LEFT JOIN card_actions ca ON ca.card_id = c.id
     WHERE c.id = $1 AND c.owner_id = $2`,
    [cardId, session.userId]
  );

  if (!card) notFound();

  const templateConfig = card.template
    ? TEMPLATE_MAP[card.template as keyof typeof TEMPLATE_MAP]
    : null;

  const actionLabel = card.action_type
    ? ACTION_TYPE_OPTIONS.find((o) => o.value === card.action_type)?.label ?? card.action_type
    : "—";

  const nfcUrl = getNfcUrl(card.card_code);

  const infoRows = [
    { label: "Card ID", value: card.card_code },
    { label: "Status", value: <StatusBadge status={card.status as "active" | "inactive" | "suspended"} /> },
    { label: "Experience", value: templateConfig?.label ?? "—" },
    { label: "NFC Action", value: actionLabel },
    {
      label: "Destination",
      value: card.destination_url
        ? card.destination_url.replace("https://", "")
        : card.username
        ? `/p/${card.username}`
        : "—",
    },
    {
      label: "NFC URL",
      value: (
        <span className="text-mono text-[0.8125rem]">{nfcUrl}</span>
      ),
    },
    {
      label: "Activation Date",
      value: card.activated_at
        ? format(new Date(card.activated_at), "d MMMM yyyy")
        : "—",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {/* Back */}
      <Link
        href="/dashboard/cards"
        className="flex items-center gap-2 text-caption hover:text-[var(--color-fg)] transition-base no-underline w-fit"
      >
        <ArrowLeft size={14} />
        Back to Cards
      </Link>

      <div>
        <h2 className="text-heading">{card.card_code}</h2>
        <p className="text-body mt-0.5">Card details and configuration.</p>
      </div>

      {/* Card info */}
      <div className="surface overflow-hidden">
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 px-5 py-3"
            style={{
              borderTop: i > 0 ? "1px solid var(--color-border)" : undefined,
            }}
          >
            <span className="text-caption shrink-0">{row.label}</span>
            <span className="text-label text-right">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {card.username && (
          <Link href={`/p/${card.username}`} target="_blank">
            <Button variant="secondary" size="sm">
              View Profile
              <ExternalLink size={14} />
            </Button>
          </Link>
        )}
        <Link href={`/dashboard/analytics`}>
          <Button variant="secondary" size="sm">
            View Analytics
          </Button>
        </Link>
        <Link href={`/dashboard/links`}>
          <Button variant="secondary" size="sm">
            Edit Links
          </Button>
        </Link>
      </div>
    </div>
  );
}
