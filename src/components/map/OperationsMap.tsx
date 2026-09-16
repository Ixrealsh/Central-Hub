import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { locations } from "@/data/locations";
import { operations } from "@/data/operations";
import { assets } from "@/data/assets";

interface OperationsMapProps {
  showLocations?: boolean;
  showOperations?: boolean;
  showAssets?: boolean;
  onMarkerClick?: (type: "location" | "operation" | "asset", id: string) => void;
  compact?: boolean;
}

type MapPoint = [number, number];

const GHANA_BOUNDS = {
  minLatitude: 4.5,
  latitudeSpan: 6.5,
  minLongitude: -3.3,
  longitudeSpan: 5,
};

const statusColors: Record<string, string> = {
  active: "#16A34A",
  standby: "#2563EB",
  completed: "#71717A",
  suspended: "#D97706",
  idle: "#2563EB",
  offline: "#DC2626",
  "operations-center": "#2563EB",
  "field-site": "#D97706",
};

function toMapPoint(x: number, y: number): MapPoint {
  return [
    GHANA_BOUNDS.minLatitude + ((100 - y) / 100) * GHANA_BOUNDS.latitudeSpan,
    GHANA_BOUNDS.minLongitude + (x / 100) * GHANA_BOUNDS.longitudeSpan,
  ];
}

function getColor(status: string) {
  return statusColors[status] ?? "#71717A";
}

export function OperationsMap({
  showLocations = true,
  showOperations = true,
  showAssets = true,
  onMarkerClick,
  compact = false,
}: OperationsMapProps) {
  const locationMap = new Map(locations.map((location) => [location.id, location]));
  let jitterSeed = 17;

  function jitter(): number {
    jitterSeed = (jitterSeed * 16807) % 2147483647;
    return ((jitterSeed & 0x7fffffff) / 0x7fffffff - 0.5) * 6;
  }

  return (
    <div
      className={`operations-map relative w-full overflow-hidden border border-border bg-surface ${compact ? "operations-map--compact" : ""}`}
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      <MapContainer
        center={[7.9, -1.2]}
        zoom={7}
        minZoom={6}
        maxZoom={13}
        scrollWheelZoom
        zoomControl
        className="h-full w-full"
        aria-label="Operations map showing locations, operations, and assets"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showLocations && locations.map((location) => {
          const position = toMapPoint(location.x, location.y);
          const color = getColor(location.kind);
          return (
            <CircleMarker
              key={location.id}
              center={position}
              radius={9}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.24, weight: 2 }}
              eventHandlers={{ click: () => onMarkerClick?.("location", location.id) }}
            >
              <Tooltip permanent direction="top" offset={[0, -8]} className="operations-map__label">
                {location.name}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {showOperations && operations
          .filter((operation) => operation.status === "active" || operation.status === "standby")
          .map((operation) => {
            const location = locationMap.get(operation.locationId);
            if (!location) return null;
            const position = toMapPoint(location.x + jitter(), location.y + jitter());
            const color = getColor(operation.status);
            return (
              <CircleMarker
                key={operation.id}
                center={position}
                radius={6}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 1.5 }}
                eventHandlers={{ click: () => onMarkerClick?.("operation", operation.id) }}
              >
                <Tooltip>{`${operation.name} (${operation.id})`}</Tooltip>
              </CircleMarker>
            );
          })}

        {showAssets && assets
          .filter((asset) => asset.status !== "offline")
          .slice(0, 20)
          .map((asset) => {
            const location = locationMap.get(asset.locationId);
            if (!location) return null;
            const position = toMapPoint(location.x + jitter(), location.y + jitter());
            const color = getColor(asset.status);
            return (
              <CircleMarker
                key={asset.id}
                center={position}
                radius={4}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 1 }}
                eventHandlers={{ click: () => onMarkerClick?.("asset", asset.id) }}
              >
                <Tooltip>{`${asset.name} (${asset.id})`}</Tooltip>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}

