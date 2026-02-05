import { useState, useEffect, useCallback } from 'preact/hooks';

type ToastType = 'error' | 'success';

interface ToastState {
  message: string;
  type: ToastType;
}

const typeClasses: Record<ToastType, string> = {
  error: 'uyap-bg-red-50 uyap-text-red-800',
  success: 'uyap-bg-green-50 uyap-text-green-800'
};

function Toast({ notification }: { notification: ToastState | null }) {
  if (!notification) {
    return null;
  }

  return (
    <div class={`uyap-px-4 uyap-py-2 uyap-text-sm ${typeClasses[notification.type]}`}>
      {notification.message}
    </div>
  );
}

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

  const ToastComponent = () => <Toast notification={notification} />;

  return { showToast, Toast: ToastComponent };
}
