import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, HelpCircle, Sun, Moon, Shield, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useRole } from "@/hooks/useRole";
import { alerts } from "@/data/alerts";

interface TopbarProps {
  collapsed: boolean;
  onSearchClick: () => void;
}

export function Topbar({ collapsed, onSearchClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { role } = useRole();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const unackAlerts = alerts.filter((a) => !a.acknowledged);
  const unacknowledgedCount = unackAlerts.length;

  return (
    <header className={`fixed left-0 right-0 top-0 z-[2000] flex h-14 items-center gap-4 border-b border-border bg-surface px-4 shadow-sm transition-[left] duration-200 sm:px-5 lg:px-7 ${collapsed ? "lg:left-16" : "lg:left-60"}`}>
      {/* Spacer for mobile menu button */}
      <div className="w-8 lg:hidden" />

      {/* Search */}
      <button
        type="button"
        onClick={onSearchClick}
        className="flex min-w-0 flex-1 items-center gap-2 border border-border bg-bg px-3 py-1.5 text-left text-text-secondary shadow-sm transition-colors hover:border-text-secondary lg:max-w-md"
        style={{ fontSize: "13px", borderRadius: "var(--radius-md)" }}
      >
        <Search size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Search operations, officers, assets…</span>
        <span className="sm:hidden">Search…</span>
        <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-text-secondary sm:inline" style={{ fontSize: "11px" }}>
          ⌘K
        </kbd>
      </button>

      {/* Right actions */}
      <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center justify-center p-2 text-text-secondary transition-colors hover:text-text-primary"
          style={{ borderRadius: "var(--radius-md)" }}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setAlertsOpen(!alertsOpen);
              setAccountOpen(false);
            }}
            className={`relative inline-flex items-center justify-center p-2 transition-colors hover:text-text-primary ${
              alertsOpen ? "bg-surface-raised text-accent-blue" : "text-text-secondary"
            }`}
            style={{ borderRadius: "var(--radius-md)" }}
            aria-label={`Notifications: ${unacknowledgedCount} unacknowledged`}
            aria-expanded={alertsOpen}
          >
            <Bell size={18} aria-hidden="true" />
            {unacknowledgedCount > 0 && (
              <span
                className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-white"
                style={{ fontSize: "10px" }}
              >
                {unacknowledgedCount}
              </span>
            )}
          </button>

          {alertsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setAlertsOpen(false)}
                aria-hidden="true"
              />
              <div
                className="absolute right-0 top-full z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] border border-border bg-surface shadow-lg"
                style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-elevated)" }}
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ fontSize: "13.5px" }}>Alerts</span>
                    <span className="border border-border bg-surface-raised px-1.5 py-0.5 text-text-secondary" style={{ fontSize: "11px", borderRadius: "var(--radius-sm)" }}>
                      {unacknowledgedCount} unacknowledged
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlertsOpen(false)}
                    className="text-text-secondary hover:text-text-primary"
                    aria-label="Close alerts popover"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {unackAlerts.slice(0, 5).map((alert) => {
                    const SeverityIcon = alert.severity === "critical" ? AlertCircle : alert.severity === "warning" ? AlertTriangle : Info;
                    const iconColor = alert.severity === "critical" ? "text-accent-red" : alert.severity === "warning" ? "text-accent-amber" : "text-accent-blue";
                    return (
                      <div key={alert.id} className="p-3 hover:bg-surface-raised transition-colors">
                        <div className="flex items-start gap-2.5">
                          <SeverityIcon size={16} className={`mt-0.5 shrink-0 ${iconColor}`} aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className="text-text-primary line-clamp-2" style={{ fontSize: "13px" }}>
                              {alert.message}
                            </p>
                            <span className="mt-1 block text-text-secondary" style={{ fontSize: "11px" }}>
                              {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {alert.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {unackAlerts.length === 0 && (
                    <div className="p-6 text-center text-text-secondary" style={{ fontSize: "13px" }}>
                      No unacknowledged alerts.
                    </div>
                  )}
                </div>

                <div className="border-t border-border p-2.5 text-center bg-bg">
                  <Link
                    to="/"
                    onClick={() => setAlertsOpen(false)}
                    className="text-accent-blue font-medium hover:underline"
                    style={{ fontSize: "12px" }}
                  >
                    View all in Dashboard overview →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help */}
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 text-text-secondary transition-colors hover:text-text-primary"
          style={{ borderRadius: "var(--radius-md)" }}
          aria-label="Help & Documentation"
          title="Centeral Hub"
        >
          <HelpCircle size={18} aria-hidden="true" />
        </button>

        {/* Account Menu / Role */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setAccountOpen(!accountOpen);
              setAlertsOpen(false);
            }}
            className="flex items-center gap-2 p-1 text-left rounded-md hover:bg-surface-raised transition-colors"
            style={{ borderRadius: "var(--radius-md)" }}
            aria-label={`Account: Signed in as ${role}`}
            aria-expanded={accountOpen}
          >
            <div
              className="flex h-8 w-8 items-center justify-center bg-accent-blue-bg text-accent-blue font-semibold"
              style={{ borderRadius: "50%", fontSize: "12px" }}
            >
              {role.charAt(0)}
            </div>
          </button>

          {accountOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setAccountOpen(false)}
                aria-hidden="true"
              />
              <div
                className="absolute right-0 top-full z-40 mt-2 w-64 border border-border bg-surface p-4 shadow-lg"
                style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-elevated)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-accent-blue" aria-hidden="true" />
                  <span className="font-semibold" style={{ fontSize: "13.5px" }}>
                    {role === "Admin" ? "Administrator" : role}
                  </span>
                </div>
                <p className="text-text-secondary" style={{ fontSize: "11px" }}>
                  Active demo role. Change in Settings to test view gating.
                </p>
                <div className="mt-3 pt-3 border-t border-border">
                  <Link
                    to="/settings"
                    onClick={() => setAccountOpen(false)}
                    className="block text-accent-blue hover:underline"
                    style={{ fontSize: "12.5px" }}
                  >
                    Open Settings →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
