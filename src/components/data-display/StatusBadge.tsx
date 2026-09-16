import type { OperationStatus } from "@/types/operation";
import type { PersonnelStatus } from "@/types/personnel";
import type { AssetStatus } from "@/types/asset";

type StatusValue = OperationStatus | PersonnelStatus | AssetStatus | string;

const statusColorMap: Record<string, { bg: string; text: string; label: string }> = {
  active:     { bg: "bg-accent-green-bg", text: "text-accent-green", label: "Active" },
  standby:    { bg: "bg-accent-blue-bg",  text: "text-accent-blue",  label: "Standby" },
  completed:  { bg: "bg-surface-raised",  text: "text-text-secondary", label: "Completed" },
  suspended:  { bg: "bg-accent-amber-bg", text: "text-accent-amber", label: "Suspended" },
  idle:       { bg: "bg-accent-blue-bg",  text: "text-accent-blue",  label: "Idle" },
  offline:    { bg: "bg-accent-red-bg",   text: "text-accent-red",   label: "Offline" },
  "off-duty": { bg: "bg-surface-raised",  text: "text-text-secondary", label: "Off Duty" },
  unavailable:{ bg: "bg-accent-amber-bg", text: "text-accent-amber", label: "Unavailable" },
  success:    { bg: "bg-accent-green-bg", text: "text-accent-green", label: "Success" },
  failure:    { bg: "bg-accent-red-bg",   text: "text-accent-red",   label: "Failure" },
};

export function StatusBadge({ status }: { status: StatusValue }) {
  const config = statusColorMap[status] ?? { bg: "bg-surface-raised", text: "text-text-secondary", label: status };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-medium ${config.bg} ${config.text}`}
      style={{ fontSize: "12px", lineHeight: "16px", borderRadius: "var(--radius-sm)" }}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full bg-current`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

