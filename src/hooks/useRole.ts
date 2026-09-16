import { createContext, useContext, useState, createElement, type ReactNode } from "react";

export type Role = "Admin" | "Supervisor" | "Officer";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Admin");
  return createElement(RoleContext, { value: { role, setRole } }, children);
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}

