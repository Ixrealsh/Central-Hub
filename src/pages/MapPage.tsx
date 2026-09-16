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

      {/* Layer toggles */}
      <div className="mb-4 flex items-center gap-3">
        {([
          { key: "locations", label: "Locations", val: showLocations, set: setShowLocations },
          { key: "operations", label: "Operations", val: showOperations, set: setShowOperations },
          { key: "assets", label: "Assets", val: showAssets, set: setShowAssets },
        ] as const).map((layer) => (
          <button
            key={layer.key}
            type="button"
            onClick={() => layer.set(!layer.val)}
            className={`border px-3 py-1 transition-colors ${
              layer.val
                ? "border-accent-blue bg-accent-blue-bg text-accent-blue"
                : "border-border text-text-secondary hover:bg-surface-raised"
            }`}
            style={{ fontSize: "12px", borderRadius: "var(--radius-sm)" }}
          >
            {layer.label}
          </button>
        ))}
      </div>

      <OperationsMap
        showLocations={showLocations}
        showOperations={showOperations}
        showAssets={showAssets}
        onMarkerClick={handleMarkerClick}
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

