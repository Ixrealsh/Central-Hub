import type { Personnel } from "../types/personnel";
import { personnel } from "../data/personnel";

// Note: returns full array; client-side filtering is handled by the UI.

export async function getPersonnel(): Promise<Personnel[]> {
  return personnel;
}

export async function getPersonnelById(id: string): Promise<Personnel | null> {
  return personnel.find((p) => p.id === id) ?? null;
}

