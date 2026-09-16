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

