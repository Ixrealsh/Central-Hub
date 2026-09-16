import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/data-display/StatCard";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { PriorityBadge } from "@/components/data-display/PriorityBadge";
import { ActivityList } from "@/components/data-display/ActivityList";
import { OperationsMap } from "@/components/map/OperationsMap";
import { operations } from "@/data/operations";
import { personnel } from "@/data/personnel";
import { assets as allAssets } from "@/data/assets";
import { alerts } from "@/data/alerts";
import { auditLogs } from "@/data/auditLogs";
import { communications } from "@/data/communications";
import { locations } from "@/data/locations";
import { NOW } from "@/data/seed";
import { CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

function relTime(iso: string): string {
  const diff = new Date(NOW).getTime() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const activeOps = operations.filter((o) => o.status === "active");
  const activePersonnel = personnel.filter((p) => p.status === "active").length;
  const activeAssets = allAssets.filter((a) => a.status === "active").length;
  const unackAlerts = alerts.filter((a) => !a.acknowledged);

  const topOps = useMemo(() => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...activeOps]
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
      .slice(0, 8);
  }, [activeOps]);

  const locMap = useMemo(() => new Map(locations.map((l) => [l.id, l.name])), []);

  const recentActivity = useMemo(() => {
    const entries = [
      ...auditLogs.slice(0, 20).map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        description: `${e.action} by ${e.actor}: ${e.resourceLabel}`,
      })),
      ...communications.slice(0, 10).map((c) => ({
        id: c.id,
        timestamp: c.timestamp,
        description: `${c.unit}: ${c.message}`,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    return entries;
  }, []);

  const dateStr = new Date(NOW).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PageHeader
        title="Central Intelligence   Operations Overview"
        description={dateStr}
        actions={
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-accent-green" aria-hidden="true" />
            <span className="text-text-secondary" style={{ fontSize: "12px" }}>System operational</span>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Operations" value={activeOps.length} delta={`+${Math.min(3, activeOps.length)} today`} />
        <StatCard label="Personnel" value={personnel.length} delta={`${activePersonnel} active`} />
        <StatCard label="Assets" value={allAssets.length} delta={`${activeAssets} active`} />
        <StatCard label="Alerts" value={alerts.length} delta={`${unackAlerts.length} requiring attention`} />
      </div>

      {/* Main content grid: Operations + Map are visually dominant */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Active Operations - takes more space */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ fontSize: "15px", lineHeight: "22px" }}>Active Operations</h2>
            <Link to="/operations" className="text-accent-blue hover:underline" style={{ fontSize: "12px" }}>View all</Link>
          </div>
          <div className="border border-border bg-surface overflow-hidden" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="divide-y divide-border">
              {topOps.map((op) => (
                <Link
                  key={op.id}
                  to={`/operations/${op.id}`}
                  className="flex items-center justify-between px-4 transition-colors hover:bg-surface-raised"
                  style={{ height: "44px" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-text-secondary" style={{ fontSize: "12px" }}>{op.id}</span>
                    <span style={{ fontSize: "13.5px" }}>{op.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={op.priority} />
                    <StatusBadge status={op.status} />
                    <span className="text-text-secondary" style={{ fontSize: "12px" }}>{locMap.get(op.locationId)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Map - secondary */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ fontSize: "15px", lineHeight: "22px" }}>Map</h2>
            <Link to="/map" className="text-accent-blue hover:underline" style={{ fontSize: "12px" }}>Open full map</Link>
          </div>
          <OperationsMap compact />
        </div>
      </div>

      {/* Secondary sections: Alerts + Recent Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <div>
          <h2 className="mb-3 font-semibold" style={{ fontSize: "15px", lineHeight: "22px" }}>Alerts</h2>
          <div className="space-y-2">
            {alerts
              .sort((a, b) => {
                const sevOrder = { critical: 0, warning: 1, info: 2 };
                return sevOrder[a.severity] - sevOrder[b.severity];
              })
              .map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 border bg-surface p-3 ${
                    alert.severity === "critical" ? "border-l-2 border-l-accent-red border-border" :
                    alert.severity === "warning" ? "border-l-2 border-l-accent-amber border-border" :
                    "border-border"
                  }`}
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  {alert.severity === "critical" && <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent-red" aria-hidden="true" />}
                  {alert.severity === "warning" && <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-amber" aria-hidden="true" />}
                  {alert.severity === "info" && <Info size={16} className="mt-0.5 shrink-0 text-accent-blue" aria-hidden="true" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium" style={{ fontSize: "13.5px" }}>{alert.title}</span>
                      <span className="shrink-0 text-text-secondary" style={{ fontSize: "12px" }}>{relTime(alert.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-text-secondary" style={{ fontSize: "12px" }}>{alert.message}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-3 font-semibold" style={{ fontSize: "15px", lineHeight: "22px" }}>Recent Activity</h2>
          <div className="border border-border bg-surface p-4" style={{ borderRadius: "var(--radius-lg)" }}>
            <ActivityList items={recentActivity} />
          </div>
        </div>
      </div>
    </>
  );
}

