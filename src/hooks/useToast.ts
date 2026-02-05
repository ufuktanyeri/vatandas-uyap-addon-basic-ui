import { useState, useEffect, useCallback } from 'preact/hooks';
import { h } from 'preact';
import { Toast } from '@components/ui/Toast';
import type { ToastType, ToastState } from '@components/ui/Toast';

export function useToast(duration = 3000) {
  const [notification, setNotification] = useState<ToastState | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), duration);
      return () => clearTimeout(timer);
    }
  }, [notification, duration]);

  const showToast = useCallback((message: string, type: ToastType) => {
    setNotification({ message, type });
  }, []);

  const ToastComponent = () => h(Toast, { notification });

  return { showToast, Toast: ToastComponent };
}
