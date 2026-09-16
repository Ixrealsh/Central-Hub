import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { useCommandPalette } from "@/hooks/useCommandPalette";

export function AppShell() {
  const { isOpen, open, close } = useCommandPalette();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <Sidebar />
      <div className="lg:ml-60">
        <Topbar onSearchClick={open} />
        <main className="px-6 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <CommandPalette
        open={isOpen}
        onClose={close}
        onNavigate={(path) => navigate(path)}
      />
    </div>
  );
}

