import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1
          className="font-semibold"
          style={{ fontSize: "20px", lineHeight: "28px" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-1 text-text-secondary"
            style={{ fontSize: "13.5px", lineHeight: "20px" }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

