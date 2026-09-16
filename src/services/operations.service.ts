import type { Operation } from "../types/operation";
import { operations } from "../data/operations";

// Note: returns full array; client-side filtering/sorting/pagination is handled by the UI.
// This tradeoff simplifies the mock layer; a real API would support server-side filtering.

export async function getOperations(): Promise<Operation[]> {
  return operations;
}

export async function getOperationById(id: string): Promise<Operation | null> {
  return operations.find((op) => op.id === id) ?? null;
}

