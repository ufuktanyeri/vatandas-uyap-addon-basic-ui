export type ToastType = 'error' | 'success';

export interface ToastState {
  message: string;
  type: ToastType;
}

const typeClasses: Record<ToastType, string> = {
  error: 'uyap-bg-red-50 uyap-text-red-800',
  success: 'uyap-bg-green-50 uyap-text-green-800'
};

export function Toast({ notification }: { notification: ToastState | null }) {
  if (!notification) {
    return null;
  }

  return (
    <div class={`uyap-px-4 uyap-py-2 uyap-text-sm ${typeClasses[notification.type]}`}>
      {notification.message}
    </div>
  );
}
