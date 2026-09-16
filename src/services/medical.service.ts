import type { MedicalSummary } from "../types/medical";
import { medicalSummary } from "../data/seed";

export async function getMedicalSummary(): Promise<MedicalSummary> {
  return medicalSummary;
}

