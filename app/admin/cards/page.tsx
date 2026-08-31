import Link from "next/link";
import { queryMany } from "@/lib/db";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const metadata = { title: "Cards — Admin" };

interface CardRow {
  id: string;
  card_code: string;
  status: string;
  owner_id: string | null;
  activated_at: string | null;
  created_at: string;
}

export default async function AdminCardsPage() {
  const cards = await queryMany<CardRow>(
    "SELECT id, card_code, status, owner_id, activated_at, created_at FROM cards ORDER BY created_at DESC LIMIT 100"
  );

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading">All Cards</h2>
          <p className="text-body mt-0.5">{cards.length} cards</p>
        </div>
        <Link href="/admin/cards/generate">
          <Button>Generate Cards</Button>
        </Link>
      </div>

      <div className="surface overflow-hidden">
        <table className="w-full text-[0.875rem]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}>
              {["Card Code", "Status", "Owner", "Created", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-label font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cards.map((card, i) => (
              <tr
                key={card.id}
                style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : undefined }}
                className="hover:bg-[var(--color-bg)] transition-base"
              >
                <td className="px-4 py-3">
                  <span className="text-mono font-medium">{card.card_code}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={card.status as "active" | "inactive" | "suspended"} />
                </td>
                <td className="px-4 py-3 text-caption">
                  {card.owner_id ? card.owner_id.slice(0, 8) + "…" : "—"}
                </td>
                <td className="px-4 py-3 text-caption">
                  {format(new Date(card.created_at), "d MMM yyyy")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/cards/${card.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cards.length === 0 && (
          <p className="text-caption text-center py-8">No cards generated yet.</p>
        )}
      </div>
    </div>
  );
}
