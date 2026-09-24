import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/data-display/StatCard";
import { getMedicalSummary } from "@/services/medical.service";
import { NOW } from "@/data/seed";
import type { MedicalSummary } from "@/types/medical";
import { Info } from "lucide-react";

function relTime(iso: string): string {
  const diff = new Date(NOW).getTime() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 1) return "Less than 1 hour ago";
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

export default function MedicalPage() {
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMedicalSummary().then(setSummary).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Medical Information" />

      {/* Notice */}
      <div
        className="mb-6 flex items-center gap-2 border border-accent-blue bg-accent-blue-bg px-4 py-3"
        style={{ borderRadius: "var(--radius-md)" }}
      >
        <Info size={16} className="shrink-0 text-accent-blue" aria-hidden="true" />
        <p className="text-accent-blue" style={{ fontSize: "13.5px" }}>
          Restricted information. Authorized personnel only.
        </p>
      </div>

      {isLoading || !summary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-border" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Cleared" value={summary.cleared} />
            <StatCard label="Monitoring" value={summary.monitoring} />
            <StatCard label="Attention" value={summary.attention} />
          </div>
          <p className="mt-4 text-text-secondary" style={{ fontSize: "12px" }}>
            Last updated: {relTime(summary.lastUpdatedAt)}
          </p>
        </>
      )}
    </>
  );
}

