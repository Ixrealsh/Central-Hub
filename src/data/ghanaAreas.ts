export interface TacticalArea {
  id: string;
  name: string;
  category: "command-base" | "field-post" | "region" | "city" | "military-base" | "tactical-sector";
  region: string;
  coordinates: [number, number]; // [lat, lng]
  zoom: number;
  description?: string;
  aliases?: string[];
}

export const GHANA_REGIONS: TacticalArea[] = [
  {
    id: "reg-greater-accra",
    name: "Greater Accra Region",
    category: "region",
    region: "Greater Accra",
    coordinates: [5.8143, 0.0747],
    zoom: 10,
    description: "National capital sector & command headquarters zone",
    aliases: ["Accra Region", "Capital Sector"],
  },
  {
    id: "reg-ashanti",
    name: "Ashanti Region",
    category: "region",
    region: "Ashanti",
    coordinates: [6.747, -1.5209],
    zoom: 9,
    description: "Central command sector & logistics corridor",
    aliases: ["Ashanti", "Kumasi Sector"],
  },
  {
    id: "reg-northern",
    name: "Northern Region",
    category: "region",
    region: "Northern",
    coordinates: [9.5439, -0.9057],
    zoom: 9,
    description: "Northern tactical sector & airborne operations area",
    aliases: ["Northern Sector", "Tamale Sector"],
  },
  {
    id: "reg-central",
    name: "Central Region",
    category: "region",
    region: "Central",
    coordinates: [5.5583, -1.2181],
    zoom: 9,
    description: "Central coastal sector & maritime security zone",
    aliases: ["Central Sector", "Cape Coast Sector"],
  },
  {
    id: "reg-volta",
    name: "Volta Region",
    category: "region",
    region: "Volta",
    coordinates: [6.5781, 0.4502],
    zoom: 9,
    description: "Eastern border surveillance sector",
    aliases: ["Volta Sector", "Ho Sector", "Eastern Frontier"],
  },
  {
    id: "reg-eastern",
    name: "Eastern Region",
    category: "region",
    region: "Eastern",
    coordinates: [6.4468, -0.3804],
    zoom: 9,
    description: "Critical infrastructure & Volta lake sector",
    aliases: ["Eastern Sector", "Koforidua Sector"],
  },
  {
    id: "reg-western",
    name: "Western Region",
    category: "region",
    region: "Western",
    coordinates: [5.3853, -2.1465],
    zoom: 9,
    description: "Western naval corridor & offshore oil sector",
    aliases: ["Western Sector", "Takoradi Sector"],
  },
  {
    id: "reg-bono",
    name: "Bono Region",
    category: "region",
    region: "Bono",
    coordinates: [7.581, -2.3432],
    zoom: 9,
    description: "Western transit corridor & tactical post sector",
    aliases: ["Sunyani Sector"],
  },
  {
    id: "reg-bono-east",
    name: "Bono East Region",
    category: "region",
    region: "Bono East",
    coordinates: [7.7587, -1.0543],
    zoom: 9,
    description: "Central agricultural & commercial crossroads",
    aliases: ["Techiman Sector"],
  },
  {
    id: "reg-ahafo",
    name: "Ahafo Region",
    category: "region",
    region: "Ahafo",
    coordinates: [7.0142, -2.3364],
    zoom: 9,
    description: "Western forestry & mining surveillance zone",
    aliases: ["Goaso Sector"],
  },
  {
    id: "reg-upper-east",
    name: "Upper East Region",
    category: "region",
    region: "Upper East",
    coordinates: [10.7082, -0.5694],
    zoom: 9,
    description: "Northern frontier border security sector",
    aliases: ["Bolgatanga Sector", "Bawku Corridor"],
  },
  {
    id: "reg-upper-west",
    name: "Upper West Region",
    category: "region",
    region: "Upper West",
    coordinates: [10.252, -2.1465],
    zoom: 9,
    description: "North-western border surveillance zone",
    aliases: ["Wa Sector"],
  },
  {
    id: "reg-oti",
    name: "Oti Region",
    category: "region",
    region: "Oti",
    coordinates: [7.9157, 0.3129],
    zoom: 9,
    description: "Eastern corridor surveillance sector",
    aliases: ["Dambai Sector"],
  },
  {
    id: "reg-north-east",
    name: "North East Region",
    category: "region",
    region: "North East",
    coordinates: [10.3548, -0.3702],
    zoom: 9,
    description: "Northern security buffer zone",
    aliases: ["Nalerigu Sector"],
  },
  {
    id: "reg-savannah",
    name: "Savannah Region",
    category: "region",
    region: "Savannah",
    coordinates: [9.0833, -1.8167],
    zoom: 9,
    description: "Largest tactical reconnaissance territory",
    aliases: ["Damongo Sector"],
  },
  {
    id: "reg-western-north",
    name: "Western North Region",
    category: "region",
    region: "Western North",
    coordinates: [6.2731, -2.8021],
    zoom: 9,
    description: "Western forest border zone",
    aliases: ["Sefwi Wiawso Sector"],
  },
];

export const GHANA_CITIES_AND_BASES: TacticalArea[] = [
  // ── Tactical Military & Air/Naval Garrisons ──────────────────────────────
  {
    id: "mil-burma-camp",
    name: "Burma Camp (GAF General HQ)",
    category: "military-base",
    region: "Greater Accra",
    coordinates: [5.5862, -0.1554],
    zoom: 14,
    description: "Ghana Armed Forces General Headquarters & CID Command",
    aliases: ["Burma Camp", "GAF HQ", "Army HQ"],
  },
  {
    id: "mil-tamale-airborne",
    name: "Tamale Airborne Force Base",
    category: "military-base",
    region: "Northern",
    coordinates: [9.42, -0.85],
    zoom: 14,
    description: "Northern Air Command & Tactical Parachute Regiment",
    aliases: ["Airborne Camp", "Tamale Base"],
  },
  {
    id: "mil-takoradi-naval",
    name: "Takoradi Naval Base (Western Command)",
    category: "military-base",
    region: "Western",
    coordinates: [4.8872, -1.7554],
    zoom: 14,
    description: "Ghana Navy Western Command & Maritime Defense Port",
    aliases: ["Western Naval Base", "Takoradi Harbor Base"],
  },
  {
    id: "mil-4-garrison-kumasi",
    name: "4 Garrison (Central Command)",
    category: "military-base",
    region: "Ashanti",
    coordinates: [6.685, -1.62],
    zoom: 14,
    description: "Central Command Brigade Headquarters, Kumasi",
    aliases: ["4 Garrison", "Kumasi Barracks", "Central Command"],
  },
  {
    id: "mil-3-garrison-sunyani",
    name: "3 Garrison (Liberation Barracks)",
    category: "military-base",
    region: "Bono",
    coordinates: [7.345, -2.315],
    zoom: 14,
    description: "Liberation Barracks, 3rd Infantry Battalion",
    aliases: ["Liberation Barracks", "Sunyani Barracks", "3BN"],
  },

  // ── Major Cities & Strategic Areas ──────────────────────────────────────
  {
    id: "city-accra",
    name: "Accra",
    category: "city",
    region: "Greater Accra",
    coordinates: [5.6037, -0.187],
    zoom: 12,
    description: "National Capital & Central Operations Command Sector",
    aliases: ["Accra Central", "Capital"],
  },
  {
    id: "area-kotoka-airport",
    name: "Kotoka International Airport (KIA)",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.6052, -0.1717],
    zoom: 13,
    description: "Strategic Air Hub & Border Entry Protocol Sector",
    aliases: ["KIA", "Airport Residential", "Airport City"],
  },
  {
    id: "city-tema",
    name: "Tema Port & Industrial Sector",
    category: "city",
    region: "Greater Accra",
    coordinates: [5.6698, -0.0166],
    zoom: 12,
    description: "Main Seaport & Eastern Industrial Maritime Hub",
    aliases: ["Tema", "Tema Harbor", "Port Sector"],
  },
  {
    id: "city-kumasi",
    name: "Kumasi",
    category: "city",
    region: "Ashanti",
    coordinates: [6.6885, -1.6244],
    zoom: 12,
    description: "Ashanti Capital & Central Tactical Staging City",
    aliases: ["Kumasi Central", "Garden City", "Kejetia"],
  },
  {
    id: "city-tamale",
    name: "Tamale",
    category: "city",
    region: "Northern",
    coordinates: [9.4008, -0.8393],
    zoom: 12,
    description: "Northern Regional Capital & Strategic Aerial Transit Hub",
    aliases: ["Tamale Metropolis"],
  },
  {
    id: "city-sekondi-takoradi",
    name: "Sekondi-Takoradi",
    category: "city",
    region: "Western",
    coordinates: [4.9125, -1.7739],
    zoom: 12,
    description: "Western Maritime City & Oil Logistics Capital",
    aliases: ["Takoradi", "Sekondi", "Twin City"],
  },
  {
    id: "city-cape-coast",
    name: "Cape Coast",
    category: "city",
    region: "Central",
    coordinates: [5.1053, -1.2466],
    zoom: 12,
    description: "Central Coastline & Regional Surveillance Point",
    aliases: ["Oguaa"],
  },
  {
    id: "city-sunyani",
    name: "Sunyani",
    category: "city",
    region: "Bono",
    coordinates: [7.3399, -2.3268],
    zoom: 12,
    description: "Bono Regional Capital & Western Perimeter Staging",
    aliases: ["Sunyani Municipality"],
  },
  {
    id: "city-ho",
    name: "Ho",
    category: "city",
    region: "Volta",
    coordinates: [6.6111, 0.4703],
    zoom: 12,
    description: "Volta Regional Capital & Eastern Border Monitoring",
    aliases: ["Ho Municipality"],
  },
  {
    id: "city-koforidua",
    name: "Koforidua",
    category: "city",
    region: "Eastern",
    coordinates: [6.0784, -0.2592],
    zoom: 12,
    description: "Eastern Regional Capital & Mountain Relay Corridor",
    aliases: ["Kof City", "K-dua"],
  },
  {
    id: "city-techiman",
    name: "Techiman",
    category: "city",
    region: "Bono East",
    coordinates: [7.5833, -1.9333],
    zoom: 12,
    description: "Major Inland Commercial Transit & Freight Hub",
    aliases: ["Techiman Market"],
  },
  {
    id: "city-bolgatanga",
    name: "Bolgatanga",
    category: "city",
    region: "Upper East",
    coordinates: [10.7856, -0.8514],
    zoom: 12,
    description: "Upper East Frontier Capital & Border Security Post",
    aliases: ["Bolga"],
  },
  {
    id: "city-wa",
    name: "Wa",
    category: "city",
    region: "Upper West",
    coordinates: [10.0601, -2.5099],
    zoom: 12,
    description: "Upper West Regional Headquarters & Sahel Border Post",
    aliases: ["Wa Municipality"],
  },
  {
    id: "city-obuasi",
    name: "Obuasi",
    category: "city",
    region: "Ashanti",
    coordinates: [6.2022, -1.6811],
    zoom: 12,
    description: "Critical Mining Asset Protection & Security Sector",
    aliases: ["Obuasi Gold Sector"],
  },
  {
    id: "city-bawku",
    name: "Bawku",
    category: "tactical-sector",
    region: "Upper East",
    coordinates: [11.0616, -0.2417],
    zoom: 12,
    description: "Border Security Zone & Joint Task Force Area",
    aliases: ["Bawku Tri-Border"],
  },
  {
    id: "city-akosombo",
    name: "Akosombo Hydro Dam Sector",
    category: "tactical-sector",
    region: "Eastern",
    coordinates: [6.2667, 0.05],
    zoom: 12,
    description: "National Critical Energy Infrastructure Facility",
    aliases: ["Akosombo Dam", "VRA Sector"],
  },
  {
    id: "city-kasoa",
    name: "Kasoa Transit Corridor",
    category: "city",
    region: "Central",
    coordinates: [5.5345, -0.4168],
    zoom: 12,
    description: "High-density Western Accra Urban Transit Sector",
    aliases: ["Kasoa Tollbooth Sector"],
  },
  {
    id: "city-aflao",
    name: "Aflao Border Crossing",
    category: "tactical-sector",
    region: "Volta",
    coordinates: [6.1198, 1.1901],
    zoom: 13,
    description: "Eastern International Land Border Post (Ghana-Togo)",
    aliases: ["Aflao Border", "Togo Border"],
  },
  {
    id: "city-elmina",
    name: "Elmina Coastal Sector",
    category: "city",
    region: "Central",
    coordinates: [5.0847, -1.3511],
    zoom: 13,
    description: "Historic Coastal Harbor & Fisheries Patrol",
    aliases: ["Elmina"],
  },
  {
    id: "city-tarkwa",
    name: "Tarkwa Resource Sector",
    category: "city",
    region: "Western",
    coordinates: [5.3018, -1.9846],
    zoom: 12,
    description: "Western Mineral Extraction Defense Sector",
    aliases: ["Tarkwa"],
  },
  {
    id: "city-winneba",
    name: "Winneba",
    category: "city",
    region: "Central",
    coordinates: [5.3511, -0.6231],
    zoom: 12,
    description: "Central Coast Transit & Education Enclave",
    aliases: ["Simpa"],
  },
  {
    id: "city-yendi",
    name: "Yendi Eastern Northern Post",
    category: "city",
    region: "Northern",
    coordinates: [9.4427, -0.0099],
    zoom: 12,
    description: "Dagbon Traditional Capital & Eastern Northern Sector",
    aliases: ["Yendi"],
  },
  {
    id: "city-keta",
    name: "Keta Lagoon & Maritime Sector",
    category: "city",
    region: "Volta",
    coordinates: [5.9179, 0.9923],
    zoom: 12,
    description: "South-Eastern Coastal Lagoon Surveillance Zone",
    aliases: ["Keta Lagoon"],
  },
  {
    id: "city-navrongo",
    name: "Navrongo",
    category: "city",
    region: "Upper East",
    coordinates: [10.8956, -1.0921],
    zoom: 12,
    description: "Northern Research Corridor & Border Proximity Site",
    aliases: ["Navrongo Post"],
  },
  {
    id: "city-nsawam",
    name: "Nsawam Junction",
    category: "city",
    region: "Eastern",
    coordinates: [5.8089, -0.3503],
    zoom: 12,
    description: "Eastern Chokepoint & National Railway Intersection",
    aliases: ["Nsawam Medium Security"],
  },
  {
    id: "city-legon",
    name: "Legon / University Sector",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.6506, -0.187],
    zoom: 13,
    description: "Academic Research & Technology Corridor",
    aliases: ["Legon Campus", "UG Legon"],
  },
  {
    id: "city-east-legon",
    name: "East Legon Commercial Sector",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.638, -0.158],
    zoom: 13,
    description: "High-density Diplomatic & Commercial District",
    aliases: ["East Legon", "Lagos Avenue", "Shiashie"],
  },
  {
    id: "city-osu",
    name: "Osu / Ministries Sector",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.556, -0.1818],
    zoom: 13,
    description: "Government Ministerial Enclave & Coastal Castle Sector",
    aliases: ["Osu RE", "Oxford Street", "Ministries", "Osu Castle"],
  },
  {
    id: "sector-madina",
    name: "Madina Tactical Sector",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.6698, -0.165],
    zoom: 13,
    description: "Major North-Eastern Accra Transport & Commercial Corridor",
    aliases: ["Madina", "Madina Market", "Zongo Junction"],
  },
  {
    id: "sector-spintex",
    name: "Spintex Road Corridor",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.632, -0.108],
    zoom: 13,
    description: "East-West Arterial Industrial & Commercial Highway",
    aliases: ["Spintex", "Spintex Road", "Batsonaa"],
  },
  {
    id: "sector-circle",
    name: "Kwame Nkrumah Circle",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.56, -0.207],
    zoom: 14,
    description: "Central Transit Interchange & Arterial Nexus",
    aliases: ["Circle", "Kwame Nkrumah Interchange", "Overpass Sector"],
  },
  {
    id: "sector-makola",
    name: "Makola / Central Business District",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.545, -0.206],
    zoom: 14,
    description: "High-density Downtown Commercial Hub & Financial Zone",
    aliases: ["Makola", "Makola Market", "Accra Central", "CBD"],
  },
  {
    id: "sector-cantonments",
    name: "Cantonments Diplomatic Enclave",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.58, -0.17],
    zoom: 14,
    description: "Diplomatic Missions & High-security Residential Sector",
    aliases: ["Cantonments", "Embassy Enclave"],
  },
  {
    id: "sector-ridge",
    name: "Ridge Institutional Enclave",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.565, -0.195],
    zoom: 14,
    description: "Administrative Headquarters, Financial District & Ridge Hospital",
    aliases: ["Ridge", "Ridge Hospital"],
  },
  {
    id: "sector-labadi",
    name: "Labadi Coastal Zone",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.564, -0.155],
    zoom: 13,
    description: "South-Eastern Coastal Security Zone & Beach Perimeter",
    aliases: ["Labadi", "La", "Labadi Beach", "Trade Fair"],
  },
  {
    id: "sector-dansoman",
    name: "Dansoman Urban Sector",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.55, -0.26],
    zoom: 13,
    description: "South-Western Residential & Coastal Outpost",
    aliases: ["Dansoman", "DC", "Dansoman Estate"],
  },
  {
    id: "sector-achimota",
    name: "Achimota Logistics & Forest Corridor",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.62, -0.225],
    zoom: 13,
    description: "Northern Transit Depot & Ecological Perimeter",
    aliases: ["Achimota", "Achimota Forest", "Achimota Station"],
  },
  {
    id: "sector-lapaz",
    name: "Lapaz Transport Hub",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.602, -0.243],
    zoom: 13,
    description: "N1 Highway West Interchange & Commercial Transit Hub",
    aliases: ["Lapaz", "George Walker Bush Highway", "Lapaz Market"],
  },
  {
    id: "sector-adenta",
    name: "Adenta Command Sector",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.71, -0.16],
    zoom: 13,
    description: "North Accra Strategic Arterial Route to Akuapem Ridge",
    aliases: ["Adenta", "Adenta Barrier", "Frafraha"],
  },
  {
    id: "sector-ashaiman",
    name: "Ashaiman Tactical Sector",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.698, -0.035],
    zoom: 13,
    description: "Eastern Industrial & Transit Hub connecting Tema Port",
    aliases: ["Ashaiman", "Ashaiman Market", "Underbridge"],
  },
  {
    id: "sector-weija",
    name: "Weija Dam & Water Infrastructure Sector",
    category: "tactical-sector",
    region: "Greater Accra",
    coordinates: [5.57, -0.34],
    zoom: 13,
    description: "Critical Metropolitan Water Supply Reservoir",
    aliases: ["Weija", "Weija Dam", "SCC"],
  },
  {
    id: "sector-kejetia",
    name: "Kejetia Market & Central Kumasi",
    category: "tactical-sector",
    region: "Ashanti",
    coordinates: [6.698, -1.624],
    zoom: 14,
    description: "West Africa's Largest Open Market & Central Logistics Terminal",
    aliases: ["Kejetia", "Kejetia Market", "Kumasi Central Market"],
  },
  {
    id: "sector-adum",
    name: "Adum Central Commercial District",
    category: "tactical-sector",
    region: "Ashanti",
    coordinates: [6.69, -1.625],
    zoom: 14,
    description: "Ashanti Financial Core & Heritage Commercial District",
    aliases: ["Adum", "Kumasi CBD"],
  },
  {
    id: "sector-bantama",
    name: "Bantama Cultural & Tactical Post",
    category: "tactical-sector",
    region: "Ashanti",
    coordinates: [6.702, -1.635],
    zoom: 14,
    description: "Key Urban Center & High Road Transit Route",
    aliases: ["Bantama", "Bantama High Street"],
  },
  {
    id: "sector-knust",
    name: "KNUST Technology & Innovation Corridor",
    category: "tactical-sector",
    region: "Ashanti",
    coordinates: [6.675, -1.57],
    zoom: 14,
    description: "Science & Cyber Research Strategic Campus",
    aliases: ["KNUST", "Tech Campus", "Ayeduase", "Bomso"],
  },
  {
    id: "sector-suame",
    name: "Suame Industrial Sector",
    category: "tactical-sector",
    region: "Ashanti",
    coordinates: [6.715, -1.63],
    zoom: 13,
    description: "Heavy Vehicle & Tactical Equipment Engineering Hub",
    aliases: ["Suame Magazine", "Suame", "Roundabout"],
  },
  {
    id: "sector-aburi",
    name: "Aburi Mountain Ridge Sector",
    category: "tactical-sector",
    region: "Eastern",
    coordinates: [5.849, -0.177],
    zoom: 13,
    description: "Elevated Tactical Ridge & Mountain Relay Corridor",
    aliases: ["Aburi", "Aburi Gardens", "Akuapem Ridge"],
  },
  {
    id: "sector-paga",
    name: "Paga Northern Border Crossing",
    category: "tactical-sector",
    region: "Upper East",
    coordinates: [10.99, -1.11],
    zoom: 13,
    description: "Strategic Northern International Border Post (Ghana-Burkina Faso)",
    aliases: ["Paga", "Paga Border", "Burkina Border"],
  },
];

export const ALL_TACTICAL_AREAS: TacticalArea[] = [
  ...GHANA_CITIES_AND_BASES,
  ...GHANA_REGIONS,
];

/**
 * Searches built-in tactical areas and returns matching records ranked by relevance.
 * Supports tokenized multi-word search, partial matching, aliases, and country-name tolerance.
 */
export function searchGhanaAreas(query: string, maxResults = 8): TacticalArea[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Remove common punctuation and split into terms
  const terms = q.replace(/[,.-]/g, " ").split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  // If query has multiple terms, ignore generic words like "ghana" for strict filtering
  const searchTerms = terms.length > 1 ? terms.filter((t) => t !== "ghana") : terms;

  const matches = ALL_TACTICAL_AREAS.filter((area) => {
    const areaName = area.name.toLowerCase();
    const areaRegion = area.region.toLowerCase();
    const areaDesc = (area.description || "").toLowerCase();
    const areaAliases = (area.aliases || []).map((a) => a.toLowerCase());
    const searchableText = `${areaName} ${areaRegion} ${areaDesc} ${areaAliases.join(" ")} ${area.category}`;

    // Full query match
    if (searchableText.includes(q)) return true;

    // All terms must match somewhere in the area's text
    return searchTerms.every((term) => searchableText.includes(term));
  });

  // Calculate relevance score
  matches.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const qClean = searchTerms.join(" ");

    // 1. Direct exact name match with full query or cleaned terms
    const aExact = aName === q || aName === qClean;
    const bExact = bName === q || bName === qClean;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // 2. Starts with full query or cleaned terms
    const aStarts = aName.startsWith(q) || aName.startsWith(qClean);
    const bStarts = bName.startsWith(q) || bName.startsWith(qClean);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // 3. Name contains full query or cleaned terms
    const aContains = aName.includes(q) || aName.includes(qClean);
    const bContains = bName.includes(q) || bName.includes(qClean);
    if (aContains && !bContains) return -1;
    if (!aContains && bContains) return 1;

    // 4. Check aliases exact match
    const aAliasExact = (a.aliases || []).some((al) => {
      const l = al.toLowerCase();
      return l === q || l === qClean;
    });
    const bAliasExact = (b.aliases || []).some((al) => {
      const l = al.toLowerCase();
      return l === q || l === qClean;
    });
    if (aAliasExact && !bAliasExact) return -1;
    if (!aAliasExact && bAliasExact) return 1;

    // 5. Check aliases startsWith
    const aAliasStarts = (a.aliases || []).some((al) => {
      const l = al.toLowerCase();
      return l.startsWith(q) || l.startsWith(qClean);
    });
    const bAliasStarts = (b.aliases || []).some((al) => {
      const l = al.toLowerCase();
      return l.startsWith(q) || l.startsWith(qClean);
    });
    if (aAliasStarts && !bAliasStarts) return -1;
    if (!aAliasStarts && bAliasStarts) return 1;

    // 6. Category priority when match quality is otherwise equal
    const priorityScore: Record<TacticalArea["category"], number> = {
      "command-base": 6,
      "military-base": 5,
      "tactical-sector": 4,
      city: 3,
      "field-post": 2,
      region: 1,
    };
    return (priorityScore[b.category] ?? 0) - (priorityScore[a.category] ?? 0);
  });

  return matches.slice(0, maxResults);
}
