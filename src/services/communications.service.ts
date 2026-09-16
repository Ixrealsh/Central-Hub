import type { Communication } from "../types/communication";
import { communications } from "../data/communications";

// Note: returns full array; client-side filtering is handled by the UI.

export async function getCommunications(): Promise<Communication[]> {
  return communications;
}

