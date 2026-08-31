"use client";

import { TEMPLATES } from "@/constants/templates";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { ProfileTemplate } from "@/types";

interface StepExperienceProps {
  selected: ProfileTemplate;
  onSelect: (t: ProfileTemplate) => void;
  onNext: () => void;
}

export function StepExperience({ selected, onSelect, onNext }: StepExperienceProps) {
  return (
    <div>
      <h2 className="text-subheading mb-1">Choose Your Experience</h2>
      <p className="text-caption mb-6">Select the profile type that best fits you.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSelected = selected === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => onSelect(tmpl.id)}
              className={cn(
                "flex flex-col gap-3 p-4 rounded-[var(--radius-lg)] border text-left transition-base cursor-pointer",
                isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-bg)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-secondary)] bg-[var(--color-surface)]"
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center justify-center size-8 rounded-[var(--radius-md)] border"
                  style={{
                    borderColor: isSelected ? "var(--color-primary)" : "var(--color-border)",
                    backgroundColor: isSelected ? "var(--color-primary)" : "var(--color-bg)",
                  }}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    style={{ color: isSelected ? "white" : "var(--color-secondary)" }}
                  />
                </div>
                {isSelected && (
                  <div
                    className="size-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p className="text-label">{tmpl.label}</p>
                <p className="text-caption mt-0.5">{tmpl.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
