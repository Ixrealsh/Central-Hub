import type { Location } from "../types/location";
import type { Personnel, PersonnelStatus } from "../types/personnel";
import type { Asset, AssetType, AssetStatus } from "../types/asset";
import type { Operation, OperationStatus, Priority } from "../types/operation";
import type { Communication, CommunicationCategory } from "../types/communication";
import type { AuditLogEntry, AuditAction, AuditResourceType, AuditResult } from "../types/audit";
import type { Alert } from "../types/alert";
import type { MedicalSummary } from "../types/medical";

// ── Single fixed "now" for the entire dataset ──────────────────────────
export const NOW = "2026-09-15T10:00:00.000Z";
const nowMs = new Date(NOW).getTime();

function hoursAgo(h: number): string {
  return new Date(nowMs - h * 3600_000).toISOString();
}
function daysAgo(d: number): string {
  return new Date(nowMs - d * 86_400_000).toISOString();
}
function minutesAgo(m: number): string {
  return new Date(nowMs - m * 60_000).toISOString();
}

// ── Deterministic pseudo-random ────────────────────────────────────────
let _seed = 42;
function rand(): number {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed & 0x7fffffff) / 0x7fffffff;
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function pickN<T>(arr: T[], min: number, max: number): T[] {
  const count = min + Math.floor(rand() * (max - min + 1));
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ── 1. Locations (6 fixed) ────────────────────────────────────────────
export const locations: Location[] = [
  { id: "LOC-01", name: "Accra Operations Center", kind: "operations-center", x: 25, y: 30 },
  { id: "LOC-02", name: "Kumasi Regional Hub", kind: "operations-center", x: 55, y: 45 },
  { id: "LOC-03", name: "Tamale Field Site", kind: "field-site", x: 50, y: 15 },
  { id: "LOC-04", name: "Cape Coast Field Site", kind: "field-site", x: 20, y: 60 },
  { id: "LOC-05", name: "Ho Eastern Post", kind: "field-site", x: 75, y: 40 },
  { id: "LOC-06", name: "Sunyani Western Post", kind: "field-site", x: 35, y: 50 },
];

// ── 2. Personnel (148 records) ─────────────────────────────────────────
const firstNames = [
  "Naa", "Kwame", "Efua", "Kofi", "Ama", "Yaw", "Abena", "Kwesi",
  "Akua", "Fiifi", "Esi", "Kojo", "Adwoa", "Paa", "Afia", "Nana",
  "Yaa", "Mensah", "Adjoa", "Osei", "Baah", "Serwaa", "Owusu", "Dede",
  "Addae", "Boateng", "Frema", "Asante", "Gyamfi", "Prempeh", "Oforiwaa",
  "Takyi", "Ansah", "Baffour", "Darkwa", "Appiah", "Amponsah", "Bonsu",
  "Addo", "Tetteh", "Adjei", "Agyemang", "Danso", "Opoku", "Antwi",
  "Amoako", "Seidu", "Mensima",
];
const lastNames = [
  "Adjei", "Mensah", "Boateng", "Asante", "Osei", "Owusu", "Agyemang",
  "Appiah", "Darkwa", "Tetteh", "Ankrah", "Quartey", "Nartey", "Frimpong",
  "Gyasi", "Asamoah", "Badu", "Forson", "Tagoe", "Armah", "Sackey",
  "Laryea", "Kwarteng", "Addo", "Annan", "Opare", "Quayson", "Ofori",
  "Amankwa", "Bonsu", "Donkor", "Aidoo", "Baiden", "Afful", "Nyarko",
];
const units = ["Field Operations", "Logistics", "Intelligence", "Communications", "Medical Support", "Administration"];

export const personnel: Personnel[] = [];
const usedNames = new Set<string>();
for (let i = 0; i < 148; i++) {
  let name: string;
  do {
    name = `${pick(firstNames)} ${pick(lastNames)}`;
  } while (usedNames.has(name));
  usedNames.add(name);

  // ~96% active/standby combined, rest off-duty/unavailable
  let status: PersonnelStatus;
  const r = rand();
  if (r < 0.70) status = "active";
  else if (r < 0.96) status = "standby";
  else if (r < 0.98) status = "off-duty";
  else status = "unavailable";

  personnel.push({
    id: `OFF-${1024 + i}`,
    displayName: name,
    status,
    unit: pick(units),
    currentAssignmentOperationId: null, // backfilled in step 4
    locationId: pick(locations).id,
    lastActivityAt: hoursAgo(Math.floor(rand() * 72)),
  });
}

// ── 3. Assets (63 records) ─────────────────────────────────────────────
const assetTypes: AssetType[] = ["vehicle", "equipment", "field-device", "comms-device"];
const assetNamePrefixes: Record<AssetType, string> = {
  vehicle: "Field Vehicle",
  equipment: "Equipment Unit",
  "field-device": "Field Device",
  "comms-device": "Comms Unit",
};

export const assets: Asset[] = [];
for (let i = 0; i < 63; i++) {
  const type = pick(assetTypes);
  // ~94% active/idle combined, rest offline
  let status: AssetStatus;
  const r = rand();
  if (r < 0.55) status = "active";
  else if (r < 0.94) status = "idle";
  else status = "offline";

  assets.push({
    id: `AST-${String(21 + i).padStart(3, "0")}`,
    name: `${assetNamePrefixes[type]} ${String(i + 1).padStart(2, "0")}`,
    type,
    status,
    locationId: pick(locations).id,
    assignedOperationId: null, // backfilled in step 4
    lastUpdatedAt: hoursAgo(Math.floor(rand() * 48)),
  });
}

// ── 4. Operations (24 records) ─────────────────────────────────────────
const operationNames = [
  "Operation Alpha", "Operation Bravo", "Operation Cascade", "Operation Delta",
  "Operation Echo", "Operation Falcon", "Operation Granite", "Operation Horizon",
  "Operation Iron", "Operation Jade", "Operation Kestrel", "Operation Lancer",
  "Operation Meridian", "Operation Noble", "Operation Osprey", "Operation Pinnacle",
  "Operation Quartz", "Operation Raptor", "Operation Sierra", "Operation Tempest",
  "Operation Unity", "Operation Vanguard", "Operation Windfall", "Operation Zenith",
];
const operationDescriptions = [
  "Coordinating field logistics across the northern sector.",
  "Monitoring supply chain integrity for regional distribution.",
  "Supporting emergency response operations in the eastern corridor.",
  "Overseeing routine security assessments at key installations.",
  "Facilitating personnel rotation and deployment scheduling.",
  "Managing equipment maintenance and readiness checks.",
  "Conducting communications infrastructure upgrades.",
  "Coordinating inter-agency collaboration on joint initiatives.",
  "Supervising field training exercises and evaluation protocols.",
  "Tracking asset movement and inventory reconciliation.",
  "Providing operational oversight for community liaison programs.",
  "Organizing rapid deployment drill sequences.",
  "Managing incident response coordination across multiple sites.",
  "Overseeing data collection and reporting for quarterly review.",
  "Coordinating transport logistics for personnel transfers.",
  "Supporting field intelligence gathering and analysis.",
  "Facilitating resource allocation and budget oversight.",
  "Managing perimeter monitoring and access control systems.",
  "Conducting site inspections and compliance audits.",
  "Overseeing communication relay station maintenance.",
  "Coordinating disaster preparedness planning sessions.",
  "Supporting environmental monitoring at field locations.",
  "Managing documentation and record-keeping protocols.",
  "Facilitating cross-departmental status briefings.",
];
export const operations: Operation[] = [];
for (let i = 0; i < 24; i++) {
  // ~14 active, ~5 standby, ~4 completed, ~1 suspended
  let status: OperationStatus;
  if (i < 14) status = "active";
  else if (i < 19) status = "standby";
  else if (i < 23) status = "completed";
  else status = "suspended";

  const priority: Priority = i < 3 ? "critical" : i < 8 ? "high" : i < 16 ? "medium" : "low";

  const locationId = pick(locations).id;

  // Pick personnel at this location (or any if too few at location)
  const personnelAtLocation = personnel.filter(
    (p) => p.locationId === locationId && p.currentAssignmentOperationId === null && (p.status === "active" || p.status === "standby")
  );
  const fallbackPersonnel = personnel.filter(
    (p) => p.currentAssignmentOperationId === null && (p.status === "active" || p.status === "standby")
  );
  const pool = personnelAtLocation.length >= 3 ? personnelAtLocation : fallbackPersonnel;
  const assignedPersonnel = pickN(pool, 3, 12);

  // Pick assets at this location
  const assetsAtLocation = assets.filter(
    (a) => a.locationId === locationId && a.assignedOperationId === null && a.status !== "offline"
  );
  const fallbackAssets = assets.filter(
    (a) => a.assignedOperationId === null && a.status !== "offline"
  );
  const assetPool = assetsAtLocation.length >= 1 ? assetsAtLocation : fallbackAssets;
  const assignedAssets = pickN(assetPool, 1, 5);

  const opId = `OP-${String(i + 1).padStart(3, "0")}`;

  // Backfill assignments
  for (const p of assignedPersonnel) {
    p.currentAssignmentOperationId = opId;
    p.locationId = locationId;
  }
  for (const a of assignedAssets) {
    a.assignedOperationId = opId;
    a.locationId = locationId;
  }

  operations.push({
    id: opId,
    name: operationNames[i],
    status,
    priority,
    locationId,
    personnelIds: assignedPersonnel.map((p) => p.id),
    assetIds: assignedAssets.map((a) => a.id),
    startedAt: daysAgo(Math.floor(rand() * 60) + 1),
    lastUpdatedAt: minutesAgo(Math.floor(rand() * 1440)),
    description: operationDescriptions[i],
  });
}

// ── 5. Communications (~60 records) ────────────────────────────────────
const commCategories: CommunicationCategory[] = ["status-update", "logistics", "general"];
const commMessages = [
  "Field team reporting all clear at sector checkpoint.",
  "Supply delivery confirmed, inventory updated.",
  "Requesting additional personnel for evening rotation.",
  "Equipment maintenance completed, unit back online.",
  "Weather advisory: operations proceeding with caution.",
  "Shift handover completed without incident.",
  "Vehicle inspection passed, cleared for deployment.",
  "Communication relay test successful.",
  "Personnel check-in confirmed, all accounted for.",
  "Logistics manifest updated for outgoing shipment.",
  "Site perimeter check completed, no anomalies.",
  "Requesting authorization for extended patrol route.",
  "Field device calibration completed successfully.",
  "Status briefing scheduled for 1400 hours.",
  "Resource allocation request submitted for review.",
  "Transport convoy departed on schedule.",
  "Incident report filed, awaiting supervisor review.",
  "Training exercise completed, results logged.",
  "Access credentials updated for new personnel.",
  "Facility maintenance request submitted.",
];

export const communications: Communication[] = [];
for (let i = 0; i < 60; i++) {
  const hasOperation = rand() > 0.3;
  communications.push({
    id: `COM-${String(142 + i).padStart(4, "0")}`,
    operationId: hasOperation ? pick(operations).id : null,
    unit: pick(units),
    timestamp: hoursAgo(Math.floor(rand() * 168)), // last 7 days
    category: pick(commCategories),
    message: pick(commMessages),
    read: rand() > 0.3,
  });
}

// ── 6. Audit Logs (~120 records) ───────────────────────────────────────
const auditActions: AuditAction[] = ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "LOGIN"];
const auditResourceTypes: AuditResourceType[] = ["operation", "asset", "personnel", "system"];
const actorNames = [
  "Admin Mensah", "Admin Adjei", "Supervisor Boateng", "Supervisor Osei",
  "System Automation", "Admin Tetteh", "Supervisor Appiah",
];

export const auditLogs: AuditLogEntry[] = [];
for (let i = 0; i < 120; i++) {
  const resourceType = pick(auditResourceTypes);
  let resourceId: string;
  let resourceLabel: string;

  if (resourceType === "operation") {
    const op = pick(operations);
    resourceId = op.id;
    resourceLabel = op.name;
  } else if (resourceType === "personnel") {
    const p = pick(personnel);
    resourceId = p.id;
    resourceLabel = p.displayName;
  } else if (resourceType === "asset") {
    const a = pick(assets);
    resourceId = a.id;
    resourceLabel = a.name;
  } else {
    resourceId = "SYS-001";
    resourceLabel = "System Configuration";
  }

  const action = pick(auditActions);
  const result: AuditResult = rand() > 0.05 ? "success" : "failure";

  const entry: AuditLogEntry = {
    id: `EVT-${83921 + i}`,
    timestamp: hoursAgo(Math.floor(rand() * 720)), // last 30 days
    actor: pick(actorNames),
    action,
    resourceType,
    resourceId,
    resourceLabel,
    result,
  };

  if (action === "STATUS_CHANGE" || action === "UPDATE") {
    entry.previousState = { status: "standby" };
    entry.newState = { status: "active" };
  }

  auditLogs.push(entry);
}

// ── 7. Alerts (7 records) ──────────────────────────────────────────────
export const alerts: Alert[] = [
  {
    id: "ALT-001",
    severity: "critical",
    title: "Asset offline unexpectedly",
    message: "Comms Unit 05 went offline at Tamale Field Site without scheduled maintenance.",
    relatedResourceType: "asset",
    relatedResourceId: "AST-025",
    createdAt: minutesAgo(12),
    acknowledged: false,
  },
  {
    id: "ALT-002",
    severity: "critical",
    title: "Unresponsive field personnel",
    message: "Personnel OFF-1030 has not checked in for over 6 hours beyond scheduled time.",
    relatedResourceType: "personnel",
    relatedResourceId: "OFF-1030",
    createdAt: minutesAgo(45),
    acknowledged: false,
  },
  {
    id: "ALT-003",
    severity: "warning",
    title: "Operation understaffed",
    message: "Operation Granite is below minimum personnel threshold for active status.",
    relatedResourceType: "operation",
    relatedResourceId: "OP-007",
    createdAt: hoursAgo(2),
    acknowledged: false,
  },
  {
    id: "ALT-004",
    severity: "warning",
    title: "Equipment maintenance overdue",
    message: "Field Vehicle 12 has exceeded scheduled maintenance interval by 3 days.",
    relatedResourceType: "asset",
    relatedResourceId: "AST-032",
    createdAt: hoursAgo(5),
    acknowledged: true,
  },
  {
    id: "ALT-005",
    severity: "warning",
    title: "Communication delay detected",
    message: "Status updates from Ho Eastern Post are arriving with significant delay.",
    relatedResourceType: null,
    relatedResourceId: null,
    createdAt: hoursAgo(8),
    acknowledged: true,
  },
  {
    id: "ALT-006",
    severity: "info",
    title: "Scheduled system maintenance",
    message: "Planned maintenance window begins at 0200 hours for communications relay.",
    relatedResourceType: null,
    relatedResourceId: null,
    createdAt: hoursAgo(12),
    acknowledged: true,
  },
  {
    id: "ALT-007",
    severity: "info",
    title: "New personnel onboarded",
    message: "Three new field operations personnel have completed onboarding and are available for assignment.",
    relatedResourceType: null,
    relatedResourceId: null,
    createdAt: daysAgo(1),
    acknowledged: true,
  },
];

// ── 8. Medical Summary ─────────────────────────────────────────────────
export const medicalSummary: MedicalSummary = {
  cleared: 121,
  monitoring: 5,
  attention: 2,
  lastUpdatedAt: hoursAgo(1),
};
