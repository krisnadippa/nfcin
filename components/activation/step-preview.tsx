"use client";

import { Button } from "@/components/ui/button";
import { getLinkIcon } from "@/constants/link-types";
import { TEMPLATE_MAP, ACTION_TYPE_OPTIONS } from "@/constants/templates";
import type { ProfileTemplate, LinkFormData, ActionFormData } from "@/types";

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  profession: string;
  company_name: string;
}

interface StepPreviewProps {
  template: ProfileTemplate;
  profile: ProfileData;
  links: LinkFormData[];
  action: ActionFormData;
  onBack: () => void;
  onNext: () => void;
}

export function StepPreview({
  template,
  profile,
  links,
  action,
  onBack,
  onNext,
}: StepPreviewProps) {
  const templateConfig = TEMPLATE_MAP[template];
  const displayName =
    template === "company" ? profile.company_name || "Company Name" : profile.name || "Your Name";
  const activeLinks = links.filter((l) => l.is_active);

  const actionLabel =
    ACTION_TYPE_OPTIONS.find((o) => o.value === action.action_type)?.label ??
    action.action_type;

  return (
    <div>
      <h2 className="text-subheading mb-1">Preview</h2>
      <p className="text-caption mb-6">
        This is how your profile will appear when someone visits it.
      </p>

      {/* Mobile device frame */}
      <div className="flex justify-center mb-6">
        <div
          className="w-64 rounded-[2rem] border-4 overflow-hidden shadow-lg"
          style={{
            borderColor: "var(--color-fg)",
            backgroundColor: "var(--color-bg)",
          }}
        >
          {/* Status bar mockup */}
          <div
            className="h-7 flex items-center justify-between px-4"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <span className="text-[0.6875rem] font-medium" style={{ color: "var(--color-fg)" }}>9:41</span>
            <div className="flex gap-1">
              <div className="w-8 h-2 rounded-full" style={{ backgroundColor: "var(--color-border)" }} />
            </div>
          </div>

          {/* Profile content */}
          <div
            className="px-5 py-6 flex flex-col items-center"
            style={{ backgroundColor: "var(--color-surface)", minHeight: 400 }}
          >
            {/* Avatar placeholder */}
            <div
              className="size-16 rounded-full border-2 mb-3 flex items-center justify-center"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-bg)",
              }}
            >
              <span className="text-[1.5rem] font-semibold" style={{ color: "var(--color-muted)" }}>
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Name */}
            <p className="font-semibold text-[0.875rem] text-center mb-0.5" style={{ color: "var(--color-fg)" }}>
              {displayName}
            </p>

            {/* Profession or template label */}
            {profile.profession && (
              <p className="text-[0.75rem] mb-0.5" style={{ color: "var(--color-secondary)" }}>
                {profile.profession}
              </p>
            )}

            {/* Template label */}
            <p className="text-[0.6875rem] mb-3" style={{ color: "var(--color-muted)" }}>
              {templateConfig?.label}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p
                className="text-[0.75rem] text-center mb-4 leading-relaxed"
                style={{ color: "var(--color-secondary)" }}
              >
                {profile.bio.length > 60 ? profile.bio.slice(0, 60) + "…" : profile.bio}
              </p>
            )}

            {/* Links */}
            <div className="w-full flex flex-col gap-2">
              {activeLinks.slice(0, 4).map((link) => {
                const Icon = getLinkIcon(link.type);
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-bg)",
                    }}
                  >
                    <Icon size={13} strokeWidth={1.5} style={{ color: "var(--color-secondary)" }} />
                    <span className="text-[0.75rem]" style={{ color: "var(--color-fg)" }}>
                      {link.title}
                    </span>
                  </div>
                );
              })}
              {activeLinks.length > 4 && (
                <p className="text-[0.6875rem] text-center" style={{ color: "var(--color-muted)" }}>
                  +{activeLinks.length - 4} more links
                </p>
              )}
              {activeLinks.length === 0 && (
                <p className="text-[0.6875rem] text-center" style={{ color: "var(--color-muted)" }}>
                  No links added
                </p>
              )}
            </div>
          </div>

          {/* Home indicator */}
          <div
            className="h-5 flex items-center justify-center"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <div className="w-20 h-1 rounded-full" style={{ backgroundColor: "var(--color-border)" }} />
          </div>
        </div>
      </div>

      {/* NFC action note */}
      <div
        className="rounded-[var(--radius-md)] border p-3 mb-6 text-center"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-bg)",
        }}
      >
        <span className="text-caption">When tapped: </span>
        <span className="text-label">{actionLabel}</span>
        {action.destination_url && (
          <span className="text-caption">
            {" "}
            → {action.destination_url.replace("https://", "")}
          </span>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Looks Good</Button>
      </div>
    </div>
  );
}
