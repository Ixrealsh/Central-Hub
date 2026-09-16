import type { AuditLogEntry } from "../types/audit";
import { auditLogs } from "../data/auditLogs";

// Note: returns full array; client-side filtering is handled by the UI.

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return auditLogs;
}

