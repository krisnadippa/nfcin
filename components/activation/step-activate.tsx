"use client";

import { Button } from "@/components/ui/button";
import { TEMPLATE_MAP, ACTION_TYPE_OPTIONS } from "@/constants/templates";
import type { ProfileTemplate, ActionFormData } from "@/types";

interface ProfileData {
  name: string;
  username: string;
  company_name: string;
}

interface WizardCard {
  card_code: string;
}

interface StepActivateProps {
  card: WizardCard;
  template: ProfileTemplate;
  profile: ProfileData;
  action: ActionFormData;
  error: string | null;
  loading: boolean;
  onBack: () => void;
  onActivate: () => void;
}

export function StepActivate({
  card,
  template,
  profile,
  action,
  error,
  loading,
  onBack,
  onActivate,
}: StepActivateProps) {
  const templateConfig = TEMPLATE_MAP[template];
  const actionLabel =
    ACTION_TYPE_OPTIONS.find((o) => o.value === action.action_type)?.label ??
    action.action_type;
  const displayName =
    template === "company"
      ? profile.company_name || "—"
      : profile.name || "—";

  const summaryItems = [
    { label: "Card", value: card.card_code },
    { label: "Experience", value: templateConfig?.label ?? template },
    {
      label: displayName && profile.username ? "Profile" : "Name",
      value: displayName
        ? `${displayName} (@${profile.username})`
        : profile.username,
    },
    { label: "NFC Action", value: actionLabel },
    ...(action.destination_url
      ? [
          {
            label: "Destination",
            value: action.destination_url.replace("https://", ""),
          },
        ]
      : []),
  ];

  return (
    <div>
      <h2 className="text-subheading mb-1">Activate Card</h2>
      <p className="text-caption mb-6">
        Review your configuration before activating.
      </p>

      {/* Summary */}
      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden mb-6"
        style={{ borderColor: "var(--color-border)" }}
      >
        {summaryItems.map((item, i) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-4 px-4 py-3"
            style={{
              borderTop:
                i > 0 ? "1px solid var(--color-border)" : undefined,
              backgroundColor: "var(--color-surface)",
            }}
          >
            <span className="text-caption shrink-0">{item.label}</span>
            <span className="text-label text-right">{item.value}</span>
          </div>
        ))}
      </div>

      {error && (
        <div
          className="mb-5 rounded-[var(--radius-md)] border p-3 text-[0.8125rem]"
          style={{
            borderColor: "#FECACA",
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger)",
          }}
        >
          {error}
        </div>
      )}

      <Button
        fullWidth
        size="lg"
        onClick={onActivate}
        loading={loading}
        className="mb-3"
      >
        Activate Card
      </Button>

      <div className="flex justify-start">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={loading}>
          Back
        </Button>
      </div>
    </div>
  );
}
