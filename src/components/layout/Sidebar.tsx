import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Crosshair, Map, Users, Package, MapPin,
  MessageSquare, HeartPulse, FileText, Settings, CheckCircle, Menu, X, PanelLeftClose, PanelLeftOpen,
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
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

  const navContent = (compact = false) => (
    <>
      <nav className={`flex-1 space-y-4 overflow-y-auto py-3 ${compact ? "px-2" : "px-2.5"}`}>
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <p
              className={`mb-1.5 px-3 font-semibold text-text-secondary ${compact ? "hidden" : ""}`}
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
                    `flex items-center ${compact ? "justify-center px-2" : "gap-3 px-3"} py-1.5 transition-colors duration-120 ${
                      isActive
                        ? "border-l-2 border-l-accent-blue bg-accent-blue-bg font-medium text-accent-blue"
                        : "border-l-2 border-l-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                    }`
                  }
                  style={{ fontSize: "13.5px", borderRadius: "0 var(--radius-md) var(--radius-md) 0" }}
                  title={compact ? item.label : undefined}
                >
                  <item.icon size={16} aria-hidden="true" />
                  {!compact && item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* System status */}
      <div className={`border-t border-border py-3 ${compact ? "px-2" : "px-5"}`}>
        <div className={`flex items-center ${compact ? "justify-center" : "gap-2"}`}>
          <CheckCircle size={14} className="text-accent-green" aria-hidden="true" />
          <span className={`text-text-secondary ${compact ? "sr-only" : ""}`} style={{ fontSize: "12px" }}>
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
        className="fixed left-4 top-3 z-[2010] inline-flex items-center justify-center p-1.5 text-text-secondary lg:hidden"
        style={{ borderRadius: "var(--radius-md)" }}
        aria-label="Open navigation"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* Desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex ${collapsed ? "w-16" : "w-60"}`}>
        {/* Logo */}
        <div className={`relative flex h-14 items-center border-b border-border ${collapsed ? "justify-center px-2" : "gap-2 px-5"}`}>
          <div
            className="flex h-7 w-7 items-center justify-center bg-accent-blue font-semibold text-white"
            style={{ fontSize: "10px", borderRadius: "var(--radius-sm)" }}
          >
            CID
          </div>
          <span className={`font-semibold text-text-primary ${collapsed ? "sr-only" : ""}`} style={{ fontSize: "13.5px" }}>
            Centeral Hub
          </span>
          <button
            type="button"
            onClick={onToggle}
            className={`absolute ${collapsed ? "-right-3" : "right-3"} top-4 hidden h-6 w-6 items-center justify-center border border-border bg-surface text-text-secondary shadow-sm hover:text-text-primary lg:inline-flex`}
            style={{ borderRadius: "50%" }}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            title={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <PanelLeftOpen size={13} aria-hidden="true" /> : <PanelLeftClose size={13} aria-hidden="true" />}
          </button>
        </div>
        {navContent(collapsed)}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[2100] bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-[2200] flex w-60 flex-col border-r border-border bg-surface lg:hidden">
            <div className="flex h-14 items-center justify-between border-b border-border px-5">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center bg-accent-blue font-semibold text-white"
                  style={{ fontSize: "10px", borderRadius: "var(--radius-sm)" }}
                >
                  CID
                </div>
                <span className="font-semibold text-text-primary" style={{ fontSize: "13.5px" }}>
                  Centeral Hub
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
            {navContent(false)}
          </aside>
        </>
      )}
    </>
  );
}

