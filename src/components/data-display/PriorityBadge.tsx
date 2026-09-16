import type { Priority } from "@/types/operation";

const priorityColorMap: Record<Priority, { bg: string; text: string; label: string }> = {
  low:      { bg: "bg-surface-raised",  text: "text-text-secondary", label: "Low" },
  medium:   { bg: "bg-accent-blue-bg",  text: "text-accent-blue",   label: "Medium" },
  high:     { bg: "bg-accent-amber-bg", text: "text-accent-amber",  label: "High" },
  critical: { bg: "bg-accent-red-bg",   text: "text-accent-red",    label: "Critical" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityColorMap[priority];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 font-medium ${config.bg} ${config.text}`}
      style={{ fontSize: "12px", lineHeight: "16px", borderRadius: "var(--radius-sm)" }}
    >
      {config.label}
    </span>
  );
}

