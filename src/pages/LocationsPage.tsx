import { PageHeader } from "@/components/layout/PageHeader";
import { locations } from "@/data/locations";
import { operations } from "@/data/operations";
import { personnel } from "@/data/personnel";
import { assets } from "@/data/assets";

export default function LocationsPage() {
  // Locations are also shown in Map page - this standalone page provides a text-focused view
  return (
    <>
      <PageHeader title="Locations" description="All operational locations." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => {
          const opsCount = operations.filter((o) => o.locationId === loc.id).length;
          const personnelCount = personnel.filter((p) => p.locationId === loc.id).length;
          const assetCount = assets.filter((a) => a.locationId === loc.id).length;
          return (
            <div
              key={loc.id}
              className="border border-border bg-surface p-4"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <p className="font-semibold" style={{ fontSize: "13.5px" }}>{loc.name}</p>
              <p className="mt-0.5 capitalize text-text-secondary" style={{ fontSize: "12px" }}>
                {loc.kind.replace("-", " ")} · {loc.id}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-semibold" style={{ fontSize: "15px" }}>{opsCount}</p>
                  <p className="text-text-secondary" style={{ fontSize: "11px" }}>Operations</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ fontSize: "15px" }}>{personnelCount}</p>
                  <p className="text-text-secondary" style={{ fontSize: "11px" }}>Personnel</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ fontSize: "15px" }}>{assetCount}</p>
                  <p className="text-text-secondary" style={{ fontSize: "11px" }}>Assets</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

