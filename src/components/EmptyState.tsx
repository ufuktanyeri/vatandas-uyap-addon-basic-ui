import type { ComponentChildren } from 'preact';

interface EmptyStateProps {
  message: string;
  icon?: ComponentChildren;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div class="uyap-p-8 uyap-text-center uyap-text-gray-500">
      {icon && <div class="uyap-mb-2">{icon}</div>}
      <p>{message}</p>
    </div>
  );
}
