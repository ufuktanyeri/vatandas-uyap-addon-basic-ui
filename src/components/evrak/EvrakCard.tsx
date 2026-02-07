import type { EvrakItem } from '@/types';

interface EvrakCardProps {
  evrak: EvrakItem;
  selected: boolean;
  onToggle: () => void;
}

export function EvrakCard({ evrak, selected, onToggle }: EvrakCardProps) {
  return (
    <div class="uyap-ext-card">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        class="uyap-ext-card__checkbox"
      />

      <div class="uyap-ext-card__content">
        <p class="uyap-ext-card__name">
          {evrak.name}
        </p>

        {(evrak.evrakTuru || evrak.evrakTarihi) && (
          <div class="uyap-ext-card__meta">
            {evrak.evrakTuru && <span>{evrak.evrakTuru}</span>}
            {evrak.evrakTarihi && <span>{evrak.evrakTarihi}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
