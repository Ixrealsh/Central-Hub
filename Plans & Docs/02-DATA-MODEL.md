# 02   Data Model, Mock Data, and Service Layer

Build this phase entirely before touching any UI component. Nothing here
depends on React.

## Entity relationship summary

```
Operation ──has many──> Personnel (via personnelIds)
Operation ──has many──> Assets (via assetIds)
Operation ──belongs to──> Location (via locationId)
Operation ──has many──> Communications (via operationId on Communication)

Personnel ──belongs to──> Location (via locationId)
Personnel ──optionally assigned to──> Operation (via currentAssignmentOperationId)

Asset ──belongs to──> Location (via locationId)
Asset ──optionally assigned to──> Operation (via assignedOperationId)

AuditLogEntry ──references──> any resource (resourceType + resourceId)
Alert ──optionally references──> any resource (relatedResourceType + relatedResourceId)
```

**Every foreign key must resolve.** If Operation `OP-004` lists
`personnelIds: ["OFF-1030"]`, `OFF-1030` must exist in the personnel
fixture and its `currentAssignmentOperationId` must be `"OP-004"`. This is
enforced by generating everything from one `seed.ts`, not by hand-writing
each fixture file separately and hoping they line up.

## Types

### `types/operation.ts`
```ts
export type OperationStatus = "active" | "standby" | "completed" | "suspended";
export type Priority = "low" | "medium" | "high" | "critical";

export interface Operation {
  id: string;                // "OP-001"
  name: string;               // "Operation Alpha"
  status: OperationStatus;
  priority: Priority;
  locationId: string;
  personnelIds: string[];
  assetIds: string[];
  startedAt: string;          // ISO 8601
  lastUpdatedAt: string;      // ISO 8601
  description: string;        // one sentence, fictional, generic
}
```

### `types/personnel.ts`
```ts
export type PersonnelStatus = "active" | "standby" | "off-duty" | "unavailable";

export interface Personnel {
  id: string;                              // "OFF-1024"
  displayName: string;                     // fictional full name
  status: PersonnelStatus;
  unit: string;                            // e.g. "Field Operations", "Logistics"
  currentAssignmentOperationId: string | null;
  locationId: string;
  lastActivityAt: string;                  // ISO 8601
}
```

### `types/asset.ts`
```ts
export type AssetType = "vehicle" | "equipment" | "field-device" | "comms-device";
export type AssetStatus = "active" | "idle" | "offline";

export interface Asset {
  id: string;                     // "AST-021"
  name: string;                   // "Field Vehicle 07"
  type: AssetType;
  status: AssetStatus;
  locationId: string;
  assignedOperationId: string | null;
  lastUpdatedAt: string;          // ISO 8601
}
```

### `types/location.ts`
```ts
export type LocationKind = "operations-center" | "field-site";

export interface Location {
  id: string;              // "LOC-01"
  name: string;             // "Accra Operations Center"
  kind: LocationKind;
  // Abstract map-space coordinates, 0-100 on each axis. NOT real geo
  // coordinates   never treat these as latitude/longitude.
  x: number;
  y: number;
}
```

### `types/communication.ts`
```ts
export type CommunicationCategory = "status-update" | "logistics" | "general";

export interface Communication {
  id: string;                    // "COM-0142"
  operationId: string | null;
  unit: string;
  timestamp: string;             // ISO 8601
  category: CommunicationCategory;
  message: string;               // short, generic, fictional operational note
  read: boolean;
}
```

### `types/audit.ts`
```ts
export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE" | "LOGIN";
export type AuditResourceType = "operation" | "asset" | "personnel" | "system";
export type AuditResult = "success" | "failure";

export interface AuditLogEntry {
  id: string;                    // "EVT-83921"
  timestamp: string;             // ISO 8601
  actor: string;                 // "Admin 01"
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceLabel: string;         // human-readable, e.g. "Operation Alpha"
  result: AuditResult;
  previousState?: Record<string, string>;
  newState?: Record<string, string>;
}
```

### `types/alert.ts`
```ts
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertResourceType = "operation" | "asset" | "personnel";

export interface Alert {
  id: string;                          // "ALT-001"
  severity: AlertSeverity;
  title: string;
  message: string;
  relatedResourceType: AlertResourceType | null;
  relatedResourceId: string | null;
  createdAt: string;                   // ISO 8601
  acknowledged: boolean;
}
```

### `types/medical.ts`
```ts
// Aggregate-only. Never add per-person medical fields anywhere in the app.
export interface MedicalSummary {
  cleared: number;
  monitoring: number;
  attention: number;
  lastUpdatedAt: string; // ISO 8601
}
```

## Mock data volumes (match these   they drive the dashboard KPIs)

| Entity | Count | Notes |
|---|---|---|
| Operations | 24 | ~14 active, ~5 standby, ~4 completed, ~1 suspended |
| Personnel | 148 | ~142 active/standby combined, rest off-duty/unavailable |
| Assets | 63 | ~59 active/idle combined, rest offline |
| Locations | 6 | 2 operations-centers, 4 field-sites |
| Communications | ~60 | spread across last 7 days |
| Audit log entries | ~120 | spread across last 30 days |
| Alerts | 7 | 2 critical, 3 warning, 2 info   matches "2 requiring attention" on the dashboard |
| Medical summary | 1 record | `cleared: 121, monitoring: 5, attention: 2` |

## `data/seed.ts`   generation approach

One file, run once at module load, produces every fixture in dependency
order so relationships are guaranteed consistent:

1. Generate `locations` first (fixed list of 6, hand-authored   these are
   few enough not to need procedural generation).
2. Generate `personnel` (148 records), assigning each a random
   `locationId` from step 1.
3. Generate `assets` (63 records), same pattern.
4. Generate `operations` (24 records). For each operation, pick a
   `locationId`, then pick 3–12 personnel and 1–5 assets **that share that
   location** and assign them. Immediately backfill
   `currentAssignmentOperationId` / `assignedOperationId` on those
   personnel/asset records   this backfill step is what keeps the graph
   consistent, don't skip it.
5. Generate `communications`, each optionally tied to an operation from
   step 4.
6. Generate `auditLogs`, referencing real resource ids from steps 2–4.
7. Generate `alerts`, referencing real resource ids where relevant.
8. Export a single fixed `NOW` constant (an ISO string) that every
   relative timestamp ("2 minutes ago") is computed against, so the data
   doesn't look stale or inconsistent depending on when the app is opened.

Each domain file (`data/operations.ts`, etc.) re-exports its slice of
`seed.ts`   components should import from the domain file, not from
`seed.ts` directly.

Use realistic fictional naming throughout: operation names like "Operation
Alpha," "Operation Bravo," "Operation Cascade" (NATO-alphabet-adjacent but
generic); personnel display names as invented full names; never "Test
User," "Lorem Ipsum," or sequential placeholder text.

## Service layer

Every service function returns a `Promise` (even though it resolves
synchronously against in-memory data) so the eventual real API swap is a
one-line change per function, not a UI rewrite.

```ts
// services/operations.service.ts
export async function getOperations(): Promise<Operation[]> { ... }
export async function getOperationById(id: string): Promise<Operation | null> { ... }

// services/personnel.service.ts
export async function getPersonnel(): Promise<Personnel[]> { ... }
export async function getPersonnelById(id: string): Promise<Personnel | null> { ... }

// services/assets.service.ts
export async function getAssets(): Promise<Asset[]> { ... }
export async function getAssetById(id: string): Promise<Asset | null> { ... }

// services/locations.service.ts
export async function getLocations(): Promise<Location[]> { ... }

// services/communications.service.ts
export async function getCommunications(): Promise<Communication[]> { ... }

// services/audit.service.ts
export async function getAuditLogs(): Promise<AuditLogEntry[]> { ... }

// services/alerts.service.ts
export async function getAlerts(): Promise<Alert[]> { ... }

// services/medical.service.ts
export async function getMedicalSummary(): Promise<MedicalSummary> { ... }
```

Do not add pagination/filtering parameters to these functions   pages
fetch the full mock array and filter/sort/paginate client-side. That
matches a real future API less exactly but keeps this phase simple; note
this tradeoff in code as a one-line comment, don't solve it.

## Future API contract (document only, do not implement)

```
GET /operations          -> { data: Operation[] }
GET /operations/:id      -> { data: Operation }
GET /personnel           -> { data: Personnel[] }
GET /personnel/:id       -> { data: Personnel }
GET /assets              -> { data: Asset[] }
GET /assets/:id          -> { data: Asset }
GET /locations           -> { data: Location[] }
GET /communications      -> { data: Communication[] }
GET /audit-logs          -> { data: AuditLogEntry[] }
GET /alerts              -> { data: Alert[] }
GET /medical/summary     -> { data: MedicalSummary }
```

## Definition of done for this phase

- [ ] All 8 type files created, no `any` anywhere
- [ ] `seed.ts` generates all 7 fixture arrays with cross-referential
      integrity (spot-check: every `personnelIds` entry in every operation
      exists in the personnel array, and vice versa for assignment back-refs)
- [ ] All 8 service files created, all functions return `Promise<...>`
- [ ] `npm run typecheck` passes with zero errors
- [ ] No component or page file created yet   this phase is data-only
