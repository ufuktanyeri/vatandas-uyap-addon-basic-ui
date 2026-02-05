import type { EvrakItem } from '@/types';

interface EvrakCardProps {
  evrak: EvrakItem;
  selected: boolean;
  onToggle: () => void;
}

export function EvrakCard({ evrak, selected, onToggle }: EvrakCardProps) {
  return (
    <div class="uyap-flex uyap-items-start uyap-p-3 uyap-pl-10 hover:uyap-bg-gray-50">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        class="uyap-mt-0.5 uyap-mr-3 uyap-h-4 uyap-w-4 uyap-text-blue-600 uyap-rounded"
      />

      <div class="uyap-flex-1 uyap-min-w-0">
        <p class="uyap-text-sm uyap-text-gray-900 uyap-truncate">
          {evrak.name}
        </p>

        {(evrak.evrakTuru || evrak.evrakTarihi) && (
          <div class="uyap-mt-1 uyap-text-xs uyap-text-gray-500">
            {evrak.evrakTuru && (
              <span class="uyap-mr-3">{evrak.evrakTuru}</span>
            )}
            {evrak.evrakTarihi && <span>{evrak.evrakTarihi}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
