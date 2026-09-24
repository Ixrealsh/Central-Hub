import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OperationsMap } from "@/components/map/OperationsMap";
import { AssetPanel } from "@/components/map/AssetPanel";
import { locations } from "@/data/locations";
import { operations } from "@/data/operations";
import { assets } from "@/data/assets";
import { personnel } from "@/data/personnel";

export default function MapPage() {
  const [showLocations, setShowLocations] = useState(true);
  const [showOperations, setShowOperations] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [panelType, setPanelType] = useState<"location" | "operation" | "asset" | null>(null);
  const [panelId, setPanelId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  function handleMarkerClick(type: "location" | "operation" | "asset", id: string) {
    setPanelType(type);
    setPanelId(id);
    setPanelOpen(true);
  }

  return (
    <>
      <PageHeader title="Map" description="Live view of operations, assets, and locations." />

      {/* Layer toggles & Pointer Legend */}
      <div className="page-toolbar flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-text-secondary font-semibold mr-1" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
            LAYERS:
          </span>
          {([
            {
              key: "locations",
              label: "Command Hubs & Sites",
              val: showLocations,
              set: setShowLocations,
              badges: [
                { color: "bg-blue-600", label: "HQ" },
                { color: "bg-amber-500", label: "Site" },
              ],
            },
            {
              key: "operations",
              label: "Operations",
              val: showOperations,
              set: setShowOperations,
              badges: [
                { color: "bg-emerald-500", label: "Active" },
                { color: "bg-blue-500", label: "Standby" },
              ],
            },
            {
              key: "assets",
              label: "Tactical Assets",
              val: showAssets,
              set: setShowAssets,
              badges: [
                { color: "bg-emerald-400", label: "Active" },
                { color: "bg-blue-400", label: "Standby" },
              ],
            },
          ] as const).map((layer) => (
            <button
              key={layer.key}
              type="button"
              onClick={() => layer.set(!layer.val)}
              className={`inline-flex items-center gap-2 border px-3 py-1.5 transition-colors ${
                layer.val
                  ? "border-accent-blue bg-accent-blue-bg text-accent-blue font-medium"
                  : "border-border text-text-secondary hover:bg-surface-raised opacity-60"
              }`}
              style={{ fontSize: "12px", borderRadius: "var(--radius-sm)" }}
            >
              <div className="flex items-center -space-x-1">
                {layer.badges.map((b, i) => (
                  <span key={i} className={`inline-block h-2.5 w-2.5 rounded-full ring-1 ring-surface ${b.color}`} />
                ))}
              </div>
              <span>{layer.label}</span>
            </button>
          ))}
        </div>

        {/* Tactical Pointer Legend */}
        <div className="hidden sm:flex items-center gap-3 text-text-secondary" style={{ fontSize: "11.5px" }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <strong className="text-text-primary font-medium">Green Pin:</strong> Active Op
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            <strong className="text-text-primary font-medium">Blue Pin:</strong> Standby Op / HQ
          </span>
        </div>
      </div>

      <OperationsMap
        showLocations={showLocations}
        showOperations={showOperations}
        showAssets={showAssets}
        onMarkerClick={handleMarkerClick}
        selectedId={panelOpen ? panelId ?? undefined : undefined}
        selectedType={panelOpen ? panelType ?? undefined : undefined}
      />

      {/* Location list below map */}
      <div className="mt-6">
        <h2 className="mb-3 font-semibold" style={{ fontSize: "15px", lineHeight: "22px" }}>Locations</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => {
            const opsCount = operations.filter((o) => o.locationId === loc.id).length;
            const personnelCount = personnel.filter((p) => p.locationId === loc.id).length;
            const assetCount = assets.filter((a) => a.locationId === loc.id).length;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleMarkerClick("location", loc.id)}
                className="border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-raised"
                style={{ borderRadius: "var(--radius-lg)" }}
              >
                <p className="font-semibold" style={{ fontSize: "13.5px" }}>{loc.name}</p>
                <p className="mt-0.5 capitalize text-text-secondary" style={{ fontSize: "12px" }}>{loc.kind.replace("-", " ")}</p>
                <div className="mt-2 flex gap-4 text-text-secondary" style={{ fontSize: "12px" }}>
                  <span>{opsCount} ops</span>
                  <span>{personnelCount} personnel</span>
                  <span>{assetCount} assets</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <AssetPanel open={panelOpen} onClose={() => setPanelOpen(false)} type={panelType} id={panelId} />
    </>
  );
}

