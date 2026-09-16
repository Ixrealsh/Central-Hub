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

