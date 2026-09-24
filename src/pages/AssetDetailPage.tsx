import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { getAssetById } from "@/services/assets.service";
import { locations } from "@/data/locations";
import { operations } from "@/data/operations";
import type { Asset } from "@/types/asset";
import { ArrowLeft } from "lucide-react";

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAssetById(id).then((r) => { if (!r) setNotFound(true); else setAsset(r); setIsLoading(false); });
  }, [id]);

  const locName = useMemo(() => asset ? locations.find((l) => l.id === asset.locationId)?.name ?? "Unknown" : "", [asset]);
  const opName = useMemo(() => asset?.assignedOperationId ? operations.find((o) => o.id === asset.assignedOperationId)?.name ?? "Unknown" : "Unassigned", [asset]);

  if (isLoading) return <PageHeader title="Loading…" />;
  if (notFound || !asset) return (<><PageHeader title="Asset Not Found" /><Link to="/assets" className="inline-flex items-center gap-1 text-accent-blue" style={{ fontSize: "13.5px" }}><ArrowLeft size={16} aria-hidden="true" /> Back to Assets</Link></>);

  return (
    <>
      <PageHeader title={asset.name} description={asset.id} actions={<StatusBadge status={asset.status} />} />
      <div className="grid gap-4 md:grid-cols-2">
        <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Type</dt><dd className="capitalize" style={{ fontSize: "13.5px" }}>{asset.type}</dd></div>
        <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Status</dt><dd><StatusBadge status={asset.status} /></dd></div>
        <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Location</dt><dd style={{ fontSize: "13.5px" }}>{locName}</dd></div>
        <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Assigned Operation</dt><dd style={{ fontSize: "13.5px" }}>{opName}</dd></div>
        <div><dt className="text-text-secondary" style={{ fontSize: "12px" }}>Last Updated</dt><dd style={{ fontSize: "13.5px" }}>{new Date(asset.lastUpdatedAt).toLocaleString()}</dd></div>
      </div>
    </>
  );
}

