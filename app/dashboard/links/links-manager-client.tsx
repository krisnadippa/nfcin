"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check, GripVertical } from "lucide-react";
import { addLinkAction, deleteLinkAction, toggleLinkActiveAction } from "@/actions/links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LINK_TYPES, getLinkIcon } from "@/constants/link-types";
import { cn } from "@/lib/utils/cn";

interface ProfileLink {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}

interface LinksManagerClientProps {
  profileId: string;
  initialLinks: ProfileLink[];
}

export function LinksManagerClient({ profileId, initialLinks }: LinksManagerClientProps) {
  const [links, setLinks] = useState<ProfileLink[]>(initialLinks);
  const [adding, setAdding] = useState(false);
  const [newLink, setNewLink] = useState({ type: "instagram", title: "", url: "" });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function addLink() {
    if (!newLink.url) return;
    const linkType = LINK_TYPES.find((lt) => lt.type === newLink.type);

    setError(null);
    startTransition(async () => {
      const result = await addLinkAction({
        profileId,
        type: newLink.type,
        title: newLink.title || linkType?.label || "Link",
        url: newLink.url,
        sortOrder: links.length,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to add link.");
        return;
      }

      setLinks([...links, result.data]);
      setNewLink({ type: "instagram", title: "", url: "" });
      setAdding(false);
    });
  }

  async function removeLink(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteLinkAction(id);
      if (!result.success) {
        setError(result.error ?? "Failed to delete link.");
        return;
      }
      setLinks(links.filter((l) => l.id !== id));
    });
  }

  async function toggleActive(id: string) {
    const link = links.find((l) => l.id === id);
    if (!link) return;

    setError(null);
    startTransition(async () => {
      const nextActive = !link.is_active;
      const result = await toggleLinkActiveAction(id, nextActive);
      if (!result.success) {
        setError(result.error ?? "Failed to update link status.");
        return;
      }
      setLinks(
        links.map((l) => (l.id === id ? { ...l, is_active: nextActive } : l))
      );
    });
  }

  return (
    <div className="surface p-5">
      {/* Link list */}
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
                    : "border-[var(--color-border)] opacity-50 bg-[var(--color-bg)]"
                )}
              >
                <GripVertical
                  size={16}
                  style={{ color: "var(--color-muted)" }}
                  className="cursor-grab shrink-0"
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
                    onClick={() => toggleActive(link.id)}
                    title={link.is_active ? "Disable" : "Enable"}
                    className={cn(
                      "size-6 rounded-[var(--radius-sm)] flex items-center justify-center border transition-base",
                      link.is_active
                        ? "border-[var(--color-success)] bg-[var(--color-success-bg)]"
                        : "border-[var(--color-border)]"
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
                    onClick={() => removeLink(link.id)}
                    title="Delete"
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

      {links.length === 0 && !adding && (
        <p className="text-caption text-center py-6">
          No links yet. Add your first link below.
        </p>
      )}

      {/* Add link form */}
      {adding ? (
        <div
          className="rounded-[var(--radius-lg)] border p-4 mb-4 flex flex-col gap-3"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LINK_TYPES.map((lt) => {
              const Icon = lt.icon;
              return (
                <button
                  key={lt.type}
                  onClick={() =>
                    setNewLink({ ...newLink, type: lt.type, title: lt.label })
                  }
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-2 rounded-[var(--radius-md)] border text-[0.8125rem] transition-base",
                    newLink.type === lt.type
                      ? "border-[var(--color-primary)] bg-[var(--color-bg)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-secondary)]"
                  )}
                >
                  <Icon size={13} strokeWidth={1.5} style={{ color: "var(--color-secondary)" }} />
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
          {error && (
            <p className="text-caption" style={{ color: "var(--color-danger)" }}>
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={addLink}
              loading={isPending}
              disabled={!newLink.url}
            >
              Add Link
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-[var(--radius-md)] border border-dashed transition-base text-[0.875rem]"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-secondary)",
          }}
        >
          <Plus size={16} />
          Add Link
        </button>
      )}
    </div>
  );
}
