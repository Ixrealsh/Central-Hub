import { useState, useCallback } from "react";

export function useDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const openDrawer = useCallback((id: string) => {
    setDrawerId(id);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setDrawerId(null);
  }, []);

  return { isOpen, drawerId, openDrawer, closeDrawer };
}

