import type { Asset } from "../types/asset";
import { assets } from "../data/assets";

// Note: returns full array; client-side filtering is handled by the UI.

export async function getAssets(): Promise<Asset[]> {
  return assets;
}

export async function getAssetById(id: string): Promise<Asset | null> {
  return assets.find((a) => a.id === id) ?? null;
}

