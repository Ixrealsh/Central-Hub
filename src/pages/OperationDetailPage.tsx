import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { PriorityBadge } from "@/components/data-display/PriorityBadge";
import { DataTable, type Column } from "@/components/data-display/DataTable";
import { ActivityList } from "@/components/data-display/ActivityList";
import { getOperationById } from "@/services/operations.service";
import { locations } from "@/data/locations";
import { personnel } from "@/data/personnel";
import { assets } from "@/data/assets";
import { communications } from "@/data/communications";
import { auditLogs } from "@/data/auditLogs";
import { NOW } from "@/data/seed";
import type { Operation } from "@/types/operation";
import type { Personnel } from "@/types/personnel";
import type { Asset } from "@/types/asset";
import type { Communication } from "@/types/communication";
import { ArrowLeft } from "lucide-react";

const tabs = ["Overview", "Personnel", "Assets", "Communications", "Activity"] as const;
type Tab = (typeof tabs)[number];

function relTime(iso: string): string {
  const diff = new Date(NOW).getTime() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OperationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [op, setOp] = useState<Operation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getOperationById(id).then((result) => {
      if (!result) setNotFound(true);
      else setOp(result);
      setIsLoading(false);
    });
  }, [id]);

  const locName = useMemo(() => {
    if (!op) return "";
    return locations.find((l) => l.id === op.locationId)?.name ?? "Unknown";
  }, [op]);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Loading…" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-64 animate-pulse rounded bg-border" />
          ))}
        </div>
      </>
    );
  }

  if (notFound || !op) {
    return (
      <>
        <PageHeader title="Operation Not Found" />
        <p className="text-text-secondary" style={{ fontSize: "13.5px" }}>
          The operation &ldquo;{id}&rdquo; could not be found.
        </p>
        <Link to="/operations" className="mt-4 inline-flex items-center gap-1 text-accent-blue hover:underline" style={{ fontSize: "13.5px" }}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to Operations
        </Link>
      </>
    );
  }

  const assignedPersonnel = personnel.filter((p) => op.personnelIds.includes(p.id));
  const assignedAssets = assets.filter((a) => op.assetIds.includes(a.id));
  const opComms = communications.filter((c) => c.operationId === op.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const opActivity = auditLogs
    .filter((e) => e.resourceId === op.id)
    .concat(opComms.map((c) => ({ id: c.id, timestamp: c.timestamp, actor: c.unit, action: "UPDATE" as const, resourceType: "operation" as const, resourceId: op.id, resourceLabel: c.message, result: "success" as const })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((e) => ({ id: e.id, timestamp: e.timestamp, description: `${e.action} by ${e.actor}: ${e.resourceLabel}` }));

  const personnelColumns: Column<Personnel>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "displayName", header: "Name", sortable: true },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "unit", header: "Unit", sortable: true },
  ];

  const assetColumns: Column<Asset>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "name", header: "Name", sortable: true },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "type", header: "Type", sortable: true },
  ];

  return (
    <>
      <PageHeader
        title={op.name}
        description={`${locName} · ${op.id}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={op.status} />
            <PriorityBadge priority={op.priority} />
          </div>
        }
      />

      {/* Tabs */}
      <div className="mb-6 flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 transition-colors ${
              activeTab === tab
                ? "border-b-2 border-b-accent-blue font-medium text-accent-blue"
                : "text-text-secondary hover:text-text-primary"
            }`}
            style={{ fontSize: "13.5px" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Status"><StatusBadge status={op.status} /></Field>
          <Field label="Priority"><PriorityBadge priority={op.priority} /></Field>
          <Field label="Location" value={locName} />
          <Field label="Started" value={new Date(op.startedAt).toLocaleString()} />
          <Field label="Last Updated" value={relTime(op.lastUpdatedAt)} />
          <Field label="Description" value={op.description} />
        </div>
      )}

      {activeTab === "Personnel" && (
        <DataTable
          columns={personnelColumns}
          data={assignedPersonnel}
          getRowId={(p) => p.id}
          onRowClick={(p) => navigate(`/personnel/${p.id}`)}
          isLoading={false}
          emptyState={{ title: "No personnel assigned.", description: "This operation has no assigned personnel." }}
        />
      )}

      {activeTab === "Assets" && (
        <DataTable
          columns={assetColumns}
          data={assignedAssets}
          getRowId={(a) => a.id}
          onRowClick={(a) => navigate(`/assets/${a.id}`)}
          isLoading={false}
          emptyState={{ title: "No assets assigned.", description: "This operation has no assigned assets." }}
        />
      )}

      {activeTab === "Communications" && (
        <div className="space-y-2">
          {opComms.length === 0 ? (
            <p className="py-8 text-center text-text-secondary" style={{ fontSize: "13.5px" }}>No communications for this operation.</p>
          ) : (
            opComms.map((c) => <CommItem key={c.id} comm={c} />)
          )}
        </div>
      )}

      {activeTab === "Activity" && <ActivityList items={opActivity} />}
    </>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-text-secondary" style={{ fontSize: "12px" }}>{label}</dt>
      <dd className="mt-0.5" style={{ fontSize: "13.5px" }}>{children ?? value}</dd>
    </div>
  );
}

function CommItem({ comm }: { comm: Communication }) {
  return (
    <div className={`border border-border p-3 ${!comm.read ? "border-l-2 border-l-accent-blue" : ""}`} style={{ borderRadius: "var(--radius-md)" }}>
      <div className="flex items-center justify-between">
        <span className="font-medium" style={{ fontSize: "13.5px" }}>{comm.unit}</span>
        <span className="text-text-secondary" style={{ fontSize: "12px" }}>{relTime(comm.timestamp)}</span>
      </div>
      <span
        className="mt-1 inline-block bg-accent-blue-bg px-1.5 py-0.5 text-accent-blue"
        style={{ fontSize: "11px", borderRadius: "var(--radius-sm)" }}
      >
        {comm.category}
      </span>
      <p className="mt-1 text-text-secondary" style={{ fontSize: "13.5px" }}>{comm.message}</p>
    </div>
  );
}

