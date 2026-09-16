import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCommunications } from "@/services/communications.service";
import { operations } from "@/data/operations";
import { NOW } from "@/data/seed";
import type { Communication, CommunicationCategory } from "@/types/communication";

function relTime(iso: string): string {
  const diff = new Date(NOW).getTime() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const categoryOptions: CommunicationCategory[] = ["status-update", "logistics", "general"];
const dateRanges = ["Today", "Last 7 days", "Last 30 days"] as const;

export default function CommunicationsPage() {
  const [comms, setComms] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Set<CommunicationCategory>>(new Set());
  const [dateRange, setDateRange] = useState<(typeof dateRanges)[number]>("Last 7 days");
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getCommunications().then(setComms).finally(() => setIsLoading(false));
  }, []);

  const opMap = useMemo(() => new Map(operations.map((o) => [o.id, o.name])), []);

  const filtered = useMemo(() => {
    const nowMs = new Date(NOW).getTime();
    const rangeDays = dateRange === "Today" ? 1 : dateRange === "Last 7 days" ? 7 : 30;
    const cutoff = nowMs - rangeDays * 86_400_000;

    return comms
      .filter((c) => {
        const q = search.toLowerCase();
        const ms = !q || c.message.toLowerCase().includes(q) || c.unit.toLowerCase().includes(q);
        const mc = categoryFilter.size === 0 || categoryFilter.has(c.category);
        const md = new Date(c.timestamp).getTime() >= cutoff;
        const mu = !unreadOnly || !c.read;
        return ms && mc && md && mu;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [comms, search, categoryFilter, dateRange, unreadOnly]);

  return (
    <>
      <PageHeader title="Communications" description="Operational updates and status messages." />

      <div className="page-toolbar">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages…" className="border border-border bg-surface px-3 py-1.5 outline-none placeholder:text-text-secondary" style={{ fontSize: "13.5px", borderRadius: "var(--radius-md)", maxWidth: "240px", width: "100%" }} />
        <div className="flex items-center gap-1">
          {categoryOptions.map((c) => (
            <button key={c} type="button" onClick={() => setCategoryFilter((p) => { const n = new Set(p); if (n.has(c)) { n.delete(c); } else { n.add(c); } return n; })} className={`border px-2 py-1 ${categoryFilter.has(c) ? "border-accent-blue bg-accent-blue-bg text-accent-blue" : "border-border text-text-secondary hover:bg-surface-raised"}`} style={{ fontSize: "12px", borderRadius: "var(--radius-sm)" }}>{c}</button>
          ))}
        </div>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value as typeof dateRange)} className="border border-border bg-surface px-3 py-1.5 outline-none" style={{ fontSize: "13.5px", borderRadius: "var(--radius-md)" }}>
          {dateRanges.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <label className="flex items-center gap-2 text-text-secondary" style={{ fontSize: "12px" }}>
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
          Unread only
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-border" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <p className="font-semibold" style={{ fontSize: "15px" }}>No communications match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`border border-border bg-surface p-4 transition-colors hover:bg-surface-raised ${!c.read ? "border-l-2 border-l-accent-blue" : ""}`}
              style={{ borderRadius: "var(--radius-md)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${!c.read ? "font-semibold" : ""}`} style={{ fontSize: "13.5px" }}>
                    {c.operationId ? opMap.get(c.operationId) ?? c.unit : c.unit}
                  </span>
                  <span className="bg-accent-blue-bg px-1.5 py-0.5 text-accent-blue" style={{ fontSize: "11px", borderRadius: "var(--radius-sm)" }}>{c.category}</span>
                  {!c.read && <span className="h-2 w-2 rounded-full bg-accent-blue" title="Unread" />}
                </div>
                <span className="text-text-secondary" style={{ fontSize: "12px" }}>{relTime(c.timestamp)}</span>
              </div>
              <p className="mt-1 text-text-secondary" style={{ fontSize: "13.5px" }}>{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

