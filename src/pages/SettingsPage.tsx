import { PageHeader } from "@/components/layout/PageHeader";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Shield, Sun } from "lucide-react";
import { useRole, type Role } from "@/hooks/useRole";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { role, setRole } = useRole();

  return (
    <>
      <PageHeader title="Settings" />

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="mb-3 font-semibold" style={{ fontSize: "15px", lineHeight: "22px" }}>Appearance</h2>
        <div className="flex items-center gap-3">
          {([
            { value: "light" as const, label: "Light", icon: Sun },
            { value: "dark" as const, label: "Dark", icon: Moon },
          ]).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-2 border px-4 py-2 transition-colors ${
                theme === opt.value
                  ? "border-accent-blue bg-accent-blue-bg text-accent-blue"
                  : "border-border text-text-secondary hover:bg-surface-raised"
              }`}
              style={{ fontSize: "13.5px", borderRadius: "var(--radius-md)" }}
            >
              <opt.icon size={16} aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications (visual only) */}
      <section className="mb-8">
        <h2 className="mb-3 font-semibold" style={{ fontSize: "15px", lineHeight: "22px" }}>Notifications</h2>
        <div className="space-y-3">
          <ToggleSetting label="Critical alerts" defaultChecked />
          <ToggleSetting label="Operation status changes" defaultChecked />
          <ToggleSetting label="Personnel check-in reminders" defaultChecked={false} />
          <ToggleSetting label="System maintenance notices" defaultChecked />
        </div>
      </section>

      {/* Account */}
      <section className="mb-8">
        <h2 className="mb-3 font-semibold" style={{ fontSize: "15px", lineHeight: "22px" }}>Account</h2>
        <div className="border border-border bg-surface p-4" style={{ borderRadius: "var(--radius-lg)" }}>
          <p className="text-text-secondary mb-3" style={{ fontSize: "12px" }}>
            Mock current role (UI demonstration only — not real access control). Toggling adjusts sidebar visibility.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {(["Admin", "Supervisor", "Officer"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex items-center gap-2 border px-4 py-2 transition-colors ${
                  role === r
                    ? "border-accent-blue bg-accent-blue-bg text-accent-blue font-medium"
                    : "border-border text-text-secondary hover:bg-surface-raised"
                }`}
                style={{ fontSize: "13.5px", borderRadius: "var(--radius-md)" }}
              >
                <Shield size={16} aria-hidden="true" />
                {r === "Admin" ? "Administrator" : r}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* System Information */}
      <section>
        <h2 className="mb-3 font-semibold" style={{ fontSize: "15px", lineHeight: "22px" }}>System Information</h2>
        <div className="border border-border bg-surface p-4" style={{ borderRadius: "var(--radius-lg)" }}>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-text-secondary" style={{ fontSize: "12px" }}>Version</dt>
              <dd style={{ fontSize: "13.5px" }}>1.0.0-prototype</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary" style={{ fontSize: "12px" }}>Build</dt>
              <dd style={{ fontSize: "13.5px" }}>2026.09.15</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary" style={{ fontSize: "12px" }}>Environment</dt>
              <dd style={{ fontSize: "13.5px" }}>Development</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}

function ToggleSetting({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center justify-between border border-border bg-surface px-4 py-3" style={{ borderRadius: "var(--radius-md)" }}>
      <span style={{ fontSize: "13.5px" }}>{label}</span>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-accent-blue"
      />
    </label>
  );
}

