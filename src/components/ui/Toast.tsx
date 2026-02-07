import { Icon } from '@components';

export type ToastType = 'error' | 'success';

export interface ToastState {
  message: string;
  type: ToastType;
}

export function Toast({ notification }: { notification: ToastState | null }) {
  if (!notification) {
    return null;
  }

  const typeClass = notification.type === 'error'
    ? 'uyap-ext-toast--error'
    : 'uyap-ext-toast--success';

  return (
    <div class={`uyap-ext-toast ${typeClass}`}>
      <Icon
        name={notification.type === 'error' ? 'errorCircle' : 'success'}
        class="uyap-ext-icon-spacing"
      />
      {notification.message}
    </div>
  );
}
