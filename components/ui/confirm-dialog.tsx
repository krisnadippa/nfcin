"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils/cn";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "m-auto rounded-[var(--radius-xl)] border border-[var(--color-border)]",
        "bg-[var(--color-surface)] shadow-lg p-0 w-full max-w-md",
        "backdrop:bg-black/30 backdrop:backdrop-blur-sm"
      )}
      onClose={onCancel}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-subheading">{title}</h2>
          <button
            onClick={onCancel}
            className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-base"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-body mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
