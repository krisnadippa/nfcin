import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import { StatusBadge } from "@/components/ui/badge";
import { QRCodeDisplay } from "@/components/admin/qr-code";
import { getNfcUrl, getActivationUrl } from "@/lib/utils/url";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NfcWriter } from "@/components/admin/nfc-writer";

interface Props {
  params: Promise<{ cardId: string }>;
}

export default async function AdminCardDetailPage({ params }: Props) {
  const { cardId } = await params;

  const card = await queryOne<{
    id: string;
    card_code: string;
    status: string;
    owner_id: string | null;
    activated_at: string | null;
    created_at: string;
    action_type: string | null;
    destination_url: string | null;
    profile_username: string | null;
    profile_name: string | null;
  }>(
    `SELECT 
      c.id, 
      c.card_code, 
      c.status, 
      c.owner_id, 
      c.activated_at, 
      c.created_at,
      ca.action_type,
      ca.destination_url,
      p.username AS profile_username,
      p.name AS profile_name
     FROM cards c
     LEFT JOIN card_actions ca ON ca.card_id = c.id
     LEFT JOIN profiles p ON p.id = c.profile_id
     WHERE c.id = $1`,
    [cardId]
  );

  if (!card) notFound();

  const nfcUrl = getNfcUrl(card.card_code);
  const activationUrl = getActivationUrl(card.card_code);

  const rows = [
    { label: "Card Code", value: <span className="text-mono">{card.card_code}</span> },
    { label: "Status", value: <StatusBadge status={card.status as "active" | "inactive" | "suspended"} /> },
    { label: "Owner ID", value: card.owner_id ? <span className="text-mono text-[0.8125rem]">{card.owner_id}</span> : "—" },
    { label: "Profile", value: card.profile_username ? `@${card.profile_username}` : "—" },
    { label: "NFC Action", value: card.action_type ?? "—" },
    { label: "Destination", value: card.destination_url ?? (card.profile_username ? `/p/${card.profile_username}` : "—") },
    { label: "Created", value: format(new Date(card.created_at), "d MMMM yyyy") },
    { label: "Activated", value: card.activated_at ? format(new Date(card.activated_at), "d MMMM yyyy") : "—" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link href="/admin/cards" className="flex items-center gap-2 text-caption hover:text-[var(--color-fg)] transition-base no-underline w-fit">
        <ArrowLeft size={14} />
        Back to Cards
      </Link>

      <div>
        <h2 className="text-heading">{card.card_code}</h2>
        <p className="text-body mt-0.5">Card details and provisioning information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info table */}
        <div className="surface overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-4 px-4 py-3"
              style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : undefined }}
            >
              <span className="text-caption shrink-0">{row.label}</span>
              <span className="text-label text-right">{row.value}</span>
            </div>
          ))}
        </div>

        {/* QR codes */}
        <div className="flex flex-col gap-4">
          <NfcWriter nfcUrl={nfcUrl} cardCode={card.card_code} />

          <div className="surface p-5">
            <p className="text-label mb-1">Activation QR Code</p>
            <p className="text-caption mb-4">
              Print and attach to card packaging. Customer scans this to activate.
            </p>
            <QRCodeDisplay url={activationUrl} filename={`activate-${card.card_code}`} />
          </div>

          <div className="surface p-5">
            <p className="text-label mb-1">NFC URL</p>
            <p className="text-caption mb-2">Write this URL to the NTAG chip.</p>
            <p className="text-mono text-[0.8125rem] break-all" style={{ color: "var(--color-secondary)" }}>
              {nfcUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
