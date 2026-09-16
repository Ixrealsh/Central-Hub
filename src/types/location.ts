export type LocationKind = "operations-center" | "field-site";

export interface Location {
  id: string;              // "LOC-01"
  name: string;             // "Accra Operations Center"
  kind: LocationKind;
  // Abstract map-space coordinates, 0-100 on each axis. NOT real geo
  // coordinates   never treat these as latitude/longitude.
  x: number;
  y: number;
}

