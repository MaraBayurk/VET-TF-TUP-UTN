
import { Stethoscope } from "lucide-react";
import "./ConfirmModal.scss";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  highlightedText?: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmModal = ({
  isOpen,
  title,
  description,
  highlightedText,
  details,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal__overlay" onClick={onCancel}>
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-modal__icon">
          <Stethoscope size={22} />
        </div>

        <h2 id="confirm-modal-title">{title}</h2>

        <p className="confirm-modal__description">{description}</p>

        {highlightedText && (
          <p className="confirm-modal__highlight">
            {highlightedText}
          </p>
        )}

        {details && (
          <p className="confirm-modal__details">{details}</p>
        )}

        <div className="confirm-modal__actions">
          <button
            type="button"
            className="confirm-modal__button confirm-modal__button--cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="confirm-modal__button confirm-modal__button--confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
