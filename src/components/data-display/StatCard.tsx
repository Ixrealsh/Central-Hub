import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, delta, onClick }: StatCardProps): ReactNode {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={`border border-border bg-surface p-3.5 text-left shadow-sm transition-all duration-120 ${
        onClick ? "cursor-pointer hover:bg-surface-raised" : ""
      }`}
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      <p
        className="text-text-secondary"
        style={{ fontSize: "12px", lineHeight: "16px" }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 font-semibold text-text-primary"
        style={{ fontSize: "26px", lineHeight: "32px" }}
      >
        {value}
      </p>
      {delta && (
        <p
          className="mt-0.5 text-text-secondary"
          style={{ fontSize: "12px", lineHeight: "16px" }}
        >
          {delta}
        </p>
      )}
    </Component>
  );
}

