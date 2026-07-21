import { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Modal — Level 3 elevation overlay with backdrop blur.
 *
 * @param {boolean} open - Controls visibility
 * @param {function} onClose - Called when backdrop or X is clicked
 * @param {string} title - Modal header title
 * @param {'sm' | 'md' | 'lg'} size
 * @param {React.ReactNode} footer - Footer content (buttons etc.)
 */
export default function Modal({
  open,
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) {
  const isModalOpen = open || isOpen;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) onClose?.();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen, onClose]);

  if (!isModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${size} animate-fade-in-up`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal__header">
          <h2 id="modal-title" className="title-md">{title}</h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
