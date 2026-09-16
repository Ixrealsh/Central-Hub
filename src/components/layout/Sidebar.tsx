import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Crosshair, Map, Users, Package, MapPin,
  MessageSquare, HeartPulse, FileText, Settings, CheckCircle, Menu, X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useRole } from "@/hooks/useRole";

const navGroups = [
  {
    label: "OVERVIEW",
    items: [{ to: "/", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "OPERATIONS",
    items: [
      { to: "/operations", icon: Crosshair, label: "Operations" },
      { to: "/map", icon: Map, label: "Map" },
    ],
  },
  {
    label: "PERSONNEL",
    items: [{ to: "/personnel", icon: Users, label: "Officers" }],
  },
  {
    label: "ASSETS",
    items: [
      { to: "/assets", icon: Package, label: "Assets" },
      { to: "/locations", icon: MapPin, label: "Locations" },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { to: "/communications", icon: MessageSquare, label: "Communications" },
      { to: "/medical", icon: HeartPulse, label: "Medical" },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      { to: "/audit-logs", icon: FileText, label: "Audit Logs" },
      { to: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role } = useRole();

  const filteredGroups = useMemo(() => {
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (role === "Admin") return true;
          if (role === "Supervisor") {
            return item.to !== "/medical" && item.to !== "/audit-logs";
          }
          if (role === "Officer") {
            return (
              item.to !== "/assets" &&
              item.to !== "/locations" &&
              item.to !== "/medical" &&
              item.to !== "/audit-logs"
            );
          }
          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [role]);

  const navContent = (
    <>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <p
              className="mb-2 px-3 font-semibold text-text-secondary"
              style={{ fontSize: "11px", letterSpacing: "0.05em" }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 transition-colors duration-120 ${
                      isActive
                        ? "border-l-2 border-l-accent-blue bg-accent-blue-bg font-medium text-accent-blue"
                        : "border-l-2 border-l-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                    }`
                  }
                  style={{ fontSize: "13.5px", borderRadius: "0 var(--radius-md) var(--radius-md) 0" }}
                >
                  <item.icon size={16} aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* System status */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <CheckCircle size={14} className="text-accent-green" aria-hidden="true" />
          <span className="text-text-secondary" style={{ fontSize: "12px" }}>
            System operational
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3 z-30 inline-flex items-center justify-center p-1.5 text-text-secondary lg:hidden"
        style={{ borderRadius: "var(--radius-md)" }}
        aria-label="Open navigation"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-border bg-surface lg:flex">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-border px-6">
          <div
            className="flex h-7 w-7 items-center justify-center bg-accent-blue font-semibold text-white"
            style={{ fontSize: "10px", borderRadius: "var(--radius-sm)" }}
          >
            CID
          </div>
          <span className="font-semibold text-text-primary" style={{ fontSize: "13.5px" }}>
            Operations Center
          </span>
        </div>
        {navContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-surface lg:hidden">
            <div className="flex h-14 items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center bg-accent-blue font-semibold text-white"
                  style={{ fontSize: "10px", borderRadius: "var(--radius-sm)" }}
                >
                  CID
                </div>
                <span className="font-semibold text-text-primary" style={{ fontSize: "13.5px" }}>
                  Operations Center
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary"
                aria-label="Close navigation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {navContent}
          </aside>
        </>
      )}
    </>
  );
}

