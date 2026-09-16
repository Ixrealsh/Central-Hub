import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useState } from "react";

export function AppShell() {
  const { isOpen, open, close } = useCommandPalette();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      <div className={`min-w-0 transition-[margin] duration-200 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"}`}>
        <Topbar collapsed={sidebarCollapsed} onSearchClick={open} />
        <main className="mx-auto w-full max-w-[1680px] px-4 pb-5 pt-[4.5rem] sm:px-5 lg:px-7 lg:pb-6">
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

