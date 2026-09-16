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

