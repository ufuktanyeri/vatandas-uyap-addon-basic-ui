import type { ComponentChildren } from 'preact';
import { useEffect, useCallback } from 'preact/hooks';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ComponentChildren;
}

// Side Drawer pattern — modeled after UYAP .ac-panel (accessibility panel)
// Always rendered in DOM for CSS slide animation (translateX)
export function Modal({ open, onClose, children }: ModalProps) {
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

  return (
    <>
      <div
        class={`uyap-ext-drawer-overlay${open ? ' uyap-ext-drawer-overlay--open' : ''}`}
        onClick={onClose}
      />
      <div class={`uyap-ext-drawer${open ? ' uyap-ext-drawer--open' : ''}`}>
        {children}
      </div>
    </>
  );
}
