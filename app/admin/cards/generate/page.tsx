"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { generateCardsAction, registerCustomCardAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GenerateCardsPage() {
  const [bulkState, bulkAction, bulkPending] = useActionState(generateCardsAction, null);
  const [singleState, singleAction, singlePending] = useActionState(registerCustomCardAction, null);

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <Link
        href="/admin/cards"
        className="flex items-center gap-2 text-caption hover:text-[var(--color-fg)] transition-base no-underline w-fit"
      >
        <ArrowLeft size={14} />
        Back to Cards
      </Link>

      <div>
        <h2 className="text-heading">Provision Cards</h2>
        <p className="text-body mt-0.5">
          Bulk generate sequential cards or register a single custom card ID.
        </p>
      </div>

      {/* Bulk Generate Card */}
      <div className="surface p-6 flex flex-col gap-4">
        <div>
          <p className="text-label">Option A: Bulk Generate Sequential Cards</p>
          <p className="text-caption mt-0.5">Automatically create new sequential codes (e.g. NFC-000001).</p>
        </div>

        {bulkState?.count && (
          <div
            className="rounded-[var(--radius-md)] border p-3 flex items-center gap-2.5"
            style={{
              borderColor: "#BBF7D0",
              backgroundColor: "var(--color-success-bg)",
            }}
          >
            <Check size={16} style={{ color: "var(--color-success)" }} />
            <p className="text-[0.8125rem]" style={{ color: "var(--color-success)" }}>
              {bulkState.count} sequential card{bulkState.count !== 1 ? "s" : ""} generated successfully.
            </p>
          </div>
        )}

        {bulkState?.error && (
          <div
            className="rounded-[var(--radius-md)] border p-3 text-[0.8125rem]"
            style={{
              borderColor: "#FECACA",
              backgroundColor: "var(--color-danger-bg)",
              color: "var(--color-danger)",
            }}
          >
            {bulkState.error}
          </div>
        )}

        <form action={bulkAction} className="flex flex-col gap-3">
          <Input
            label="Quantity"
            name="quantity"
            type="number"
            min={1}
            max={500}
            defaultValue={10}
          />
          <Button type="submit" loading={bulkPending}>
            Generate Bulk Cards
          </Button>
        </form>
      </div>

      {/* Register Custom Card */}
      <div className="surface p-6 flex flex-col gap-4">
        <div>
          <p className="text-label">Option B: Register Single Custom Card ID</p>
          <p className="text-caption mt-0.5">Register an existing physical card ID (e.g. GLORIOUS-NFC-99) into the database.</p>
        </div>

        {singleState?.success && (
          <div
            className="rounded-[var(--radius-md)] border p-3 flex items-center gap-2.5"
            style={{
              borderColor: "#BBF7D0",
              backgroundColor: "var(--color-success-bg)",
            }}
          >
            <Check size={16} style={{ color: "var(--color-success)" }} />
            <p className="text-[0.8125rem]" style={{ color: "var(--color-success)" }}>
              Custom card code <strong>{singleState.code}</strong> registered successfully.
            </p>
          </div>
        )}

        {singleState?.error && (
          <div
            className="rounded-[var(--radius-md)] border p-3 text-[0.8125rem]"
            style={{
              borderColor: "#FECACA",
              backgroundColor: "var(--color-danger-bg)",
              color: "var(--color-danger)",
            }}
          >
            {singleState.error}
          </div>
        )}

        <form action={singleAction} className="flex flex-col gap-3">
          <Input
            label="Card Code / ID"
            name="cardCode"
            placeholder="e.g. GLORIOUS-NFC-99"
            required
          />
          <Button type="submit" loading={singlePending}>
            Register Custom Card
          </Button>
        </form>
      </div>

      <div className="surface p-5">
        <p className="text-label mb-3">After Provisioning</p>
        <div className="flex flex-col gap-2 text-caption">
          <p>1. Cards are initialized with status: <strong>Inactive</strong></p>
          <p>2. To connect the physical card to this local system, write this URL to the card: <code className="text-mono">{"http://<your-computer-ip>:3000/go/<card-id>"}</code></p>
          <p>3. Scanning/tapping the inactive card will launch the activation wizard</p>
        </div>
      </div>
    </div>
  );
}
