import type { Alert } from "../types/alert";
import { alerts } from "../data/alerts";

// Note: returns full array; client-side filtering is handled by the UI.

export async function getAlerts(): Promise<Alert[]> {
  return alerts;
}

