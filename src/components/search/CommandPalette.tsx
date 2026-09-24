import { useState, useMemo } from "react";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { operations } from "@/data/operations";
import { personnel } from "@/data/personnel";
import { assets } from "@/data/assets";
import { locations } from "@/data/locations";
import { auditLogs } from "@/data/auditLogs";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return {
      operations: operations.filter(
        (op) => !q || op.id.toLowerCase().includes(q) || op.name.toLowerCase().includes(q)
      ).slice(0, 4),
      personnel: personnel.filter(
        (p) => !q || p.id.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q)
      ).slice(0, 4),
      assets: assets.filter(
        (a) => !q || a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
      ).slice(0, 4),
      locations: locations.filter(
        (l) => !q || l.id.toLowerCase().includes(q) || l.name.toLowerCase().includes(q)
      ).slice(0, 4),
      auditEvents: auditLogs.filter(
        (e) => !q || e.id.toLowerCase().includes(q) || e.resourceLabel.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q)
      ).slice(0, 4),
    };
  }, [query]);

  const hasResults =
    results.operations.length > 0 ||
    results.personnel.length > 0 ||
    results.assets.length > 0 ||
    results.locations.length > 0 ||
    results.auditEvents.length > 0;

  if (!open) return null;

  function handleSelect(path: string) {
    onNavigate(path);
    onClose();
    setQuery("");
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[2300] bg-black/40 backdrop-blur-[1px]"
        onClick={() => { onClose(); setQuery(""); }}
        aria-hidden="true"
      />
      <div className="fixed inset-x-0 top-[20%] z-[2400] mx-auto w-full max-w-lg px-4">
        <Command
          className="border border-border bg-surface overflow-hidden"
          style={{
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-elevated)",
          }}
          shouldFilter={false}
        >
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search size={16} className="text-text-secondary" aria-hidden="true" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search operations, officers, assets, locations…"
              className="w-full bg-transparent py-3 text-text-primary outline-none placeholder:text-text-secondary"
              style={{ fontSize: "13.5px" }}
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            {query && !hasResults && (
              <Command.Empty className="py-6 text-center text-text-secondary" style={{ fontSize: "13.5px" }}>
                No results for &ldquo;{query}&rdquo;. Check your spelling or try a different term.
              </Command.Empty>
            )}

            {results.operations.length > 0 && (
              <Command.Group
                heading="OPERATIONS"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-text-secondary [&_[cmdk-group-heading]]:font-semibold"
                style={{ fontSize: "11px" }}
              >
                {results.operations.map((op) => (
                  <Command.Item
                    key={op.id}
                    value={op.id}
                    onSelect={() => handleSelect(`/operations/${op.id}`)}
                    className="flex cursor-pointer items-center gap-3 px-2 py-2 text-text-primary data-[selected=true]:bg-accent-blue-bg"
                    style={{ fontSize: "13.5px", borderRadius: "var(--radius-sm)" }}
                  >
                    <span className="text-text-secondary" style={{ fontSize: "12px" }}>{op.id}</span>
                    <span>{op.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.personnel.length > 0 && (
              <Command.Group
                heading="PERSONNEL"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-text-secondary [&_[cmdk-group-heading]]:font-semibold"
                style={{ fontSize: "11px" }}
              >
                {results.personnel.map((p) => (
                  <Command.Item
                    key={p.id}
                    value={p.id}
                    onSelect={() => handleSelect(`/personnel/${p.id}`)}
                    className="flex cursor-pointer items-center gap-3 px-2 py-2 text-text-primary data-[selected=true]:bg-accent-blue-bg"
                    style={{ fontSize: "13.5px", borderRadius: "var(--radius-sm)" }}
                  >
                    <span className="text-text-secondary" style={{ fontSize: "12px" }}>{p.id}</span>
                    <span>{p.displayName}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.assets.length > 0 && (
              <Command.Group
                heading="ASSETS"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-text-secondary [&_[cmdk-group-heading]]:font-semibold"
                style={{ fontSize: "11px" }}
              >
                {results.assets.map((a) => (
                  <Command.Item
                    key={a.id}
                    value={a.id}
                    onSelect={() => handleSelect(`/assets/${a.id}`)}
                    className="flex cursor-pointer items-center gap-3 px-2 py-2 text-text-primary data-[selected=true]:bg-accent-blue-bg"
                    style={{ fontSize: "13.5px", borderRadius: "var(--radius-sm)" }}
                  >
                    <span className="text-text-secondary" style={{ fontSize: "12px" }}>{a.id}</span>
                    <span>{a.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.locations.length > 0 && (
              <Command.Group
                heading="LOCATIONS"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-text-secondary [&_[cmdk-group-heading]]:font-semibold"
                style={{ fontSize: "11px" }}
              >
                {results.locations.map((l) => (
                  <Command.Item
                    key={l.id}
                    value={l.id}
                    onSelect={() => handleSelect("/map")}
                    className="flex cursor-pointer items-center gap-3 px-2 py-2 text-text-primary data-[selected=true]:bg-accent-blue-bg"
                    style={{ fontSize: "13.5px", borderRadius: "var(--radius-sm)" }}
                  >
                    <span className="text-text-secondary" style={{ fontSize: "12px" }}>{l.id}</span>
                    <span>{l.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.auditEvents.length > 0 && (
              <Command.Group
                heading="AUDIT EVENTS"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-text-secondary [&_[cmdk-group-heading]]:font-semibold"
                style={{ fontSize: "11px" }}
              >
                {results.auditEvents.map((e) => (
                  <Command.Item
                    key={e.id}
                    value={e.id}
                    onSelect={() => handleSelect("/audit-logs")}
                    className="flex cursor-pointer items-center gap-3 px-2 py-2 text-text-primary data-[selected=true]:bg-accent-blue-bg"
                    style={{ fontSize: "13.5px", borderRadius: "var(--radius-sm)" }}
                  >
                    <span className="text-text-secondary" style={{ fontSize: "12px" }}>{e.id}</span>
                    <span>{e.action}: {e.resourceLabel}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </>
  );
}

