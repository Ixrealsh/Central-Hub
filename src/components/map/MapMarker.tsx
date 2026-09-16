interface MapMarkerProps {
  x: number;
  y: number;
  kind: "location" | "operation" | "asset";
  status: string;
  label: string;
  onClick?: () => void;
}

const statusColorMap: Record<string, string> = {
  active: "var(--accent-green)",
  standby: "var(--accent-blue)",
  completed: "var(--text-secondary)",
  suspended: "var(--accent-amber)",
  idle: "var(--accent-blue)",
  offline: "var(--accent-red)",
  "operations-center": "var(--accent-blue)",
  "field-site": "var(--accent-amber)",
};

const kindSizeMap: Record<string, number> = {
  location: 5,
  operation: 3.5,
  asset: 2.5,
};

export function MapMarker({ x, y, kind, status, label, onClick }: MapMarkerProps) {
  const color = statusColorMap[status] ?? "var(--text-secondary)";
  const size = kindSizeMap[kind] ?? 3;

  return (
    <g>
      <title>{label}</title>
      <circle
        cx={x}
        cy={y}
        r={size}
        fill={color}
        opacity={0.2}
        stroke="none"
      />
      <circle
        cx={x}
        cy={y}
        r={size * 0.5}
        fill={color}
        stroke="var(--surface)"
        strokeWidth={0.5}
        role="button"
        tabIndex={0}
        aria-label={label}
        style={{ cursor: onClick ? "pointer" : "default", outline: "none" }}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
      />
      {kind === "location" && (
        <text
          x={x}
          y={y + size + 3}
          textAnchor="middle"
          fill="var(--text-secondary)"
          style={{ fontSize: "2.5px", fontFamily: "Inter, sans-serif" }}
        >
          {label}
        </text>
      )}
    </g>
  );
}

