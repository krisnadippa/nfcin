"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACTION_TYPE_OPTIONS } from "@/constants/templates";
import { cn } from "@/lib/utils/cn";
import type { ActionFormData } from "@/types";

interface StepNfcActionProps {
  profileUsername: string;
  action: ActionFormData;
  onChange: (action: ActionFormData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepNfcAction({
  profileUsername,
  action,
  onChange,
  onBack,
  onNext,
}: StepNfcActionProps) {
  function handleTypeChange(type: ActionFormData["action_type"]) {
    onChange({ action_type: type, destination_url: "" });
  }

  const needsUrl = action.action_type !== "profile";

  const placeholderMap: Record<string, string> = {
    instagram: "https://instagram.com/username",
    whatsapp: "https://wa.me/628123456789",
    website: "https://yourwebsite.com",
    tiktok: "https://tiktok.com/@username",
    youtube: "https://youtube.com/@channel",
    linkedin: "https://linkedin.com/in/username",
    custom: "https://...",
  };

  return (
    <div>
      <h2 className="text-subheading mb-1">NFC Action</h2>
      <p className="text-caption mb-6">
        Choose what happens when someone taps your NFC card.
      </p>

      <div className="flex flex-col gap-2 mb-6">
        {ACTION_TYPE_OPTIONS.map((opt) => {
          const isSelected = action.action_type === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleTypeChange(opt.value)}
              className={cn(
                "flex items-start gap-3 p-3 rounded-[var(--radius-md)] border text-left transition-base",
                isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-bg)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-secondary)]"
              )}
            >
              <div
                className="mt-0.5 size-4 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: isSelected
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                }}
              >
                {isSelected && (
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  />
                )}
              </div>
              <div>
                <p className="text-label">{opt.label}</p>
                <p className="text-caption">{opt.description}</p>
                {opt.value === "profile" && profileUsername && isSelected && (
                  <p className="text-caption mt-1 font-medium">
                    /p/{profileUsername}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {needsUrl && (
        <div className="mb-6">
          <Input
            label="Destination URL"
            type="url"
            value={action.destination_url ?? ""}
            onChange={(e) =>
              onChange({ ...action, destination_url: e.target.value })
            }
            placeholder={
              placeholderMap[action.action_type] ?? "https://..."
            }
          />
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={needsUrl && !action.destination_url}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
