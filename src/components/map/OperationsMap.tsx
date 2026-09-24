import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapSearchBar } from "./MapSearchBar";
import { locations } from "@/data/locations";
import { operations } from "@/data/operations";
import { assets } from "@/data/assets";
import { personnel } from "@/data/personnel";

export interface OperationsMapProps {
  showLocations?: boolean;
  showOperations?: boolean;
  showAssets?: boolean;
  onMarkerClick?: (type: "location" | "operation" | "asset", id: string) => void;
  compact?: boolean;
  selectedId?: string;
  selectedType?: "location" | "operation" | "asset";
}

type MapPoint = [number, number];

const GHANA_BOUNDS = {
  minLatitude: 4.5,
  latitudeSpan: 6.5,
  minLongitude: -3.3,
  longitudeSpan: 5,
};

function toMapPoint(x: number, y: number): MapPoint {
  return [
    GHANA_BOUNDS.minLatitude + ((100 - y) / 100) * GHANA_BOUNDS.latitudeSpan,
    GHANA_BOUNDS.minLongitude + (x / 100) * GHANA_BOUNDS.longitudeSpan,
  ];
}

// ── Icon Caches to prevent memory leaks and GC thrash in Leaflet ─────────
const operationIconCache = new Map<string, L.DivIcon>();
const locationIconCache = new Map<string, L.DivIcon>();
const assetIconCache = new Map<string, L.DivIcon>();

/**
 * Creates high-fidelity tactical pointers:
 * - Green Pointer: Active Operations (tactical reticle HUD, target pip, priority crown gem, terrain sonar wave)
 * - Blue Pointer: Standby Operations (tactical diamond readiness glyph, cyan standby pip, ground halo)
 */
function createOperationMarkerIcon(
  status: "active" | "standby",
  priority: string,
  isSelected: boolean
): L.DivIcon {
  const isGreen = status === "active";
  const wrapperClass = `tactical-pin-wrapper tactical-pin-wrapper--${isGreen ? "green" : "blue"} ${
    isSelected ? "tactical-pin-wrapper--selected" : ""
  }`;

  // Priority indicator color & beacon at crown apex
  const isCritical = priority === "critical";
  const isHigh = priority === "high";
  const crownGemColor = isCritical ? "#EF4444" : isHigh ? "#F59E0B" : isGreen ? "#4ADE80" : "#60A5FA";
  const crownStroke = isCritical ? "#FFFFFF" : isHigh ? "#FEF3C7" : isGreen ? "#052e16" : "#0f172a";

  const gradId = `op-grad-${status}-${priority}-${isSelected}`;

  const html = `
    <div class="${wrapperClass}" role="button" aria-label="${isGreen ? "Active Operation" : "Standby Operation"} Pin (${priority} priority)">
      <!-- 1. Stationary Ground Contact Elements (anchored at map coordinate) -->
      <div class="tactical-pin-ground">
        <div class="tactical-pin-shadow"></div>
        ${
          isGreen
            ? `<div class="tactical-pin-sonar tactical-pin-sonar--green"></div>
               <div class="tactical-pin-sonar tactical-pin-sonar--green-secondary"></div>`
            : `<div class="tactical-pin-sonar tactical-pin-sonar--blue"></div>`
        }
      </div>

      <!-- 2. Gliding Pin Stem (lifts upward on hover) -->
      <div class="tactical-pin-stem">
        ${isCritical ? '<div class="tactical-pin-alert-beacon" aria-hidden="true"></div>' : ""}
        <svg class="tactical-pin-svg" viewBox="0 0 34 46" width="34" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${gradId}" x1="17" y1="2" x2="17" y2="45" gradientUnits="userSpaceOnUse">
              ${
                isGreen
                  ? '<stop offset="0%" stop-color="#22C55E"/><stop offset="55%" stop-color="#16A34A"/><stop offset="100%" stop-color="#14532D"/>'
                  : '<stop offset="0%" stop-color="#3B82F6"/><stop offset="55%" stop-color="#2563EB"/><stop offset="100%" stop-color="#1E3A8A"/>'
              }
            </linearGradient>
          </defs>

          <!-- Outer Chassis Body (Sharp needle anchor pointing to exact 17, 45.5) -->
          <path
            d="M 17 45.5 C 15.6 43 3.5 27 3.5 16 A 13.5 13.5 0 1 1 30.5 16 C 30.5 27 18.4 43 17 45.5 Z"
            fill="url(#${gradId})"
            stroke="${isGreen ? "#052e16" : "#0a192f"}"
            stroke-width="1.4"
          />

          <!-- Inner Luminous Highlight Bevel -->
          <path
            d="M 17 43.5 C 15.9 41 5 26.5 5 16 A 12 12 0 1 1 29 16 C 29 26.5 18.1 41 17 43.5 Z"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            stroke-width="1"
          />

          <!-- Tactical Lens Aperture -->
          <circle cx="17" cy="16" r="8.5" fill="${isGreen ? "#041c10" : "#07172e"}" stroke="rgba(255,255,255,0.7)" stroke-width="1.1"/>

          ${
            isGreen
              ? `<!-- Active Reticle Crosshair HUD -->
                 <circle cx="17" cy="16" r="5.2" fill="none" stroke="#22C55E" stroke-width="1"/>
                 <circle cx="17" cy="16" r="1.8" fill="#4ADE80"/>
                 <line x1="17" y1="8.5" x2="17" y2="11" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
                 <line x1="17" y1="21" x2="17" y2="23.5" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
                 <line x1="9.5" y1="16" x2="12" y2="16" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
                 <line x1="22" y1="16" x2="24.5" y2="16" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>`
              : `<!-- Standby Tactical Readiness Diamond Glyph -->
                 <circle cx="17" cy="16" r="5.5" fill="none" stroke="#60A5FA" stroke-width="1" stroke-dasharray="2.5 1.5"/>
                 <polygon points="17,11.5 21.5,16 17,20.5 12.5,16" fill="rgba(59,130,246,0.3)" stroke="#93C5FD" stroke-width="1"/>
                 <circle cx="17" cy="16" r="1.8" fill="#93C5FD"/>
                 <line x1="17" y1="7.5" x2="17" y2="9.5" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
                 <line x1="17" y1="22.5" x2="17" y2="24.5" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
                 <line x1="8.5" y1="16" x2="10.5" y2="16" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
                 <line x1="23.5" y1="16" x2="25.5" y2="16" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>`
          }

          <!-- Priority Apex Gem -->
          <circle cx="17" cy="5.2" r="${isCritical ? "2.3" : "1.8"}" fill="${crownGemColor}" stroke="${crownStroke}" stroke-width="0.8"/>
        </svg>
      </div>
    </div>`;

  return L.divIcon({
    className: "tactical-leaflet-div-icon",
    html,
    iconSize: [34, 46],
    iconAnchor: [17, 46],
    popupAnchor: [0, -46],
  });
}

function getOperationMarkerIcon(
  status: "active" | "standby",
  priority: string,
  isSelected: boolean
): L.DivIcon {
  const key = `${status}-${priority}-${isSelected}`;
  let icon = operationIconCache.get(key);
  if (!icon) {
    icon = createOperationMarkerIcon(status, priority, isSelected);
    operationIconCache.set(key, icon);
  }
  return icon;
}

/**
 * Creates tactical pointer for Locations:
 * - Operations Center (Accra Ops Center & Kumasi Hub): Command Blue Pointer with 24K Gold Bezel & Star Shield
 * - Field Site (Tamale, Cape Coast, Ho, Sunyani): Field Amber Pointer with Radio Mast
 */
function createLocationMarkerIcon(
  kind: "operations-center" | "field-site",
  isSelected: boolean
): L.DivIcon {
  const isHQ = kind === "operations-center";
  const wrapperClass = `tactical-pin-wrapper tactical-pin-wrapper--${isHQ ? "hq" : "site"} ${
    isSelected ? "tactical-pin-wrapper--selected" : ""
  }`;

  const html = isHQ
    ? `
    <div class="${wrapperClass}" role="button" aria-label="Command Operations Center Pin">
      <div class="tactical-pin-ground">
        <div class="tactical-pin-shadow tactical-pin-shadow--large"></div>
        <div class="tactical-pin-sonar tactical-pin-sonar--hq"></div>
      </div>
      <div class="tactical-pin-stem">
        <svg class="tactical-pin-svg" viewBox="0 0 40 52" width="40" height="52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pin-grad-hq-command" x1="20" y1="2" x2="20" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#2563EB"/>
              <stop offset="55%" stop-color="#1E40AF"/>
              <stop offset="100%" stop-color="#0B132B"/>
            </linearGradient>
            <linearGradient id="hq-gold-bezel" x1="20" y1="2" x2="20" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FDE047"/>
              <stop offset="100%" stop-color="#D97706"/>
            </linearGradient>
          </defs>

          <!-- Bastion Outer Chassis (Anchor needle at 20, 51.5) -->
          <path
            d="M 20 51.5 C 18.5 48.5 4 31 4 18 A 16 16 0 1 1 36 18 C 36 31 21.5 48.5 20 51.5 Z"
            fill="url(#pin-grad-hq-command)"
            stroke="#F59E0B"
            stroke-width="1.6"
          />

          <!-- Inner Gold Bezel Rim -->
          <path
            d="M 20 49 C 18.8 46.5 5.5 30 5.5 18 A 14.5 14.5 0 1 1 34.5 18 C 34.5 30 21.2 46.5 20 49 Z"
            fill="none"
            stroke="url(#hq-gold-bezel)"
            stroke-width="1"
            stroke-opacity="0.8"
          />

          <!-- Command Star Shield Aperture -->
          <circle cx="20" cy="18" r="10.5" fill="#071022" stroke="#F59E0B" stroke-width="1.3"/>
          <path d="M 20 10.5 L 25.5 13 V 18 C 25.5 21.8 22.8 24.2 20 25.2 C 17.2 24.2 14.5 21.8 14.5 18 V 13 Z" fill="rgba(37,99,235,0.25)" stroke="#93C5FD" stroke-width="1"/>
          <polygon points="20,12 21.2,15.2 24.5,15.2 21.8,17.2 22.8,20.5 20,18.5 17.2,20.5 18.2,17.2 15.5,15.2 18.8,15.2" fill="url(#hq-gold-bezel)" stroke="#B45309" stroke-width="0.5"/>

          <!-- Crown Bastion Pip -->
          <circle cx="20" cy="4.8" r="2.2" fill="#FDE047" stroke="#92400E" stroke-width="0.8"/>
        </svg>
      </div>
    </div>`
    : `
    <div class="${wrapperClass}" role="button" aria-label="Field Site Pin">
      <div class="tactical-pin-ground">
        <div class="tactical-pin-shadow"></div>
      </div>
      <div class="tactical-pin-stem">
        <svg class="tactical-pin-svg" viewBox="0 0 34 46" width="34" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pin-grad-amber-site" x1="17" y1="2" x2="17" y2="45" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#F59E0B"/>
              <stop offset="55%" stop-color="#D97706"/>
              <stop offset="100%" stop-color="#78350F"/>
            </linearGradient>
          </defs>

          <!-- Needle at 17, 45.5 -->
          <path
            d="M 17 45.5 C 15.6 43 3.5 27 3.5 16 A 13.5 13.5 0 1 1 30.5 16 C 30.5 27 18.4 43 17 45.5 Z"
            fill="url(#pin-grad-amber-site)"
            stroke="#451a03"
            stroke-width="1.4"
          />
          <path
            d="M 17 43.5 C 15.9 41 5 26.5 5 16 A 12 12 0 1 1 29 16 C 29 26.5 18.1 41 17 43.5 Z"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            stroke-width="1"
          />

          <!-- Radio Tower Relay Lens -->
          <circle cx="17" cy="16" r="8.5" fill="#291403" stroke="#FBBF24" stroke-width="1.2"/>
          <line x1="17" y1="9.5" x2="17" y2="22.5" stroke="#FFFFFF" stroke-width="1.3" stroke-linecap="round"/>
          <line x1="13.5" y1="19" x2="20.5" y2="19" stroke="#FFFFFF" stroke-width="1.1" stroke-linecap="round"/>
          <line x1="14.5" y1="15" x2="19.5" y2="15" stroke="#FFFFFF" stroke-width="1.1" stroke-linecap="round"/>
          <path d="M 14 11 A 3.5 3.5 0 0 1 20 11" fill="none" stroke="#FDE047" stroke-width="1" stroke-linecap="round"/>
          <circle cx="17" cy="9.5" r="1.4" fill="#FDE047"/>

          <!-- Crown Pip -->
          <circle cx="17" cy="5.2" r="1.8" fill="#FDE047" stroke="#451a03" stroke-width="0.8"/>
        </svg>
      </div>
    </div>`;

  return L.divIcon({
    className: "tactical-leaflet-div-icon",
    html,
    iconSize: isHQ ? [40, 52] : [34, 46],
    iconAnchor: isHQ ? [20, 52] : [17, 46],
    popupAnchor: isHQ ? [0, -52] : [0, -46],
  });
}

function getLocationMarkerIcon(
  kind: "operations-center" | "field-site",
  isSelected: boolean
): L.DivIcon {
  const key = `${kind}-${isSelected}`;
  let icon = locationIconCache.get(key);
  if (!icon) {
    icon = createLocationMarkerIcon(kind, isSelected);
    locationIconCache.set(key, icon);
  }
  return icon;
}

/**
 * Creates compact tactical badge pointer for Assets (vehicles, sensors, devices)
 */
function createAssetMarkerIcon(
  status: string,
  type: string,
  isSelected: boolean
): L.DivIcon {
  const isGreen = status === "active";
  const isBlue = status === "standby" || status === "idle";
  const topColor = isGreen ? "#22C55E" : isBlue ? "#3B82F6" : "#F59E0B";
  const bottomColor = isGreen ? "#15803D" : isBlue ? "#1D4ED8" : "#B45309";
  const darkBorder = isGreen ? "#052e16" : isBlue ? "#0f172a" : "#451a03";

  // Tactical glyph inside asset badge
  let glyph = '<circle cx="12" cy="11" r="2" fill="#FFFFFF"/>';
  if (type === "vehicle") {
    glyph = '<path d="M8 12h8 M9 9l1.5-2h3L15 9 M9.5 13a1 1 0 100-2 1 1 0 000 2z M14.5 13a1 1 0 100-2 1 1 0 000 2z" stroke="#FFFFFF" stroke-width="0.9" fill="none"/>';
  } else if (type === "comms-device" || type === "field-device") {
    glyph = '<path d="M12 7v8 M9.5 9.5a3.5 3.5 0 015 0 M8 8a5.5 5.5 0 018 0" stroke="#FFFFFF" stroke-width="0.9" stroke-linecap="round" fill="none"/>';
  }

  const html = `
    <div class="tactical-pin-wrapper tactical-pin-wrapper--asset ${isSelected ? "tactical-pin-wrapper--selected" : ""}" role="button" aria-label="Asset Marker">
      <div class="tactical-pin-ground">
        <div class="tactical-pin-shadow tactical-pin-shadow--asset"></div>
      </div>
      <div class="tactical-pin-stem">
        <svg class="tactical-pin-svg" viewBox="0 0 24 32" width="24" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 12 31.5 C 11 29.5 3 20 3 11 A 9 9 0 1 1 21 11 C 21 20 13 29.5 12 31.5 Z"
            fill="${topColor}"
            stroke="${darkBorder}"
            stroke-width="1.1"
          />
          <path
            d="M 12 29.5 C 11.2 27.8 4.2 19 4.2 11 A 7.8 7.8 0 1 1 19.8 11 C 19.8 19 12.8 27.8 12 29.5 Z"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            stroke-width="0.8"
          />
          <circle cx="12" cy="11" r="5.5" fill="${bottomColor}" stroke="rgba(255,255,255,0.6)" stroke-width="0.8"/>
          ${glyph}
        </svg>
      </div>
    </div>`;

  return L.divIcon({
    className: "tactical-leaflet-div-icon",
    html,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  });
}

function getAssetMarkerIcon(
  status: string,
  type: string,
  isSelected: boolean
): L.DivIcon {
  const key = `${status}-${type}-${isSelected}`;
  let icon = assetIconCache.get(key);
  if (!icon) {
    icon = createAssetMarkerIcon(status, type, isSelected);
    assetIconCache.set(key, icon);
  }
  return icon;
}

export function OperationsMap({
  showLocations = true,
  showOperations = true,
  showAssets = true,
  onMarkerClick,
  compact = false,
  selectedId,
  selectedType,
}: OperationsMapProps) {
  const locationMap = useMemo(() => new Map(locations.map((l) => [l.id, l])), []);

  // Filtered operations for display
  const activeOps = useMemo(
    () => operations.filter((op) => op.status === "active"),
    []
  );
  const standbyOps = useMemo(
    () => operations.filter((op) => op.status === "standby"),
    []
  );

  const displayedOps = useMemo(
    () => operations.filter((op) => op.status === "active" || op.status === "standby"),
    []
  );

  const displayedAssets = useMemo(
    () => assets.filter((asset) => asset.status !== "offline").slice(0, 20),
    []
  );

  const commandHubsCount = useMemo(
    () => locations.filter((loc) => loc.kind === "operations-center").length,
    []
  );

  // Structured tactical perimeter dispersion around regional hubs (eliminates occlusions & wild 15km drift)
  const { opPositions, assetPositions } = useMemo(() => {
    // 1. Group operations by location
    const opsByLoc = new Map<string, string[]>();
    for (const op of displayedOps) {
      const list = opsByLoc.get(op.locationId) ?? [];
      list.push(op.id);
      opsByLoc.set(op.locationId, list);
    }

    const opPos = new Map<string, MapPoint>();
    for (const op of displayedOps) {
      const loc = locationMap.get(op.locationId);
      if (!loc) continue;
      const list = opsByLoc.get(op.locationId) ?? [];
      const idx = list.indexOf(op.id);
      const count = list.length;
      // Radial distribution around base: radius ~1.35-1.6 units (~3-4 km)
      const theta = (idx / Math.max(1, count)) * 2 * Math.PI - Math.PI / 2;
      const r = count === 1 ? 1.25 : 1.35 + (idx % 2) * 0.28;
      const ox = loc.x + r * Math.cos(theta);
      const oy = loc.y + r * Math.sin(theta);
      opPos.set(op.id, toMapPoint(ox, oy));
    }

    // 2. Group assets by location
    const assetsByLoc = new Map<string, string[]>();
    for (const asset of displayedAssets) {
      const list = assetsByLoc.get(asset.locationId) ?? [];
      list.push(asset.id);
      assetsByLoc.set(asset.locationId, list);
    }

    const assetPos = new Map<string, MapPoint>();
    for (const asset of displayedAssets) {
      const loc = locationMap.get(asset.locationId);
      if (!loc) continue;
      const list = assetsByLoc.get(asset.locationId) ?? [];
      const idx = list.indexOf(asset.id);
      const count = list.length;
      // Outer reconnaissance perimeter offset: radius ~2.1-2.4 units (~5 km)
      const theta = ((idx + 0.5) / Math.max(1, count)) * 2 * Math.PI - Math.PI / 2;
      const r = 2.15 + (idx % 2) * 0.35;
      const ox = loc.x + r * Math.cos(theta);
      const oy = loc.y + r * Math.sin(theta);
      assetPos.set(asset.id, toMapPoint(ox, oy));
    }

    return { opPositions: opPos, assetPositions: assetPos };
  }, [displayedOps, displayedAssets, locationMap]);

  return (
    <div
      className={`operations-map relative z-0 isolate w-full overflow-hidden border border-border bg-surface ${
        compact ? "operations-map--compact" : ""
      }`}
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      {/* ── Tactical Telemetry HUD Overlay ───────────────────────────── */}
      {!compact && (
        <div className="operations-map__hud" aria-label="Tactical map telemetry">
          <div className="operations-map__hud-item font-semibold text-text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="tracking-wide">LIVE TELEMETRY</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="operations-map__hud-item" title="Green Pointers: Active tactical operations">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            <span className="text-text-secondary">
              <strong className="text-text-primary">{activeOps.length}</strong> Active
            </span>
          </div>
          <div className="operations-map__hud-item" title="Blue Pointers: Standby operations & Command HQ">
            <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
            <span className="text-text-secondary">
              <strong className="text-text-primary">{standbyOps.length}</strong> Standby •{" "}
              <strong className="text-text-primary">{commandHubsCount}</strong> HQ
            </span>
          </div>
        </div>
      )}

      {compact && (
        <div
          className="operations-map__hud"
          style={{ top: 8, right: 8, padding: "4px 8px", fontSize: "10.5px" }}
        >
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          <span className="text-text-secondary">
            <strong className="text-text-primary">{activeOps.length}</strong> Active •{" "}
            <strong className="text-text-primary">{standbyOps.length}</strong> Standby
          </span>
        </div>
      )}

      <MapContainer
        center={[7.9, -1.2]}
        zoom={7}
        minZoom={6}
        maxZoom={17}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
        aria-label="Operations map showing tactical green and blue pointers for locations, operations, and assets"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ── Tactical Map Search Bar Overlay ───────────────────────── */}
        <MapSearchBar
          locations={locations}
          operations={displayedOps}
          locationMap={locationMap}
          opPositions={opPositions}
          compact={compact}
          onMarkerClick={onMarkerClick}
          toMapPoint={toMapPoint}
        />

        {/* ── 1. Locations (Blue Command HQ & Amber Field Posts) ─────── */}
        {showLocations &&
          locations.map((location) => {
            const position = toMapPoint(location.x, location.y);
            const isSelected = selectedType === "location" && selectedId === location.id;
            const icon = getLocationMarkerIcon(
              location.kind as "operations-center" | "field-site",
              isSelected
            );
            const opsAtLoc = operations.filter((o) => o.locationId === location.id);
            const assetsAtLoc = assets.filter((a) => a.locationId === location.id);
            const personnelAtLoc = personnel.filter((p) => p.locationId === location.id);

            return (
              <Marker
                key={location.id}
                position={position}
                icon={icon}
                eventHandlers={{ click: () => onMarkerClick?.("location", location.id) }}
              >
                {/* Tactical inspect card on hover only */}
                <Tooltip
                  direction="auto"
                  offset={[0, location.kind === "operations-center" ? -54 : -48]}
                  opacity={1}
                  className="tactical-leaflet-tooltip"
                >
                  <div className="tactical-tooltip-card">
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
                      <span className="font-mono text-[11px] font-bold tracking-wider text-white/90">
                        {location.id}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          location.kind === "operations-center"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {location.kind === "operations-center" ? "COMMAND HQ" : "FIELD SITE"}
                      </span>
                    </div>
                    <div className="text-[13px] font-semibold text-white leading-snug">
                      {location.name}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-300 pt-1 border-t border-white/10">
                      <span>
                        {opsAtLoc.length} ops • {assetsAtLoc.length} assets • {personnelAtLoc.length} personnel
                      </span>
                      <span className="text-blue-400 font-medium">Click to inspect ↗</span>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}

        {/* ── 2. Operations (Green Active & Blue Standby Pointers) ───── */}
        {showOperations &&
          displayedOps.map((operation) => {
            const location = locationMap.get(operation.locationId);
            if (!location) return null;
            const position = opPositions.get(operation.id) ?? toMapPoint(location.x, location.y);
            const isSelected = selectedType === "operation" && selectedId === operation.id;
            const icon = getOperationMarkerIcon(
              operation.status as "active" | "standby",
              operation.priority,
              isSelected
            );

            return (
              <Marker
                key={operation.id}
                position={position}
                icon={icon}
                eventHandlers={{ click: () => onMarkerClick?.("operation", operation.id) }}
              >
                <Tooltip
                  direction="auto"
                  offset={[0, -46]}
                  opacity={1}
                  className="tactical-leaflet-tooltip"
                >
                  <div className="tactical-tooltip-card">
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            operation.status === "active"
                              ? "bg-emerald-400 shadow-[0_0_8px_#4ade80]"
                              : "bg-blue-400 shadow-[0_0_8px_#60a5fa]"
                          }`}
                        />
                        <span className="font-mono text-[11px] font-bold tracking-wider text-white/90">
                          {operation.id}
                        </span>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          operation.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {operation.status}
                      </span>
                    </div>
                    <div className="text-[13px] font-semibold text-white leading-snug">
                      {operation.name}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-300">
                      <span
                        className={`font-semibold uppercase ${
                          operation.priority === "critical"
                            ? "text-red-400"
                            : operation.priority === "high"
                            ? "text-amber-400"
                            : "text-blue-300"
                        }`}
                      >
                        {operation.priority} priority
                      </span>
                      <span>•</span>
                      <span>{location.name.split(" ")[0]} sector</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/10">
                      <span>
                        {operation.personnelIds.length} personnel • {operation.assetIds.length} assets
                      </span>
                      <span className="text-emerald-400 font-medium">Click to inspect ↗</span>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}

        {/* ── 3. Assets (Tactical Field Units & Equipment Badges) ────── */}
        {showAssets &&
          displayedAssets.map((asset) => {
            const location = locationMap.get(asset.locationId);
            if (!location) return null;
            const position = assetPositions.get(asset.id) ?? toMapPoint(location.x, location.y);
            const isSelected = selectedType === "asset" && selectedId === asset.id;
            const icon = getAssetMarkerIcon(asset.status, asset.type, isSelected);

            return (
              <Marker
                key={asset.id}
                position={position}
                icon={icon}
                eventHandlers={{ click: () => onMarkerClick?.("asset", asset.id) }}
              >
                <Tooltip
                  direction="auto"
                  offset={[0, -32]}
                  opacity={1}
                  className="tactical-leaflet-tooltip"
                >
                  <div className="tactical-tooltip-card" style={{ minWidth: "180px" }}>
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1 mb-1">
                      <span className="font-mono text-[10px] font-bold text-white/90">
                        {asset.id}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          asset.status === "active"
                            ? "text-emerald-300 bg-emerald-500/20"
                            : "text-blue-300 bg-blue-500/20"
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>
                    <div className="text-[12px] font-semibold text-white">{asset.name}</div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-gray-300 capitalize pt-1 border-t border-white/10">
                      <span>{asset.type.replace("-", " ")}</span>
                      <span className="text-blue-400 font-medium">Click to inspect ↗</span>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
