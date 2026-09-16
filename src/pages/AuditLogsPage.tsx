import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { Drawer } from "@/components/ui/Drawer";
import { getAuditLogs } from "@/services/audit.service";
import { NOW } from "@/data/seed";
import type { AuditLogEntry, AuditAction, AuditResourceType } from "@/types/audit";

function relTime(iso: string): string {
  const diff = new Date(NOW).getTime() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const actionOptions: AuditAction[] = ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "LOGIN"];
const resourceOptions: AuditResourceType[] = ["operation", "asset", "personnel", "system"];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<Set<AuditAction>>(new Set());
  const [resourceFilter, setResourceFilter] = useState<Set<AuditResourceType>>(new Set());
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getAuditLogs().then(setLogs).catch(() => setError("Failed to load audit logs.")).finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return logs
      .filter((e) => {
        const q = search.toLowerCase();
        const ms = !q || e.actor.toLowerCase().includes(q) || e.resourceLabel.toLowerCase().includes(q);
        const ma = actionFilter.size === 0 || actionFilter.has(e.action);
        const mr = resourceFilter.size === 0 || resourceFilter.has(e.resourceType);
        return ms && ma && mr;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, search, actionFilter, resourceFilter]);

  const columns: Column<AuditLogEntry>[] = [
    { key: "timestamp", header: "Timestamp", sortable: true, render: (row) => <span title={new Date(row.timestamp).toLocaleString()}>{relTime(row.timestamp)}</span> },
    { key: "actor", header: "Actor", sortable: true },
    { key: "action", header: "Action", sortable: true },
    { key: "resourceLabel", header: "Resource", sortable: true },
    { key: "result", header: "Result", render: (row) => <StatusBadge status={row.result} /> },
  ];

  if (error) {
    return (<><PageHeader title="Audit Logs" /><div className="flex flex-col items-center py-16"><p className="text-accent-red font-semibold">{error}</p><button type="button" onClick={() => { setError(null); setIsLoading(true); getAuditLogs().then(setLogs).catch(() => setError("Failed.")).finally(() => setIsLoading(false)); }} className="mt-4 border border-border px-4 py-2 text-accent-blue" style={{ borderRadius: "var(--radius-md)" }}>Retry</button></div></>);
  }

  return (
    <>
      <PageHeader title="Audit Logs" />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search actor or resource…" className="border border-border bg-surface px-3 py-1.5 outline-none placeholder:text-text-secondary" style={{ fontSize: "13.5px", borderRadius: "var(--radius-md)", maxWidth: "240px", width: "100%" }} />
        <div className="flex items-center gap-1">
          {actionOptions.map((a) => (
            <button key={a} type="button" onClick={() => setActionFilter((p) => { const n = new Set(p); if (n.has(a)) { n.delete(a); } else { n.add(a); } return n; })} className={`border px-2 py-1 ${actionFilter.has(a) ? "border-accent-blue bg-accent-blue-bg text-accent-blue" : "border-border text-text-secondary hover:bg-surface-raised"}`} style={{ fontSize: "11px", borderRadius: "var(--radius-sm)" }}>{a}</button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {resourceOptions.map((r) => (
            <button key={r} type="button" onClick={() => setResourceFilter((p) => { const n = new Set(p); if (n.has(r)) { n.delete(r); } else { n.add(r); } return n; })} className={`border px-2 py-1 capitalize ${resourceFilter.has(r) ? "border-accent-blue bg-accent-blue-bg text-accent-blue" : "border-border text-text-secondary hover:bg-surface-raised"}`} style={{ fontSize: "11px", borderRadius: "var(--radius-sm)" }}>{r}</button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} getRowId={(e) => e.id} onRowClick={(e) => { setSelected(e); setDrawerOpen(true); }} selectedRowId={selected?.id} isLoading={isLoading} emptyState={{ title: "No audit logs found.", description: "Try adjusting your filters." }} />

      {selected && (
        <Drawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setSelected(null); }} title={`Event ${selected.id}`}>
          <dl className="space-y-3">
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Event ID</dt><dd style={{ fontSize: "13.5px" }}>{selected.id}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Timestamp</dt><dd style={{ fontSize: "13.5px" }}>{new Date(selected.timestamp).toLocaleString()}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Actor</dt><dd style={{ fontSize: "13.5px" }}>{selected.actor}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Action</dt><dd style={{ fontSize: "13.5px" }}>{selected.action}</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Resource</dt><dd style={{ fontSize: "13.5px" }}>{selected.resourceLabel} ({selected.resourceType})</dd></div>
            <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Result</dt><dd><StatusBadge status={selected.result} /></dd></div>
            {selected.previousState && selected.newState && (
              <div>
                <dt className="text-text-secondary mb-1" style={{ fontSize: "12px" }}>State Change</dt>
                <dd className="grid grid-cols-2 gap-2">
                  <div className="border border-border p-2" style={{ borderRadius: "var(--radius-sm)" }}>
                    <p className="text-text-secondary" style={{ fontSize: "11px" }}>Before</p>
                    {Object.entries(selected.previousState).map(([k, v]) => <p key={k} style={{ fontSize: "13.5px" }}>{k}: {v}</p>)}
                  </div>
                  <div className="border border-border p-2" style={{ borderRadius: "var(--radius-sm)" }}>
                    <p className="text-text-secondary" style={{ fontSize: "11px" }}>After</p>
                    {Object.entries(selected.newState).map(([k, v]) => <p key={k} style={{ fontSize: "13.5px" }}>{k}: {v}</p>)}
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </Drawer>
      )}
    </>
  );
}

