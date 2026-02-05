import { grupluEvraklar, deltaInfo } from '@store';
import { EvrakGroup } from './EvrakGroup';
import { EmptyState } from '@components/ui/EmptyState';

export function EvrakList() {
  const groups = grupluEvraklar.value;
  const delta = deltaInfo.value;

  if (groups.size === 0) {
    return <EmptyState message="Evrak bulunamadı" />;
  }

  return (
    <div class="uyap-flex-1 uyap-overflow-y-auto">
      {/* Delta info */}
      {delta.mevcut > 0 && (
        <div class="uyap-p-3 uyap-bg-blue-50 uyap-border-b uyap-border-blue-100">
          <p class="uyap-text-sm uyap-text-blue-800">
            <strong>{delta.yeni}</strong> yeni evrak bulundu
            {delta.mevcut > 0 && (
              <span class="uyap-ml-1">
                ({delta.mevcut} evrak zaten indirilmiş)
              </span>
            )}
          </p>
        </div>
      )}

      {/* Groups */}
      <div>
        {Array.from(groups.entries()).map(([klasorAdi, evraklar]) => (
          <EvrakGroup
            key={klasorAdi}
            klasorAdi={klasorAdi}
            evraklar={evraklar}
          />
        ))}
      </div>
    </div>
  );
}
