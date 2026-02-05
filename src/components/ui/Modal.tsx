import type { ComponentChildren } from 'preact';
import { useEffect, useCallback } from 'preact/hooks';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ComponentChildren;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('uyap-ext-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div class="uyap-ext-modal-overlay" onClick={handleBackdropClick}>
      <div class="uyap-ext-modal">
        {title && (
          <div class="uyap-flex uyap-items-center uyap-justify-between uyap-p-4 uyap-border-b uyap-border-gray-200">
            <h2 class="uyap-text-lg uyap-font-semibold uyap-text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              class="uyap-text-gray-400 hover:uyap-text-gray-600"
            >
              <svg
                class="uyap-w-5 uyap-h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div class="uyap-ext-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}
