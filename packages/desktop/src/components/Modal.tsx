import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-[400px]",
  md: "max-w-[520px]",
  lg: "max-w-[640px]",
};

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} mx-4 glass-card p-0 animate-fade-in`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-bg-card-hover transition-colors"
          >
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
