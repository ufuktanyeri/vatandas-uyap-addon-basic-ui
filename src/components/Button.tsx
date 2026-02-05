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

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'uyap-text-white uyap-bg-blue-600 uyap-border-transparent hover:uyap-bg-blue-700',
  secondary:
    'uyap-text-gray-700 uyap-bg-white uyap-border-gray-300 hover:uyap-bg-gray-50',
  warning:
    'uyap-text-white uyap-bg-yellow-600 uyap-border-transparent hover:uyap-bg-yellow-700',
  danger:
    'uyap-text-white uyap-bg-red-600 uyap-border-transparent hover:uyap-bg-red-700'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'uyap-px-3 uyap-py-1.5 uyap-text-xs',
  md: 'uyap-px-4 uyap-py-2 uyap-text-sm'
};

const baseClasses =
  'uyap-font-medium uyap-border uyap-rounded-md disabled:uyap-opacity-50 disabled:uyap-cursor-not-allowed';

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
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'uyap-w-full' : '',
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
