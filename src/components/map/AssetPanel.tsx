import { Drawer } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { locations } from "@/data/locations";
import { operations } from "@/data/operations";
import { assets } from "@/data/assets";
import { personnel } from "@/data/personnel";

interface AssetPanelProps {
  open: boolean;
  onClose: () => void;
  type: "location" | "operation" | "asset" | null;
  id: string | null;
}

export function AssetPanel({ open, onClose, type, id }: AssetPanelProps) {
  if (!type || !id) return null;

  if (type === "asset") {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return null;
    const location = locations.find((l) => l.id === asset.locationId);
    const op = asset.assignedOperationId
      ? operations.find((o) => o.id === asset.assignedOperationId)
      : null;

    return (
      <Drawer open={open} onClose={onClose} title={asset.name}>
        <dl className="space-y-3">
          <Field label="ID" value={asset.id} />
          <Field label="Type" value={asset.type} />
          <Field label="Status"><StatusBadge status={asset.status} /></Field>
          <Field label="Location" value={location?.name ?? "Unknown"} />
          <Field label="Assigned Operation" value={op?.name ?? "Unassigned"} />
          <Field label="Last Updated" value={new Date(asset.lastUpdatedAt).toLocaleString()} />
        </dl>
      </Drawer>
    );
  }

  if (type === "operation") {
    const op = operations.find((o) => o.id === id);
    if (!op) return null;
    const location = locations.find((l) => l.id === op.locationId);

    return (
      <Drawer open={open} onClose={onClose} title={op.name}>
        <dl className="space-y-3">
          <Field label="ID" value={op.id} />
          <Field label="Status"><StatusBadge status={op.status} /></Field>
          <Field label="Location" value={location?.name ?? "Unknown"} />
          <Field label="Personnel" value={`${op.personnelIds.length} assigned`} />
          <Field label="Assets" value={`${op.assetIds.length} assigned`} />
          <Field label="Description" value={op.description} />
        </dl>
      </Drawer>
    );
  }

  if (type === "location") {
    const loc = locations.find((l) => l.id === id);
    if (!loc) return null;
    const opsHere = operations.filter((o) => o.locationId === id).length;
    const personnelHere = personnel.filter((p) => p.locationId === id).length;
    const assetsHere = assets.filter((a) => a.locationId === id).length;

    return (
      <Drawer open={open} onClose={onClose} title={loc.name}>
        <dl className="space-y-3">
          <Field label="ID" value={loc.id} />
          <Field label="Kind" value={loc.kind === "operations-center" ? "Operations Center" : "Field Site"} />
          <Field label="Operations" value={String(opsHere)} />
          <Field label="Personnel" value={String(personnelHere)} />
          <Field label="Assets" value={String(assetsHere)} />
        </dl>
      </Drawer>
    );
  }

  return null;
}

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-text-secondary" style={{ fontSize: "12px", lineHeight: "16px" }}>
        {label}
      </dt>
      <dd className="mt-0.5" style={{ fontSize: "13.5px", lineHeight: "20px" }}>
        {children ?? value}
      </dd>
    </div>
  );
}

