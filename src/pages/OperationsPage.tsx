import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { PriorityBadge } from "@/components/data-display/PriorityBadge";
import { ActivityList } from "@/components/data-display/ActivityList";
import { Drawer } from "@/components/ui/Drawer";
import { getOperations } from "@/services/operations.service";
import { locations } from "@/data/locations";
import { personnel } from "@/data/personnel";
import { assets as allAssets } from "@/data/assets";
import { auditLogs } from "@/data/auditLogs";
import { NOW } from "@/data/seed";
import type { Operation, OperationStatus, Priority } from "@/types/operation";

function formatRelative(iso: string): string {
  const diff = new Date(NOW).getTime() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const statusOptions: OperationStatus[] = ["active", "standby", "completed", "suspended"];
const priorityOptions: Priority[] = ["low", "medium", "high", "critical"];

export default function OperationsPage() {
  const navigate = useNavigate();
  const [ops, setOps] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<OperationStatus>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<Set<Priority>>(new Set());

  // Drawer
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getOperations()
      .then(setOps)
      .catch(() => setError("Failed to load operations."))
      .finally(() => setIsLoading(false));
  }, []);

  const locMap = useMemo(() => new Map(locations.map((l) => [l.id, l.name])), []);

  const filtered = useMemo(() => {
    return ops.filter((op) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || op.id.toLowerCase().includes(q) || op.name.toLowerCase().includes(q);
      const matchesStatus = statusFilter.size === 0 || statusFilter.has(op.status);
      const matchesPriority = priorityFilter.size === 0 || priorityFilter.has(op.priority);
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [ops, search, statusFilter, priorityFilter]);

  const hasFilters = search || statusFilter.size > 0 || priorityFilter.size > 0;
  const filterCount = (search ? 1 : 0) + statusFilter.size + priorityFilter.size;

  const columns: Column<Operation>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "name", header: "Operation", sortable: true },
    { key: "status", header: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: "priority", header: "Priority", sortable: true, render: (row) => <PriorityBadge priority={row.priority} /> },
    { key: "locationId", header: "Location", sortable: true, render: (row) => <span>{locMap.get(row.locationId) ?? "Unknown"}</span> },
    { key: "personnelIds", header: "Personnel", render: (row) => <span>{row.personnelIds.length}</span> },
    { key: "startedAt", header: "Started", sortable: true, render: (row) => (
      <span title={new Date(row.startedAt).toLocaleString()}>{formatRelative(row.startedAt)}</span>
    )},
    { key: "lastUpdatedAt", header: "Last Update", sortable: true, render: (row) => <span>{formatRelative(row.lastUpdatedAt)}</span> },
  ];

  function toggleStatus(s: OperationStatus) {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      if (next.has(s)) {
        next.delete(s);
      } else {
        next.add(s);
      }
      return next;
    });
  }

  function togglePriority(p: Priority) {
    setPriorityFilter((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      if (next.has(p)) {
        next.delete(p);
      } else {
        next.add(p);
      }
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter(new Set());
    setPriorityFilter(new Set());
  }

  function handleRowClick(op: Operation) {
    setSelectedOp(op);
    setDrawerOpen(true);
  }

  // Drawer activity data
  const drawerActivity = useMemo(() => {
    if (!selectedOp) return [];
    return auditLogs
      .filter((e) => e.resourceId === selectedOp.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
      .map((e) => ({ id: e.id, timestamp: e.timestamp, description: `${e.action} by ${e.actor}: ${e.resourceLabel}` }));
  }, [selectedOp]);

  if (error) {
    return (
      <>
        <PageHeader title="Operations" description="All active and historical operations." />
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-accent-red font-semibold" style={{ fontSize: "15px" }}>{error}</p>
          <button
            type="button"
            onClick={() => { setIsLoading(true); setError(null); getOperations().then(setOps).catch(() => setError("Failed to load operations.")).finally(() => setIsLoading(false)); }}
            className="mt-4 border border-border bg-surface px-4 py-2 font-medium text-accent-blue transition-colors hover:bg-surface-raised"
            style={{ borderRadius: "var(--radius-md)", fontSize: "13.5px" }}
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Operations" description="All active and historical operations." />

      {/* Toolbar */}
      <div className="page-toolbar">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or ID…"
          className="border border-border bg-surface px-3 py-1.5 text-text-primary outline-none placeholder:text-text-secondary"
          style={{ fontSize: "13.5px", borderRadius: "var(--radius-md)", maxWidth: "240px", width: "100%" }}
        />

        {/* Status filter */}
        <div className="flex items-center gap-1">
          {statusOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleStatus(s)}
              className={`border px-2 py-1 capitalize transition-colors ${
                statusFilter.has(s)
                  ? "border-accent-blue bg-accent-blue-bg text-accent-blue"
                  : "border-border bg-surface text-text-secondary hover:bg-surface-raised"
              }`}
              style={{ fontSize: "12px", borderRadius: "var(--radius-sm)" }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1">
          {priorityOptions.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePriority(p)}
              className={`border px-2 py-1 capitalize transition-colors ${
                priorityFilter.has(p)
                  ? "border-accent-blue bg-accent-blue-bg text-accent-blue"
                  : "border-border bg-surface text-text-secondary hover:bg-surface-raised"
              }`}
              style={{ fontSize: "12px", borderRadius: "var(--radius-sm)" }}
            >
              {p}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-text-secondary hover:text-text-primary"
            style={{ fontSize: "12px" }}
          >
            Clear filters ({filterCount})
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(op) => op.id}
        onRowClick={handleRowClick}
        selectedRowId={selectedOp?.id}
        isLoading={isLoading}
        emptyState={{ title: "No operations found.", description: "Try adjusting your filters or search terms." }}
      />

      {/* Drawer */}
      {selectedOp && (
        <Drawer
          open={drawerOpen}
          onClose={() => { setDrawerOpen(false); setSelectedOp(null); }}
          title={selectedOp.name}
          footerAction={
            <button
              type="button"
              onClick={() => navigate(`/operations/${selectedOp.id}`)}
              className="w-full bg-accent-blue py-2 text-center font-medium text-white transition-colors hover:opacity-90"
              style={{ borderRadius: "var(--radius-md)", fontSize: "13.5px" }}
            >
              Open full details
            </button>
          }
        >
          <dl className="space-y-3">
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>ID</dt><dd style={{ fontSize: "13.5px" }}>{selectedOp.id}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Status</dt><dd><StatusBadge status={selectedOp.status} /></dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Priority</dt><dd><PriorityBadge priority={selectedOp.priority} /></dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Location</dt><dd style={{ fontSize: "13.5px" }}>{locMap.get(selectedOp.locationId) ?? "Unknown"}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Started</dt><dd style={{ fontSize: "13.5px" }}>{new Date(selectedOp.startedAt).toLocaleString()}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Last Updated</dt><dd style={{ fontSize: "13.5px" }}>{formatRelative(selectedOp.lastUpdatedAt)}</dd></div>
            <div>
              <dt className="text-text-secondary" style={{ fontSize: "12px" }}>Personnel ({selectedOp.personnelIds.length})</dt>
              <dd className="mt-1 space-y-1">
                {selectedOp.personnelIds.slice(0, 8).map((pid) => {
                  const p = personnel.find((pp) => pp.id === pid);
                  return <div key={pid} style={{ fontSize: "13.5px" }}>{p?.displayName ?? pid} <span className="text-text-secondary">({pid})</span></div>;
                })}
                {selectedOp.personnelIds.length > 8 && <p className="text-text-secondary" style={{ fontSize: "12px" }}>+{selectedOp.personnelIds.length - 8} more</p>}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary" style={{ fontSize: "12px" }}>Assets ({selectedOp.assetIds.length})</dt>
              <dd className="mt-1 space-y-1">
                {selectedOp.assetIds.map((aid) => {
                  const a = allAssets.find((aa) => aa.id === aid);
                  return <div key={aid} style={{ fontSize: "13.5px" }}>{a?.name ?? aid} <span className="text-text-secondary">({aid})</span></div>;
                })}
              </dd>
            </div>
          </dl>
          {drawerActivity.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 font-semibold" style={{ fontSize: "13.5px" }}>Recent Activity</h3>
              <ActivityList items={drawerActivity} />
            </div>
          )}
        </Drawer>
      )}
    </>
  );
}

