export interface MapMarkerProps {
  x: number;
  y: number;
  kind: "location" | "operation" | "asset";
  status: string;
  label: string;
  onClick?: () => void;
}

const statusColorMap: Record<string, { fill: string; dark: string; light: string }> = {
  active: { fill: "#16A34A", dark: "#052e16", light: "#4ADE80" },
  standby: { fill: "#2563EB", dark: "#0f172a", light: "#60A5FA" },
  completed: { fill: "#71717A", dark: "#27272a", light: "#A1A1AA" },
  suspended: { fill: "#D97706", dark: "#451a03", light: "#FBBF24" },
  idle: { fill: "#2563EB", dark: "#0f172a", light: "#60A5FA" },
  offline: { fill: "#DC2626", dark: "#450a0a", light: "#F87171" },
  "operations-center": { fill: "#1D4ED8", dark: "#0f172a", light: "#93C5FD" },
  "field-site": { fill: "#D97706", dark: "#451a03", light: "#FDE047" },
};

const kindScaleMap: Record<string, number> = {
  location: 1.25,
  operation: 1.0,
  asset: 0.75,
};

export function MapMarker({ x, y, kind, status, label, onClick }: MapMarkerProps) {
  const colors = statusColorMap[status] ?? {
    fill: "var(--text-secondary)",
    dark: "#18181b",
    light: "#a1a1aa",
  };
  const scale = kindScaleMap[kind] ?? 1.0;
  const isGreen = status === "active";
  const isHQ = kind === "location" && status === "operations-center";

  // Height of pin head above ground anchor (x, y)
  const headCenterY = y - 5.5 * scale;
  const headRadius = 2.4 * scale;

  return (
    <g
      className="tactical-svg-marker"
      role="button"
      tabIndex={0}
      aria-label={`${label} (${status})`}
      style={{ cursor: onClick ? "pointer" : "default", outline: "none" }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <title>{`${label} — ${status.toUpperCase()}`}</title>

      {/* Ground contact shadow */}
      <ellipse
        cx={x}
        cy={y + 0.3 * scale}
        rx={1.8 * scale}
        ry={0.6 * scale}
        fill="#000000"
        opacity={0.35}
      />

      {/* Active green radar sonar ripple */}
      {isGreen && (
        <>
          <circle
            cx={x}
            cy={y}
            r={3.2 * scale}
            fill="none"
            stroke="#22C55E"
            strokeWidth={0.35 * scale}
            opacity={0.7}
          >
            <animate
              attributeName="r"
              values={`${1.5 * scale}; ${5.5 * scale}`}
              dur="2.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8; 0"
              dur="2.2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={x}
            cy={y}
            r={1.8 * scale}
            fill="#22C55E"
            opacity={0.25}
          />
        </>
      )}

      {/* Command HQ radar ping */}
      {isHQ && (
        <circle
          cx={x}
          cy={y}
          r={3.5 * scale}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={0.35 * scale}
          opacity={0.6}
        >
          <animate
            attributeName="r"
            values={`${1.8 * scale}; ${6 * scale}`}
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7; 0"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Tactical Pinpointer teardrop body pointing precisely down to (x, y) */}
      <path
        d={`M ${x} ${y} C ${x - 0.7 * scale} ${y - 1.5 * scale} ${x - headRadius} ${headCenterY + 1 * scale} ${x - headRadius} ${headCenterY} A ${headRadius} ${headRadius} 0 1 1 ${x + headRadius} ${headCenterY} C ${x + headRadius} ${headCenterY + 1 * scale} ${x + 0.7 * scale} ${y - 1.5 * scale} ${x} ${y} Z`}
        fill={colors.fill}
        stroke={isHQ ? "#F59E0B" : colors.dark}
        strokeWidth={0.35 * scale}
      />

      {/* Inner tactile highlight bezel */}
      <circle
        cx={x}
        cy={headCenterY}
        r={headRadius * 0.72}
        fill={colors.dark}
        fillOpacity={0.88}
        stroke={colors.light}
        strokeWidth={0.25 * scale}
      />

      {/* Center Tactical Glyphs */}
      {isGreen ? (
        /* Active reticle target */
        <g stroke="#FFFFFF" strokeWidth={0.28 * scale}>
          <circle cx={x} cy={headCenterY} r={headRadius * 0.42} fill="none" />
          <circle cx={x} cy={headCenterY} r={headRadius * 0.16} fill="#4ADE80" stroke="none" />
          <line x1={x} y1={headCenterY - headRadius * 0.58} x2={x} y2={headCenterY - headRadius * 0.38} strokeLinecap="round" />
          <line x1={x} y1={headCenterY + headRadius * 0.38} x2={x} y2={headCenterY + headRadius * 0.58} strokeLinecap="round" />
          <line x1={x - headRadius * 0.58} y1={headCenterY} x2={x - headRadius * 0.38} y2={headCenterY} strokeLinecap="round" />
          <line x1={x + headRadius * 0.38} y1={headCenterY} x2={x + headRadius * 0.58} y2={headCenterY} strokeLinecap="round" />
        </g>
      ) : isHQ ? (
        /* HQ Star inside Shield */
        <polygon
          points={`${x},${headCenterY - headRadius * 0.42} ${x + headRadius * 0.13},${headCenterY - headRadius * 0.1} ${x + headRadius * 0.44},${headCenterY - headRadius * 0.1} ${x + headRadius * 0.18},${headCenterY + headRadius * 0.1} ${x + headRadius * 0.28},${headCenterY + headRadius * 0.42} ${x},${headCenterY + headRadius * 0.22} ${x - headRadius * 0.28},${headCenterY + headRadius * 0.42} ${x - headRadius * 0.18},${headCenterY + headRadius * 0.1} ${x - headRadius * 0.44},${headCenterY - headRadius * 0.1} ${x - headRadius * 0.13},${headCenterY - headRadius * 0.1}`}
          fill="#FDE047"
        />
      ) : (
        /* Standby / Standard Glyph: Tactical diamond readiness reticle */
        <g strokeLinecap="round">
          <circle cx={x} cy={headCenterY} r={headRadius * 0.42} fill="none" stroke="#60A5FA" strokeWidth={0.2 * scale} strokeDasharray="1 0.8" />
          <polygon
            points={`${x},${headCenterY - headRadius * 0.28} ${x + headRadius * 0.28},${headCenterY} ${x},${headCenterY + headRadius * 0.28} ${x - headRadius * 0.28},${headCenterY}`}
            fill="rgba(59,130,246,0.3)"
            stroke="#93C5FD"
            strokeWidth={0.22 * scale}
          />
          <circle cx={x} cy={headCenterY} r={headRadius * 0.12} fill="#93C5FD" stroke="none" />
          <line x1={x} y1={headCenterY - headRadius * 0.52} x2={x} y2={headCenterY - headRadius * 0.36} stroke="#FFFFFF" strokeWidth={0.24 * scale} />
          <line x1={x} y1={headCenterY + headRadius * 0.36} x2={x} y2={headCenterY + headRadius * 0.52} stroke="#FFFFFF" strokeWidth={0.24 * scale} />
          <line x1={x - headRadius * 0.52} y1={headCenterY} x2={x - headRadius * 0.36} y2={headCenterY} stroke="#FFFFFF" strokeWidth={0.24 * scale} />
          <line x1={x + headRadius * 0.36} y1={headCenterY} x2={x + headRadius * 0.52} y2={headCenterY} stroke="#FFFFFF" strokeWidth={0.24 * scale} />
        </g>
      )}

      {/* Label for Locations */}
      {kind === "location" && (
        <text
          x={x}
          y={y + 3 * scale}
          textAnchor="middle"
          fill="var(--text-primary)"
          style={{
            fontSize: `${2.2 * scale}px`,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            textShadow: "0 1px 2px rgba(0,0,0,0.4)",
          }}
        >
          {label}
        </text>
      )}
    </g>
  );
}
