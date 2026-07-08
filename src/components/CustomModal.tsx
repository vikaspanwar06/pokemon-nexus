import "../styles/customModal.css";

interface CustomModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  children?: React.ReactNode;
}

function CustomModal({ isOpen, title, message, onClose, onConfirm, confirmText, children}: CustomModalProps) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">⚔️</div>
        <h2>{title}</h2>
        <p>{message}</p>

        {children}

        <div className="modal-actions">
          <button
            className="modal-btn secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          {onConfirm && (
            <button
              className="modal-btn"
              onClick={onConfirm}
            >
              {confirmText || "Confirm"}
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default CustomModal;