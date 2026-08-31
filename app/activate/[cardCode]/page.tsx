import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Nfc } from "lucide-react";
import { queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { ActivationWizard } from "./activation-wizard";

interface Props {
  params: Promise<{ cardCode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cardCode } = await params;
  return {
    title: `Activate ${cardCode} — NFC Smart Profile`,
  };
}

export default async function ActivatePage({ params }: Props) {
  const { cardCode } = await params;
  const session = await getSession();

  // Look up the card using Neon
  const card = await queryOne<{
    id: string;
    card_code: string;
    status: string;
    owner_id: string | null;
  }>(
    "SELECT id, card_code, status, owner_id FROM cards WHERE card_code = $1",
    [cardCode.toUpperCase()]
  );

  if (!card) {
    notFound();
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container-page">
          <div className="flex items-center h-14">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <span
                className="flex items-center justify-center size-7 rounded-[var(--radius-sm)] text-white text-[0.6875rem] font-bold"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                NFC
              </span>
              <span className="font-semibold text-[0.875rem] text-[var(--color-fg)]">
                Smart Profile
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-page py-10 max-w-2xl">
        {card.status === "active" && card.owner_id !== session?.userId ? (
          // Card already claimed by someone else
          <div className="surface p-8 text-center">
            <div
              className="mx-auto mb-5 flex items-center justify-center size-12 rounded-[var(--radius-lg)] border"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-bg)",
              }}
            >
              <Nfc size={22} strokeWidth={1.5} style={{ color: "var(--color-muted)" }} />
            </div>
            <h1 className="text-subheading mb-2">Card Already Activated</h1>
            <p className="text-body">
              This card has already been activated by another account.
            </p>
          </div>
        ) : card.status === "suspended" ? (
          // Card suspended
          <div className="surface p-8 text-center">
            <div
              className="mx-auto mb-5 flex items-center justify-center size-12 rounded-[var(--radius-lg)] border"
              style={{
                borderColor: "#FECACA",
                backgroundColor: "var(--color-danger-bg)",
              }}
            >
              <Nfc size={22} strokeWidth={1.5} style={{ color: "var(--color-danger)" }} />
            </div>
            <h1 className="text-subheading mb-2">Card Suspended</h1>
            <p className="text-body">
              This card has been suspended. Please contact support.
            </p>
          </div>
        ) : (
          // Valid — show wizard
          <ActivationWizard
            card={{ id: card.id, card_code: card.card_code, status: card.status }}
            user={session ? { id: session.userId, email: session.email } : null}
          />
        )}
      </main>
    </div>
  );
}
