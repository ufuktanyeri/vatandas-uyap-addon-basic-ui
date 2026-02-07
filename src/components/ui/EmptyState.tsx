interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div class="uyap-ext-empty">
      <i class="fa fa-inbox"></i>
      <p>{message}</p>
    </div>
  );
}
