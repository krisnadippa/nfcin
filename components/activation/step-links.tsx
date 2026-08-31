"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LINK_TYPES, getLinkIcon } from "@/constants/link-types";
import { cn } from "@/lib/utils/cn";
import type { LinkFormData } from "@/types";

interface StepLinksProps {
  links: LinkFormData[];
  onChange: (links: LinkFormData[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepLinks({ links, onChange, onBack, onNext }: StepLinksProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ type: "instagram", title: "", url: "" });

  function addLink() {
    if (!newLink.url) return;
    const id = `link-${Date.now()}`;
    const linkType = LINK_TYPES.find((lt) => lt.type === newLink.type);
    onChange([
      ...links,
      {
        id,
        type: newLink.type as LinkFormData["type"],
        title: newLink.title || (linkType?.label ?? "Link"),
        url: newLink.url,
        is_active: true,
        sort_order: links.length,
      },
    ]);
    setNewLink({ type: "instagram", title: "", url: "" });
    setAdding(false);
  }

  function removeLink(id: string) {
    onChange(links.filter((l) => l.id !== id));
  }

  function toggleActive(id: string) {
    onChange(
      links.map((l) =>
        l.id === id ? { ...l, is_active: !l.is_active } : l
      )
    );
  }

  return (
    <div>
      <h2 className="text-subheading mb-1">Your Links</h2>
      <p className="text-caption mb-6">
        Add links to display on your profile. You can always edit these later.
      </p>

      {/* Existing links */}
      {links.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {links.map((link) => {
            const Icon = getLinkIcon(link.type);
            return (
              <div
                key={link.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-[var(--radius-md)] border transition-base",
                  link.is_active
                    ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] opacity-60"
                )}
              >
                <GripVertical
                  size={16}
                  style={{ color: "var(--color-muted)" }}
                  className="shrink-0 cursor-grab"
                />
                <div
                  className="flex items-center justify-center size-7 rounded-[var(--radius-sm)] border shrink-0"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                  }}
                >
                  <Icon size={14} strokeWidth={1.5} style={{ color: "var(--color-secondary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label truncate">{link.title}</p>
                  <p className="text-caption truncate">{link.url}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(link.id!)}
                    className={cn(
                      "size-6 rounded-[var(--radius-sm)] flex items-center justify-center border transition-base",
                      link.is_active
                        ? "border-[var(--color-success)] bg-[var(--color-success-bg)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg)]"
                    )}
                  >
                    <Check
                      size={12}
                      style={{
                        color: link.is_active
                          ? "var(--color-success)"
                          : "var(--color-muted)",
                      }}
                    />
                  </button>
                  <button
                    onClick={() => removeLink(link.id!)}
                    className="size-6 rounded-[var(--radius-sm)] flex items-center justify-center border border-[var(--color-border)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-base"
                  >
                    <Trash2 size={12} style={{ color: "var(--color-danger)" }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add link form */}
      {adding ? (
        <div
          className="rounded-[var(--radius-lg)] border p-4 mb-4 flex flex-col gap-3"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg)",
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            {LINK_TYPES.map((lt) => {
              const Icon = lt.icon;
              return (
                <button
                  key={lt.type}
                  onClick={() => setNewLink({ ...newLink, type: lt.type, title: lt.label })}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border text-[0.8125rem] transition-base",
                    newLink.type === lt.type
                      ? "border-[var(--color-primary)] bg-[var(--color-bg)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-secondary)]"
                  )}
                >
                  <Icon size={14} strokeWidth={1.5} style={{ color: "var(--color-secondary)" }} />
                  {lt.label}
                </button>
              );
            })}
          </div>
          <Input
            label="Title"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            placeholder={LINK_TYPES.find((lt) => lt.type === newLink.type)?.label ?? "Link"}
          />
          <Input
            label="URL"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder={
              LINK_TYPES.find((lt) => lt.type === newLink.type)?.placeholder ?? "https://..."
            }
          />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={addLink} disabled={!newLink.url}>
              Add Link
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-[var(--radius-md)] border border-dashed transition-base text-[0.875rem] mb-4"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-secondary)",
          }}
        >
          <Plus size={16} />
          Add Link
        </button>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
