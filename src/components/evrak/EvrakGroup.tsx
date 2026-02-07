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
    <div class="uyap-ext-group">
      {/* Folder header */}
      <div class="uyap-ext-group__header">
        <button
          onClick={() => setCollapsed(!collapsed)}
          class={`uyap-ext-group__toggle${!collapsed ? ' uyap-ext-group__toggle--open' : ''}`}
        >
          <i class="fa fa-chevron-right"></i>
        </button>

        <input
          type="checkbox"
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={handleGroupToggle}
        />

        <i class="fa fa-folder uyap-ext-group__folder-icon"></i>

        <span class="uyap-ext-group__name">
          {klasorAdi}
        </span>

        <span class="uyap-ext-group__count">
          {evraklar.length}
        </span>
      </div>

      {/* Evraklar list */}
      {!collapsed && (
        <div>
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
