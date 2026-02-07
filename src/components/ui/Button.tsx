import type { ComponentChildren } from 'preact';

type ButtonVariant = 'primary' | 'secondary' | 'warning' | 'danger';
type ButtonSize = 'sm' | 'md';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  class?: string;
  onClick?: () => void;
  children: ComponentChildren;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  class: className = '',
  onClick,
  children
}: ButtonProps) {
  const classes = [
    'uyap-ext-btn',
    `uyap-ext-btn--${variant}`,
    size === 'sm' ? 'uyap-ext-btn--sm' : '',
    fullWidth ? 'uyap-ext-btn--full' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      class={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
