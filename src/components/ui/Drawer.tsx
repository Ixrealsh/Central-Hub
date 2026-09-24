import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string | ReactNode;
  children: ReactNode;
  footerAction?: ReactNode;
}

export function Drawer({ open, onClose, title, children, footerAction }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      // Focus the drawer on open
      setTimeout(() => drawerRef.current?.focus(), 50);
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Scrim with high z-index above map tiles */}
      <div
        className="fixed inset-0 z-[2100] bg-black/40 backdrop-blur-[1px] transition-opacity"
        style={{ animationDuration: "220ms" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel with high z-index */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Detail Panel"}
        tabIndex={-1}
        className="fixed inset-y-0 right-0 z-[2200] flex w-full max-w-md sm:max-w-lg flex-col border-l border-border bg-surface shadow-2xl transition-all"
        style={{
          borderRadius: "var(--radius-xl) 0 0 var(--radius-xl)",
          boxShadow: "var(--shadow-elevated)",
          animation: "slideIn 220ms ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="min-w-0 flex-1">
            {typeof title === "string" ? (
              <h2
                className="font-semibold text-text-primary truncate"
                style={{ fontSize: "15px", lineHeight: "22px" }}
              >
                {title}
              </h2>
            ) : (
              title
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center p-1.5 text-text-secondary transition-colors hover:text-text-primary rounded-md hover:bg-surface-raised ml-3"
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">{children}</div>

        {/* Footer */}
        {footerAction && (
          <div className="border-t border-border bg-surface-raised/40 px-6 py-3.5 shrink-0">
            {footerAction}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
