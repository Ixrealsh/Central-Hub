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

