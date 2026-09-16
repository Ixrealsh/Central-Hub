import { useState, useMemo, type ReactNode } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string;
  isLoading?: boolean;
  emptyState: { title: string; description: string };
  pageSize?: number;
}

const PAGE_SIZE_DEFAULT = 10;

export function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  selectedRowId,
  isLoading,
  emptyState,
  pageSize = PAGE_SIZE_DEFAULT,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      const cmp = aStr.localeCompare(bStr);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedData = sortedData.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const showingStart = sortedData.length === 0 ? 0 : safePage * pageSize + 1;
  const showingEnd = Math.min((safePage + 1) * pageSize, sortedData.length);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  // Skeleton rows
  if (isLoading) {
    return (
      <div className="border border-border overflow-hidden" style={{ borderRadius: "var(--radius-lg)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 text-left font-semibold text-text-secondary"
                  style={{ fontSize: "12px", lineHeight: "16px", height: "44px" }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4" style={{ height: "44px" }}>
                    <div className="h-3 w-24 animate-pulse rounded bg-border" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center border border-border bg-surface py-16"
        style={{ borderRadius: "var(--radius-lg)" }}
      >
        <p className="font-semibold text-text-primary" style={{ fontSize: "15px", lineHeight: "22px" }}>
          {emptyState.title}
        </p>
        <p className="mt-1 text-text-secondary" style={{ fontSize: "13.5px", lineHeight: "20px" }}>
          {emptyState.description}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="data-table-shell overflow-x-auto border border-border shadow-sm" style={{ borderRadius: "var(--radius-lg)" }}>
        <table className="data-table w-full min-w-[680px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-surface-raised">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 text-left font-semibold uppercase tracking-[0.04em] text-text-secondary ${
                    col.sortable ? "cursor-pointer select-none hover:text-text-primary" : ""
                  }`}
                  style={{ fontSize: "11px", lineHeight: "16px", height: "40px" }}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc" ? (
                        <ChevronUp size={14} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={14} aria-hidden="true" />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((row) => {
              const rowId = getRowId(row);
              const isSelected = rowId === selectedRowId;
              return (
                <tr
                  key={rowId}
                  className={`border-b border-border last:border-b-0 transition-colors duration-120 ${
                    isSelected
                      ? "border-l-2 border-l-accent-blue bg-accent-blue-bg"
                      : "hover:bg-surface-raised"
                  } ${onRowClick ? "cursor-pointer" : ""}`}
                  style={{ height: "48px" }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-3"
                      style={{ fontSize: "13.5px", lineHeight: "20px" }}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-2 flex items-center justify-between px-0.5">
        <p className="text-text-secondary" style={{ fontSize: "12px", lineHeight: "16px" }}>
          Showing {showingStart}–{showingEnd} of {sortedData.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="inline-flex items-center justify-center border border-border bg-surface p-1.5 shadow-sm transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderRadius: "var(--radius-md)" }}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="inline-flex items-center justify-center border border-border bg-surface p-1.5 transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderRadius: "var(--radius-md)" }}
            aria-label="Next page"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

