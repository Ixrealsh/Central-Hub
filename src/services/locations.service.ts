import type { Location } from "../types/location";
import { locations } from "../data/locations";

export async function getLocations(): Promise<Location[]> {
  return locations;
}

