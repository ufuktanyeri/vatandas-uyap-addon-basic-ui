import { useState } from 'preact/hooks';
import type { EvrakItem } from '@/types';
import {
  seciliEvrakIds,
  toggleEvrakSecimi,
  klasorEvraklariniSec,
  klasorEvraklariniKaldir
} from '@store';
import { EvrakCard } from './EvrakCard';

interface EvrakGroupProps {
  klasorAdi: string;
  evraklar: EvrakItem[];
}

export function EvrakGroup({ klasorAdi, evraklar }: EvrakGroupProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Check if all evraklar in this group are selected
  const allSelected = evraklar.every(e =>
    seciliEvrakIds.value.has(e.evrakId)
  );

  const someSelected = evraklar.some(e =>
    seciliEvrakIds.value.has(e.evrakId)
  );

  const handleGroupToggle = () => {
    if (allSelected) {
      klasorEvraklariniKaldir(klasorAdi);
    } else {
      klasorEvraklariniSec(klasorAdi);
    }
  };

  return (
    <div class="uyap-border-b uyap-border-gray-200">
      {/* Folder header */}
      <div class="uyap-flex uyap-items-center uyap-p-3 uyap-bg-gray-50 uyap-cursor-pointer hover:uyap-bg-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          class="uyap-mr-2 uyap-text-gray-600 hover:uyap-text-gray-800"
        >
          <svg
            class={`uyap-w-4 uyap-h-4 uyap-transition-transform ${
              collapsed ? '' : 'uyap-rotate-90'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <input
          type="checkbox"
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={handleGroupToggle}
          class="uyap-mr-2 uyap-h-4 uyap-w-4 uyap-text-blue-600 uyap-rounded"
        />

        <svg
          class="uyap-w-5 uyap-h-5 uyap-mr-2 uyap-text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>

        <span class="uyap-flex-1 uyap-font-medium uyap-text-sm">
          {klasorAdi}
        </span>

        <span class="uyap-text-xs uyap-text-gray-500 uyap-ml-2">
          {evraklar.length}
        </span>
      </div>

      {/* Evraklar list */}
      {!collapsed && (
        <div class="uyap-divide-y uyap-divide-gray-100">
          {evraklar.map(evrak => (
            <EvrakCard
              key={evrak.evrakId}
              evrak={evrak}
              selected={seciliEvrakIds.value.has(evrak.evrakId)}
              onToggle={() => toggleEvrakSecimi(evrak.evrakId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
