import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Nfc, QrCode, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "NFC Smart Profile — One Tap. Your Digital Identity.",
  description:
    "One NFC card connects your audience to your profile, social media, website, CV, or any digital destination. No app required.",
};

// ─── How It Works ─────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    icon: QrCode,
    title: "Get Your Card",
    description:
      "Order your NFC Smart Profile card. Each card comes with a unique code and activation QR.",
  },
  {
    number: "02",
    icon: Nfc,
    title: "Scan & Activate",
    description:
      "Scan the QR code on your card packaging. Create your account and start the activation process.",
  },
  {
    number: "03",
    icon: Settings,
    title: "Customize Your Profile",
    description:
      "Choose a profile type, fill in your information, add your links, and set your NFC destination.",
  },
  {
    number: "04",
    icon: Zap,
    title: "Tap & Connect",
    description:
      "Your card is live. Anyone who taps it is redirected instantly to your configured destination.",
  },
];

// ─── Use Cases ────────────────────────────────────────────────

const USE_CASES = [
  {
    label: "Personal Branding",
    description:
      "Share your online presence with a single tap. Connect people to your social profiles, website, and contact info.",
  },
  {
    label: "Creator",
    description:
      "Point your audience to your content hub — YouTube, Instagram, TikTok, and more — all in one place.",
  },
  {
    label: "Professional",
    description:
      "Replace paper business cards. Share your LinkedIn, email, and portfolio with anyone, instantly.",
  },
  {
    label: "Business",
    description:
      "Let customers discover your products, menu, or social channels by tapping a card at your counter.",
  },
  {
    label: "Portfolio",
    description:
      "Showcase your work at events or interviews. One tap reveals your best projects and contact details.",
  },
  {
    label: "CV / Resume",
    description:
      "Hand over a card at a job fair and let employers tap to view your full digital resume instantly.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="py-24 md:py-32"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="container-page">
          <div className="max-w-2xl">
            {/* Label */}
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 mb-8"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <Nfc
                size={14}
                style={{ color: "var(--color-muted)" }}
                strokeWidth={1.5}
              />
              <span className="text-caption">NFC Smart Profile</span>
            </div>

            <h1 className="text-display mb-5">
              One Tap.
              <br />
              Your Digital Identity.
            </h1>

            <p className="text-body mb-10 max-w-lg">
              A single NFC card connects your audience to your profile, social
              media, website, CV, or any digital destination — without ever
              rewriting the card.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" fullWidth>
                  Get Your NFC Card
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button size="lg" variant="secondary" fullWidth>
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider" />

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-20">
        <div className="container-page">
          <div className="mb-12">
            <p className="text-caption mb-2" style={{ color: "var(--color-muted)" }}>
              Process
            </p>
            <h2 className="text-heading">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center justify-center size-10 rounded-[var(--radius-md)] border"
                      style={{
                        borderColor: "var(--color-border)",
                        backgroundColor: "var(--color-surface)",
                      }}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.5}
                        style={{ color: "var(--color-fg)" }}
                      />
                    </div>
                    <span
                      className="font-mono text-[0.75rem]"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <p className="text-subheading mb-1.5">{step.title}</p>
                    <p className="text-caption">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider" />

      {/* ── Product Demo Visual ──────────────────────────────── */}
      <section
        className="py-20"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-caption mb-2" style={{ color: "var(--color-muted)" }}>
                Dynamic Routing
              </p>
              <h2 className="text-heading mb-4">
                One Card. Any Destination.
              </h2>
              <p className="text-body mb-8">
                Your NFC card stores a single, permanent URL. The destination is
                configured in our system — meaning you can change where the card
                points at any time, without touching the card.
              </p>

              <div className="flex flex-col gap-3">
                {[
                  { from: "NFC Tap", to: "Instagram Profile" },
                  { from: "NFC Tap", to: "Personal Branding Page" },
                  { from: "NFC Tap", to: "Digital CV" },
                  { from: "NFC Tap", to: "WhatsApp Chat" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-[0.875rem]"
                  >
                    <span
                      className="font-medium"
                      style={{ color: "var(--color-fg)" }}
                    >
                      {item.from}
                    </span>
                    <ArrowRight
                      size={14}
                      style={{ color: "var(--color-muted)" }}
                    />
                    <span style={{ color: "var(--color-secondary)" }}>
                      {item.to}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock NFC flow diagram */}
            <div
              className="rounded-[var(--radius-xl)] border p-8 flex flex-col gap-4"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-bg)",
              }}
            >
              <p className="text-caption text-center mb-2">
                NFC Tap Flow
              </p>
              {[
                { code: "NFC TAP", desc: "User taps card" },
                { code: "/go/NFC-8X29A7", desc: "Dynamic URL" },
                { code: "Router", desc: "Looks up destination" },
                { code: "instagram.com/...", desc: "Redirects user" },
              ].map((item, i) => (
                <div key={i}>
                  <div
                    className="rounded-[var(--radius-md)] border p-3 text-center"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                    }}
                  >
                    <span className="text-mono font-medium">{item.code}</span>
                    <span className="text-caption block mt-0.5">{item.desc}</span>
                  </div>
                  {i < 3 && (
                    <div className="flex justify-center my-1">
                      <ArrowRight
                        size={14}
                        style={{ color: "var(--color-muted)" }}
                        className="rotate-90"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider" />

      {/* ── Use Cases ────────────────────────────────────────── */}
      <section id="use-cases" className="py-20">
        <div className="container-page">
          <div className="mb-12">
            <p className="text-caption mb-2" style={{ color: "var(--color-muted)" }}>
              Use Cases
            </p>
            <h2 className="text-heading">Built for Everyone</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map((uc) => (
              <div
                key={uc.label}
                className="surface p-5 hover:shadow-md transition-base"
              >
                <p className="text-label mb-2">{uc.label}</p>
                <p className="text-caption">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider" />

      {/* ── CTA Section ──────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="container-page">
          <div className="max-w-xl">
            <h2 className="text-heading mb-4">
              Ready to upgrade your first impression?
            </h2>
            <p className="text-body mb-8">
              Get your NFC Smart Profile card and set up your digital identity in
              minutes.
            </p>
            <Link href="/register">
              <Button size="lg">
                Get Your NFC Card
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
