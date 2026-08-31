import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for NFC Smart Profile. One card, unlimited possibilities.",
};

const FEATURES = [
  "1 NFC card (physical)",
  "Unlimited destination changes",
  "Profile page",
  "Up to 20 links",
  "QR code activation",
  "Basic analytics",
  "All profile templates",
];

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="container-page max-w-3xl">
        <div className="mb-12">
          <p className="text-caption mb-2" style={{ color: "var(--color-muted)" }}>
            Pricing
          </p>
          <h1 className="text-heading mb-3">Simple Pricing</h1>
          <p className="text-body">
            Pay once for the physical card. No subscription required.
          </p>
        </div>

        {/* Single plan card */}
        <div className="surface p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-subheading mb-1">NFC Smart Profile Card</h2>
              <p className="text-caption">
                Physical NFC card with lifetime digital profile access.
              </p>
            </div>
            <div className="shrink-0">
              <span className="text-display">Rp 149K</span>
              <span className="text-caption ml-2">/ card</span>
            </div>
          </div>

          <div className="divider mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <Check
                  size={15}
                  strokeWidth={2}
                  style={{ color: "var(--color-success)" }}
                />
                <span className="text-caption">{feature}</span>
              </div>
            ))}
          </div>

          <Link href="/register">
            <Button size="lg" fullWidth>
              Get Started
            </Button>
          </Link>
        </div>

        <p className="text-caption text-center">
          Already have a card?{" "}
          <Link
            href="/login"
            className="text-[var(--color-fg)] underline underline-offset-2"
          >
            Log in to activate it.
          </Link>
        </p>
      </div>
    </div>
  );
}
