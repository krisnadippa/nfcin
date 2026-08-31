"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { activateCard } from "@/actions/activation";
import { TEMPLATES } from "@/constants/templates";
import { cn } from "@/lib/utils/cn";
import type { ProfileTemplate, LinkFormData, ActionFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { StepExperience } from "@/components/activation/step-experience";
import { StepProfileInfo } from "@/components/activation/step-profile-info";
import { StepLinks } from "@/components/activation/step-links";
import { StepNfcAction } from "@/components/activation/step-nfc-action";
import { StepPreview } from "@/components/activation/step-preview";
import { StepActivate } from "@/components/activation/step-activate";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────

interface WizardCard {
  id: string;
  card_code: string;
  status: string;
}

interface WizardUser {
  id: string;
  email: string;
}

interface ActivationWizardProps {
  card: WizardCard;
  user: WizardUser | null;
}

const STEPS = [
  { number: "01", label: "Experience" },
  { number: "02", label: "Information" },
  { number: "03", label: "Links" },
  { number: "04", label: "NFC Action" },
  { number: "05", label: "Preview" },
  { number: "06", label: "Activate" },
];

// ─── Wizard ───────────────────────────────────────────────────

export function ActivationWizard({ card, user }: ActivationWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);
  const [activatedUsername, setActivatedUsername] = useState<string | null>(null);

  // Form state
  const [template, setTemplate] = useState<ProfileTemplate>("linktree");
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    bio: "",
    profession: "",
    company_name: "",
    industry: "",
    location: "",
    website_url: "",
  });
  const [links, setLinks] = useState<LinkFormData[]>([]);
  const [nfcAction, setNfcAction] = useState<ActionFormData>({
    action_type: "profile",
    destination_url: "",
  });

  // ── Guard: must be logged in ──────────────────────────────
  if (!user) {
    return (
      <div className="surface p-8 text-center">
        <div
          className="inline-flex items-center justify-center size-10 rounded-[var(--radius-lg)] border mb-5"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
        >
          <span className="text-mono text-[0.75rem]" style={{ color: "var(--color-muted)" }}>
            NFC
          </span>
        </div>
        <h1 className="text-subheading mb-1">
          Card found
        </h1>
        <p className="text-mono text-[0.875rem] mb-1" style={{ color: "var(--color-muted)" }}>
          &bull;&bull;&bull;&bull; {card.card_code.slice(-6)}
        </p>
        <p className="text-body mb-6">
          Sign in or create an account to activate this card.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/login?redirectTo=/activate/${card.card_code}`}>
            <Button variant="secondary">Log in</Button>
          </Link>
          <Link href={`/register?redirectTo=/activate/${card.card_code}`}>
            <Button>Create Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────
  if (activated) {
    return (
      <div className="surface p-8 text-center">
        <div
          className="mx-auto mb-5 flex items-center justify-center size-12 rounded-full"
          style={{ backgroundColor: "var(--color-success-bg)", border: "1px solid #BBF7D0" }}
        >
          <Check size={22} strokeWidth={2} style={{ color: "var(--color-success)" }} />
        </div>
        <h1 className="text-subheading mb-2">Card Activated</h1>
        <p className="text-body mb-8">
          Your NFC card is ready. Tap the card to test it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {activatedUsername && (
            <Link href={`/p/${activatedUsername}`}>
              <Button variant="secondary">View Profile</Button>
            </Link>
          )}
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Activate handler ──────────────────────────────────────
  function handleActivate() {
    setError(null);
    startTransition(async () => {
      const result = await activateCard({
        cardCode: card.card_code,
        template,
        profileData,
        links,
        action: nfcAction,
      });

      if (!result.success) {
        setError(result.error ?? "Activation failed.");
        return;
      }

      setActivated(true);
      setActivatedUsername(result.data?.profileUsername ?? null);
    });
  }

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div>
      {/* Card info bar */}
      <div
        className="surface px-5 py-3 mb-6 flex items-center justify-between"
      >
        <div>
          <span className="text-caption">Activating card</span>
          <p className="text-mono font-medium" style={{ color: "var(--color-fg)" }}>
            {card.card_code}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 text-caption"
          style={{ color: "var(--color-muted)" }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: "var(--color-muted)" }}
          />
          Inactive
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
        {STEPS.map((step, i) => (
          <div key={step.number} className="flex items-center gap-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex items-center justify-center size-6 rounded-full text-[0.6875rem] font-medium transition-base",
                  i < currentStep
                    ? "bg-[var(--color-primary)] text-white"
                    : i === currentStep
                    ? "border-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border border-[var(--color-border)] text-[var(--color-muted)]"
                )}
              >
                {i < currentStep ? <Check size={12} strokeWidth={3} /> : step.number}
              </span>
              <span
                className={cn(
                  "text-[0.75rem] font-medium hidden sm:block",
                  i === currentStep
                    ? "text-[var(--color-fg)]"
                    : "text-[var(--color-muted)]"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-4 h-px ml-1"
                style={{
                  backgroundColor:
                    i < currentStep
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="surface p-6 mb-4">
        {currentStep === 0 && (
          <StepExperience
            selected={template}
            onSelect={setTemplate}
            onNext={goNext}
          />
        )}
        {currentStep === 1 && (
          <StepProfileInfo
            template={template}
            data={profileData}
            onChange={setProfileData}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {currentStep === 2 && (
          <StepLinks
            links={links}
            onChange={setLinks}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {currentStep === 3 && (
          <StepNfcAction
            profileUsername={profileData.username}
            action={nfcAction}
            onChange={setNfcAction}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {currentStep === 4 && (
          <StepPreview
            template={template}
            profile={profileData}
            links={links}
            action={nfcAction}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {currentStep === 5 && (
          <StepActivate
            card={card}
            template={template}
            profile={profileData}
            action={nfcAction}
            error={error}
            loading={isPending}
            onBack={goBack}
            onActivate={handleActivate}
          />
        )}
      </div>
    </div>
  );
}
