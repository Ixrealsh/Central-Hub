import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { Drawer } from "@/components/ui/Drawer";
import { getAssets } from "@/services/assets.service";
import { locations } from "@/data/locations";
import { operations } from "@/data/operations";
import { NOW } from "@/data/seed";
import type { Asset, AssetType, AssetStatus } from "@/types/asset";

function relTime(iso: string): string {
  const diff = new Date(NOW).getTime() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const typeOptions: AssetType[] = ["vehicle", "equipment", "field-device", "comms-device"];
const statusOptions: AssetStatus[] = ["active", "idle", "offline"];

export default function AssetsPage() {
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<Set<AssetType>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<AssetStatus>>(new Set());
  const [selected, setSelected] = useState<Asset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getAssets().then(setAssetList).catch(() => setError("Failed to load assets.")).finally(() => setIsLoading(false));
  }, []);

  const locMap = useMemo(() => new Map(locations.map((l) => [l.id, l.name])), []);
  const opMap = useMemo(() => new Map(operations.map((o) => [o.id, o.name])), []);

  const filtered = useMemo(() => assetList.filter((a) => {
    const q = search.toLowerCase();
    const ms = !q || a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    const mt = typeFilter.size === 0 || typeFilter.has(a.type);
    const mst = statusFilter.size === 0 || statusFilter.has(a.status);
    return ms && mt && mst;
  }), [assetList, search, typeFilter, statusFilter]);

  const columns: Column<Asset>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "name", header: "Name", sortable: true },
    { key: "type", header: "Type", sortable: true, render: (row) => <span className="capitalize">{row.type}</span> },
    { key: "status", header: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: "locationId", header: "Location", render: (row) => <span>{locMap.get(row.locationId) ?? "Unknown"}</span> },
    { key: "assignedOperationId", header: "Operation", render: (row) => <span>{row.assignedOperationId ? opMap.get(row.assignedOperationId) ?? row.assignedOperationId : "Unassigned"}</span> },
    { key: "lastUpdatedAt", header: "Last Updated", sortable: true, render: (row) => <span>{relTime(row.lastUpdatedAt)}</span> },
  ];

  if (error) {
    return (<><PageHeader title="Assets" /><div className="flex flex-col items-center py-16"><p className="text-accent-red font-semibold">{error}</p><button type="button" onClick={() => { setError(null); setIsLoading(true); getAssets().then(setAssetList).catch(() => setError("Failed.")).finally(() => setIsLoading(false)); }} className="mt-4 border border-border px-4 py-2 text-accent-blue" style={{ borderRadius: "var(--radius-md)" }}>Retry</button></div></>);
  }

  return (
    <>
      <PageHeader title="Assets" />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="border border-border bg-surface px-3 py-1.5 outline-none placeholder:text-text-secondary" style={{ fontSize: "13.5px", borderRadius: "var(--radius-md)", maxWidth: "200px", width: "100%" }} />
        <div className="flex items-center gap-1">
          {typeOptions.map((t) => (<button key={t} type="button" onClick={() => setTypeFilter((p) => { const n = new Set(p); n.has(t) ? n.delete(t) : n.add(t); return n; })} className={`border px-2 py-1 capitalize ${typeFilter.has(t) ? "border-accent-blue bg-accent-blue-bg text-accent-blue" : "border-border text-text-secondary hover:bg-surface-raised"}`} style={{ fontSize: "12px", borderRadius: "var(--radius-sm)" }}>{t}</button>))}
          {typeOptions.map((t) => (<button key={t} type="button" onClick={() => setTypeFilter((p) => { const n = new Set(p); if (n.has(t)) { n.delete(t); } else { n.add(t); } return n; })} className={`border px-2 py-1 capitalize ${typeFilter.has(t) ? "border-accent-blue bg-accent-blue-bg text-accent-blue" : "border-border text-text-secondary hover:bg-surface-raised"}`} style={{ fontSize: "12px", borderRadius: "var(--radius-sm)" }}>{t}</button>))}
        </div>
        <div className="flex items-center gap-1">
          {statusOptions.map((s) => (<button key={s} type="button" onClick={() => setStatusFilter((p) => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; })} className={`border px-2 py-1 capitalize ${statusFilter.has(s) ? "border-accent-blue bg-accent-blue-bg text-accent-blue" : "border-border text-text-secondary hover:bg-surface-raised"}`} style={{ fontSize: "12px", borderRadius: "var(--radius-sm)" }}>{s}</button>))}
          {statusOptions.map((s) => (<button key={s} type="button" onClick={() => setStatusFilter((p) => { const n = new Set(p); if (n.has(s)) { n.delete(s); } else { n.add(s); } return n; })} className={`border px-2 py-1 capitalize ${statusFilter.has(s) ? "border-accent-blue bg-accent-blue-bg text-accent-blue" : "border-border text-text-secondary hover:bg-surface-raised"}`} style={{ fontSize: "12px", borderRadius: "var(--radius-sm)" }}>{s}</button>))}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} getRowId={(a) => a.id} onRowClick={(a) => { setSelected(a); setDrawerOpen(true); }} selectedRowId={selected?.id} isLoading={isLoading} emptyState={{ title: "No assets found.", description: "Try adjusting your filters." }} />

      {selected && (
        <Drawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setSelected(null); }} title={selected.name}>
          <dl className="space-y-3">
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>ID</dt><dd style={{ fontSize: "13.5px" }}>{selected.id}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Type</dt><dd className="capitalize" style={{ fontSize: "13.5px" }}>{selected.type}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Status</dt><dd><StatusBadge status={selected.status} /></dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Location</dt><dd style={{ fontSize: "13.5px" }}>{locMap.get(selected.locationId) ?? "Unknown"}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Operation</dt><dd style={{ fontSize: "13.5px" }}>{selected.assignedOperationId ? opMap.get(selected.assignedOperationId) ?? "Unknown" : "Unassigned"}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Last Updated</dt><dd style={{ fontSize: "13.5px" }}>{new Date(selected.lastUpdatedAt).toLocaleString()}</dd></div>
          </dl>
        </Drawer>
      )}
    </>
  );
}

