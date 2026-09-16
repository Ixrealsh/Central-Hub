import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { Drawer } from "@/components/ui/Drawer";
import { ActivityList } from "@/components/data-display/ActivityList";
import { getPersonnel } from "@/services/personnel.service";
import { locations } from "@/data/locations";
import { operations } from "@/data/operations";
import { auditLogs } from "@/data/auditLogs";
import { NOW } from "@/data/seed";
import type { Personnel, PersonnelStatus } from "@/types/personnel";

function relTime(iso: string): string {
  const diff = new Date(NOW).getTime() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const statusOptions: PersonnelStatus[] = ["active", "standby", "off-duty", "unavailable"];
const units = ["Field Operations", "Logistics", "Intelligence", "Communications", "Medical Support", "Administration"];

export default function PersonnelPage() {
  const navigate = useNavigate();
  const [people, setPeople] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<PersonnelStatus>>(new Set());
  const [unitFilter, setUnitFilter] = useState("");
  const [selected, setSelected] = useState<Personnel | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getPersonnel()
      .then(setPeople)
      .catch(() => setError("Failed to load personnel."))
      .finally(() => setIsLoading(false));
  }, []);

  const locMap = useMemo(() => new Map(locations.map((l) => [l.id, l.name])), []);
  const opMap = useMemo(() => new Map(operations.map((o) => [o.id, o.name])), []);

  const filtered = useMemo(() => {
    return people.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.id.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q);
      const matchStatus = statusFilter.size === 0 || statusFilter.has(p.status);
      const matchUnit = !unitFilter || p.unit === unitFilter;
      return matchSearch && matchStatus && matchUnit;
    });
  }, [people, search, statusFilter, unitFilter]);

  const columns: Column<Personnel>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "displayName", header: "Name", sortable: true },
    { key: "status", header: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: "unit", header: "Unit", sortable: true },
    { key: "currentAssignmentOperationId", header: "Assignment", render: (row) => <span>{row.currentAssignmentOperationId ? opMap.get(row.currentAssignmentOperationId) ?? row.currentAssignmentOperationId : "Unassigned"}</span> },
    { key: "locationId", header: "Location", render: (row) => <span>{locMap.get(row.locationId) ?? "Unknown"}</span> },
    { key: "lastActivityAt", header: "Last Activity", sortable: true, render: (row) => <span>{relTime(row.lastActivityAt)}</span> },
  ];

  const drawerActivity = useMemo(() => {
    if (!selected) return [];
    return auditLogs
      .filter((e) => e.resourceId === selected.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4)
      .map((e) => ({ id: e.id, timestamp: e.timestamp, description: `${e.action}: ${e.resourceLabel}` }));
  }, [selected]);

  if (error) {
    return (
      <>
        <PageHeader title="Officers" />
        <div className="flex flex-col items-center py-16">
          <p className="text-accent-red font-semibold">{error}</p>
          <button type="button" onClick={() => { setError(null); setIsLoading(true); getPersonnel().then(setPeople).catch(() => setError("Failed to load personnel.")).finally(() => setIsLoading(false)); }} className="mt-4 border border-border px-4 py-2 text-accent-blue" style={{ borderRadius: "var(--radius-md)", fontSize: "13.5px" }}>Retry</button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Officers" />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID…" className="border border-border bg-surface px-3 py-1.5 outline-none placeholder:text-text-secondary" style={{ fontSize: "13.5px", borderRadius: "var(--radius-md)", maxWidth: "240px", width: "100%" }} />
        <div className="flex items-center gap-1">
          {statusOptions.map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter((prev) => { const n = new Set(prev); if (n.has(s)) { n.delete(s); } else { n.add(s); } return n; })} className={`border px-2 py-1 capitalize transition-colors ${statusFilter.has(s) ? "border-accent-blue bg-accent-blue-bg text-accent-blue" : "border-border text-text-secondary hover:bg-surface-raised"}`} style={{ fontSize: "12px", borderRadius: "var(--radius-sm)" }}>{s}</button>
          ))}
        </div>
        <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="border border-border bg-surface px-3 py-1.5 outline-none" style={{ fontSize: "13.5px", borderRadius: "var(--radius-md)" }}>
          <option value="">All units</option>
          {units.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} getRowId={(p) => p.id} onRowClick={(p) => { setSelected(p); setDrawerOpen(true); }} selectedRowId={selected?.id} isLoading={isLoading} emptyState={{ title: "No officers found.", description: "Try adjusting your filters or search terms." }} />

      {selected && (
        <Drawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setSelected(null); }} title={selected.displayName}
          footerAction={<button type="button" onClick={() => navigate(`/personnel/${selected.id}`)} className="w-full bg-accent-blue py-2 text-center font-medium text-white" style={{ borderRadius: "var(--radius-md)", fontSize: "13.5px" }}>Open full details</button>}
        >
          <dl className="space-y-3">
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>ID</dt><dd style={{ fontSize: "13.5px" }}>{selected.id}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Status</dt><dd><StatusBadge status={selected.status} /></dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Unit</dt><dd style={{ fontSize: "13.5px" }}>{selected.unit}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Assignment</dt><dd style={{ fontSize: "13.5px" }}>{selected.currentAssignmentOperationId ? opMap.get(selected.currentAssignmentOperationId) ?? "Unknown" : "Unassigned"}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Location</dt><dd style={{ fontSize: "13.5px" }}>{locMap.get(selected.locationId) ?? "Unknown"}</dd></div>
          </dl>
          {drawerActivity.length > 0 && <div className="mt-6"><h3 className="mb-2 font-semibold" style={{ fontSize: "13.5px" }}>Recent Activity</h3><ActivityList items={drawerActivity} /></div>}
        </Drawer>
      )}
    </>
  );
}

