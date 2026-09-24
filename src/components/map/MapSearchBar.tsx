import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useMap, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { Search, X, Crosshair, MapPin, Compass, Loader2, Navigation, Building2, Shield, Radio } from "lucide-react";
import { searchGhanaAreas, ALL_TACTICAL_AREAS } from "@/data/ghanaAreas";
import type { Location } from "@/types/location";
import type { Operation } from "@/types/operation";

export interface SearchResultItem {
  id: string;
  name: string;
  subtitle: string;
  category:
    | "command-hq"
    | "field-site"
    | "command-base"
    | "field-post"
    | "operation"
    | "military-base"
    | "city"
    | "region"
    | "tactical-sector"
    | "geocoded";
  coordinates: [number, number]; // [lat, lng]
  zoom: number;
  entityType?: "location" | "operation" | "area";
  entityId?: string;
  badge: string;
  badgeColor: string;
}

interface MapSearchBarProps {
  locations: Location[];
  operations: Operation[];
  locationMap: Map<string, Location>;
  opPositions: Map<string, [number, number]>;
  compact?: boolean;
  onMarkerClick?: (type: "location" | "operation" | "asset", id: string) => void;
  toMapPoint: (x: number, y: number) => [number, number];
}

function getTargetReticleIcon(name: string): L.DivIcon {
  const html = `
    <div class="tactical-target-marker" role="status" aria-label="Target acquired: ${name}">
      <div class="tactical-target-sonar"></div>
      <div class="tactical-target-sonar tactical-target-sonar--secondary"></div>
      <div class="tactical-target-reticle">
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Crosshair Lines -->
          <line x1="24" y1="3" x2="24" y2="13" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
          <line x1="24" y1="35" x2="24" y2="45" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
          <line x1="3" y1="24" x2="13" y2="24" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
          <line x1="35" y1="24" x2="45" y2="24" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
          
          <!-- Outer Dash Ring -->
          <circle cx="24" cy="24" r="15" stroke="#38BDF8" stroke-width="1.6" stroke-dasharray="4 2"/>
          
          <!-- Tactical Inner Target Pip -->
          <circle cx="24" cy="24" r="6" stroke="#0284C7" stroke-width="1.6" fill="rgba(56, 189, 248, 0.25)"/>
          <circle cx="24" cy="24" r="2.2" fill="#38BDF8"/>
          
          <!-- Corner brackets -->
          <path d="M 7 14 V 7 H 14" stroke="#38BDF8" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M 41 14 V 7 H 34" stroke="#38BDF8" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M 7 34 V 41 H 14" stroke="#38BDF8" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M 41 34 V 41 H 34" stroke="#38BDF8" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="tactical-target-badge">
        <span class="tactical-target-badge__dot"></span>
        <span class="tactical-target-badge__text">${name}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "tactical-target-leaflet-div-icon",
    html,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -32],
  });
}

export function MapSearchBar({
  locations,
  operations,
  locationMap,
  opPositions,
  compact = false,
  onMarkerClick,
  toMapPoint,
}: MapSearchBarProps) {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [currentTarget, setCurrentTarget] = useState<SearchResultItem | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedResults, setGeocodedResults] = useState<SearchResultItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stop Leaflet from intercepting clicks or drag gestures inside the search control
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  // Close dropdown on click outside or map click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    const handleMapClick = () => {
      setIsOpen(false);
    };
    map.on("click", handleMapClick);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      map.off("click", handleMapClick);
    };
  }, [map]);

  // Scroll active option into view during keyboard navigation
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const activeOption = dropdownRef.current.querySelector<HTMLElement>(
        `[role="option"][data-index="${selectedIndex}"]`
      );
      if (activeOption) {
        activeOption.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // ── 1. Local Search Candidates (Command Hubs, Operations, Ghana Areas) ─
  const localResults = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const terms = q.replace(/[,.-]/g, " ").split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    const searchTerms = terms.length > 1 ? terms.filter((t) => t !== "ghana") : terms;

    const items: SearchResultItem[] = [];

    // A. Locations (Command Hubs & Field Posts)
    for (const loc of locations) {
      const isHQ = loc.kind === "operations-center";
      const hqTerms = isHQ ? "hq command hq operations center" : "field site post";
      const locText = `${loc.name} ${loc.id} ${loc.kind} ${hqTerms}`.toLowerCase();
      const matches = locText.includes(q) || searchTerms.every((term) => locText.includes(term));
      if (matches) {
        const isHQ = loc.kind === "operations-center";
        const coords = toMapPoint(loc.x, loc.y);
        items.push({
          id: `loc-${loc.id}`,
          name: loc.name,
          subtitle: `${loc.id} • ${isHQ ? "Operations Center" : "Field Site Post"}`,
          category: isHQ ? "command-hq" : "field-site",
          coordinates: coords,
          zoom: 13,
          entityType: "location",
          entityId: loc.id,
          badge: isHQ ? "COMMAND HQ" : "FIELD POST",
          badgeColor: isHQ
            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
            : "bg-amber-500/20 text-amber-400 border-amber-500/30",
        });
      }
    }

    // B. Operations
    for (const op of operations) {
      const loc = locationMap.get(op.locationId);
      const opText = `${op.name} ${op.id} ${op.priority} ${op.status} ${loc?.name ?? ""}`.toLowerCase();
      const matches = opText.includes(q) || searchTerms.every((term) => opText.includes(term));
      if (matches) {
        const coords = opPositions.get(op.id) ?? (loc ? toMapPoint(loc.x, loc.y) : [7.9, -1.2]);
        const isActive = op.status === "active";
        items.push({
          id: `op-${op.id}`,
          name: op.name,
          subtitle: `${op.id} • ${op.priority.toUpperCase()} Priority • ${loc?.name ?? "Ghana"}`,
          category: "operation",
          coordinates: coords,
          zoom: 14,
          entityType: "operation",
          entityId: op.id,
          badge: isActive ? "ACTIVE OP" : "STANDBY OP",
          badgeColor: isActive
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            : "bg-blue-500/20 text-blue-400 border-blue-500/30",
        });
      }
    }

    // C. Ghana Tactical Areas (Cities, Garrisons, Regions, Suburbs)
    const tacticalAreas = searchGhanaAreas(q, 8);
    for (const area of tacticalAreas) {
      const isMil = area.category === "military-base";
      const isRegion = area.category === "region";
      const isCity = area.category === "city";
      const badge = isMil ? "GARRISON" : isRegion ? "REGION" : isCity ? "CITY" : "TACTICAL AREA";
      const badgeColor = isMil
        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
        : isRegion
        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
        : "bg-sky-500/20 text-sky-400 border-sky-500/30";

      items.push({
        id: area.id,
        name: area.name,
        subtitle: `${area.region} • ${area.description || "Strategic Area"}`,
        category: area.category,
        coordinates: area.coordinates,
        zoom: area.zoom,
        entityType: "area",
        badge,
        badgeColor,
      });
    }

    return items;
  }, [query, locations, operations, locationMap, opPositions, toMapPoint]);

  // Combined Results (local first, then geocoded online fallbacks)
  const combinedResults = useMemo(() => {
    const set = new Set<string>();
    const out: SearchResultItem[] = [];

    for (const item of localResults) {
      const key = `${item.coordinates[0].toFixed(3)},${item.coordinates[1].toFixed(3)}`;
      if (!set.has(key)) {
        set.add(key);
        out.push(item);
      }
    }

    for (const item of geocodedResults) {
      const key = `${item.coordinates[0].toFixed(3)},${item.coordinates[1].toFixed(3)}`;
      if (!set.has(key)) {
        set.add(key);
        out.push(item);
      }
    }

    return out.slice(0, compact ? 5 : 8);
  }, [localResults, geocodedResults, compact]);

  // ── 2. Live Nominatim Geocoding (Debounced) ──────────────────────────
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      return;
    }

    // Cancel existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const ghanaUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&countrycodes=gh&limit=4&addressdetails=1`;

        const res = await fetch(ghanaUrl, {
          signal: controller.signal,
          headers: { "Accept-Language": "en" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let data = (await res.json()) as Array<{
          place_id: number;
          display_name: string;
          lat: string;
          lon: string;
          type: string;
        }>;

        // If no Ghana-specific results, try fallback
        if (data.length === 0) {
          const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            `${trimmed}, Ghana`
          )}&limit=3`;
          const fbRes = await fetch(fallbackUrl, { signal: controller.signal });
          if (fbRes.ok) {
            data = await fbRes.json();
          }
        }

        const items: SearchResultItem[] = data.map((d) => {
          const parts = d.display_name.split(",");
          const name = parts[0]?.trim() || trimmed;
          const subtitle = parts.slice(1, 3).join(",").trim() || "OpenStreetMap Location";
          return {
            id: `geo-${d.place_id}`,
            name,
            subtitle,
            category: "geocoded",
            coordinates: [parseFloat(d.lat), parseFloat(d.lon)],
            zoom: 13,
            badge: "OSM GEOCODE",
            badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
          };
        });

        setGeocodedResults(items);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          // Silent fallback to local results
          setGeocodedResults([]);
        }
      } finally {
        setIsGeocoding(false);
      }
    }, 380);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // ── 3. Action: Fly to Location & Drop Reticle ────────────────────────
  const handleSelectPlace = useCallback(
    (item: SearchResultItem) => {
      setQuery(item.name);
      setIsOpen(false);
      setSelectedIndex(-1);
      setCurrentTarget(item);
      setStatusMessage(`Target locked: ${item.name}`);

      // Smooth flight animation to the exact coordinates
      map.flyTo(item.coordinates, item.zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    },
    [map]
  );

  // ── 4. Action: Enter Key Press Handler ───────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen && combinedResults.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
        return;
      }
      setSelectedIndex((prev) => (prev < combinedResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : combinedResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && combinedResults[selectedIndex]) {
        handleSelectPlace(combinedResults[selectedIndex]);
      } else if (combinedResults.length > 0) {
        handleSelectPlace(combinedResults[0]);
      } else if (query.trim().length > 0) {
        const rawQ = query.trim();

        // 1. Instant check against local tactical areas
        const localMatches = searchGhanaAreas(rawQ, 1);
        if (localMatches.length > 0) {
          const area = localMatches[0];
          handleSelectPlace({
            id: area.id,
            name: area.name,
            subtitle: `${area.region} • ${area.description || "Strategic Area"}`,
            category: area.category,
            coordinates: area.coordinates,
            zoom: area.zoom,
            entityType: "area",
            badge: area.category === "military-base" ? "GARRISON" : "TACTICAL AREA",
            badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
          });
          return;
        }

        // 2. Direct search execution for freeform entered text via geocoding
        setStatusMessage(`Scanning coordinates for "${rawQ}"...`);
        setIsGeocoding(true);
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            rawQ
          )}&countrycodes=gh&limit=1`
        )
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then(async (data) => {
            let itemData = data && data[0];
            if (!itemData) {
              const fb = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                  `${rawQ}, Ghana`
                )}&limit=1`
              );
              if (fb.ok) {
                const fbData = await fb.json();
                if (fbData && fbData[0]) itemData = fbData[0];
              }
            }

            if (itemData) {
              const item: SearchResultItem = {
                id: `direct-${itemData.place_id}`,
                name: itemData.display_name.split(",")[0] || rawQ,
                subtitle: itemData.display_name,
                category: "geocoded",
                coordinates: [parseFloat(itemData.lat), parseFloat(itemData.lon)],
                zoom: 13,
                badge: "COORDINATES",
                badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
              };
              handleSelectPlace(item);
            } else {
              setStatusMessage(`No tactical area matches "${rawQ}"`);
            }
          })
          .catch(() => {
            setStatusMessage(`Unable to reach geocoding service for "${rawQ}"`);
          })
          .finally(() => setIsGeocoding(false));
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  // ── 5. Action: Reset Map to Ghana Tactical Overview ──────────────────
  const handleResetView = () => {
    map.flyTo([7.9, -1.2], 7, { duration: 1.2 });
    setCurrentTarget(null);
    setQuery("");
    setGeocodedResults([]);
    setStatusMessage("Ghana tactical overview restored");
  };

  // ── 6. Preset Tactical Area Quick Chips ──────────────────────────────
  const quickChips: Array<{ label: string; action: () => void }> = useMemo(() => {
    return [
      {
        label: "Accra Ops HQ",
        action: () => {
          const loc = locations.find((l) => l.id === "LOC-01");
          if (loc) {
            handleSelectPlace({
              id: "loc-LOC-01",
              name: loc.name,
              subtitle: "Command Operations Center",
              category: "command-hq",
              coordinates: toMapPoint(loc.x, loc.y),
              zoom: 13,
              entityType: "location",
              entityId: loc.id,
              badge: "COMMAND HQ",
              badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            });
          }
        },
      },
      {
        label: "Kumasi Hub",
        action: () => {
          const loc = locations.find((l) => l.id === "LOC-02");
          if (loc) {
            handleSelectPlace({
              id: "loc-LOC-02",
              name: loc.name,
              subtitle: "Regional Command Hub",
              category: "command-hq",
              coordinates: toMapPoint(loc.x, loc.y),
              zoom: 13,
              entityType: "location",
              entityId: loc.id,
              badge: "COMMAND HQ",
              badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            });
          }
        },
      },
      {
        label: "Burma Camp",
        action: () => {
          const area = ALL_TACTICAL_AREAS.find((a) => a.id === "mil-burma-camp");
          if (area) {
            handleSelectPlace({
              id: area.id,
              name: area.name,
              subtitle: "GAF General HQ & CID Command",
              category: "military-base",
              coordinates: area.coordinates,
              zoom: 14,
              badge: "GARRISON",
              badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
            });
          }
        },
      },
      {
        label: "Tamale Airborne",
        action: () => {
          const area = ALL_TACTICAL_AREAS.find((a) => a.id === "mil-tamale-airborne");
          if (area) {
            handleSelectPlace({
              id: area.id,
              name: area.name,
              subtitle: "Northern Air Command & Airborne Base",
              category: "military-base",
              coordinates: area.coordinates,
              zoom: 14,
              badge: "GARRISON",
              badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
            });
          }
        },
      },
      {
        label: "Circle Nexus",
        action: () => {
          const area = ALL_TACTICAL_AREAS.find((a) => a.id === "sector-circle");
          if (area) {
            handleSelectPlace({
              id: area.id,
              name: area.name,
              subtitle: "Kwame Nkrumah Interchange & Sector Hub",
              category: "tactical-sector",
              coordinates: area.coordinates,
              zoom: 14,
              badge: "TACTICAL AREA",
              badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
            });
          }
        },
      },
      {
        label: "Kejetia Central",
        action: () => {
          const area = ALL_TACTICAL_AREAS.find((a) => a.id === "sector-kejetia");
          if (area) {
            handleSelectPlace({
              id: area.id,
              name: area.name,
              subtitle: "Kumasi Central Market & Terminal",
              category: "tactical-sector",
              coordinates: area.coordinates,
              zoom: 14,
              badge: "TACTICAL AREA",
              badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
            });
          }
        },
      },
    ];
  }, [locations, toMapPoint, handleSelectPlace]);

  // Render Category Icon helper
  const getCategoryIcon = (category: SearchResultItem["category"]) => {
    switch (category) {
      case "command-hq":
        return <Shield size={14} className="text-blue-400 shrink-0" />;
      case "field-site":
        return <Radio size={14} className="text-amber-400 shrink-0" />;
      case "operation":
        return <Crosshair size={14} className="text-emerald-400 shrink-0" />;
      case "military-base":
        return <Building2 size={14} className="text-indigo-400 shrink-0" />;
      case "city":
        return <MapPin size={14} className="text-sky-400 shrink-0" />;
      case "region":
        return <Compass size={14} className="text-purple-400 shrink-0" />;
      default:
        return <Navigation size={14} className="text-teal-400 shrink-0" />;
    }
  };

  return (
    <>
      {/* ── 1. Tactical Reticle Layer on the Map ──────────────────────── */}
      {currentTarget && (
        <Marker
          position={currentTarget.coordinates}
          icon={getTargetReticleIcon(currentTarget.name)}
          zIndexOffset={1000}
        >
          <Tooltip direction="top" offset={[0, -42]} permanent={false} opacity={0.95}>
            <div className="text-xs p-1 font-mono">
              <div className="font-bold text-sky-400 flex items-center gap-1">
                <Crosshair size={12} /> TARGET ACQUIRED
              </div>
              <div className="text-white font-semibold mt-0.5">{currentTarget.name}</div>
              <div className="text-[10px] text-gray-300">
                {currentTarget.coordinates[0].toFixed(4)}°N,{" "}
                {Math.abs(currentTarget.coordinates[1]).toFixed(4)}°W
              </div>
            </div>
          </Tooltip>
        </Marker>
      )}

      {/* ── 2. Tactical Map Search Bar Overlay ────────────────────────── */}
      <div
        ref={containerRef}
        className={`map-search-container pointer-events-auto ${
          compact ? "map-search-container--compact" : ""
        }`}
        style={{
          position: "absolute",
          top: compact ? "8px" : "10px",
          left: compact ? "8px" : "10px",
          zIndex: 1000,
          maxWidth: compact ? "calc(100% - 130px)" : "calc(100% - 24px)",
        }}
      >
        <div
          className={`map-search-bar relative flex items-center border shadow-sm transition-all ${
            compact ? "h-8 w-44 sm:w-56" : "h-9 w-60 sm:w-80"
          }`}
          style={{
            background: isOpen
              ? "color-mix(in srgb, var(--surface) 85%, transparent)"
              : "color-mix(in srgb, var(--surface) 55%, transparent)",
            borderColor: isOpen
              ? "var(--accent-blue)"
              : "color-mix(in srgb, var(--border) 60%, transparent)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: "var(--radius-md)",
            boxShadow: isOpen
              ? "0 0 0 1px var(--accent-blue), 0 4px 14px -2px rgba(0, 0, 0, 0.12)"
              : "0 2px 6px -1px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Search / Radar Icon */}
          <div className="flex items-center pl-2.5 pr-1.5 text-text-secondary">
            {isGeocoding ? (
              <Loader2 size={compact ? 13 : 15} className="animate-spin text-accent-blue" />
            ) : (
              <Search size={compact ? 13 : 15} />
            )}
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              setIsOpen(true);
              setSelectedIndex(-1);
              if (val.trim().length < 3) {
                setGeocodedResults([]);
                setIsGeocoding(false);
              }
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={compact ? "Search areas..." : "Search areas, bases, ops..."}
            className="h-full w-full bg-transparent pr-2 text-text-primary placeholder:text-text-secondary focus:outline-none"
            style={{
              fontSize: compact ? "11.5px" : "12.5px",
              fontFamily: "var(--font-data)",
            }}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label="Search map areas and locations"
          />

          {/* Clear Button */}
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedIndex(-1);
                setGeocodedResults([]);
                inputRef.current?.focus();
              }}
              className="mr-1 inline-flex p-1 text-text-secondary hover:text-text-primary"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}

          {/* Reset Ghana View Button */}
          <button
            type="button"
            onClick={handleResetView}
            className="mr-1 inline-flex items-center justify-center p-1 text-text-secondary transition-colors hover:text-accent-blue"
            title="Reset to Ghana Overview"
            aria-label="Reset map view to Ghana bounds"
          >
            <Compass size={compact ? 13 : 15} />
          </button>
        </div>

        {/* ── 3. Autocomplete / Suggestions Dropdown ─────────────────── */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="map-search-dropdown absolute left-0 mt-1.5 w-full min-w-[240px] sm:min-w-[300px] max-w-[calc(100vw-32px)] overflow-hidden border shadow-2xl"
            style={{
              background: "color-mix(in srgb, var(--surface) 82%, transparent)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderColor: "color-mix(in srgb, var(--border) 65%, transparent)",
              borderRadius: "var(--radius-md)",
              zIndex: 1010,
              maxHeight: compact ? "170px" : "320px",
            }}
            role="listbox"
          >
            {/* Quick Suggestions when query is empty */}
            {query.trim().length === 0 && (
              <div className="p-2 border-b border-border/50">
                <div
                  className="mb-1.5 px-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-secondary"
                  style={{ fontSize: "10px" }}
                >
                  Tactical Jump Sectors:
                </div>
                <div className="flex flex-wrap gap-1">
                  {quickChips.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        chip.action();
                        setIsOpen(false);
                      }}
                      className="inline-flex items-center gap-1 rounded border border-border bg-surface px-2 py-0.5 text-[11px] text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
                    >
                      <Crosshair size={10} className="text-accent-blue" />
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="overflow-y-auto" style={{ maxHeight: compact ? "120px" : "260px" }}>
              {combinedResults.length > 0 ? (
                combinedResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPlace(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      data-index={idx}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors border-b border-border/20 last:border-0 ${
                        isSelected
                          ? "bg-accent-blue-bg/80 text-accent-blue"
                          : "hover:bg-surface-raised text-text-primary"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getCategoryIcon(item.category)}
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-medium truncate"
                            style={{ fontSize: compact ? "11.5px" : "12.5px" }}
                          >
                            {item.name}
                          </div>
                          <div
                            className="text-text-secondary truncate"
                            style={{ fontSize: "10.5px" }}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : query.trim().length > 0 && !isGeocoding ? (
                <div className="px-3 py-3 text-center text-text-secondary" style={{ fontSize: "11.5px" }}>
                  <p>No area matches "{query}".</p>
                  <p className="mt-1 text-[10.5px] text-text-secondary/80">
                    Press <strong className="text-text-primary">Enter</strong> to search coordinates.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Dropdown Footer Status */}
            <div
              className="flex items-center justify-between border-t border-border/50 px-3 py-1 text-[10px] text-text-secondary"
              style={{ background: "color-mix(in srgb, var(--surface-raised) 50%, transparent)" }}
            >
              <span>{combinedResults.length} tactical areas</span>
              <span>Press ↵ to jump</span>
            </div>
          </div>
        )}

        {/* ── 4. Target Acquired Toast Indicator ─────────────────────── */}
        {currentTarget && !isOpen && (
          <div
            className="mt-1.5 flex items-center justify-between gap-2 border border-sky-500/35 px-2.5 py-1 text-[11px] shadow-md animate-in fade-in slide-in-from-top-1"
            style={{
              background: "rgba(12, 22, 36, 0.65)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: "var(--radius-sm)",
              color: "#38BDF8",
            }}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Crosshair size={12} className="animate-pulse shrink-0 text-sky-400" />
              <span className="font-semibold text-white truncate">{currentTarget.name}</span>
              <span className="text-[10px] text-sky-300/80 font-mono hidden sm:inline">
                [{currentTarget.coordinates[0].toFixed(2)}°, {currentTarget.coordinates[1].toFixed(2)}°]
              </span>
            </div>
            <div className="flex items-center gap-1">
              {currentTarget.entityId && onMarkerClick && (
                <button
                  type="button"
                  onClick={() =>
                    onMarkerClick(
                      currentTarget.entityType === "operation" ? "operation" : "location",
                      currentTarget.entityId!
                    )
                  }
                  className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-[10px] font-medium"
                >
                  Inspect ↗
                </button>
              )}
              <button
                type="button"
                onClick={() => setCurrentTarget(null)}
                className="p-0.5 text-sky-300 hover:text-white"
                title="Clear Target"
                aria-label="Dismiss target reticle"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Status notice when no target is active */}
        {statusMessage && !currentTarget && !isOpen && (
          <div
            className="mt-1.5 flex items-center justify-between gap-2 border px-2.5 py-1 text-[11px] shadow-sm animate-in fade-in"
            style={{
              background: "color-mix(in srgb, var(--surface) 60%, transparent)",
              borderColor: "color-mix(in srgb, var(--border) 55%, transparent)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-secondary)",
            }}
          >
            <span className="truncate">{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="p-0.5 hover:text-text-primary"
              aria-label="Dismiss status message"
            >
              <X size={11} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
