import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      {Icon && (
        <div
          className="mb-5 flex items-center justify-center size-12 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]"
        >
          <Icon
            size={22}
            strokeWidth={1.5}
            style={{ color: "var(--color-muted)" }}
          />
        </div>
      )}
      <p className="text-subheading mb-1.5">{title}</p>
      {description && (
        <p className="text-body max-w-xs" style={{ color: "var(--color-muted)" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
