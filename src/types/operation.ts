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

