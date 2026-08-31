import { cn } from "@/lib/utils/cn";
import type { CardStatus } from "@/types";

type BadgeVariant = "default" | "active" | "inactive" | "suspended" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-bg)] text-[var(--color-secondary)] border-[var(--color-border)]",
  active:
    "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[#BBF7D0]",
  inactive:
    "bg-[var(--color-bg)] text-[var(--color-muted)] border-[var(--color-border)]",
  suspended:
    "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[#FECACA]",
  warning:
    "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[#FEF08A]",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        "text-[0.75rem] font-medium uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: CardStatus }) {
  const config: Record<CardStatus, { variant: BadgeVariant; label: string }> = {
    active: { variant: "active", label: "Active" },
    inactive: { variant: "inactive", label: "Inactive" },
    suspended: { variant: "suspended", label: "Suspended" },
  };

  const { variant, label } = config[status];
  return (
    <Badge variant={variant}>
      <span
        className="size-1.5 rounded-full"
        style={{
          backgroundColor:
            variant === "active"
              ? "var(--color-success)"
              : variant === "suspended"
              ? "var(--color-danger)"
              : "var(--color-muted)",
        }}
      />
      {label}
    </Badge>
  );
}
