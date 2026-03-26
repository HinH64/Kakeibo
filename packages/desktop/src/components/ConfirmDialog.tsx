import { Modal } from "./Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "確認",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <p className="text-[13px] text-text-secondary mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-[13px] text-text-secondary hover:bg-bg-card-hover transition-colors"
        >
          取消
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors ${
            variant === "danger" ? "bg-expense hover:opacity-90" : "bg-accent hover:bg-accent-light"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
