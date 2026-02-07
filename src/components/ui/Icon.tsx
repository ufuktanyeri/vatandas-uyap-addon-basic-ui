const ICONS = {
  download: 'fa-download',
  close: 'fa-times',
  pause: 'fa-pause',
  play: 'fa-play',
  stop: 'fa-stop',
  refresh: 'fa-refresh',
  error: 'fa-exclamation-circle',
  warning: 'fa-exclamation-triangle',
  success: 'fa-check-circle',
  errorCircle: 'fa-times-circle',
  inbox: 'fa-inbox',
  folder: 'fa-folder',
  chevronRight: 'fa-chevron-right',
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  class?: string;
}

export function Icon({ name, class: className = '' }: IconProps) {
  return <i class={`fa ${ICONS[name]} ${className}`} />;
}
