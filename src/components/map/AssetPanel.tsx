import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { PriorityBadge } from "@/components/data-display/PriorityBadge";
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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatRelative(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    if (isNaN(diff)) return "Recently";
    const min = Math.floor(diff / 60_000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "Recently";
  }
}

export function AssetPanel({ open, onClose, type, id }: AssetPanelProps) {
  if (!type || !id) return null;

  // ── 1. LOCATION SIDE POP ──────────────────────────────────────────
  if (type === "location") {
    const loc = locations.find((l) => l.id === id);
    if (!loc) return null;

    const isHQ = loc.kind === "operations-center";
    const opsAtLoc = operations.filter((o) => o.locationId === id);
    const activeOpsCount = opsAtLoc.filter((o) => o.status === "active").length;
    const personnelAtLoc = personnel.filter((p) => p.locationId === id);
    const assetsAtLoc = assets.filter((a) => a.locationId === id);

    return (
      <Drawer
        open={open}
        onClose={onClose}
        title={
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-text-primary text-[15px] truncate">
              {loc.name}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded border border-border bg-surface-raised text-text-secondary shrink-0">
              {loc.id}
            </span>
          </div>
        }
        footerAction={
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-text-secondary">Sector Command Registry</span>
            <Link
              to="/locations"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-raised"
            >
              <span>View Locations</span>
              <ExternalLink size={13} className="text-text-secondary" />
            </Link>
          </div>
        }
      >
        {/* Architectural Overview Metrics */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded border border-border bg-surface-raised/40 p-2.5">
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              Operations
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-text-primary">
              {opsAtLoc.length}
            </div>
            <div className="text-[11px] text-text-secondary">
              {activeOpsCount} active
            </div>
          </div>

          <div className="rounded border border-border bg-surface-raised/40 p-2.5">
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              Personnel
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-text-primary">
              {personnelAtLoc.length}
            </div>
            <div className="text-[11px] text-text-secondary">Stationed</div>
          </div>

          <div className="rounded border border-border bg-surface-raised/40 p-2.5">
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              Assets
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-text-primary">
              {assetsAtLoc.length}
            </div>
            <div className="text-[11px] text-text-secondary">Deployed</div>
          </div>
        </div>

        {/* Facility Specifications */}
        <div className="rounded border border-border bg-surface-raised/30 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Facility Class</span>
            <span className="font-medium text-text-primary">
              {isHQ ? "Operations Center" : "Field Site"}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
            <span className="text-text-secondary">Grid Coordinates</span>
            <span className="font-mono text-text-primary">
              X: {loc.x.toFixed(1)} • Y: {loc.y.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Assigned Operations List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
            <span>Operations in Sector ({opsAtLoc.length})</span>
          </div>

          {opsAtLoc.length > 0 ? (
            <div className="divide-y divide-border border border-border rounded overflow-hidden">
              {opsAtLoc.map((op) => (
                <Link
                  key={op.id}
                  to={`/operations/${op.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 text-xs transition-colors hover:bg-surface-raised"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-text-primary truncate">
                      {op.name}
                    </div>
                    <div className="font-mono text-[11px] text-text-secondary">
                      {op.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={op.priority} />
                    <StatusBadge status={op.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-border p-3 text-center text-xs text-text-secondary">
              No active operations currently assigned.
            </div>
          )}
        </div>

        {/* Stationed Hardware / Assets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
            <span>Stationed Assets ({assetsAtLoc.length})</span>
          </div>

          {assetsAtLoc.length > 0 ? (
            <div className="divide-y divide-border border border-border rounded overflow-hidden">
              {assetsAtLoc.slice(0, 5).map((asset) => (
                <Link
                  key={asset.id}
                  to={`/assets/${asset.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 text-xs transition-colors hover:bg-surface-raised"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-text-primary truncate">
                      {asset.name}
                    </div>
                    <div className="font-mono text-[11px] text-text-secondary capitalize">
                      {asset.id} • {asset.type.replace("-", " ")}
                    </div>
                  </div>
                  <StatusBadge status={asset.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-border p-3 text-center text-xs text-text-secondary">
              No hardware assigned to this location.
            </div>
          )}
        </div>

        {/* Stationed Personnel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
            <span>Personnel ({personnelAtLoc.length})</span>
          </div>

          {personnelAtLoc.length > 0 ? (
            <div className="divide-y divide-border border border-border rounded overflow-hidden">
              {personnelAtLoc.slice(0, 5).map((person) => (
                <Link
                  key={person.id}
                  to={`/personnel/${person.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 text-xs transition-colors hover:bg-surface-raised"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-text-primary truncate">
                      {person.displayName}
                    </div>
                    <div className="text-[11px] text-text-secondary truncate">
                      {person.unit}
                    </div>
                  </div>
                  <StatusBadge status={person.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-border p-3 text-center text-xs text-text-secondary">
              No officers stationed at this outpost.
            </div>
          )}
        </div>
      </Drawer>
    );
  }

  // ── 2. OPERATION SIDE POP ─────────────────────────────────────────
  if (type === "operation") {
    const op = operations.find((o) => o.id === id);
    if (!op) return null;

    const location = locations.find((l) => l.id === op.locationId);
    const assignedPersonnel = personnel.filter((p) => op.personnelIds.includes(p.id));
    const assignedAssets = assets.filter((a) => op.assetIds.includes(a.id));

    return (
      <Drawer
        open={open}
        onClose={onClose}
        title={
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-text-primary text-[15px] truncate">
              {op.name}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded border border-border bg-surface-raised text-text-secondary shrink-0">
              {op.id}
            </span>
          </div>
        }
        footerAction={
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-text-secondary">
              Started {formatDate(op.startedAt)}
            </span>
            <Link
              to={`/operations/${op.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded bg-accent-blue px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
            >
              <span>Full Briefing</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        }
      >
        {/* Status and Priority Header Row */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded border border-border bg-surface-raised/40">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Status:</span>
            <StatusBadge status={op.status} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Priority:</span>
            <PriorityBadge priority={op.priority} />
          </div>
        </div>

        {/* Mission Directive Callout */}
        <div className="rounded border border-border bg-surface-raised/30 p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-text-secondary mb-1">
            Mission Directive
          </div>
          <p className="text-xs leading-relaxed text-text-primary">
            {op.description}
          </p>
        </div>

        {/* Operation Architecture Metrics */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="rounded border border-border bg-surface-raised/40 p-2.5">
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              Base Sector
            </div>
            <div className="mt-1 font-medium text-text-primary truncate">
              {location?.name ?? "Unknown Location"}
            </div>
          </div>

          <div className="rounded border border-border bg-surface-raised/40 p-2.5">
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              Last Activity
            </div>
            <div className="mt-1 font-mono text-text-primary">
              {formatRelative(op.lastUpdatedAt)}
            </div>
          </div>
        </div>

        {/* Assigned Strike Personnel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
            <span>Assigned Team ({assignedPersonnel.length})</span>
          </div>

          <div className="divide-y divide-border border border-border rounded overflow-hidden">
            {assignedPersonnel.map((person) => (
              <Link
                key={person.id}
                to={`/personnel/${person.id}`}
                onClick={onClose}
                className="flex items-center justify-between p-2.5 text-xs transition-colors hover:bg-surface-raised"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-medium text-text-primary truncate">
                    {person.displayName}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate">
                    {person.unit}
                  </div>
                </div>
                <StatusBadge status={person.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Assigned Assets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
            <span>Assigned Equipment ({assignedAssets.length})</span>
          </div>

          <div className="divide-y divide-border border border-border rounded overflow-hidden">
            {assignedAssets.map((asset) => (
              <Link
                key={asset.id}
                to={`/assets/${asset.id}`}
                onClick={onClose}
                className="flex items-center justify-between p-2.5 text-xs transition-colors hover:bg-surface-raised"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-medium text-text-primary truncate">
                    {asset.name}
                  </div>
                  <div className="font-mono text-[11px] text-text-secondary capitalize">
                    {asset.id} • {asset.type.replace("-", " ")}
                  </div>
                </div>
                <StatusBadge status={asset.status} />
              </Link>
            ))}
          </div>
        </div>
      </Drawer>
    );
  }

  // ── 3. ASSET SIDE POP ─────────────────────────────────────────────
  if (type === "asset") {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return null;

    const location = locations.find((l) => l.id === asset.locationId);
    const op = asset.assignedOperationId
      ? operations.find((o) => o.id === asset.assignedOperationId)
      : null;

    return (
      <Drawer
        open={open}
        onClose={onClose}
        title={
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-text-primary text-[15px] truncate">
              {asset.name}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded border border-border bg-surface-raised text-text-secondary shrink-0">
              {asset.id}
            </span>
          </div>
        }
        footerAction={
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-text-secondary">Equipment Registry</span>
            <Link
              to={`/assets/${asset.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded bg-accent-blue px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
            >
              <span>Full Dossier</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        }
      >
        {/* Status and Type Header Row */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded border border-border bg-surface-raised/40">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Status:</span>
            <StatusBadge status={asset.status} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Type:</span>
            <span className="font-mono text-xs capitalize text-text-primary">
              {asset.type.replace("-", " ")}
            </span>
          </div>
        </div>

        {/* Operational Deployment Architecture */}
        <div className="rounded border border-border bg-surface-raised/30 p-3 space-y-3 text-xs">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              Home Station Base
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-medium text-text-primary">
                {location?.name ?? "Unknown Location"}
              </span>
              <span className="font-mono text-text-secondary">{location?.id}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50">
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              Operation Assignment
            </div>
            {op ? (
              <Link
                to={`/operations/${op.id}`}
                onClick={onClose}
                className="mt-1 flex items-center justify-between rounded border border-border bg-surface p-2 hover:bg-surface-raised transition-colors"
              >
                <div>
                  <div className="font-medium text-text-primary">{op.name}</div>
                  <div className="font-mono text-[10px] text-text-secondary">{op.id}</div>
                </div>
                <StatusBadge status={op.status} />
              </Link>
            ) : (
              <div className="mt-1 text-text-secondary italic">
                In Reserve Depot (Unassigned)
              </div>
            )}
          </div>
        </div>

        {/* Diagnostics & Specifications */}
        <div className="rounded border border-border bg-surface-raised/30 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Telemetry Link</span>
            <span className="font-mono text-text-primary">AES-256 Encrypted</span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
            <span className="text-text-secondary">Last Telemetry Handshake</span>
            <span className="font-mono text-text-primary">
              {formatRelative(asset.lastUpdatedAt)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
            <span className="text-text-secondary">Registered Date</span>
            <span className="font-mono text-text-primary">
              {formatDate(asset.lastUpdatedAt)}
            </span>
          </div>
        </div>
      </Drawer>
    );
  }

  return null;
}
