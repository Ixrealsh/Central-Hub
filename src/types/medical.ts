// Aggregate-only. Never add per-person medical fields anywhere in the app.
export interface MedicalSummary {
  cleared: number;
  monitoring: number;
  attention: number;
  lastUpdatedAt: string; // ISO 8601
}

