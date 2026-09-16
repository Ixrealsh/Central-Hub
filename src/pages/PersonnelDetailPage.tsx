import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ActivityList } from "@/components/data-display/ActivityList";
import { getPersonnelById } from "@/services/personnel.service";
import { locations } from "@/data/locations";
import { operations } from "@/data/operations";
import { auditLogs } from "@/data/auditLogs";
import type { Personnel } from "@/types/personnel";
import { ArrowLeft } from "lucide-react";

export default function PersonnelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<Personnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getPersonnelById(id).then((r) => { if (!r) setNotFound(true); else setPerson(r); setIsLoading(false); });
  }, [id]);

  const activity = useMemo(() => {
    if (!person) return [];
    return auditLogs.filter((e) => e.resourceId === person.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8).map((e) => ({ id: e.id, timestamp: e.timestamp, description: `${e.action}: ${e.resourceLabel}` }));
  }, [person]);

  if (isLoading) return <PageHeader title="Loading…" />;
  if (notFound || !person) return (<><PageHeader title="Officer Not Found" /><Link to="/personnel" className="inline-flex items-center gap-1 text-accent-blue" style={{ fontSize: "13.5px" }}><ArrowLeft size={16} aria-hidden="true" /> Back to Officers</Link></>);

  const locName = locations.find((l) => l.id === person.locationId)?.name ?? "Unknown";
  const opName = person.currentAssignmentOperationId ? operations.find((o) => o.id === person.currentAssignmentOperationId)?.name ?? "Unknown" : "Unassigned";

  return (
    <>
      <PageHeader title={person.displayName} description={person.id} actions={<StatusBadge status={person.status} />} />
      <div className="grid gap-4 md:grid-cols-2">
        <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Unit</dt><dd style={{ fontSize: "13.5px" }}>{person.unit}</dd></div>
        <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Status</dt><dd><StatusBadge status={person.status} /></dd></div>
        <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Assignment</dt><dd style={{ fontSize: "13.5px" }}>{opName}</dd></div>
        <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Location</dt><dd style={{ fontSize: "13.5px" }}>{locName}</dd></div>
      </div>
      {activity.length > 0 && <div className="mt-8"><h3 className="mb-2 font-semibold" style={{ fontSize: "15px" }}>Recent Activity</h3><ActivityList items={activity} /></div>}
    </>
  );
}

