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

