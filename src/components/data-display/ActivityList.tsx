import { NOW } from "@/data/seed";

interface ActivityItem {
  id: string;
  timestamp: string;
  description: string;
}

function formatRelativeTime(timestamp: string): string {
  const nowMs = new Date(NOW).getTime();
  const diffMs = nowMs - new Date(timestamp).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-text-secondary" style={{ fontSize: "13.5px" }}>
        No recent activity.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 py-3">
          <span
            className="shrink-0 text-text-secondary"
            style={{ fontSize: "12px", lineHeight: "16px", minWidth: "60px" }}
          >
            {formatRelativeTime(item.timestamp)}
          </span>
          <span style={{ fontSize: "13.5px", lineHeight: "20px" }}>
            {item.description}
          </span>
        </div>
      ))}
    </div>
  );
}

